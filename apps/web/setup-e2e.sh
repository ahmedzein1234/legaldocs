#!/bin/bash

# E2E Testing Setup Script for LegalDocs
# This script sets up and verifies E2E testing environment

set -e

echo "🚀 Setting up E2E Testing for LegalDocs..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from apps/web directory${NC}"
    exit 1
fi

# Step 1: Check Node.js version
echo -e "${YELLOW}Step 1: Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Install Playwright browsers
echo -e "${YELLOW}Step 3: Installing Playwright browsers...${NC}"
npx playwright install
echo -e "${GREEN}✓ Playwright browsers installed${NC}"
echo ""

# Step 4: Create necessary directories
echo -e "${YELLOW}Step 4: Creating test directories...${NC}"
mkdir -p .auth
mkdir -p test-results
mkdir -p playwright-report
echo -e "${GREEN}✓ Test directories created${NC}"
echo ""

# Step 5: Check if environment file exists
echo -e "${YELLOW}Step 5: Checking environment configuration...${NC}"
if [ ! -f ".env.test" ]; then
    echo -e "${YELLOW}⚠ .env.test not found. Creating from example...${NC}"
    cp .env.test.example .env.test
    echo -e "${GREEN}✓ .env.test created. Please update with your configuration.${NC}"
else
    echo -e "${GREEN}✓ .env.test already exists${NC}"
fi
echo ""

# Step 6: Verify test files exist
echo -e "${YELLOW}Step 6: Verifying test files...${NC}"
TEST_FILES=(
    "e2e/auth.spec.ts"
    "e2e/dashboard.spec.ts"
    "e2e/documents.spec.ts"
    "e2e/templates.spec.ts"
    "e2e/generate.spec.ts"
    "e2e/signatures.spec.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file not found${NC}"
    fi
done
echo ""

# Step 7: Verify utility files
echo -e "${YELLOW}Step 7: Verifying utility files...${NC}"
UTIL_FILES=(
    "e2e/utils/test-helpers.ts"
    "e2e/utils/auth-helpers.ts"
    "e2e/utils/fixtures.ts"
)

for file in "${UTIL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file not found${NC}"
    fi
done
echo ""

# Step 8: Verify configuration
echo -e "${YELLOW}Step 8: Verifying Playwright configuration...${NC}"
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✓ playwright.config.ts${NC}"
else
    echo -e "${RED}✗ playwright.config.ts not found${NC}"
fi
echo ""

# Step 9: Check if application is running
echo -e "${YELLOW}Step 9: Checking if application is running...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Application is not running on http://localhost:3000${NC}"
    echo -e "${YELLOW}  Please start the application with: npm run dev${NC}"
fi
echo ""

# Step 10: Run a quick test
echo -e "${YELLOW}Step 10: Running a quick verification test...${NC}"
echo -e "${YELLOW}This will list all available tests without running them${NC}"
npx playwright test --list | head -20
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ E2E Testing Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Update ${YELLOW}.env.test${NC} with your test configuration"
echo -e "2. Start your application: ${YELLOW}npm run dev${NC}"
echo -e "3. Run tests in UI mode: ${YELLOW}npm run test:e2e:ui${NC}"
echo -e "4. Or run all tests: ${YELLOW}npm run test:e2e${NC}"
echo ""
echo -e "Documentation:"
echo -e "- Quick Start: ${YELLOW}QUICKSTART-E2E.md${NC}"
echo -e "- Full Guide: ${YELLOW}TESTING.md${NC}"
echo -e "- Cheat Sheet: ${YELLOW}E2E-CHEATSHEET.md${NC}"
echo -e "- E2E README: ${YELLOW}e2e/README.md${NC}"
echo ""
echo -e "Happy Testing! 🎉"
