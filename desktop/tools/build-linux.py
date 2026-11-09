#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Build .deb and portable tar.gz from an explicit, account-free file list."""
import gzip
import io
from pathlib import Path, PurePosixPath
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
VERSION = '0.2.0~preview.2'
OUT = ROOT / 'dist/linux'

def tar_bytes(files):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode='w') as archive:
        directories = {str(parent) for name in files for parent in PurePosixPath(name).parents if str(parent) != '.'}
        for name in sorted(directories, key=lambda item: (item.count('/'), item)):
            info = tarfile.TarInfo(name + '/')
            info.type = tarfile.DIRTYPE; info.mode = 0o755; info.uid = info.gid = 0
            info.uname = info.gname = 'root'; info.mtime = 0
            archive.addfile(info)
        for name, (data, mode) in sorted(files.items()):
            info = tarfile.TarInfo(name)
            info.size = len(data); info.mode = mode; info.uid = info.gid = 0
            info.uname = info.gname = 'root'; info.mtime = 0
            archive.addfile(info, io.BytesIO(data))
    return gzip.compress(output.getvalue(), mtime=0)

def ar_member(name, data):
    header = f'{name + "/":<16}{0:<12}{0:<6}{0:<6}{"100644":<8}{len(data):<10}`\n'.encode('ascii')
    return header + data + (b'\n' if len(data) % 2 else b'')

def build():
    subprocess.run(['node', str(ROOT / 'tools/build.cjs')], check=True)
    revision = subprocess.check_output(['git', '-C', str(REPO), 'rev-parse', 'HEAD'], text=True).strip()
    payload = {'setup.py': ((ROOT / 'installer/linux/setup.py').read_bytes(), 0o755),
               'myspoti.svg': ((REPO / 'docs/brand/myspoti-logo.svg').read_bytes(), 0o644),
               'SOURCES.txt': (('GPL-3.0\nComplete corresponding source: https://github.com/weikiboy-tech/myspoti-desktop/tree/' + revision + '\nUpstream: https://github.com/kota-zo/myspoti\nNo Spotify binaries or accounts included.\n').encode(), 0o644)}
    for name in ('index.js','myspoti-runtime.js','style.css','manifest.json','LICENSE','THIRD_PARTY_NOTICES.md'):
        payload['app/' + name] = ((ROOT / 'dist/myspoti-desktop' / name).read_bytes(), 0o644)
    payload['README.txt'] = ('Myspoti Linux Setup (preview)\nUbuntu/Debian x86_64: install the .deb, then open Myspoti Setup from the application menu.\nPortable: python3 setup.py (requires Python >=3.10 and tkinter).\nNative Spotify required; close Spotify first. Snap/Flatpak/Nix/ARM are not supported by this preview.\nMyspoti remains an integration in the official client, not an independent player.\nHelp: https://github.com/weikiboy-tech/myspoti-desktop/blob/main/docs/INSTALL-LINUX.md\n'.encode(), 0o644)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'Myspoti-Linux-Setup.tar.gz').write_bytes(tar_bytes({'Myspoti-Linux-Setup/' + n: v for n,v in payload.items()}))
    data = {'usr/share/myspoti-setup/' + n: v for n,v in payload.items()}
    data['usr/bin/myspoti-setup'] = (b'#!/bin/sh\nexec /usr/bin/python3 /usr/share/myspoti-setup/setup.py "$@"\n', 0o755)
    data['usr/share/applications/myspoti-setup.desktop'] = (b'[Desktop Entry]\nType=Application\nName=Myspoti Setup\nComment=Set up Myspoti for Linux\nExec=/usr/bin/myspoti-setup\nIcon=myspoti-setup\nTerminal=false\nCategories=AudioVideo;Settings;\n', 0o644)
    data['usr/share/icons/hicolor/scalable/apps/myspoti-setup.svg'] = payload['myspoti.svg']
    data['usr/share/doc/myspoti-setup/copyright'] = payload['app/LICENSE']
    control = f'Package: myspoti-setup\nVersion: {VERSION}\nArchitecture: amd64\nMaintainer: Myspoti Desktop contributors <codex@localhost>\nSection: sound\nPriority: optional\nDepends: python3 (>= 3.10), python3-tk, procps, ca-certificates\nHomepage: https://github.com/weikiboy-tech/myspoti-desktop\nDescription: Graphical Myspoti setup preview for Linux\n Sets up a local copy of an existing native Spotify client.\n Contains no Spotify binaries, credentials or user profiles.\n'.encode()
    deb = b'!<arch>\n' + ar_member('debian-binary', b'2.0\n') + ar_member('control.tar.gz', tar_bytes({'control': (control, 0o644)})) + ar_member('data.tar.gz', tar_bytes(data))
    (OUT / 'Myspoti-Linux-Setup.deb').write_bytes(deb)
    print('Linux packages:', OUT)

if __name__ == '__main__': build()
