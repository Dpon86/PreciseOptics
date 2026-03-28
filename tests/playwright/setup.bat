@echo off
REM PreciseOptics Playwright Test Setup Script (Windows CMD)
REM This script will set up everything you need to run Playwright tests

echo.
echo ========================================
echo   PreciseOptics Playwright Test Setup  
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1/5: Installing NPM dependencies...
if exist package.json (
    call npm install
    if %ERRORLEVEL% EQU 0 (
        echo [32m[OK] NPM dependencies installed successfully[0m
    ) else (
        echo [31m[ERROR] Failed to install NPM dependencies[0m
        echo Please make sure Node.js is installed: https://nodejs.org/
        exit /b 1
    )
) else (
    echo [31m[ERROR] package.json not found![0m
    exit /b 1
)
echo.

echo Step 2/5: Installing Playwright browsers...
echo (This may take a few minutes on first run)
call npx playwright install chromium
if %ERRORLEVEL% EQU 0 (
    echo [32m[OK] Playwright browsers installed successfully[0m
) else (
    echo [31m[ERROR] Failed to install Playwright browsers[0m
    exit /b 1
)
echo.

echo Step 3/5: Setting up environment configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [32m[OK] Created .env file from template[0m
        echo Default credentials: admin / admin123
    ) else (
        echo [33m[WARNING] .env.example not found, creating default .env[0m
        (
            echo # Test User Credentials
            echo TEST_USERNAME=admin
            echo TEST_PASSWORD=admin123
            echo.
            echo # Server URLs
            echo BASE_URL=http://localhost:3000
            echo API_URL=http://localhost:8000
            echo.
            echo # Test Configuration
            echo HEADLESS=true
        ) > .env
        echo [32m[OK] Created default .env file[0m
    )
) else (
    echo [32m[OK] .env file already exists[0m
)
echo.

echo Step 4/5: Checking for test user...
echo The tests require a superuser with credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Please create this user manually:
echo   1. Open a terminal
echo   2. cd Backend
echo   3. python manage.py createsuperuser
echo   4. Enter username: admin
echo   5. Enter password: admin123
echo.

echo Step 5/5: Verifying helper scripts...
if exist start-servers.ps1 (
    echo [32m[OK] Server startup script exists[0m
) else (
    echo [33m[WARNING] start-servers.ps1 not found[0m
)
echo.

echo ========================================
echo   [32mSetup Complete![0m                    
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Create test user (if not done yet):
echo    cd ..\..\Backend
echo    python manage.py createsuperuser
echo    Username: admin, Password: admin123
echo.
echo 2. Start servers (PowerShell):
echo    .\start-servers.ps1
echo.
echo 3. Run tests (new terminal):
echo    cd tests\playwright
echo    npm test
echo.
echo 4. View results:
echo    npm run report
echo.
echo [32mHappy Testing![0m
echo.
pause
