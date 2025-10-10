# MySQL Database Setup Guide for PreciseOptics

## Current Status
✅ MySQL Server 8.0.39 is installed and running as Windows Service "MySQL80"
✅ MySQL binaries located at: `C:\Program Files\MySQL\MySQL Server 8.0\bin\`

## Step-by-Step Setup Instructions

### Step 1: Add MySQL to System PATH (Optional but Recommended)
1. Press `Windows + X` → Select "System"
2. Click "Advanced system settings" 
3. Click "Environment Variables"
4. Under "System variables", find "Path" → Click "Edit"
5. Click "New" and add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
6. Click "OK" on all dialogs
7. **Restart PowerShell** for changes to take effect

### Step 2: Connect to MySQL as Root
Open PowerShell as Administrator and run:
```powershell
# If you added MySQL to PATH:
mysql -u root -p

# OR use full path:
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

**You will be prompted for the MySQL root password** that you set during installation.

### Step 3: Create Database and User
Once connected to MySQL, run these commands:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS precise_optics_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER IF NOT EXISTS 'precise_optics_user'@'localhost' 
    IDENTIFIED BY 'PreciseOptics2025!';

-- Grant privileges
GRANT ALL PRIVILEGES ON precise_optics_db.* 
    TO 'precise_optics_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify setup
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'precise_optics_user';

-- Exit MySQL
EXIT;
```

### Step 4: Test New User Connection
```powershell
mysql -u precise_optics_user -p precise_optics_db
# Password: PreciseOptics2025!
```

### Step 5: Update Django Settings
Your `.env` file should have:
```env
DB_ENGINE=django.db.backends.mysql
DB_NAME=precise_optics_db
DB_USER=precise_optics_user
DB_PASSWORD=PreciseOptics2025!
DB_HOST=localhost
DB_PORT=3306
```

### Step 6: Test Django Connection
```powershell
cd "C:\Users\user\Documents\GitHub\PreciseOptics\Backend"
python manage.py check --database default
```

### Step 7: Run Migrations
```powershell
python manage.py migrate
```

### Step 8: Import Your Existing Data
```powershell
python import_to_mysql.py
```

## Troubleshooting

### If you forgot the MySQL root password:
1. Stop MySQL service: `net stop MySQL80`
2. Start MySQL in safe mode and reset password
3. Or reinstall MySQL with a new password

### If connection fails:
- Check if MySQL service is running: `Get-Service MySQL80`
- Verify user exists: Login as root and check users
- Check firewall settings on port 3306

### Common Error Solutions:
- **"Access denied"**: Wrong username/password
- **"Can't connect"**: MySQL service not running
- **"Unknown database"**: Database not created yet

## MySQL Workbench Connection
Once setup is complete, connect MySQL Workbench with:
- **Connection Name**: PreciseOptics
- **Hostname**: localhost
- **Port**: 3306  
- **Username**: precise_optics_user
- **Password**: PreciseOptics2025!
- **Default Schema**: precise_optics_db

## Security Notes
- Change the default password `PreciseOptics2025!` to something more secure
- Consider creating separate users for different environments
- Enable MySQL binary logging for point-in-time recovery