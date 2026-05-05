# Run this from PowerShell inside the project folder:
#   cd C:\Users\david\Documents\Claude\Projects\IntercambioCartasMundial
#   .\push-to-github.ps1
#
# Prerequisites:
#   1. Git for Windows is installed (check with: git --version)
#   2. You have already created an EMPTY repo at:
#        https://github.com/davidbenavides86/IntercambioCartasMundial
#      (do NOT add a README, .gitignore, or license — leave it blank)

$ErrorActionPreference = "Stop"

Write-Host "==> Cleaning up any stray git lock files..." -ForegroundColor Cyan
Remove-Item -Force -ErrorAction SilentlyContinue ".git\config.lock"
Remove-Item -Force -ErrorAction SilentlyContinue ".git\index.lock"

Write-Host "==> Resetting .git/config to a clean state..." -ForegroundColor Cyan
@"
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
"@ | Set-Content -Encoding ASCII ".git\config"

Write-Host "==> Configuring git identity (local to this repo)..." -ForegroundColor Cyan
git config user.name  "davidbenavides86"
git config user.email "davidbenavides86@gmail.com"
git config init.defaultBranch main

Write-Host "==> Staging files..." -ForegroundColor Cyan
git add .

Write-Host "==> Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Intercambio Cartas Mundial"

Write-Host "==> Adding GitHub remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/davidbenavides86/IntercambioCartasMundial.git

Write-Host "==> Pushing to GitHub (a browser window may open for sign-in)..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "Done. Visit: https://github.com/davidbenavides86/IntercambioCartasMundial" -ForegroundColor Green
