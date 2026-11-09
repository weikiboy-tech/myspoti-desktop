# SPDX-License-Identifier: GPL-3.0-only
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'dist\installer'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$exe = Join-Path $out 'InstallerTests.exe'
& $compiler /nologo /target:exe /platform:x64 "/out:$exe" /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll /reference:Microsoft.CSharp.dll (Join-Path $root 'installer\InstallerTests.cs') (Join-Path $root 'installer\Installer.cs')
if ($LASTEXITCODE -ne 0) { throw 'Installer tests compilation failed' }
& $exe
if ($LASTEXITCODE -ne 0) { throw 'Installer tests failed' }
