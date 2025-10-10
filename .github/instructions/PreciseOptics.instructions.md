---
applyTo: '**'
---

# PreciseOptics Eye Hospital Management System - AI Coding Instructions

## Project Overview
PreciseOptics is a comprehensive eye hospital management system designed for tracking patient care, medication management, and eye test results with sophisticated auditing capabilities. The software focuses on ease of use while maintaining detailed tracking of patient outcomes over time.

### Core Mission
- **Primary Focus**: Track patient medications and eye test results with comprehensive auditing
- **Key Requirement**: Map test results against patients and medications to analyze improvement trends
- **Example Use Case**: Select a medication and view all associated tests showing patient improvement/decline over time
- **Production Ready**: Enterprise-grade system ready for live medical environment with real patient data

## Technology Stack
- **Backend**: Django + Django REST Framework (Production-grade web framework)
- **Frontend**: React (Enterprise frontend framework)
- **Database**: PostgreSQL/MySQL (Production) / SQLite (Development only)
- **Authentication**: Django Token Authentication with session management
- **API**: RESTful APIs with comprehensive serializers and validation
- **Security**: HTTPS enforcement, CORS configuration, data encryption
- **Monitoring**: Comprehensive logging and error tracking
- **Deployment**: Docker containers with environment-specific configurations

## Architecture Principles

### 1. Modular Code Structure
```
Backend/
├── accounts/           # User management and authentication
├── patients/          # Patient records and visits
├── medications/       # Medication inventory and prescriptions
├── consultations/     # Patient consultations
├── eye_tests/         # All eye test types and results
├── audit/            # Comprehensive auditing system
└── precise_optics/   # Main project settings
```

### 2. Data Relationships & Auditing
- Every action must be traceable to a user, patient, and timestamp
- Medication prescriptions linked to specific consultations
- Eye test results linked to patients, consultations, and prescribed medications
- Audit trails for all CRUD operations
- Historical data preservation (never delete, only mark inactive)

### 3. Production Data Integrity Policy
- **NEVER** generate fake/dummy patient data in any environment accessible to production
- **NO FIXTURES** containing patient data - all patient records through UI workflows only
- **STRICT SEPARATION**: Development uses anonymized test data, production uses real patient data
- **AUDIT COMPLIANCE**: Every data entry must be traceable to authenticated user actions
- **REFERENCE DATA ONLY**: System configuration (test types, user roles) via management commands
- **DATA VALIDATION**: All inputs validated both client-side and server-side
- **BACKUP STRATEGY**: Automated daily backups with point-in-time recovery
- **DATA RETENTION**: Comply with medical record retention requirements (typically 7+ years)

## Coding Standards

### Django Backend Guidelines
```python
# Model Design
class AuditableModel(models.Model):
    """Base model with comprehensive auditing"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True

# Error Handling Pattern
try:
    # Database operation
    result = Model.objects.get(id=pk)
except Model.DoesNotExist:
    logger.error(f"Model {pk} not found", extra={'user': request.user.id})
    return Response({'error': 'Record not found'}, status=404)
except Exception as e:
    logger.exception("Unexpected error in operation")
    return Response({'error': 'Internal server error'}, status=500)
```

### React Frontend Guidelines
```javascript
// Component Structure
const ComponentName = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Error handling wrapper
    const handleApiCall = async (apiFunction) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction();
            setData(result);
        } catch (error) {
            setError(error.message);
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <ErrorMessage error={error} />}
            {loading && <LoadingSpinner />}
            {data && <DataDisplay data={data} />}
        </div>
    );
};
```

## Database Design Principles

### 1. Audit Trail Requirements
Every significant table must include:
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp  
- `created_by` - User who created the record
- `updated_by` - User who last modified the record
- `is_active` - Soft delete flag (never hard delete)

### 2. Patient-Medication-Test Correlation
```sql
-- Core relationship for auditing and analysis
Patient -> Consultation -> Medication Prescription
                      \-> Eye Test Results
                      
-- This enables queries like:
-- "Show all eye test improvements for patients on Medication X"
-- "Track visual acuity changes over time for Patient Y"
```

### 3. Data Integrity
- Use foreign keys with PROTECT (not CASCADE) for audit preservation
- Implement database constraints for critical business rules
- Version sensitive data for historical analysis

## Error Handling Standards

### 1. Comprehensive Logging
```python
import logging
logger = logging.getLogger(__name__)

# Log levels usage:
# DEBUG: Development debugging info
# INFO: Normal operation events
# WARNING: Important but non-critical issues
# ERROR: Error conditions that need attention
# CRITICAL: System failure conditions
```

