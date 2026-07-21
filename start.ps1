$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$env:Path = "$PSScriptRoot\.node\node-v20.15.0-win-x64;" + $env:Path

Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting JKSPDC Web Platform (Frontend & Backend)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

& "$PSScriptRoot\.node\node-v20.15.0-win-x64\node.exe" "$PSScriptRoot\dev.js"
