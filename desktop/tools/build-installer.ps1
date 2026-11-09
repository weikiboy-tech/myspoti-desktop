# SPDX-License-Identifier: GPL-3.0-only
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$repo = Split-Path -Parent $root
& node (Join-Path $PSScriptRoot 'build.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Custom-App build failed' }
$out = Join-Path $root 'dist\installer'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$app = Join-Path $root 'dist\myspoti-desktop'
$revision = (& git -C $repo rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Source revision missing' }
@"
Myspoti Desktop - GPL-3.0
Corresponding source: https://github.com/weikiboy-tech/myspoti-desktop/tree/$revision
Upstream: https://github.com/kota-zo/myspoti
Spicetify is downloaded separately from https://github.com/spicetify/cli/releases/tag/v2.46.4
No Spotify binaries or user profiles are included.
"@ | Set-Content -LiteralPath (Join-Path $out 'SOURCES.txt') -Encoding UTF8
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$payload = Join-Path $out 'payload.zip'
$stream = [IO.File]::Open($payload, [IO.FileMode]::Create)
$zip = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($name in @('index.js','myspoti-runtime.js','style.css','manifest.json','myspoti.ico','LICENSE','THIRD_PARTY_NOTICES.md')) {
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $app $name),$name) | Out-Null
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $out 'SOURCES.txt'),'SOURCES.txt') | Out-Null
} finally { $zip.Dispose(); $stream.Dispose() }
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$exe = Join-Path $out 'Myspoti-Setup.exe'
& $compiler /nologo /target:winexe /platform:x64 "/out:$exe" "/win32icon:$(Join-Path $app 'myspoti.ico')" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll /reference:Microsoft.CSharp.dll "/resource:$payload,payload.zip" "/resource:$(Join-Path $app 'myspoti.ico'),myspoti.ico" (Join-Path $root 'installer\Setup.cs') (Join-Path $root 'installer\Installer.cs')
if ($LASTEXITCODE -ne 0) { throw 'Installer compilation failed' }
Get-FileHash -LiteralPath $exe -Algorithm SHA256 | Format-List
Write-Output "Built: $exe"
