-- MySQL Setup Script for PreciseOptics
-- Run these commands in MySQL Workbench or MySQL command line

-- Connect as root user first:
-- mysql -u root -p

-- Create the database
CREATE DATABASE IF NOT EXISTS precise_optics_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application
CREATE USER IF NOT EXISTS 'precise_optics_user'@'localhost' 
    IDENTIFIED BY 'PreciseOptics2025!';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON precise_optics_db.* 
    TO 'precise_optics_user'@'localhost';

-- Apply the privilege changes
FLUSH PRIVILEGES;

-- Verify the database was created
SHOW DATABASES;

-- Verify the user was created
SELECT User, Host FROM mysql.user WHERE User = 'precise_optics_user';

-- Test connection with the new user (run this separately)
-- mysql -u precise_optics_user -p precise_optics_db