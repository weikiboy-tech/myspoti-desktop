# SPDX-License-Identifier: GPL-3.0-only
import importlib.util
import io
from pathlib import Path
import tarfile
import unittest

spec = importlib.util.spec_from_file_location('build_linux', Path(__file__).resolve().parents[2] / 'tools/build-linux.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class LinuxPackageTests(unittest.TestCase):
    def test_parent_directories_precede_files_for_dpkg(self):
        data = builder.tar_bytes({'usr/share/myspoti-setup/setup.py': (b'print("fixture")', 0o755)})
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
            names = archive.getnames()
            for name in ('usr','usr/share','usr/share/myspoti-setup'):
                self.assertTrue(archive.getmember(name).isdir())
                self.assertLess(names.index(name),names.index('usr/share/myspoti-setup/setup.py'))
            self.assertEqual(archive.getmember('usr/share/myspoti-setup/setup.py').mode, 0o755)

if __name__ == '__main__': unittest.main()
