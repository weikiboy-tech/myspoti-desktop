# SPDX-License-Identifier: GPL-3.0-only
[CmdletBinding()]
param(
    [string]$SpotifyPath = (Join-Path $env:APPDATA 'Spotify\Spotify.exe'),
    [string]$InstallDirectory = (Join-Path $env:LOCALAPPDATA 'Myspoti')
)
$ErrorActionPreference = 'Stop'
$iconSource = Join-Path $PSScriptRoot '..\dist\myspoti-desktop\myspoti.ico'
if (-not (Test-Path -LiteralPath $SpotifyPath -PathType Leaf)) { throw 'Spotify fehlt. Zuerst den offiziellen Client installieren.' }
if (-not (Test-Path -LiteralPath $iconSource -PathType Leaf)) { throw 'Zuerst npm run build ausfuehren.' }
if (-not (Test-Path -LiteralPath (Join-Path $env:APPDATA 'spicetify\CustomApps\myspoti-desktop\manifest.json'))) {
    throw 'Zuerst die Myspoti-Custom-App installieren und spicetify apply ausfuehren.'
}
New-Item -ItemType Directory -Path $InstallDirectory -Force | Out-Null
$iconPath = Join-Path $InstallDirectory 'myspoti.ico'
Copy-Item -LiteralPath $iconSource -Destination $iconPath -Force
$shell = New-Object -ComObject WScript.Shell
foreach ($folder in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    $shortcutPath = Join-Path $folder 'Myspoti.lnk'
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $SpotifyPath
    $shortcut.Arguments = 'spotify:app:myspoti-desktop'
    $shortcut.WorkingDirectory = Split-Path -Parent $SpotifyPath
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Description = 'Myspoti - Oberflaeche im installierten Spotify-Client'
    $shortcut.Save()
    Write-Output "Erstellt: $shortcutPath"
}
# Deliberately never reads or copies Spotify profiles, cookies, tokens or credentials.
