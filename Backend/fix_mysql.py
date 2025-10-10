"""
MySQL Troubleshooting and Quick Setup

This script provides step-by-step troubleshooting for the MySQL connection issue.
The error shows: Access denied for user 'precise_optics_user'@'localhost'

This means either:
1. The user doesn't exist in MySQL
2. The password is incorrect
3. MySQL server isn't running
"""

def print_section(title, content):
    print(f"\n🔧 {title}")
    print("=" * 50)
    print(content)

def main():
    print("🚨 MySQL Connection Troubleshooting 🚨")
    
    print_section("ISSUE DIAGNOSIS", """
The error 'Access denied for user 'precise_optics_user'@'localhost'' means:
- The MySQL user 'precise_optics_user' doesn't exist, OR
- The password is incorrect, OR  
- The user exists but doesn't have proper permissions
""")
    
    print_section("QUICK FIX - Use ROOT User", """
The fastest solution is to use the MySQL root user temporarily:

1. Open your .env file
2. Change these lines:
   DB_USER=root
   DB_PASSWORD=[your MySQL root password]
   
This will use the root user instead of creating a custom user.
""")
    
    print_section("ALTERNATIVE - Create User Properly", """
If you want to create the proper user, follow these steps:

1. Open Command Prompt as Administrator
2. Connect to MySQL as root:
   mysql -u root -p
   
3. Enter your root password when prompted

4. Run these commands in the MySQL prompt:
   CREATE DATABASE IF NOT EXISTS precise_optics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'precise_optics_user'@'localhost' IDENTIFIED BY 'Clockface!2023';
   GRANT ALL PRIVILEGES ON precise_optics_db.* TO 'precise_optics_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

5. Test the connection:
   mysql -u precise_optics_user -p precise_optics_db
""")
    
    print_section("TEST MYSQL CONNECTION", """
Let's test if MySQL is running and accessible:

1. Open Command Prompt
2. Type: mysql --version
   (This should show MySQL version if installed)
   
3. Type: mysql -u root -p
   (This should connect you to MySQL if running)
""")
    
    print_section("RECOMMENDED QUICK SOLUTION", """
For immediate results, let's use the root user:

1. Update your .env file with these values:
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=precise_optics_db  
   DB_USER=root
   DB_PASSWORD=[your MySQL root password]
   DB_HOST=localhost
   DB_PORT=3306

2. Create the database:
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS precise_optics_db;"

3. Test Django connection:
   python manage.py check --database default

4. Run migrations:
   python manage.py migrate

5. Import your data:
   python import_to_mysql.py
""")

    choice = input("\nDo you want me to help update your .env file to use root user? (y/n): ").lower()
    
    if choice == 'y':
        root_password = input("Enter your MySQL root password: ")
        
        # Update .env file
        import os
        env_file = '.env'
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            # Update the user and password lines
            with open(env_file, 'w') as f:
                for line in lines:
                    if line.startswith('DB_USER='):
                        f.write('DB_USER=root\n')
                    elif line.startswith('DB_PASSWORD='):
                        f.write(f'DB_PASSWORD={root_password}\n')
                    else:
                        f.write(line)
            
            print("✅ Updated .env file to use root user")
            print("\nNext steps:")
            print("1. Run: mysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS precise_optics_db;\"")
            print("2. Run: python manage.py migrate")
            print("3. Run: python import_to_mysql.py")
        else:
            print("❌ .env file not found")

if __name__ == '__main__':
    main()