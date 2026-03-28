# Start Backend and Frontend Servers for Testing

Write-Host "Starting PreciseOptics Test Environment..." -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Check if backend is already running
if (Test-Port 8000) {
    Write-Host "[+] Backend already running on port 8000" -ForegroundColor Yellow
} else {
    Write-Host "[>] Starting Django backend on port 8000..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..\..\Backend; python manage.py runserver 8000"
    Start-Sleep -Seconds 3
}

# Check if frontend is already running
if (Test-Port 3000) {
    Write-Host "[+] Frontend already running on port 3000" -ForegroundColor Yellow
} else {
    Write-Host "[>] Starting React frontend on port 3000..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..\..\frontend; npm start"
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "[*] Waiting for servers to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Test backend health
Write-Host "[*] Testing backend..." -ForegroundColor Cyan
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "[+] Backend is ready!" -ForegroundColor Green
} catch {
    Write-Host "[!] Backend may not be ready yet (this is normal on first start)" -ForegroundColor Yellow
}

# Test frontend health
Write-Host "[*] Testing frontend..." -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "[+] Frontend is ready!" -ForegroundColor Green
} catch {
    Write-Host "[!] Frontend may not be ready yet (React may still be compiling)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[+] Test environment is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait 30-60 seconds for servers to fully start"
Write-Host "   2. Open a new terminal"
Write-Host "   3. Run: cd tests\playwright"
Write-Host "   4. Run: npm test"
Write-Host ""
Write-Host "[!] To stop servers: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""
