// SPDX-License-Identifier: GPL-3.0-only
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

static class Installer {
    const string Hash = "0490380BF59E00C94CF6CB12BFAC5152791B91BB8009ACEEF53C49815B45A56F";
    internal static readonly string[] AppFiles = { "index.js", "myspoti-runtime.js", "style.css", "manifest.json", "myspoti.ico", "LICENSE", "THIRD_PARTY_NOTICES.md" };
    internal static void CheckVersion(string version) {
        if (version != "1.3.8.620") throw new InvalidOperationException("Spotify " + version + " ist für diese Vorschau noch nicht getestet. Bitte eine passende Myspoti-Version abwarten; Spotify nicht downgraden.");
    }
    internal static bool MatchingBackup(string directory,string version) {
        string config = Path.Combine(directory,"config-xpui.ini");
        if (!File.Exists(config)) return false;
        var section = Regex.Match(File.ReadAllText(config), @"(?ms)^\[Backup\]\s*\r?\n(?<body>.*?)(?=^\[|\z)");
        var saved = Regex.Match(section.Groups["body"].Value, @"(?m)^version\s*=\s*([^\r\n]+)").Groups[1].Value.Trim();
        if (saved != version && !saved.StartsWith(version + ".",StringComparison.Ordinal)) return false;
        foreach(var name in new[] {"xpui.spa","login.spa"}) {
            var file = new FileInfo(Path.Combine(directory,"Backup",name));
            if (!file.Exists || file.Length == 0) return false;
        }
        return true;
    }
    static int Run(string exe, string args, Action<string> output) {
        var start = new ProcessStartInfo(exe,args) { UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
        using (var process = new Process { StartInfo = start }) {
            process.OutputDataReceived += (s,e) => { if(e.Data != null) output(e.Data); };
            process.ErrorDataReceived += (s,e) => { if(e.Data != null) output(e.Data); };
            process.Start(); process.BeginOutputReadLine(); process.BeginErrorReadLine(); process.WaitForExit(); return process.ExitCode;
        }
    }
    static void Cli(string exe, string args, Action<string> output) {
        int exit = Run(exe,args,output);
        if (exit != 0) throw new InvalidOperationException("Spicetify fehlgeschlagen: " + args + " (Exit " + exit + ").");
    }
    static void CopyTree(string source,string target) {
        if ((File.GetAttributes(source) & FileAttributes.ReparsePoint) != 0) throw new IOException("Verknüpfter App-Ordner wird nicht überschrieben.");
        Directory.CreateDirectory(target);
        foreach (var file in Directory.GetFiles(source)) {
            if ((File.GetAttributes(file) & FileAttributes.ReparsePoint) != 0) throw new IOException("Verknüpfte App-Datei wird nicht kopiert.");
            File.Copy(file,Path.Combine(target,Path.GetFileName(file)),true);
        }
        foreach (var dir in Directory.GetDirectories(source)) CopyTree(dir,Path.Combine(target,Path.GetFileName(dir)));
    }
    static void Extract(string archive,string target) {
        string root = Path.GetFullPath(target).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        Directory.CreateDirectory(root);
        using (var zip = ZipFile.OpenRead(archive)) foreach (var entry in zip.Entries) {
            string destination = Path.GetFullPath(Path.Combine(root,entry.FullName));
            if (!destination.StartsWith(root,StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Ungültiger Archivpfad.");
            if (entry.Name.Length == 0) { Directory.CreateDirectory(destination); continue; }
            Directory.CreateDirectory(Path.GetDirectoryName(destination)); entry.ExtractToFile(destination,true);
        }
    }
    internal static void ValidateArchive(string archive) {
        using (var sha = SHA256.Create()) using (var stream = File.OpenRead(archive)) {
            if (BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "") != Hash) throw new InvalidDataException("Spicetify-Prüfsumme stimmt nicht. Installation abgebrochen.");
        }
    }
    internal static int Execute(string payload,bool checkOnly,Action<string> output) {
        try {
            if (Environment.GetEnvironmentVariable("PROCESSOR_ARCHITECTURE") != "AMD64") throw new InvalidOperationException("Diese Vorschau unterstützt Windows x64.");
            string roaming = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string spotify = Path.Combine(roaming,"Spotify","Spotify.exe");
            if (!File.Exists(spotify)) throw new FileNotFoundException("Spotify fehlt. Den offiziellen Desktop-Client herunterladen, einmal starten und Setup erneut öffnen. Die Store-Version wird noch nicht unterstützt.");
            string version = FileVersionInfo.GetVersionInfo(spotify).FileVersion;
            output("Spotify erkannt: " + version); CheckVersion(version);
            output("Experimentelle Kombination: Spotify 1.3.8.620 / Spicetify 2.46.4. Lokal getestet, keine allgemeine Stabilitätszusage.");
            if (checkOnly) { output("Voraussetzungen erfüllt. Noch nichts installiert."); return 0; }
            string root = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Myspoti");
            string tools = Path.Combine(root,"tools","spicetify-2.46.4");
            Directory.CreateDirectory(root);
            string archive = Path.Combine(root,"spicetify-2.46.4.zip");
            output("Spicetify von github.com/spicetify/cli herunterladen …");
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var web = new WebClient()) {
                web.Headers[HttpRequestHeader.UserAgent] = "Myspoti-Setup/0.1";
                web.DownloadFile("https://github.com/spicetify/cli/releases/download/v2.46.4/spicetify-2.46.4-windows-x64.zip",archive);
            }
            ValidateArchive(archive); Extract(archive,tools);
            string cli = Path.Combine(tools,"spicetify.exe");
            string config = Path.Combine(roaming,"spicetify","config-xpui.ini");
            string target = Path.Combine(roaming,"spicetify","CustomApps","myspoti-desktop");
            string backup = Path.Combine(root,"backups",Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(backup);
            bool hadConfig = File.Exists(config), hadApp = Directory.Exists(target);
            if (hadConfig) File.Copy(config,Path.Combine(backup,"config-xpui.ini"));
            if (hadApp) {
                string manifest = Path.Combine(target,"manifest.json");
                if (!File.Exists(manifest) || !File.ReadAllText(manifest).Contains("myspoti-runtime.js")) throw new IOException("Unbekannte vorhandene Custom-App. Bitte zuerst manuell prüfen.");
                CopyTree(target,Path.Combine(backup,"myspoti-desktop"));
            }
            output("Lokale Konfiguration sichern; Spotify-Ressourcen sichern …");
            if (MatchingBackup(Path.Combine(roaming,"spicetify"),version)) output("Vorhandene Sicherung dieser Spotify-Version wird beibehalten.");
            else Cli(cli,"backup -n",output);
            try {
                Directory.CreateDirectory(target);
                foreach (var file in AppFiles) File.Copy(Path.Combine(payload,file),Path.Combine(target,file),true);
                Cli(cli,"config custom_apps myspoti-desktop",output);
                output("Myspoti aktivieren. Spotify wird neu gestartet …");
                Cli(cli,"apply",output);
            } catch {
                if (hadConfig) File.Copy(Path.Combine(backup,"config-xpui.ini"),config,true);
                else Run(cli,"config custom_apps myspoti-desktop-",output);
                if (hadApp) CopyTree(Path.Combine(backup,"myspoti-desktop"),target);
                output("Vorhandene Konfiguration zurückkopiert. Erneutes spicetify apply kann erforderlich sein. Sicherung: " + backup);
                throw;
            }
            foreach (var file in new[] {"myspoti.ico","LICENSE","THIRD_PARTY_NOTICES.md","SOURCES.txt"}) File.Copy(Path.Combine(payload,file),Path.Combine(root,file),true);
            dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
            foreach (var folder in new[] {Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),Environment.GetFolderPath(Environment.SpecialFolder.Programs)}) {
                dynamic shortcut = shell.CreateShortcut(Path.Combine(folder,"Myspoti.lnk"));
                shortcut.TargetPath = spotify; shortcut.Arguments = "spotify:app:myspoti-desktop";
                shortcut.IconLocation = Path.Combine(root,"myspoti.ico") + ",0";
                shortcut.Description = "Myspoti - Oberfläche im Spotify-Client"; shortcut.Save();
            }
            output("Fertig. Myspoti ist eingerichtet. Die Anmeldung erfolgt ausschließlich in deinem lokalen Spotify-Client."); return 0;
        } catch(Exception e) { output("Fehler: " + e.Message); return 1; }
    }
}
