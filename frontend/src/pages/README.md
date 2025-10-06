# PreciseOptics Frontend - Page Organization

This document outlines the logical organization of pages in the PreciseOptics Eye Hospital Management System frontend.

## Folder Structure

```
frontend/src/pages/
│
├── HomePage.js                 # Main dashboard page
├── index.js                    # Main export file for all pages
│
├── auth/                       # Authentication & Authorization
│   ├── LoginPage.js           # User login page
│   └── index.js               # Auth pages exports
│
├── patients/                   # Patient Management
│   ├── PatientsPage.js        # View all patients
│   ├── AddPatientPage.js      # Add new patient form
│   └── index.js               # Patient pages exports
│
├── consultations/             # Consultation Management
│   ├── ConsultationsPage.js   # View consultations
│   ├── AddConsultationPage.js # Add consultation form
│   └── index.js               # Consultation pages exports
│
├── eye-tests/                 # Eye Tests & Examinations
│   ├── EyeTestsPage.js        # Main eye tests overview
│   ├── AddVisualAcuityTestPage.js
│   ├── AddRefractionTestPage.js
│   ├── AddTonometryTestPage.js
│   ├── AddOphthalmoscopyPage.js
│   ├── AddSlitLampExamPage.js
│   ├── AddVisualFieldTestPage.js
│   ├── AddOCTScanPage.js
│   ├── AddFluoresceinAngiographyPage.js
│   └── index.js               # Eye tests pages exports
│
├── medications/               # Medication & Prescription Management
│   ├── MedicationsPage.js     # View all medications
│   ├── AddMedicationPage.js   # Add medication to patient
│   ├── AddMedicinePage.js     # Add new medicine to inventory
│   ├── AddPrescriptionPage.js # Create prescription
│   └── index.js               # Medication pages exports
│
├── reports/                   # Reports & Analytics
│   ├── PatientMedicationsReportPage.js
│   ├── ConsultationReportPage.js
│   └── index.js               # Report pages exports
│
├── audit/                     # Audit & Logging
│   ├── AuditLogsPage.js       # View audit logs
│   ├── AddAuditLogPage.js     # Create audit entry
│   └── index.js               # Audit pages exports
│
└── system/                    # System Administration
    ├── FormsOverviewPage.js   # Forms management overview
    └── index.js               # System pages exports
```

## Import Pattern

All pages can be imported using the centralized import from `./pages`:

```javascript
import {
  HomePage,
  LoginPage,
  PatientsPage,
  AddPatientPage,
  // ... other pages
} from './pages';
```

## Logical Organization Benefits

1. **Clear Separation**: Each folder contains related functionality
2. **Scalability**: Easy to add new pages to appropriate categories
3. **Maintainability**: Developers can quickly locate relevant files
4. **Clean Imports**: Centralized export system keeps imports organized
5. **Feature-Based**: Organization follows medical workflow patterns

## Page Categories

- **Auth**: User authentication and authorization
- **Patients**: Patient management and records
- **Consultations**: Appointment and consultation management
- **Eye Tests**: All eye examination and test procedures
- **Medications**: Medicine inventory and prescription management
- **Reports**: Analytics and reporting functionality
- **Audit**: System logging and audit trails
- **System**: Administrative and system management tools

This structure follows modern React application organization principles and medical practice workflow patterns.