# MySQL Configuration for PreciseOptics

# Add these environment variables to your system or create a .env file:

# For MySQL Database Connection
DB_ENGINE=django.db.backends.mysql
DB_NAME=precise_optics_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Instructions:
# 1. Install MySQL Server from https://dev.mysql.com/downloads/mysql/
# 2. Create a new database called 'precise_optics_db' in MySQL
# 3. Create a MySQL user with appropriate permissions
# 4. Update the environment variables above with your MySQL credentials
# 5. Run: python manage.py migrate
# 6. Run: python manage.py createsuperuser
# 7. Optionally run: python manage.py loaddata fixtures/initial_data.json (if you have fixtures)

# MySQL Workbench Connection Settings:
# Connection Name: PreciseOptics
# Connection Method: Standard (TCP/IP)
# Hostname: localhost
# Port: 3306
# Username: your_mysql_username
# Password: your_mysql_password
# Default Schema: precise_optics_db