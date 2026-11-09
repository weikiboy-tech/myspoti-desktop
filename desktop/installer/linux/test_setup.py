# SPDX-License-Identifier: GPL-3.0-only
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch
import setup

class LinuxSetupTests(unittest.TestCase):
    def test_version_boundaries(self):
        for version in ('Spotify version 1.2.14.114', '1.3.4.1.gtest'):
            self.assertTrue(setup.validate_version(version))
        for version in ('1.2.13.1','1.3.5.1','1.3.8.620','unknown',''):
            with self.assertRaises(RuntimeError): setup.validate_version(version)

    def test_reject_corrupted_download(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive = Path(tmp) / 'bad'; archive.write_bytes(b'corrupted')
            with self.assertRaises(RuntimeError): setup.verify_download(archive)

    def test_reject_archive_traversal_and_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            for name, kind in (('../escape',tarfile.REGTYPE),('link',tarfile.SYMTYPE),('hard',tarfile.LNKTYPE)):
                archive = Path(tmp) / 'bad.tar.gz'
                with tarfile.open(archive,'w:gz') as tar:
                    item = tarfile.TarInfo(name); item.type = kind; item.linkname = '/tmp/escape'
                    tar.addfile(item)
                with self.assertRaises(RuntimeError): setup.extract_tool(archive,Path(tmp)/'out')
            self.assertFalse((Path(tmp)/'escape').exists())

    def test_desktop_path_escaping(self):
        self.assertEqual(setup.desktop_quote('/home/A B/100%/launch.sh'), '"/home/A B/100%%/launch.sh"')
        with self.assertRaises(RuntimeError): setup.desktop_quote('/home/bad\npath')

    def transaction(self, fail_apply=False):
        with tempfile.TemporaryDirectory(prefix='myspoti test ') as tmp:
            home = Path(tmp); source = home/'vendor'; (source/'Apps').mkdir(parents=True)
            (source/'spotify').write_text('vendor executable fixture')
            (source/'Apps/xpui.spa').write_bytes(b'original program fixture')
            payload = home/'payload'; (payload/'app').mkdir(parents=True)
            for name in setup.FILES: (payload/'app'/name).write_text('synthetic app fixture')
            (payload/'myspoti.svg').write_text('<svg/>'); (payload/'SOURCES.txt').write_text('GPL source fixture')
            prefs = home/'.config/spotify/prefs'; prefs.parent.mkdir(parents=True); prefs.write_text('PRIVATE-TEST-SENTINEL')
            archive_data = io.BytesIO()
            with tarfile.open(fileobj=archive_data,mode='w:gz') as tar:
                item = tarfile.TarInfo('spicetify'); item.size=4; item.mode=0o755; tar.addfile(item,io.BytesIO(b'test'))
            commands=[]
            def run(argv,**kwargs):
                commands.append(argv)
                return subprocess.CompletedProcess(argv, 1 if fail_apply and 'apply' in argv else 0, 'fixture', '')
            engine=setup.Installer(payload,home,{},run)
            engine.root.mkdir(parents=True); launcher=engine.root/'launch.sh'; launcher.write_text('previous working launcher')
            with patch.object(engine,'check',return_value=(source,prefs,'1.3.4.1')), patch.object(setup.urllib.request,'urlopen',return_value=io.BytesIO(archive_data.getvalue())), patch.object(setup,'verify_download'):
                if fail_apply:
                    with self.assertRaises(RuntimeError): engine.install(lambda _: None)
                    self.assertEqual(launcher.read_text(),'previous working launcher')
                else:
                    engine.install(lambda _: None)
                    self.assertIn('spotify:app:myspoti-desktop',launcher.read_text())
                    entry=engine.data/'applications/myspoti.desktop'
                    self.assertIn('Name=Myspoti',entry.read_text())
                    for file in engine.root.rglob('*'):
                        if file.is_file(): self.assertNotIn(b'PRIVATE-TEST-SENTINEL',file.read_bytes())
            self.assertEqual(prefs.read_text(),'PRIVATE-TEST-SENTINEL')
            self.assertEqual((source/'Apps/xpui.spa').read_bytes(),b'original program fixture')
            self.assertTrue(any('backup' in c for c in commands))
    def test_install_paths_spaces_no_profile_copy(self): self.transaction()
    def test_apply_failure_preserves_existing_launcher(self): self.transaction(True)

if __name__ == '__main__': unittest.main()
