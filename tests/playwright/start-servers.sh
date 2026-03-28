#!/bin/bash
# Start Backend and Frontend Servers for Testing

echo "🚀 Starting PreciseOptics Test Environment..."
echo ""

# Function to check if a port is in use
check_port() {
    nc -z localhost $1 2>/dev/null
    return $?
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."

# Check if backend is already running
if check_port 8000; then
    echo "✓ Backend already running on port 8000"
else
    echo "▶ Starting Django backend on port 8000..."
    cd "$PROJECT_ROOT/Backend"
    python manage.py runserver 8000 > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo "  Backend PID: $BACKEND_PID"
    sleep 3
fi

# Check if frontend is already running
if check_port 3000; then
    echo "✓ Frontend already running on port 3000"
else
    echo "▶ Starting React frontend on port 3000..."
    cd "$PROJECT_ROOT/frontend"
    npm start > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo "  Frontend PID: $FRONTEND_PID"
    sleep 5
fi

echo ""
echo "⏳ Waiting for servers to be ready..."
sleep 10

# Test backend health
echo "🔍 Testing backend..."
if curl -s http://localhost:8000 > /dev/null; then
    echo "✓ Backend is ready!"
else
    echo "⚠ Backend may not be ready yet (this is normal on first start)"
fi

# Test frontend health
echo "🔍 Testing frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Frontend is ready!"
else
    echo "⚠ Frontend may not be ready yet (React may still be compiling)"
fi

echo ""
echo "✅ Test environment is starting up!"
echo ""
echo "📝 Next steps:"
echo "   1. Wait 30-60 seconds for servers to fully start"
echo "   2. Open a new terminal"
echo "   3. Run: cd tests/playwright"
echo "   4. Run: npm test"
echo ""
echo "🛑 To stop servers manually:"
if [ ! -z "$BACKEND_PID" ]; then
    echo "   Backend: kill $BACKEND_PID"
fi
if [ ! -z "$FRONTEND_PID" ]; then
    echo "   Frontend: kill $FRONTEND_PID"
fi
echo ""
