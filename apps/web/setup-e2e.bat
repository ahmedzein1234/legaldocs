@echo off
REM E2E Testing Setup Script for LegalDocs (Windows)
REM This script sets up and verifies E2E testing environment

echo.
echo ============================================
echo Setting up E2E Testing for LegalDocs...
echo ============================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ERROR: package.json not found. Please run this script from apps\web directory
    exit /b 1
)

REM Step 1: Check Node.js
echo Step 1: Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)
echo [OK] Node.js version:
node -v
echo.

REM Step 2: Install dependencies
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Install Playwright browsers
echo Step 3: Installing Playwright browsers...
echo This may take a few minutes...
call npx playwright install
if errorlevel 1 (
    echo ERROR: Failed to install Playwright browsers
    exit /b 1
)
echo [OK] Playwright browsers installed
echo.

REM Step 4: Create necessary directories
echo Step 4: Creating test directories...
if not exist .auth mkdir .auth
if not exist test-results mkdir test-results
if not exist playwright-report mkdir playwright-report
echo [OK] Test directories created
echo.

REM Step 5: Check environment file
echo Step 5: Checking environment configuration...
if not exist .env.test (
    echo WARNING: .env.test not found. Creating from example...
    copy .env.test.example .env.test >nul
    echo [OK] .env.test created. Please update with your configuration.
) else (
    echo [OK] .env.test already exists
)
echo.

REM Step 6: Verify test files
echo Step 6: Verifying test files...
set TEST_COUNT=0

if exist e2e\auth.spec.ts (
    echo [OK] e2e\auth.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\auth.spec.ts not found
)

if exist e2e\dashboard.spec.ts (
    echo [OK] e2e\dashboard.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\dashboard.spec.ts not found
)

if exist e2e\documents.spec.ts (
    echo [OK] e2e\documents.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\documents.spec.ts not found
)

if exist e2e\templates.spec.ts (
    echo [OK] e2e\templates.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\templates.spec.ts not found
)

if exist e2e\generate.spec.ts (
    echo [OK] e2e\generate.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\generate.spec.ts not found
)

if exist e2e\signatures.spec.ts (
    echo [OK] e2e\signatures.spec.ts
    set /a TEST_COUNT+=1
) else (
    echo [X] e2e\signatures.spec.ts not found
)

echo Found %TEST_COUNT% of 6 test files
echo.

REM Step 7: Verify utility files
echo Step 7: Verifying utility files...
if exist e2e\utils\test-helpers.ts echo [OK] e2e\utils\test-helpers.ts
if exist e2e\utils\auth-helpers.ts echo [OK] e2e\utils\auth-helpers.ts
if exist e2e\utils\fixtures.ts echo [OK] e2e\utils\fixtures.ts
echo.

REM Step 8: Verify configuration
echo Step 8: Verifying Playwright configuration...
if exist playwright.config.ts (
    echo [OK] playwright.config.ts
) else (
    echo [X] playwright.config.ts not found
)
echo.

REM Step 9: Check if application is running
echo Step 9: Checking if application is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo WARNING: Application is not running on http://localhost:3000
    echo          Please start the application with: npm run dev
) else (
    echo [OK] Application is running on http://localhost:3000
)
echo.

REM Step 10: List available tests
echo Step 10: Listing available tests...
echo This will list all available tests without running them
echo.
call npx playwright test --list | more
echo.

REM Summary
echo.
echo ============================================
echo E2E Testing Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Update .env.test with your test configuration
echo 2. Start your application: npm run dev
echo 3. Run tests in UI mode: npm run test:e2e:ui
echo 4. Or run all tests: npm run test:e2e
echo.
echo Documentation:
echo - Quick Start: QUICKSTART-E2E.md
echo - Full Guide: TESTING.md
echo - Cheat Sheet: E2E-CHEATSHEET.md
echo - E2E README: e2e\README.md
echo.
echo Happy Testing!
echo.

pause
