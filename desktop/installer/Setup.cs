// SPDX-License-Identifier: GPL-3.0-only
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Forms;

class Setup : Form {
    readonly TextBox log = new TextBox();
    readonly Button install = new Button();
    readonly Button check = new Button();
    readonly CheckBox consent = new CheckBox();
    bool busy;
    Setup() {
        Text = "Myspoti Setup · Vorschau";
        ClientSize = new Size(680, 510);
        MinimumSize = Size; MaximumSize = Size;
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 10);
        BackColor = Color.FromArgb(18,18,18); ForeColor = Color.White;
        using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("myspoti.ico")) Icon = new Icon(stream);
        var title = new Label { Text = "Myspoti für Windows", Font = new Font("Segoe UI",22,FontStyle.Bold), AutoSize = true, Location = new Point(24,20) };
        var info = new Label { Text = "Richtet Myspoti in deinem Spotify-Client ein, mit Desktop-Symbol.\nWindows x64 · Spotify 1.3.8.620 · experimentelle Vorschau\nKeine unabhängige Musik-App. Dein Konto bleibt ausschließlich lokal.", Location = new Point(26,78), Size = new Size(625,80) };
        consent.Text = "Spotify-UI ändern, lokal sichern und Spotify neu starten.";
        consent.SetBounds(26,160,625,32);
        consent.CheckedChanged += delegate { install.Enabled = consent.Checked && !busy; };
        install.Text = "Myspoti installieren"; install.SetBounds(26,205,220,42);
        install.BackColor = Color.FromArgb(30,215,96); install.ForeColor = Color.Black; install.Enabled = false;
        check.Text = "Nur prüfen"; check.SetBounds(258,205,160,42); check.ForeColor = Color.Black; check.BackColor = Color.Gainsboro;
        var download = new LinkLabel { Text = "Spotify herunterladen", Location = new Point(440,215), AutoSize = true, LinkColor = Color.LightGreen };
        download.LinkClicked += delegate { Process.Start(new ProcessStartInfo("https://www.spotify.com/download/windows/") { UseShellExecute = true }); };
        log.Multiline = true; log.ReadOnly = true; log.ScrollBars = ScrollBars.Vertical; log.AccessibleName = "Installationsstatus";
        log.SetBounds(26,265,625,190); log.BackColor = Color.FromArgb(30,30,30); log.ForeColor = Color.White;
        var source = new LinkLabel { Text = "GPL-3.0 · Quellcode, Herkunft und Hilfe", Location = new Point(26,475), AutoSize = true, LinkColor = Color.LightGreen };
        source.LinkClicked += delegate { Process.Start(new ProcessStartInfo("https://github.com/weikiboy-tech/myspoti-desktop") { UseShellExecute = true }); };
        Controls.AddRange(new Control[] {title,info,consent,install,check,download,log,source});
        check.Click += async delegate { await Run(true); };
        install.Click += async delegate { await Run(false); };
        FormClosing += delegate(object sender, FormClosingEventArgs e) { if (busy) e.Cancel = true; };
    }
    void Append(string line) {
        if (line == null) return;
        if (InvokeRequired) { BeginInvoke(new Action<string>(Append), line); return; }
        log.AppendText(System.Text.RegularExpressions.Regex.Replace(line, @"\x1B\[[0-?]*[ -/]*[@-~]", "") + Environment.NewLine);
    }
    async Task Run(bool checkOnly) {
        busy = true; install.Enabled = check.Enabled = consent.Enabled = false; log.Clear();
        try { int exit = await Task.Run(() => Execute(checkOnly, Append)); Append(exit == 0 ? "Vorgang erfolgreich abgeschlossen." : "Vorgang nicht abgeschlossen. Siehe Meldung oben."); }
        catch (Exception e) { Append("Setup konnte nicht ausgeführt werden: " + e.Message); }
        finally { busy = false; check.Enabled = consent.Enabled = true; install.Enabled = consent.Checked; }
    }
    static int Execute(bool checkOnly, Action<string> output) {
        string temporaryRoot = Path.GetFullPath(Path.GetTempPath());
        string staging = Path.Combine(temporaryRoot, "Myspoti-Setup-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(staging);
        try {
            using (var resource = Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))
            using (var zip = new ZipArchive(resource, ZipArchiveMode.Read)) {
                foreach (var entry in zip.Entries) {
                    if (Path.GetFileName(entry.FullName) != entry.FullName) throw new InvalidDataException("Invalid package path");
                    entry.ExtractToFile(Path.Combine(staging, entry.FullName));
                }
            }
            return Installer.Execute(staging,checkOnly,output);
        } finally {
            if (Path.GetFullPath(staging).StartsWith(temporaryRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) Directory.Delete(staging, true);
        }
    }
    [STAThread] static int Main(string[] args) {
        if (args.Length == 1 && args[0] == "--check") return Execute(true, Console.WriteLine);
        Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false); Application.Run(new Setup()); return 0;
    }
}
