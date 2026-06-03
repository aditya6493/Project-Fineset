@echo off
REM Paste this in PowerShell instead of running scripts from this folder (OneDrive corrupts new .ps1/.cjs files):
REM Get-ChildItem lib,app,components,hooks -Recurse -Include *.ts,*.tsx | %% { $b=[IO.File]::ReadAllBytes($_.FullName); if(($b|?{$_ -eq 0}).Count){ $_.FullName } }
echo See docs\ONEDRIVE_FILE_CORRUPTION.md
pause
