# PreciseOptics Eye Hospital Management System

## Overview

PreciseOptics is a comprehensive Django-based backend system designed specifically for eye hospitals and ophthalmic clinics. The system provides complete patient management, clinical workflow management, comprehensive eye testing modules, medication management, and robust audit trails for compliance and quality assurance.

## Features

### 🏥 **Core Hospital Management**
- **Patient Management**: Complete patient registration, demographics, medical history, and document management
- **Staff Management**: Role-based user management with departments and specializations
- **Visit Tracking**: Comprehensive visit scheduling, check-in/out, and workflow management
- **Consultation Management**: Detailed consultation records with vital signs, documents, and images

### 👁️ **Comprehensive Eye Testing Modules**
- **Visual Acuity Testing**: Snellen, LogMAR, ETDRS charts with pediatric options
- **Refraction Testing**: Subjective, objective, retinoscopy, and cycloplegic refraction
- **Cataract Assessment**: Grading, surgical planning, and IOL calculations
- **Glaucoma Assessment**: IOP monitoring, optic disc evaluation, risk assessment
- **Visual Field Testing**: Humphrey, Octopus perimetry with automated analysis
- **Retinal Assessment**: Medical retina examination with vascular assessment
- **Diabetic Retinopathy Screening**: DESP compliant screening with grading
- **Vitreoretinal Assessment**: Comprehensive posterior segment evaluation
- **Strabismus & Orthoptics**: Cover tests, motility assessment, binocular vision
- **Pediatric Eye Exams**: Age-appropriate testing for children
- **Eye Casualty Assessment**: Emergency triage and acute care protocols
- **Corneal Assessment**: External eye disease evaluation with fluorescein staining
- **OCT Imaging**: Optical coherence tomography integration and analysis

### 💊 **Medication Management**
- **Medication Database**: Comprehensive drug information with interactions and contraindications
- **Prescription Management**: Electronic prescribing with safety checks
- **Administration Tracking**: In-hospital medication administration records
- **Drug Allergy Management**: Patient allergy tracking and alerts
- **Inventory Management**: Stock levels and automated reordering

### 📊 **Audit & Compliance**
- **Comprehensive Audit Logs**: Every system interaction logged for compliance
- **Patient Access Tracking**: GDPR/HIPAA compliant access monitoring
- **Clinical Decision Audit**: Evidence-based decision tracking
- **Medication Safety Audit**: Prescription and administration audit trails
- **Data Export Logging**: Secure data export with encryption options
- **Compliance Reporting**: Automated compliance report generation
- **Security Event Monitoring**: Real-time security threat detection

## Technology Stack

- **Backend**: Django 5.2.7 with Django REST Framework
- **Database**: PostgreSQL (recommended for production) / SQLite (development)
- **Authentication**: Token-based authentication with role-based access control
- **File Storage**: Local file system with cloud storage options
- **API**: RESTful API with comprehensive documentation
- **Admin Interface**: Django Admin with custom configurations

## Installation & Setup

### Prerequisites
- Python 3.10+
- PostgreSQL (for production)
- Git

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/PreciseOptics.git
   cd PreciseOptics/Backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv PreciseOpticsvenv
   # On Windows:
   PreciseOpticsvenv\Scripts\activate
   # On macOS/Linux:
   source PreciseOpticsvenv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework python-decouple psycopg2-binary pillow
   ```

4. **Environment Configuration**:
   Create a `.env` file in the Backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   
   # Database Configuration (PostgreSQL for production)
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=precise_optics_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   
   # Email Configuration
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=your-smtp-host
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email
   EMAIL_HOST_PASSWORD=your-email-password
   DEFAULT_FROM_EMAIL=noreply@preciseoptics.com
   ```

5. **Database Setup**:
   ```bash
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Populate sample data (optional)
   python manage.py populate_sample_data
   ```

6. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

## Database Models

### Core Models

#### **User Management**
- `CustomUser`: Extended user model with employee information
- `StaffProfile`: Detailed staff profiles with specializations and permissions
- `UserSession`: Session tracking for audit purposes

#### **Patient Management**
- `Patient`: Complete patient demographics and medical information
- `PatientVisit`: Visit scheduling and workflow management
- `PatientDocument`: Document and file management

#### **Clinical Management**
- `Consultation`: Detailed consultation records
- `VitalSigns`: Patient vital signs during consultations
- `ConsultationDocument`: Clinical documents and reports
- `ConsultationImage`: Medical imaging and photographs

