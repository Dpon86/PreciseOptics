// scripts/check-servers.js - Check if Backend and Frontend are running
import http from 'http';

const checkServer = (url, name) => {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`✓ ${name} is running (${url})`);
      resolve(true);
    }).on('error', () => {
      console.log(`✗ ${name} is NOT running (${url})`);
      resolve(false);
    });
  });
};

async function checkServers() {
  console.log('🔍 Checking server status...\n');
  
  const backendRunning = await checkServer('http://localhost:8000', 'Backend (Django)');
  const frontendRunning = await checkServer('http://localhost:3000', 'Frontend (React)');
  
  console.log('');
  
  if (backendRunning && frontendRunning) {
    console.log('✅ Both servers are running! Ready to test.\n');
    process.exit(0);
  } else {
    console.log('⚠️  One or more servers are not running.\n');
    console.log('To start servers:');
    if (process.platform === 'win32') {
      console.log('  PowerShell: .\\start-servers.ps1');
    } else {
      console.log('  Bash: ./start-servers.sh');
    }
    console.log('  Or manually:\n');
    if (!backendRunning) {
      console.log('    Terminal 1: cd ../../Backend && python manage.py runserver 8000');
    }
    if (!frontendRunning) {
      console.log('    Terminal 2: cd ../../frontend && npm start');
    }
    console.log('');
    process.exit(1);
  }
}

checkServers();
