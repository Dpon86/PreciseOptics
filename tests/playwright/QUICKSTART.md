# 🚀 Quick Start Guide - Playwright Tests

Get up and running with Playwright tests in 5 minutes!

## ⚡ Option A: Automated Setup (Recommended ⭐)

**Windows (PowerShell):**
```powershell
cd tests\playwright
.\setup.ps1
```

**Linux/Mac:**
```bash
cd tests/playwright
chmod +x setup.sh
./setup.sh
```

**What the setup script does:**
- ✅ Installs NPM dependencies
- ✅ Installs Playwright browsers
- ✅ Creates .env configuration file
- ✅ Prompts to create test superuser
- ✅ Sets everything up in one command!

**After setup completes, skip to "Step 4: Start Servers" below!**

---

## 📝 Option B: Manual Setup (Alternative)

If you prefer step-by-step manual setup:

### Step 1: Install Dependencies (One-time setup)

```bash
# Navigate to playwright test directory
cd tests/playwright

# Install Node dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Step 2: Create Test User (One-time setup)

```bash
# Navigate to backend
cd ../../Backend

# Create superuser for authentication tests
python manage.py createsuperuser

# When prompted, enter:
# Username: admin
# Email: admin@preciseoptics.test  (or any email)
# Password: admin123
# Password (again): admin123
```

### Step 3: Configure Environment (One-time setup)

```bash
# Navigate back to playwright directory
cd ../tests/playwright

# Copy environment template
cp .env.example .env

# .env file is already configured with correct credentials
# No need to edit unless you used different credentials
```

---

## Step 4: Start Servers (Both Options)

### Windows (PowerShell):
```powershell
# Run this in PowerShell (run as Administrator recommended)
.\start-servers.ps1

# Wait ~60 seconds for servers to start (you'll see console output)
```

### Mac/Linux:
```bash
# Make script executable (first time only)
chmod +x start-servers.sh

# Run the script
./start-servers.sh

# Wait ~60 seconds for servers to start
```

### Manual Option (All platforms):

**Terminal 1:**
```bash
cd Backend
python manage.py runserver 8000
```

**Terminal 2:**
```bash
cd frontend
npm start
```

---

## Step 5: Run Tests (Both Options)

**Open a NEW terminal:**

```bash
# Navigate to playwright directory
cd tests/playwright

# Check servers are ready
npm run check:servers

# Run all tests
npm test

# OR run specific tests
npm run test:login          # Just login tests
npm run test:patient        # Patient management tests
npm run test:consultation   # Consultation tests
npm run test:eye-tests      # All eye test tests
```

## Step 6: View Results

After tests complete:

```bash
# Open HTML report
npm run report
```

This opens a detailed report in your browser with:
- ✅ Pass/fail status for each test
- 📸 Screenshots (on failures)
- 🎥 Videos (on failures)
- 📊 Execution timeline

## Common Commands

```bash
# Run tests with browser visible (see what's happening)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# Interactive UI mode
npm run test:ui

# Check if servers are running
npm run check:servers
```

## Troubleshooting

### "Cannot connect to localhost:8000 or localhost:3000"
- Make sure both servers are running
- Run: `npm run check:servers`
- Restart servers if needed

### "Login test fails"
- Verify test user exists: Username `admin`, Password `admin123`
- Check `.env` file has correct credentials
- Test login manually in browser: http://localhost:3000/login

### "Tests are slow"
- First run is always slower (React compilation, browser setup)
- Subsequent runs are much faster
- Use `npm run test:headed` to see progress

### "I made changes to code but tests still fail"
- Make sure you restarted the servers after code changes
- Clear browser cache: Delete `playwright/.cache/`
- Reinstall dependencies if needed

## Quick Reference

| Step | Windows (PowerShell) | Linux/Mac |
|------|---------------------|-----------|
| **First Time Setup** | `cd tests\playwright`<br>`.\setup.ps1` | `cd tests/playwright`<br>`./setup.sh` |
| **Start Servers** | `.\start-servers.ps1`<br>*(wait 60s)* | `./start-servers.sh`<br>*(wait 60s)* |
| **Check Ready** | `npm run check:servers` | `npm run check:servers` |
| **Run Tests** | `npm test` | `npm test` |
| **View Report** | `npm run report` | `npm run report` |

---

| Task | Command |
|------|---------|
| Install | `npm install && npx playwright install` |
| Check servers | `npm run check:servers` |
| Run all tests | `npm test` |
| Run specific test | `npm run test:login` |
| View report | `npm run report` |
| Debug test | `npm run test:debug` |
| Headed mode | `npm run test:headed` |

## Next Steps

1. ✅ **Create more tests** - Add tests for conditions, protocols, referrals
2. ✅ **Customize data** - Modify `utils/test-data.js` to generate different test data
3. ✅ **Add assertions** - Enhance tests with more detailed validation
4. ✅ **CI/CD Integration** - Set up automated testing in your pipeline
5. ✅ **Coverage goals** - Aim for 80%+ test coverage of critical workflows

## Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🌐 Playwright docs: https://playwright.dev
- 🐛 Troubleshooting: See README.md troubleshooting section

---

**Total setup time:** ~5-10 minutes  
**First test run:** ~2-3 minutes  
**Subsequent runs:** ~1 minute

Happy Testing! 🎉
