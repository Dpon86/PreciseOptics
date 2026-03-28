# PreciseOptics Playwright Test Setup Script (Windows)
# This script will set up everything you need to run Playwright tests

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PreciseOptics Playwright Test Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Get script location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "[*] Working directory: $ScriptDir" -ForegroundColor Gray
Write-Host ""

# Step 1: Install NPM dependencies
Write-Host "Step 1/5: Installing NPM dependencies..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] NPM dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[-] Failed to install NPM dependencies" -ForegroundColor Red
        Write-Host "  Please make sure Node.js is installed: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[-] package.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install Playwright browsers
Write-Host "Step 2/5: Installing Playwright browsers..." -ForegroundColor Cyan
Write-Host "  (This may take a few minutes on first run)" -ForegroundColor Gray
npx playwright install chromium
if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Playwright browsers installed successfully" -ForegroundColor Green
} else {
    Write-Host "[-] Failed to install Playwright browsers" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Create .env file if it doesn't exist
Write-Host "Step 3/5: Setting up environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[+] Created .env file from template" -ForegroundColor Green
        Write-Host "  Default credentials: admin / admin123" -ForegroundColor Gray
    } else {
        Write-Host "[!] .env.example not found, creating default .env" -ForegroundColor Yellow
        @"
# Test User Credentials
TEST_USERNAME=dr.smith
TEST_PASSWORD=password123

# Server URLs
BASE_URL=http://localhost:3000
API_URL=http://localhost:8000

# Test Configuration
HEADLESS=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "[+] Created default .env file" -ForegroundColor Green
    }
} else {
    Write-Host "[+] .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Create test users
Write-Host "Step 4/5: Creating test users..." -ForegroundColor Cyan
Write-Host "  Creating doctor user (dr.smith) and other test users" -ForegroundColor Gray
Write-Host ""

$BackendPath = Join-Path $ScriptDir "..\..\Backend"
if (Test-Path $BackendPath) {
    Write-Host "  Running create_test_user.py script..." -ForegroundColor Cyan
    
    Set-Location $BackendPath
    python create_test_user.py
    Set-Location $ScriptDir
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Test users created or verified successfully" -ForegroundColor Green
        Write-Host "  Login as: dr.smith / password123" -ForegroundColor Gray
        Write-Host "[+] Test users created or verified successfully" -ForegroundColor Green
        Write-Host "  Login as: dr.smith / password123" -ForegroundColor Gray
    } else {
        Write-Host "[!] User creation failed or users already exist" -ForegroundColor Yellow
        Write-Host "  If users already exist, that's fine! Continue with setup." -ForegroundColor Gray
    }
} else {
    Write-Host "[!] Backend directory not found at expected location" -ForegroundColor Yellow
    Write-Host "  You'll need to create test users manually:" -ForegroundColor Gray
    Write-Host "    cd Backend" -ForegroundColor Gray
    Write-Host "    python create_test_user.py" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Create helper scripts if they don't exist
Write-Host "Step 5/5: Verifying helper scripts..." -ForegroundColor Cyan
if (Test-Path "start-servers.ps1") {
    Write-Host "[+] Server startup script exists" -ForegroundColor Green
} else {
    Write-Host "[!] start-servers.ps1 not found" -ForegroundColor Yellow
}
Write-Host ""

# Setup complete
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!                       " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the servers:" -ForegroundColor White
Write-Host "   Option A (Automated):" -ForegroundColor Gray
Write-Host "     .\start-servers.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Option B (Manual - 2 separate terminals):" -ForegroundColor Gray
Write-Host "     Terminal 1: cd ..\..\Backend; python manage.py runserver 8000" -ForegroundColor Yellow
Write-Host "     Terminal 2: cd ..\..\frontend; npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Wait 30-60 seconds for servers to fully start" -ForegroundColor White
Write-Host ""
Write-Host "3. In a NEW terminal, run tests:" -ForegroundColor White
Write-Host "     cd tests\playwright" -ForegroundColor Yellow
Write-Host "     npm run check:servers  # Verify servers are ready" -ForegroundColor Yellow
Write-Host "     npm test               # Run all tests" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. View test results:" -ForegroundColor White
Write-Host "     npm run report" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: QUICKSTART.md" -ForegroundColor Gray
Write-Host "   - Full Guide:  README.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy Testing!" -ForegroundColor Green
Write-Host ""
