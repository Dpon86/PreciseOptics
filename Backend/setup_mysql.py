"""
MySQL Setup Guide for PreciseOptics

This script will guide you through the MySQL setup process step by step.
"""
import os
import sys

def print_step(step_num, title, content):
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    print('='*60)
    print(content)

def main():
    print("🏥 PreciseOptics MySQL Setup Guide 🏥")
    print("This will walk you through setting up MySQL for your Django application")
    
    # Check if MySQL is installed
    print_step(1, "Check MySQL Installation", """
First, let's check if MySQL is installed on your system.

To check:
1. Open Command Prompt (cmd)
2. Type: mysql --version
3. If you see a version number, MySQL is installed
4. If you get an error, you need to install MySQL

If MySQL is NOT installed:
1. Go to: https://dev.mysql.com/downloads/mysql/
2. Download "MySQL Installer for Windows"
3. Run the installer and choose "Developer Default"
4. Set a ROOT PASSWORD during installation (remember this!)
5. Complete the installation
""")
    
    input("Press Enter when MySQL is installed and you know your ROOT password...")
    
    print_step(2, "Create Database and User", """
Now we'll create the database and user in MySQL Workbench:

1. Open MySQL Workbench
2. Connect using root user and your password
3. In the Query tab, run these commands one by one:
""")
    
    sql_commands = """
-- Create the database
CREATE DATABASE precise_optics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user (change 'your_password' to a secure password)
CREATE USER 'precise_optics_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON precise_optics_db.* TO 'precise_optics_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify (should show precise_optics_db in the list)
SHOW DATABASES;
"""
    
    print("Copy and paste these SQL commands:")
    print("-" * 50)
    print(sql_commands)
    print("-" * 50)
    
    input("Press Enter after running these SQL commands in MySQL Workbench...")
    
    print_step(3, "Update Environment Variables", """
Now update your .env file in the Backend directory with your MySQL credentials:

Edit the file: Backend/.env
    
Update these lines with your actual password:
    """)
    
    env_content = """
DB_ENGINE=django.db.backends.mysql
DB_NAME=precise_optics_db
DB_USER=precise_optics_user
DB_PASSWORD=your_password  # <-- Change this to your actual password
DB_HOST=localhost
DB_PORT=3306
"""
    
    print(env_content)
    
    password = input("Enter the password you set for 'precise_optics_user': ")
    
    # Update the .env file
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    try:
        with open(env_file_path, 'r') as f:
            content = f.read()
        
        # Update the password line
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('DB_PASSWORD='):
                lines[i] = f'DB_PASSWORD={password}'
                break
        
        updated_content = '\n'.join(lines)
        
        with open(env_file_path, 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Updated .env file with password")
        
    except Exception as e:
        print(f"❌ Could not update .env file automatically: {e}")
        print("Please update it manually")
    
    print_step(4, "Test Connection", """
Let's test if Django can connect to MySQL:
    """)
    
    print("Testing Django connection...")
    
    # Test connection
    try:
        os.system('python manage.py check --database default')
        print("✅ Connection test completed!")
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
    
    print_step(5, "Import Your Data", """
Now let's import your existing SQLite data to MySQL:
    """)
    
    import_choice = input("Do you want to import your existing SQLite data? (y/n): ").lower()
    
    if import_choice == 'y':
        print("Running data migration...")
        try:
            os.system('python import_to_mysql.py')
            print("✅ Data migration completed!")
        except Exception as e:
            print(f"❌ Data migration failed: {e}")
    
    print_step(6, "MySQL Workbench Connection", """
🎉 Setup Complete! 

Your MySQL Workbench connection details:
- Connection Name: PreciseOptics
- Hostname: localhost  
- Port: 3306
- Username: precise_optics_user
- Password: [the password you set]
- Default Schema: precise_optics_db

To connect in MySQL Workbench:
1. Open MySQL Workbench
2. Click the + next to "MySQL Connections"  
3. Enter the connection details above
4. Test Connection
5. Click OK to save
6. Double-click the connection to connect

You can now browse your Django data in MySQL Workbench! 🎊
    """)

if __name__ == '__main__':
    main()