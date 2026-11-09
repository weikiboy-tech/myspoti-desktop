#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Myspoti Linux setup. No credentials or Spotify binaries are distributed."""
import argparse
import configparser
import hashlib
import os
from pathlib import Path
import platform
import queue
import re
import shlex
import shutil
import subprocess
import sys
import tarfile
import threading
import urllib.request
import uuid
import webbrowser

SPICE_URL = 'https://github.com/spicetify/cli/releases/download/v2.46.4/spicetify-2.46.4-linux-amd64.tar.gz'
SPICE_HASH = '61216076ef40eb46e57716b2f68ae9e5281e1c440e67ae34013facdb25300cfd'
FILES = ('index.js', 'myspoti-runtime.js', 'style.css', 'manifest.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md')
HERE = Path(__file__).resolve().parent

def validate_version(text):
    match = re.search(r'\b(\d+)\.(\d+)\.(\d+)(?:\.\d+)?', text)
    if not match or not ( (1, 2, 14) <= tuple(map(int, match.groups())) <= (1, 3, 4) ):
        raise RuntimeError('Diese Spotify-Version liegt außerhalb der Linux-Unterstützung von Spicetify 2.46.4 (1.2.14 bis 1.3.4). Keine Installation.')
    return match.group(0)

def verify_download(path, expected=SPICE_HASH):
    with open(path, 'rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest() if hasattr(hashlib, 'file_digest') else hashlib.sha256(stream.read()).hexdigest()
    if digest != expected:
        raise RuntimeError('Spicetify-Prüfsumme stimmt nicht. Installation abgebrochen.')

def extract_tool(archive, destination):
    destination = Path(destination).resolve()
    with tarfile.open(archive, 'r:gz') as tar:
        members = tar.getmembers()
        for member in members:
            target = (destination / member.name).resolve()
            if not target.is_relative_to(destination) or not (member.isfile() or member.isdir()):
                raise RuntimeError('Unzulässiger Pfad oder Link im Werkzeugarchiv.')
        # Validation above deliberately rejects symlinks, hard links and special files.
        for member in members:
            target = destination / member.name
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with tar.extractfile(member) as source, target.open('wb') as out:
                    shutil.copyfileobj(source, out)
                target.chmod(0o755 if member.mode & 0o111 else 0o644)

def desktop_quote(path):
    value = str(path)
    if '\n' in value or '\r' in value:
        raise RuntimeError('Zeilenumbruch im Installationspfad ist nicht unterstützt.')
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('$', '\\$').replace('%', '%%') + '"'

class Installer:
    def __init__(self, payload=HERE, home=None, env=None, run=subprocess.run):
        self.home = Path(home or Path.home()).resolve()
        self.env = dict(os.environ if env is None else env)
        self.data = Path(self.env.get('XDG_DATA_HOME') or self.home / '.local/share').resolve()
        self.config = Path(self.env.get('XDG_CONFIG_HOME') or self.home / '.config').resolve()
        self.root = self.data / 'myspoti'
        self.payload = Path(payload)
        self.run = run

    def discover(self):
        choices = (Path('/usr/share/spotify'), Path('/opt/spotify'), self.data / 'spotify-launcher/install/usr/share/spotify')
        for path in choices:
            if (path / 'spotify').is_file() and (path / 'Apps').is_dir():
                return path.resolve()
        raise RuntimeError('Keine native Spotify-Installation gefunden. Bitte Spotify als Debian-/native Distribution installieren und einmal starten. Snap, Flatpak und Nix sind in dieser Vorschau nicht unterstützt.')

    def check(self):
        if sys.platform != 'linux' or platform.machine() not in ('x86_64', 'AMD64'):
            raise RuntimeError('Dieser Installer benötigt Linux x86_64.')
        if os.geteuid() == 0:
            raise RuntimeError('Myspoti Setup als normaler Benutzer starten, nicht mit sudo.')
        source = self.discover()
        result = self.run([str(source / 'spotify'), '--version'], capture_output=True, text=True, timeout=20, check=True)
        version = validate_version(result.stdout + result.stderr)
        prefs = self.config / 'spotify/prefs'
        if not prefs.is_file():
            raise RuntimeError('Spotify zuerst normal starten und anmelden, danach vollständig schließen. Die lokale prefs-Datei fehlt.')
        running = self.run(['pgrep', '-x', 'spotify'], capture_output=True, timeout=10)
        if running.returncode == 0:
            raise RuntimeError('Spotify bitte vollständig schließen und erneut prüfen. So startet anschließend sicher die Myspoti-Kopie.')
        if running.returncode != 1:
            raise RuntimeError('Laufende Spotify-Prozesse konnten nicht geprüft werden.')
        # Only vendor program directories are copied, never the user profile.
        for path in source.rglob('*'):
            if path.is_symlink() and not path.resolve().is_relative_to(source):
                raise RuntimeError('Diese Spotify-Installation enthält externe Links und wird nicht automatisch kopiert.')
        return source, prefs, version

    def command(self, cli, args, env, log):
        result = self.run([str(cli), *args], env=env, capture_output=True, text=True, timeout=180)
        if result.returncode:
            # Keep raw host output local; do not export prefs or credentials.
            detail = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', (result.stdout or '') + (result.stderr or ''))
            raise RuntimeError('Spicetify fehlgeschlagen: ' + ' '.join(args) + '\n' + detail[-2000:])

    def install(self, log=print):
        source, prefs, version = self.check()
        log('Spotify ' + version + ' erkannt. Eigene lokale Programm-Kopie vorbereiten …')
        self.root.mkdir(parents=True, exist_ok=True)
        if self.root.is_symlink():
            raise RuntimeError('Verknüpfter Zielordner wird nicht verwendet.')
        total = sum(p.stat().st_size for p in source.rglob('*') if p.is_file())
        if shutil.disk_usage(self.root).free < total * 2 + 100_000_000:
            raise RuntimeError('Zu wenig freier Speicher für Programm-Kopie und Sicherung.')
        generation = self.root / 'versions' / uuid.uuid4().hex
        generation.mkdir(parents=True)
        archive = generation / 'spicetify.tar.gz'
        log('Spicetify aus offizieller Quelle herunterladen und Prüfsumme prüfen …')
        request = urllib.request.Request(SPICE_URL, headers={'User-Agent': 'Myspoti-Setup/0.2'})
        with urllib.request.urlopen(request, timeout=60) as response, archive.open('wb') as out:
            shutil.copyfileobj(response, out)
        verify_download(archive)
        tools = generation / 'tools'
        extract_tool(archive, tools)
        cli = tools / 'spicetify'
        if not cli.is_file():
            raise RuntimeError('Spicetify-Datei fehlt im Download.')
        client = generation / 'spotify'
        # All links were constrained to the vendor directory in check();
        # materialize them so absolute internal links cannot point back at system files.
        shutil.copytree(source, client, symlinks=False)
        # Keep an existing vendor-owned setuid sandbox helper, without changing permissions.
        sandbox = source / 'chrome-sandbox'
        if sandbox.is_file() and sandbox.stat().st_uid == 0 and sandbox.stat().st_mode & 0o4000:
            (client / 'chrome-sandbox').unlink()
            (client / 'chrome-sandbox').symlink_to(sandbox)
        config_dir = generation / 'spicetify'
        app_dir = config_dir / 'CustomApps/myspoti-desktop'
        app_dir.mkdir(parents=True)
        for name in FILES:
            shutil.copyfile(self.payload / 'app' / name, app_dir / name)
        settings = configparser.ConfigParser(interpolation=None)
        settings['Setting'] = {'spotify_path': str(client), 'prefs_path': str(prefs), 'inject_css': '1', 'replace_colors': '1'}
        settings['Preprocesses'] = {'expose_apis': '1'}
        settings['AdditionalOptions'] = {'custom_apps': 'myspoti-desktop'}
        with (config_dir / 'config-xpui.ini').open('w', encoding='utf-8') as stream:
            settings.write(stream)
        tool_env = {**self.env, 'SPICETIFY_CONFIG': str(config_dir)}
        log('Lokale Programm-Kopie sichern und Myspoti aktivieren …')
        self.command(cli, ['backup', '-n'], tool_env, log)
        self.command(cli, ['apply', '-n'], tool_env, log)
        launcher = self.root / 'launch.sh'
        staged = generation / 'launch.sh'
        staged.write_text('#!/bin/sh\nexec ' + shlex.quote(str(client / 'spotify')) + ' spotify:app:myspoti-desktop "$@"\n', encoding='utf-8')
        staged.chmod(0o755)
        icon = self.root / 'myspoti.svg'
        shutil.copyfile(self.payload / 'myspoti.svg', icon)
        entries = self.data / 'applications'
        entries.mkdir(parents=True, exist_ok=True)
        entry = '[Desktop Entry]\nType=Application\nName=Myspoti\nComment=Myspoti im lokalen Spotify-Client\nExec=' + desktop_quote(launcher) + '\nIcon=' + str(icon) + '\nTerminal=false\nCategories=AudioVideo;Audio;Player;\n'
        # Switch the launch target only after both Spicetify operations succeed.
        os.replace(staged, launcher)
        (entries / 'myspoti.desktop').write_text(entry, encoding='utf-8')
        for name in ('LICENSE', 'THIRD_PARTY_NOTICES.md'):
            shutil.copyfile(self.payload / 'app' / name, self.root / name)
        shutil.copyfile(self.payload / 'SOURCES.txt', self.root / 'SOURCES.txt')
        log('Fertig. Myspoti im Anwendungsmenü öffnen. Die originale Spotify-Installation und ihre Anmeldung bleiben lokal erhalten.')
        return launcher

def gui():
    import tkinter as tk
    from tkinter import messagebox, scrolledtext
    root = tk.Tk()
    root.title('Myspoti Setup · Linux-Vorschau')
    root.geometry('700x540')
    root.configure(bg='#121212')
    tk.Label(root, text='Myspoti für Linux', font=('sans', 24, 'bold'), bg='#121212', fg='white').pack(anchor='w', padx=24, pady=(20,12))
    tk.Label(root, text='Linux x86_64 · native Spotify-Installation · experimentelle Vorschau\nErstellt eine lokale Programm-Kopie. Keine Kontodaten im Download.\nSpotify vor der Einrichtung vollständig schließen.', justify='left', bg='#121212', fg='white').pack(anchor='w', padx=24)
    accepted = tk.BooleanVar()
    consent = tk.Checkbutton(root, text='Myspoti lokal einrichten und Spicetify herunterladen.', variable=accepted, bg='#121212', fg='white', selectcolor='#333333', activebackground='#121212', activeforeground='white')
    consent.pack(anchor='w', padx=20, pady=14)
    controls = tk.Frame(root, bg='#121212'); controls.pack(anchor='w', padx=24)
    log = scrolledtext.ScrolledText(root, height=13, bg='#202020', fg='white', wrap='word', state='disabled'); log.pack(fill='both', expand=True, padx=24, pady=18)
    messages = queue.Queue(); busy = [False]
    engine = Installer()
    def work(install):
        if install and not accepted.get():
            messagebox.showinfo('Myspoti', 'Bitte den Installationshinweis bestätigen.'); return
        busy[0] = True; check.configure(state='disabled'); run.configure(state='disabled')
        def task():
            try:
                if install: engine.install(lambda s: messages.put(s))
                else:
                    _, _, version = engine.check(); messages.put('Voraussetzungen erfüllt: Spotify ' + version + '. Noch nichts installiert.')
            except Exception as exc: messages.put('Fehler: ' + str(exc))
            finally: messages.put(None)
        threading.Thread(target=task, daemon=True).start()
    check = tk.Button(controls, text='Nur prüfen', command=lambda: work(False)); check.pack(side='left', padx=(0,12))
    run = tk.Button(controls, text='Myspoti installieren', bg='#1ed760', fg='black', command=lambda: work(True)); run.pack(side='left')
    tk.Button(controls, text='Hilfe / Quellcode', command=lambda: webbrowser.open('https://github.com/weikiboy-tech/myspoti-desktop/blob/main/docs/INSTALL-LINUX.md')).pack(side='left', padx=12)
    def poll():
        while not messages.empty():
            item = messages.get()
            if item is None:
                busy[0] = False; check.configure(state='normal'); run.configure(state='normal')
            else:
                log.configure(state='normal'); log.insert('end',item + '\n'); log.see('end'); log.configure(state='disabled')
        root.after(100, poll)
    root.protocol('WM_DELETE_WINDOW', lambda: None if busy[0] else root.destroy())
    if os.environ.get('MYSPOTI_GUI_SMOKE') == '1': root.after(500, root.destroy)
    poll(); root.mainloop()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--install', action='store_true')
    args = parser.parse_args()
    try:
        if args.check:
            print('Voraussetzungen erfüllt:', Installer().check()[2])
        elif args.install:
            if input('Myspoti lokal installieren? [ja/NEIN] ').strip().lower() == 'ja': Installer().install()
        else: gui()
    except ImportError:
        print('Die grafische Einrichtung benötigt python3-tk. Bitte über den Paketmanager installieren oder das .deb-Paket verwenden.', file=sys.stderr); sys.exit(1)
    except Exception as error:
        print('Fehler:', error, file=sys.stderr); sys.exit(1)