### 2. User-Friendly Error Messages
- Never expose internal system details to users
- Provide actionable error messages
- Log technical details, show user-friendly messages
- Implement proper HTTP status codes

### 3. Input Validation
- Server-side validation is mandatory (never trust client)
- Client-side validation for user experience
- Use Django serializers for API validation
- Implement form validation in React

## Security Requirements (Production Critical)

### 1. Authentication & Authorization
- **Multi-factor authentication** for all healthcare staff
- **Role-based access control** (Doctor, Nurse, Admin, Reception) with granular permissions
- **Session timeout** and automatic logout after inactivity
- **Password policies**: Minimum complexity, regular rotation requirements
- **Account lockout** after failed login attempts
- **Audit all authentication** events (login, logout, failed attempts)

### 2. Data Protection & Compliance
- **End-to-end encryption** for all patient data (at rest and in transit)
- **HTTPS/TLS 1.3** mandatory for all communications
- **Database encryption** with separate key management
- **HIPAA/GDPR compliance** for patient data handling
- **Data anonymization** for development/testing environments
- **Access logging**: Track who accessed which patient records when
- **Data export controls**: Encrypted exports with audit trails

### 3. Infrastructure Security
- **Regular security patches** and vulnerability assessments
- **Network segmentation** and firewall protection
- **Intrusion detection** and monitoring systems
- **Regular penetration testing** by qualified security professionals
- **Backup encryption** and secure offsite storage
- **Disaster recovery** plan with defined RTO/RPO objectives

## Production Deployment Requirements

### 1. Performance & Scalability
- **Database optimization**: Query analysis, proper indexing, connection pooling
- **Caching strategy**: Redis/Memcached for session and query caching
- **Load balancing**: Multiple app servers behind load balancer
- **CDN integration**: Static assets served through CDN
- **Database replication**: Read replicas for reporting queries
- **Asynchronous processing**: Celery for heavy operations (reports, exports)
- **Auto-scaling**: Horizontal scaling based on load metrics

### 2. Monitoring & Observability
- **Application Performance Monitoring** (APM) with detailed metrics
- **Real-time alerting** for system failures, security incidents
- **Comprehensive logging**: Structured logs with correlation IDs
- **Health check endpoints** for all services and dependencies
- **Database monitoring**: Performance, deadlocks, slow queries
- **User activity monitoring**: Track system usage patterns
- **Compliance reporting**: Automated audit trail reports

### 3. Deployment & Operations
- **CI/CD pipeline**: Automated testing, security scanning, deployment
- **Blue-green deployment** strategy for zero-downtime updates
- **Infrastructure as Code**: Terraform/CloudFormation for environment management
- **Container orchestration**: Docker with Kubernetes/ECS
- **Environment separation**: Strict dev/staging/production isolation
- **Database migrations**: Automated, reversible, tested migration process
- **Configuration management**: Environment-specific settings via secure vaults

### 4. Business Continuity
- **Automated backups**: Hourly database backups with 7-year retention
- **Disaster recovery**: Multi-region deployment with failover capability
- **High availability**: 99.9% uptime SLA with redundant systems
- **Data recovery**: Point-in-time recovery within 15 minutes
- **Incident response**: 24/7 monitoring with escalation procedures
- **Maintenance windows**: Scheduled updates during low-usage periods

## Development Workflow

### 1. Feature Development
1. Create feature branch from main
2. Implement with full error handling
3. Add comprehensive tests
4. Update documentation
5. Code review focusing on audit capabilities
6. Merge after approval

### 2. Testing Requirements
- Unit tests for all models and views
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing for critical workflows

### 3. Documentation
- API documentation with examples
- Model relationship diagrams
- User workflow documentation
- Deployment instructions

## Production Readiness Tracking

### Development-to-Production Migration Log
Maintain a comprehensive log file `PRODUCTION_READINESS.md` in the project root that tracks all components requiring production updates. This file must be updated whenever non-production code is identified or created.

#### Required Log Format:
```markdown
# Production Readiness Status

## Components Requiring Production Updates

### Database Configuration
- [ ] **CRITICAL**: SQLite currently used - migrate to PostgreSQL/MySQL for production
- [ ] **HIGH**: Database connection pooling not configured
- [ ] **MEDIUM**: Database backup automation not implemented

### Security Implementation  
- [ ] **CRITICAL**: Multi-factor authentication not implemented
- [ ] **HIGH**: HTTPS/TLS enforcement missing
- [ ] **HIGH**: Rate limiting not configured on API endpoints

### Development Dependencies
- [ ] **MEDIUM**: Debug mode enabled in settings
- [ ] **LOW**: Development logging configuration active

### Performance Optimization
- [ ] **HIGH**: Redis caching not implemented
- [ ] **MEDIUM**: CDN integration missing for static assets

## Completed Production Items
- [x] **COMPLETED**: Basic authentication system implemented
- [x] **COMPLETED**: Audit logging framework established
```

