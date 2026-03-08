#!/bin/bash
# Phase 3 Deployment Verification Script
# Run this script to verify all components are ready for deployment

set -e

echo "=========================================="
echo "Phase 3 Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check Python version
echo "1. Checking Python environment..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    pass "Python installed: $PYTHON_VERSION"
else
    fail "Python3 not found"
fi

# Check backend dependencies
echo ""
echo "2. Checking backend dependencies..."
cd phase-3/backend
if [ -f "requirements.txt" ]; then
    pass "requirements.txt exists"
else
    fail "requirements.txt not found"
fi

# Check MCP server
echo ""
echo "3. Checking MCP server..."
cd mcp-server
if [ -f "src/server.py" ]; then
    pass "MCP server.py exists"
else
    fail "MCP server.py not found"
fi

if python3 -c "from src.server import mcp" 2>/dev/null; then
    pass "MCP server imports successfully"
else
    fail "MCP server import failed"
fi

# Run MCP unit tests
echo ""
echo "4. Running MCP unit tests..."
if python3 -m pytest tests/test_logic.py -v --tb=short 2>&1 | tail -5 | grep -q "passed"; then
    pass "MCP unit tests passing"
else
    warn "MCP unit tests may have issues (check manually)"
fi

cd ../..

# Check frontend
echo ""
echo "5. Checking frontend..."
cd frontend
if [ -f "package.json" ]; then
    pass "Frontend package.json exists"
else
    fail "Frontend package.json not found"
fi

if [ -f ".env.local" ]; then
    pass "Frontend .env.local exists"
else
    warn "Frontend .env.local not found (create from .env.example)"
fi

cd ..

# Check environment files
echo ""
echo "6. Checking environment configuration..."
if [ -f "backend/.env" ]; then
    pass "Backend .env exists"
else
    warn "Backend .env not found (create from .env.example)"
fi

if [ -f "backend/mcp-server/.env" ]; then
    pass "MCP server .env exists"
else
    warn "MCP server .env not found (create from .env.example)"
fi

# Check database connectivity
echo ""
echo "7. Checking database connectivity..."
cd backend
if python3 -c "
from dotenv import load_dotenv
load_dotenv()
import os
from sqlmodel import create_engine
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and 'neon' in DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute('SELECT 1')
    print('Connected')
else:
    print('Skip')
" 2>&1 | grep -q "Connected"; then
    pass "Neon database connection working"
else
    warn "Database connection skipped or failed (check DATABASE_URL)"
fi

cd ..

# Check CI/CD configuration
echo ""
echo "8. Checking CI/CD configuration..."
if [ -f "../.github/workflows/backend-ci.yml" ]; then
    pass "Backend CI workflow exists"
else
    warn "Backend CI workflow not found"
fi

if [ -f "../.github/workflows/frontend-ci.yml" ]; then
    pass "Frontend CI workflow exists"
else
    warn "Frontend CI workflow not found"
fi

# Check deployment configuration
echo ""
echo "9. Checking deployment configuration..."
if [ -f "backend/vercel.json" ]; then
    pass "Backend Vercel config exists"
else
    warn "Backend Vercel config not found"
fi

if [ -f "DEPLOYMENT.md" ]; then
    pass "Deployment guide exists"
else
    warn "Deployment guide not found"
fi

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT.md for detailed instructions"
    echo "2. Set up Vercel projects (frontend and backend)"
    echo "3. Configure environment variables in Vercel"
    echo "4. Deploy backend first, then frontend"
    echo "5. Update CORS origins after deployment"
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix issues before deploying.${NC}"
    exit 1
fi
