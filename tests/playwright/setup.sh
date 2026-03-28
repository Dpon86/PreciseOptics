#!/bin/bash
# PreciseOptics Playwright Test Setup Script (Linux/Mac)
# This script will set up everything you need to run Playwright tests

echo ""
echo "========================================"
echo "  PreciseOptics Playwright Test Setup  "
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $SCRIPT_DIR"
echo ""

# Step 1: Install NPM dependencies
echo "Step 1/5: Installing NPM dependencies..."
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo "✓ NPM dependencies installed successfully"
    else
        echo "✗ Failed to install NPM dependencies"
        echo "  Please make sure Node.js is installed: https://nodejs.org/"
        exit 1
    fi
else
    echo "✗ package.json not found!"
    exit 1
fi
echo ""

# Step 2: Install Playwright browsers
echo "Step 2/5: Installing Playwright browsers..."
echo "  (This may take a few minutes on first run)"
npx playwright install chromium
if [ $? -eq 0 ]; then
    echo "✓ Playwright browsers installed successfully"
else
    echo "✗ Failed to install Playwright browsers"
    exit 1
fi
echo ""

# Step 3: Create .env file if it doesn't exist
echo "Step 3/5: Setting up environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo "✓ Created .env file from template"
        echo "  Default credentials: admin / admin123"
    else
        echo "⚠ .env.example not found, creating default .env"
        cat > .env << 'EOF'
# Test User Credentials
TEST_USERNAME=admin
TEST_PASSWORD=admin123

# Server URLs
BASE_URL=http://localhost:3000
API_URL=http://localhost:8000

# Test Configuration
HEADLESS=true
EOF
        echo "✓ Created default .env file"
    fi
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 4: Check for test user
echo "Step 4/5: Checking for test user..."
echo "  The tests require a superuser with credentials:"
echo "    Username: admin"
echo "    Password: admin123"
echo ""

BACKEND_PATH="$SCRIPT_DIR/../../Backend"
if [ -d "$BACKEND_PATH" ]; then
    echo "  Backend found at: $BACKEND_PATH"
    echo ""
    echo "  Do you want to create the test user now? (y/n)"
    read -r CREATE_USER
    
    if [ "$CREATE_USER" = "y" ] || [ "$CREATE_USER" = "Y" ]; then
        echo ""
        echo "  Creating superuser..."
        echo "  When prompted:"
        echo "    Username: admin"
        echo "    Email: admin@preciseoptics.test (or any email)"
        echo "    Password: admin123"
        echo ""
        
        cd "$BACKEND_PATH"
        python manage.py createsuperuser --username admin --email admin@preciseoptics.test
        cd "$SCRIPT_DIR"
        
        if [ $? -eq 0 ]; then
            echo "✓ Test user created successfully"
        else
            echo "⚠ User creation failed or user already exists"
            echo "  If user already exists, that's fine! Continue with setup."
        fi
    else
        echo "⚠ Skipped user creation"
        echo "  Remember to create the user manually before running tests:"
        echo "    cd Backend"
        echo "    python manage.py createsuperuser"
    fi
else
    echo "⚠ Backend directory not found at expected location"
    echo "  You'll need to create the test user manually:"
    echo "    cd Backend"
    echo "    python manage.py createsuperuser"
    echo "    Username: admin, Password: admin123"
fi
echo ""

# Step 5: Make scripts executable
echo "Step 5/5: Setting up helper scripts..."
if [ -f "start-servers.sh" ]; then
    chmod +x start-servers.sh
    echo "✓ Made start-servers.sh executable"
else
    echo "⚠ start-servers.sh not found"
fi

if [ -f "setup.sh" ]; then
    chmod +x setup.sh
    echo "✓ Made setup.sh executable"
fi
echo ""

# Setup complete
echo "========================================"
echo "  ✅ Setup Complete!                    "
echo "========================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start the servers:"
echo "   Option A (Automated):"
echo "     ./start-servers.sh"
echo ""
echo "   Option B (Manual - 2 separate terminals):"
echo "     Terminal 1: cd ../../Backend && python manage.py runserver 8000"
echo "     Terminal 2: cd ../../frontend && npm start"
echo ""
echo "2. Wait 30-60 seconds for servers to fully start"
echo ""
echo "3. In a NEW terminal, run tests:"
echo "     cd tests/playwright"
echo "     npm run check:servers  # Verify servers are ready"
echo "     npm test               # Run all tests"
echo ""
echo "4. View test results:"
echo "     npm run report"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full Guide:  README.md"
echo ""
echo "🎉 Happy Testing!"
echo ""