#### Update Requirements:
- **Every developer** must update this log when identifying non-production code
- **All pull requests** must include production readiness assessment
- **Weekly reviews** to prioritize production migration tasks
- **Release blocking** items must be marked as CRITICAL priority

#### Integration with Development Workflow:
1. Before any code commit, check if changes affect production readiness
2. Add TODO comments in code linking to specific PRODUCTION_READINESS.md items
3. Use issue tracking system to monitor production migration progress
4. Include production readiness status in sprint planning

## Key Focus Areas

### 1. Medication-Test Correlation
The system must excel at:
- Linking medications to patient outcomes
- Tracking improvement/decline trends
- Generating reports on medication effectiveness
- Historical analysis of treatment patterns

### 2. Audit Excellence
- Every data change must be traceable
- User action logging with timestamps
- Data version history for critical records
- Compliance-ready audit trails

### 3. User Experience
- Intuitive navigation for medical staff
- Fast data entry workflows
- Clear visual indicators for patient status
- Responsive design for various devices

## Production Dependencies & Compliance

### 1. Library and Dependency Guidelines
- **Production-grade libraries only**: No beta, experimental, or abandoned packages
- **Open-source with commercial-friendly licenses**: MIT, BSD, Apache 2.0
- **Regular security updates**: Automated vulnerability scanning and patching
- **Dependency pinning**: Exact versions in production, compatible ranges in development
- **License compliance**: Legal review of all dependencies for medical software use
- **Vendor support**: Prefer libraries with commercial support options available
- **Performance validation**: Load testing with all production dependencies

### 2. Medical Software Compliance
- **FDA compliance** considerations for medical device software (if applicable)
- **ISO 27001** information security management standards
- **SOC 2 Type II** compliance for service organizations
- **DICOM standards** for medical imaging (if handling eye images)
- **HL7 FHIR** for healthcare data interchange (future integration)
- **Audit logging standards** meeting healthcare regulatory requirements
- **Data retention policies** compliant with medical record laws

### 3. Quality Assurance
- **Automated testing**: Unit (>90%), integration (>80%), E2E (critical paths)
- **Code coverage**: Minimum 95% coverage for all business logic
- **Security testing**: OWASP compliance, penetration testing quarterly
- **Performance testing**: Load testing to 10x expected peak usage
- **Usability testing**: Healthcare professional validation of workflows
- **Accessibility compliance**: WCAG 2.1 AA standards for medical interfaces
- **Documentation**: Complete API docs, user manuals, admin guides

## Production Code Review Checklist

### Security & Compliance
- [ ] No hardcoded credentials or sensitive data
- [ ] Proper authentication and authorization implemented
- [ ] Input validation and SQL injection prevention
- [ ] XSS and CSRF protection in place
- [ ] Audit logging for all patient data access
- [ ] Encryption for sensitive data fields
- [ ] Rate limiting on API endpoints

### Performance & Reliability  
- [ ] Database queries optimized with proper indexing
- [ ] Error handling with graceful degradation
- [ ] Resource cleanup (connections, files, memory)
- [ ] Caching strategy implemented where appropriate
- [ ] Asynchronous processing for heavy operations
- [ ] Health check endpoints working
- [ ] Monitoring and alerting configured

### Data Integrity
- [ ] Database constraints and validations
- [ ] Proper foreign key relationships
- [ ] Soft deletes for audit trail preservation
- [ ] User action tracking and timestamps
- [ ] Backup and recovery procedures tested
- [ ] Migration scripts are reversible
- [ ] Data consistency checks implemented

### Code Quality
- [ ] Comprehensive unit and integration tests (>95% coverage)
- [ ] Documentation updated (API, user guides, technical docs)
- [ ] Code follows established patterns and conventions
- [ ] No debug code or temporary fixes in production
- [ ] Performance profiling completed for critical paths
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified

### Production Readiness Assessment
- [ ] PRODUCTION_READINESS.md updated with any new non-production components
- [ ] All TODO comments link to specific production readiness items
- [ ] Critical production blockers identified and prioritized
- [ ] Development-only dependencies clearly marked
- [ ] Migration path documented for non-production code


