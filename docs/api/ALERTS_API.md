# Appointment Alerts API Documentation

**Version**: 1.0  
**Base URL**: `/api/v1/patients/`  
**Authentication**: Token-based (required for all endpoints)  
**Last Updated**: May 2, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Query Parameters](#query-parameters)
5. [Custom Actions](#custom-actions)
6. [Alert Service Logic](#alert-service-logic)
7. [Error Responses](#error-responses)
8. [Code Examples](#code-examples)

---

## Overview

The Appointment Alerts API provides comprehensive functionality for managing automated alerts for appointment-related events including:

- **Late Arrivals**: Patient hasn't checked in after scheduled time
- **Missed Appointments**: Patient hasn't arrived beyond threshold
- **Upcoming Reminders**: Notifications before scheduled appointments
- **Overdue Follow-ups**: Patients requiring follow-up visits

### Key Features

- ✅ Automated alert generation based on configurable thresholds
- ✅ Multi-level severity classification (low, medium, high, critical)
- ✅ Status tracking (active, acknowledged, resolved, dismissed)
- ✅ Comprehensive filtering and search
- ✅ Audit trail for all actions
- ✅ Configurable alert rules system-wide

---

## Data Models

### AppointmentAlert

Represents an individual alert instance.

```python
{
    "id": "uuid",                          # Unique identifier
    "patient": "patient_id",               # Foreign key to Patient
    "visit": "visit_id",                   # Foreign key to PatientVisit (nullable)
    "alert_type": "string",                # missed | late | upcoming | overdue_followup
    "severity": "string",                  # low | medium | high | critical
    "status": "string",                    # active | acknowledged | resolved | dismissed
    "title": "string",                     # Alert title (max 200 chars)
    "message": "string",                   # Detailed alert message
    "trigger_time": "datetime",            # When alert was triggered
    "acknowledged_at": "datetime",         # When acknowledged (nullable)
    "acknowledged_by": "user_id",          # User who acknowledged (nullable)
    "resolved_at": "datetime",             # When resolved (nullable)
    "resolved_by": "user_id",              # User who resolved (nullable)
    "action_taken": "string",              # Actions taken to resolve
    "notes": "string",                     # Additional notes
    "created_at": "datetime",              # Record creation time
    "updated_at": "datetime"               # Last update time
}
```

**Alert Types**:
- `missed`: Patient has not arrived beyond missed threshold (default: 60 minutes)
- `late`: Patient is late but within missed threshold (default: 15-60 minutes)
- `upcoming`: Reminder for upcoming appointment (default: 60 minutes before)
- `overdue_followup`: Patient requires follow-up visit (default: 30 days since last visit)

**Severity Levels**:
- `low`: Informational alerts
- `medium`: Requires attention (default for late arrivals)
- `high`: Urgent attention needed (default for missed appointments)
- `critical`: Immediate action required

**Status Values**:
- `active`: Alert is new and unaddressed
- `acknowledged`: Staff has seen the alert but not resolved
- `resolved`: Issue has been addressed and resolved
- `dismissed`: Alert dismissed without action

### AlertConfiguration

System-wide alert configuration settings.

```python
{
    "id": "uuid",                                # Unique identifier
    "late_threshold_minutes": 15,                # Minutes to trigger 'late' alert
    "missed_threshold_minutes": 60,              # Minutes to mark as 'missed'
    "upcoming_reminder_minutes": 60,             # Minutes before for reminder
    "overdue_followup_days": 30,                 # Days to trigger follow-up alert
    "auto_resolve_on_checkin": true,             # Auto-resolve on check-in
    "auto_dismiss_after_days": 7,                # Days before auto-dismiss (0=never)
    "send_email_alerts": false,                  # Enable email notifications
    "send_sms_alerts": false,                    # Enable SMS notifications
    "is_active": true,                           # Configuration is active
    "created_at": "datetime",                    # Creation timestamp
    "updated_at": "datetime",                    # Last update timestamp
    "created_by": "user_id"                      # User who created config
}
```

---

## API Endpoints

### 1. List Alerts

**Endpoint**: `GET /api/v1/patients/alerts/`  
**Permission**: Authenticated users  
**Serializer**: `AppointmentAlertListSerializer`

Returns paginated list of alerts with filtering options.

**Response** (200 OK):
```json
{
    "count": 150,
    "next": "http://api.example.com/api/v1/patients/alerts/?page=2",
    "previous": null,
    "results": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "patient_id": "P12345",
            "patient_name": "John Doe",
            "visit_id": "visit-uuid",
            "visit_scheduled_date": "2026-05-02T14:00:00Z",
            "alert_type": "late",
            "severity": "medium",
            "status": "active",
            "title": "Late Arrival - John Doe",
            "message": "Patient John Doe (ID: P12345) is 20 minutes late...",
            "trigger_time": "2026-05-02T14:20:00Z",
            "acknowledged_at": null,
            "acknowledged_by_name": null,
            "created_at": "2026-05-02T14:20:00Z"
        }
    ]
}
```

**Query Parameters**: See [Query Parameters](#query-parameters) section

---

### 2. Retrieve Alert

**Endpoint**: `GET /api/v1/patients/alerts/{id}/`  
**Permission**: Authenticated users  
**Serializer**: `AppointmentAlertSerializer`

Retrieve detailed information for a specific alert.

**Response** (200 OK):
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "patient": {
        "id": "patient-uuid",
        "patient_id": "P12345",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890"
    },
    "visit": {
        "id": "visit-uuid",
        "scheduled_date": "2026-05-02T14:00:00Z",
        "visit_type": "follow_up",
        "status": "scheduled"
    },
    "alert_type": "late",
    "severity": "medium",
    "status": "active",
    "title": "Late Arrival - John Doe",
    "message": "Patient John Doe (ID: P12345) is 20 minutes late for their Follow-up appointment scheduled at 02:00 PM.",
    "trigger_time": "2026-05-02T14:20:00Z",
    "acknowledged_at": null,
    "acknowledged_by": null,
    "resolved_at": null,
    "resolved_by": null,
    "action_taken": "",
    "notes": "",
    "created_at": "2026-05-02T14:20:00Z",
    "updated_at": "2026-05-02T14:20:00Z"
}
```

---

### 3. Create Alert

**Endpoint**: `POST /api/v1/patients/alerts/`  
**Permission**: Authenticated users  
**Serializer**: `AppointmentAlertCreateSerializer`

Manually create an alert (typically used for custom situations).

**Request Body**:
```json
{
    "patient": "patient-uuid",
    "visit": "visit-uuid",              // Optional
    "alert_type": "overdue_followup",
    "severity": "high",
    "title": "Follow-up Required",
    "message": "Patient requires follow-up visit for post-treatment check."
}
```

**Response** (201 Created):
```json
{
    "id": "new-alert-uuid",
    "patient": "patient-uuid",
    "alert_type": "overdue_followup",
    "severity": "high",
    "status": "active",
    "title": "Follow-up Required",
    "message": "Patient requires follow-up visit for post-treatment check.",
    "trigger_time": "2026-05-02T15:00:00Z",
    "created_at": "2026-05-02T15:00:00Z"
}
```

**Validation Rules**:
- `patient`: Required, must be valid Patient UUID
- `visit`: Optional, must be valid PatientVisit UUID if provided
- `alert_type`: Required, must be one of: missed, late, upcoming, overdue_followup
- `severity`: Optional, defaults to 'medium'
- `title`: Required, max 200 characters
- `message`: Required

---

### 4. Update Alert

**Endpoint**: `PUT /api/v1/patients/alerts/{id}/`  
**Endpoint**: `PATCH /api/v1/patients/alerts/{id}/`  
**Permission**: Authenticated users

Update alert details (notes, action_taken, etc.).

**Request Body** (PATCH example):
```json
{
    "notes": "Contacted patient via phone. Patient rescheduling for tomorrow.",
    "action_taken": "Phone call made, appointment rescheduled"
}
```

**Response** (200 OK): Returns updated alert object

---

### 5. Delete Alert

**Endpoint**: `DELETE /api/v1/patients/alerts/{id}/`  
**Permission**: Authenticated users

Delete an alert (use with caution - prefer resolve/dismiss).

**Response** (204 No Content)

---

## Custom Actions

### 1. Acknowledge Alert

**Endpoint**: `POST /api/v1/patients/alerts/{id}/acknowledge/`  
**Permission**: Authenticated users

Mark an alert as acknowledged by current user.

**Request Body**: None required

**Response** (200 OK):
```json
{
    "message": "Alert acknowledged successfully",
    "alert": {
        "id": "alert-uuid",
        "status": "acknowledged",
        "acknowledged_at": "2026-05-02T14:25:00Z",
        "acknowledged_by": {
            "id": "user-uuid",
            "username": "nurse_jane",
            "first_name": "Jane",
            "last_name": "Smith"
        }
    }
}
```

**Business Logic**:
- Only alerts with status 'active' can be acknowledged
- Sets `acknowledged_at` to current timestamp
- Sets `acknowledged_by` to current user
- Changes status from 'active' to 'acknowledged'

---

### 2. Resolve Alert

**Endpoint**: `POST /api/v1/patients/alerts/{id}/resolve/`  
**Permission**: Authenticated users

Mark an alert as resolved with action details.

**Request Body**:
```json
{
    "action_taken": "Patient contacted and appointment rescheduled for May 5th at 10:00 AM",
    "notes": "Patient had transportation issues"
}
```

**Response** (200 OK):
```json
{
    "message": "Alert resolved successfully",
    "alert": {
        "id": "alert-uuid",
        "status": "resolved",
        "resolved_at": "2026-05-02T14:30:00Z",
        "resolved_by": {
            "id": "user-uuid",
            "username": "nurse_jane",
            "first_name": "Jane",
            "last_name": "Smith"
        },
        "action_taken": "Patient contacted and appointment rescheduled for May 5th at 10:00 AM",
        "notes": "Patient had transportation issues"
    }
}
```

**Business Logic**:
- Can resolve alerts with status 'active' or 'acknowledged'
- Sets `resolved_at` to current timestamp
- Sets `resolved_by` to current user
- Changes status to 'resolved'
- Requires `action_taken` in request body

---

### 3. Dismiss Alert

**Endpoint**: `POST /api/v1/patients/alerts/{id}/dismiss/`  
**Permission**: Authenticated users

Dismiss an alert without resolution action.

**Request Body**:
```json
{
    "notes": "Duplicate alert, patient already checked in"
}
```

**Response** (200 OK):
```json
{
    "message": "Alert dismissed successfully",
    "alert": {
        "id": "alert-uuid",
        "status": "dismissed",
        "notes": "Duplicate alert, patient already checked in"
    }
}
```

**Business Logic**:
- Can dismiss alerts with any status except 'resolved'
- Changes status to 'dismissed'
- Does not set resolved_at or resolved_by

---

### 4. Get Alert Statistics

**Endpoint**: `GET /api/v1/patients/alerts/statistics/`  
**Permission**: Authenticated users

Get summary statistics for all alerts.

**Response** (200 OK):
```json
{
    "total_active": 25,
    "total_acknowledged": 8,
    "total_resolved": 142,
    "total_dismissed": 15,
    "by_type": {
        "missed": 45,
        "late": 32,
        "upcoming": 98,
        "overdue_followup": 15
    },
    "by_severity": {
        "critical": 2,
        "high": 15,
        "medium": 80,
        "low": 93
    },
    "critical_active": 2,
    "high_active": 8,
    "medium_active": 12,
    "low_active": 3
}
```

**Usage**: Displayed in Header badge to show alert counts by severity

---

### 5. Generate Alerts

**Endpoint**: `POST /api/v1/patients/alerts/generate/`  
**Permission**: Authenticated users (typically called by scheduled task)

Scan all scheduled appointments and generate alerts based on current configuration.

**Request Body**: None required

**Response** (200 OK):
```json
{
    "message": "Alert generation completed",
    "stats": {
        "scanned": 150,
        "late": 12,
        "missed": 5,
        "errors": 0,
        "followups_created": 3
    }
}
```

**Business Logic**:
- Scans all scheduled appointments
- Generates late alerts for appointments 15+ minutes past scheduled time
- Generates missed alerts for appointments 60+ minutes past scheduled time
- Auto-escalates late alerts to missed when threshold crossed
- Generates overdue follow-up alerts for patients needing return visits

**Recommended Usage**: Run via scheduled task (cron/celery) every 5-15 minutes

---

## Alert Configuration Endpoints

### 1. List Configurations

**Endpoint**: `GET /api/v1/patients/alert-config/`  
**Permission**: Authenticated users

List all alert configurations (active and inactive).

**Response** (200 OK):
```json
{
    "count": 3,
    "results": [
        {
            "id": "config-uuid",
            "late_threshold_minutes": 15,
            "missed_threshold_minutes": 60,
            "upcoming_reminder_minutes": 60,
            "overdue_followup_days": 30,
            "auto_resolve_on_checkin": true,
            "auto_dismiss_after_days": 7,
            "send_email_alerts": false,
            "send_sms_alerts": false,
            "is_active": true,
            "created_at": "2026-01-15T10:00:00Z",
            "updated_at": "2026-03-20T14:30:00Z",
            "created_by": "admin-user-uuid"
        }
    ]
}
```

---

### 2. Get Active Configuration

**Endpoint**: `GET /api/v1/patients/alert-config/active/`  
**Permission**: Authenticated users

Retrieve the currently active alert configuration.

**Response** (200 OK): Returns single AlertConfiguration object

---

### 3. Create Configuration

**Endpoint**: `POST /api/v1/patients/alert-config/`  
**Permission**: Authenticated users

Create a new alert configuration.

**Request Body**:
```json
{
    "late_threshold_minutes": 20,
    "missed_threshold_minutes": 90,
    "upcoming_reminder_minutes": 120,
    "overdue_followup_days": 45,
    "auto_resolve_on_checkin": true,
    "auto_dismiss_after_days": 14,
    "send_email_alerts": true,
    "send_sms_alerts": false
}
```

**Response** (201 Created): Returns created configuration

**Note**: Creating a new configuration does NOT automatically activate it. Use the activate action.

---

### 4. Update Configuration

**Endpoint**: `PUT /api/v1/patients/alert-config/{id}/`  
**Endpoint**: `PATCH /api/v1/patients/alert-config/{id}/`  
**Permission**: Authenticated users

Update configuration thresholds.

---

### 5. Activate Configuration

**Endpoint**: `POST /api/v1/patients/alert-config/{id}/activate/`  
**Permission**: Authenticated users (Admin recommended)

Activate a specific configuration (deactivates all others).

**Response** (200 OK):
```json
{
    "message": "Configuration activated successfully",
    "config": {
        "id": "config-uuid",
        "is_active": true,
        "late_threshold_minutes": 20,
        "missed_threshold_minutes": 90
    }
}
```

---

## Query Parameters

All list endpoints support the following query parameters:

### Alert List Filtering

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (active, acknowledged, resolved, dismissed, unresolved) | `?status=active` |
| `alert_type` | string | Filter by type (missed, late, upcoming, overdue_followup) | `?alert_type=missed` |
| `severity` | string | Filter by severity (critical, high, medium, low) | `?severity=high` |
| `patient` | uuid | Filter by patient ID | `?patient=patient-uuid` |
| `date_from` | datetime | Alerts triggered on or after this date | `?date_from=2026-05-01` |
| `date_to` | datetime | Alerts triggered on or before this date | `?date_to=2026-05-31` |
| `page` | integer | Page number for pagination | `?page=2` |
| `page_size` | integer | Results per page (max 100) | `?page_size=50` |

**Special Status Filters**:
- `status=unresolved`: Returns alerts with status 'active' OR 'acknowledged'

**Example Combined Query**:
```
GET /api/v1/patients/alerts/?status=active&severity=high&date_from=2026-05-01&page_size=50
```

---

## Alert Service Logic

### Alert Generation Algorithm

1. **Scheduled Task Runs** (every 5-15 minutes)
   - Calls `AlertService.scan_all_appointments()`
   - Retrieves all visits with status='scheduled'

2. **For Each Scheduled Visit**:
   - Skip if status is completed, cancelled, checked_in, or in_progress
   - Calculate time difference between now and scheduled_date
   - Apply threshold logic:

3. **Late Alert Generation**:
   - **Trigger**: `late_threshold_minutes < minutes_late ≤ missed_threshold_minutes`
   - **Default**: 15-60 minutes late
   - **Severity**: Medium
   - **Check**: Only create if no active 'late' alert exists for this visit

4. **Missed Alert Generation**:
   - **Trigger**: `minutes_late > missed_threshold_minutes`
   - **Default**: More than 60 minutes late
   - **Severity**: High
   - **Actions**:
     - Auto-resolve any active 'late' alerts for this visit
     - Create new 'missed' alert if none exists

5. **Auto-Resolution**:
   - When patient checks in (`status='checked_in'` or `'in_progress'`):
     - If `auto_resolve_on_checkin=true`, auto-resolve all active/acknowledged alerts for that visit
     - Set action_taken: "Auto-resolved: Patient checked in"

6. **Overdue Follow-up Generation**:
   - Separate process checks last visit date
   - If `(today - last_visit_date) > overdue_followup_days`, create alert
   - Severity: Medium to High (configurable)

### Performance Optimizations

- Uses `select_related('patient')` to minimize database queries
- Checks for existing alerts before creation to prevent duplicates
- Bulk updates for auto-resolution scenarios
- Database indexes on: status, alert_type, trigger_time, created_at

---

## Error Responses

### Standard Error Format

```json
{
    "detail": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid parameters, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Alert or configuration ID doesn't exist |
| 409 | Conflict | Alert already acknowledged/resolved |
| 500 | Server Error | Unexpected server error |

### Example Error Responses

**400 Bad Request** (Missing required field):
```json
{
    "patient": ["This field is required."],
    "title": ["This field is required."]
}
```

**404 Not Found**:
```json
{
    "detail": "No AppointmentAlert matches the given query."
}
```

**409 Conflict** (Cannot acknowledge resolved alert):
```json
{
    "detail": "Alert is already resolved and cannot be modified."
}
```

---

## Code Examples

### Python (using requests)

```python
import requests

# Authentication
headers = {
    'Authorization': 'Token your-auth-token-here',
    'Content-Type': 'application/json'
}

BASE_URL = 'https://api.preciseoptics.com/api/v1/patients'

# Get all active high-severity alerts
response = requests.get(
    f'{BASE_URL}/alerts/',
    params={'status': 'active', 'severity': 'high'},
    headers=headers
)
alerts = response.json()['results']

# Acknowledge an alert
alert_id = alerts[0]['id']
response = requests.post(
    f'{BASE_URL}/alerts/{alert_id}/acknowledge/',
    headers=headers
)
print(response.json())

# Resolve alert with action
resolve_data = {
    'action_taken': 'Patient contacted and rescheduled',
    'notes': 'Transportation issue'
}
response = requests.post(
    f'{BASE_URL}/alerts/{alert_id}/resolve/',
    json=resolve_data,
    headers=headers
)
```

### JavaScript (using fetch)

```javascript
const BASE_URL = 'https://api.preciseoptics.com/api/v1/patients';
const authToken = 'your-auth-token-here';

// Get alert statistics
async function getAlertStatistics() {
    const response = await fetch(`${BASE_URL}/alerts/statistics/`, {
        headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
        }
    });
    const stats = await response.json();
    console.log('Critical alerts:', stats.critical_active);
    return stats;
}

// Create custom alert
async function createCustomAlert(patientId, title, message) {
    const response = await fetch(`${BASE_URL}/alerts/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            patient: patientId,
            alert_type: 'overdue_followup',
            severity: 'high',
            title: title,
            message: message
        })
    });
    return response.json();
}

// Resolve alert
async function resolveAlert(alertId, actionTaken) {
    const response = await fetch(`${BASE_URL}/alerts/${alertId}/resolve/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action_taken: actionTaken,
            notes: 'Resolved via web interface'
        })
    });
    return response.json();
}
```

### cURL Examples

```bash
# Get all active alerts
curl -X GET "https://api.preciseoptics.com/api/v1/patients/alerts/?status=active" \
  -H "Authorization: Token your-auth-token-here"

# Get alert statistics
curl -X GET "https://api.preciseoptics.com/api/v1/patients/alerts/statistics/" \
  -H "Authorization: Token your-auth-token-here"

# Acknowledge alert
curl -X POST "https://api.preciseoptics.com/api/v1/patients/alerts/{alert-id}/acknowledge/" \
  -H "Authorization: Token your-auth-token-here" \
  -H "Content-Type: application/json"

# Resolve alert
curl -X POST "https://api.preciseoptics.com/api/v1/patients/alerts/{alert-id}/resolve/" \
  -H "Authorization: Token your-auth-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "action_taken": "Patient contacted and appointment rescheduled",
    "notes": "Patient had transportation issues"
  }'

# Generate alerts (scheduled task)
curl -X POST "https://api.preciseoptics.com/api/v1/patients/alerts/generate/" \
  -H "Authorization: Token your-auth-token-here"

# Get active configuration
curl -X GET "https://api.preciseoptics.com/api/v1/patients/alert-config/active/" \
  -H "Authorization: Token your-auth-token-here"
```

---

## Best Practices

### For Frontend Developers

1. **Poll Statistics Endpoint**: Call `/alerts/statistics/` every 30-60 seconds to update alert badge counts
2. **Use Filters**: Apply status filters to show relevant views (e.g., "unresolved" for action items)
3. **Show Severity**: Color-code alerts by severity (critical=red, high=orange, medium=yellow, low=blue)
4. **Real-time Updates**: Consider WebSocket integration for instant alert notifications
5. **Acknowledge First**: Train users to acknowledge alerts before resolving (audit trail)

### For Backend/DevOps

1. **Scheduled Tasks**: Run `/alerts/generate/` every 5-15 minutes via cron or Celery
2. **Monitoring**: Track alert generation errors and response times
3. **Database Indexes**: Ensure indexes on status, alert_type, trigger_time are in place
4. **Cleanup**: Implement auto-dismiss logic for old resolved alerts (optional)
5. **Configuration Backup**: Keep configuration history for audit purposes

### For System Administrators

1. **Threshold Tuning**: Adjust thresholds based on clinic workflow and patient demographics
2. **Auto-Resolution**: Enable `auto_resolve_on_checkin` for reduced manual work
3. **Email/SMS**: Configure notification channels for critical alerts
4. **Access Control**: Restrict configuration changes to admin users only
5. **Training**: Ensure staff understand alert severity levels and proper resolution workflow

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 2, 2026 | Initial API documentation release |

---

## Support & Contact

For questions or issues with the Alerts API, contact:
- **Technical Support**: support@preciseoptics.com
- **API Documentation**: https://docs.preciseoptics.com/api
- **GitHub Issues**: https://github.com/Dpon86/PreciseOptics/issues

---

**End of Alerts API Documentation**