#### **Eye Testing Models**
- `VisualAcuityTest`: Visual acuity measurements
- `RefractionTest`: Refraction and glasses prescriptions
- `CataractAssessment`: Cataract evaluation and surgical planning
- `GlaucomaAssessment`: Glaucoma diagnosis and monitoring
- `VisualFieldTest`: Perimetry results and analysis
- `RetinalAssessment`: Medical retina examinations
- `DiabeticRetinopathyScreening`: DR screening and grading
- `VitreoretinalAssessment`: Posterior segment evaluation
- `StrabismusAssessment`: Squint and eye movement evaluation
- `PediatricEyeExam`: Specialized pediatric assessments
- `EyeCasualtyAssessment`: Emergency eye care protocols
- `CornealAssessment`: Anterior segment evaluation
- `OCTScan`: OCT imaging and analysis

#### **Medication Management**
- `Medication`: Comprehensive drug database
- `Prescription`: Electronic prescription management
- `PrescriptionItem`: Individual medication items
- `MedicationAdministration`: In-hospital drug administration
- `DrugAllergy`: Patient allergy management

#### **Audit & Compliance**
- `AuditLog`: Comprehensive system audit trail
- `PatientAccessLog`: Patient data access monitoring
- `MedicationAudit`: Medication safety audit trail
- `ClinicalDecisionAudit`: Clinical decision tracking
- `DataExportLog`: Data export monitoring
- `ComplianceReport`: Automated compliance reporting
- `SystemSecurityEvent`: Security incident tracking

## API Endpoints

The system provides RESTful API endpoints for all models:

- `/api/patients/` - Patient management
- `/api/consultations/` - Consultation management
- `/api/eye-tests/` - Eye testing modules
- `/api/medications/` - Medication and prescription management
- `/api/audit/` - Audit and compliance data
- `/api/accounts/` - User and staff management

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` with comprehensive management tools for:

- User and staff management
- Patient registration and management
- Clinical data entry and review
- Medication inventory management
- Audit log review and compliance reporting
- System configuration and settings

## Security Features

### Data Protection
- Encrypted data storage for sensitive information
- Role-based access control (RBAC)
- Session management with automatic timeout
- Comprehensive audit logging
- GDPR/HIPAA compliance features

### Authentication & Authorization
- Token-based authentication
- Multi-factor authentication ready
- Permission-based access control
- Session security monitoring

## Compliance & Audit

### GDPR Compliance
- Patient consent management
- Data access logging
- Right to erasure implementation
- Data portability features
- Privacy impact assessments

### Clinical Governance
- Clinical decision audit trails
- Evidence-based practice tracking
- Quality metrics and reporting
- Incident management
- Risk assessment tools

## Customization

### Adding New Test Types
1. Create a new model inheriting from `BaseEyeTest`
2. Add specific fields for the test
3. Register in admin interface
4. Create API serializers and views
5. Update documentation

### Custom Workflows
- Configurable consultation workflows
- Custom form templates
- Automated notifications
- Integration hooks for external systems

## Production Deployment

### Database Configuration
Use PostgreSQL for production:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'precise_optics_prod',
        'USER': 'db_user',
        'PASSWORD': 'secure_password',
        'HOST': 'db_host',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

### Security Settings
```python
# Production security settings
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Static Files & Media
Configure appropriate storage for static files and media:
```python
# AWS S3 or similar cloud storage
STATIC_ROOT = '/var/www/static/'
MEDIA_ROOT = '/var/www/media/'
```

## Testing

### Sample Data
Run the sample data population command:
```bash
python manage.py populate_sample_data
```

This creates:
- Sample staff users (doctors, nurses, technicians)
- Test patients with complete demographics
- Sample medications and prescriptions
- Example clinical data

### Test Users
- **Admin**: admin / (password set during setup)
- **Doctor**: dr.smith / password123
- **Nurse**: nurse.brown / password123

## Support & Documentation

### Getting Started
1. Review the model documentation
2. Explore the admin interface
3. Test API endpoints
4. Review sample data

### Integration Guide
- API documentation available at `/api/docs/`
- Postman collection for testing
- Integration examples for common workflows

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Changelog

### Version 1.0.0
- Initial release with core functionality
- Complete eye testing modules
- Comprehensive audit system
- Admin interface
- API endpoints
- Sample data population

---

**PreciseOptics** - Transforming Eye Care Through Technology

For support, contact: support@preciseoptics.com