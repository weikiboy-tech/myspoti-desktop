// SPDX-License-Identifier: GPL-3.0-only
using System;
using System.IO;
class InstallerTests {
    static int Main() {
        Installer.CheckVersion("1.3.8.620");
        foreach (var version in new[] {"1.3.9.1", "1.3.7.1", "", null}) {
            bool rejected = false;
            try { Installer.CheckVersion(version); } catch (InvalidOperationException) { rejected = true; }
            if (!rejected) throw new Exception("Untested version accepted");
        }
        string corrupted = Path.GetTempFileName();
        try {
            File.WriteAllText(corrupted,"This is not the verified Spicetify archive");
            bool rejected = false;
            try { Installer.ValidateArchive(corrupted); } catch (InvalidDataException) { rejected = true; }
            if (!rejected) throw new Exception("Corrupted download accepted");
        } finally { File.Delete(corrupted); }
        string fixture = Path.Combine(Path.GetTempPath(),"Myspoti-BackupTest-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(fixture,"Backup"));
        try {
            File.WriteAllText(Path.Combine(fixture,"config-xpui.ini"),"[Setting]\nother=value\n[Backup]\nversion = 1.3.8.620.gtest\nwith = 2.46.4\n");
            if (Installer.MatchingBackup(fixture,"1.3.8.620")) throw new Exception("Missing backup accepted");
            File.WriteAllText(Path.Combine(fixture,"Backup","xpui.spa"),"test fixture");
            File.WriteAllText(Path.Combine(fixture,"Backup","login.spa"),"test fixture");
            if (!Installer.MatchingBackup(fixture,"1.3.8.620")) throw new Exception("Matching backup rejected");
            if (Installer.MatchingBackup(fixture,"1.3.9.1")) throw new Exception("Wrong-version backup accepted");
        } finally {
            foreach (var name in new[] {"xpui.spa","login.spa"}) File.Delete(Path.Combine(fixture,"Backup",name));
            File.Delete(Path.Combine(fixture,"config-xpui.ini")); Directory.Delete(Path.Combine(fixture,"Backup")); Directory.Delete(fixture);
        }
        Console.WriteLine("Installer: version, corrupted download and existing-backup checks passed.");
        return 0;
    }
}
