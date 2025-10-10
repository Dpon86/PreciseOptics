# SQLite Database Viewing Options

## Option 1: DB Browser for SQLite (Recommended for SQLite)
- Download from: https://sqlitebrowser.org/
- Free, open-source SQLite database browser
- Similar interface to MySQL Workbench
- Direct compatibility with your db.sqlite3 file

### To Connect:
1. Download and install DB Browser for SQLite
2. Open the application
3. Click "Open Database"
4. Navigate to: `C:\Users\user\Documents\GitHub\PreciseOptics\Backend\db.sqlite3`
5. You can now browse, query, and modify your database

## Option 2: VS Code SQLite Extension
- Install "SQLite Viewer" extension in VS Code
- Right-click on db.sqlite3 file in VS Code
- Select "Open with SQLite Viewer"

## Option 3: Command Line SQLite
- Open PowerShell/Command Prompt
- Navigate to Backend directory
- Run: `sqlite3 db.sqlite3`
- Use SQL commands to query the database

## Current Database Location
Your SQLite database is located at:
`C:\Users\user\Documents\GitHub\PreciseOptics\Backend\db.sqlite3`

## Tables in Your Database
Based on your Django models, you have these main tables:
- accounts_customuser (Users/Staff)
- patients_patient (Patient records)
- patients_patientvisit (Patient visits)
- consultations_consultation (Consultations)
- medications_* (Medication data)
- eye_tests_* (All eye test types)
- audit_* (Audit logs)