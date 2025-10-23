# Two-Factor Authentication (2FA) Setup Documentation

## Overview

PreciseOptics now supports Two-Factor Authentication (2FA) using Time-based One-Time Passwords (TOTP). This adds an extra layer of security to user accounts by requiring a verification code from an authenticator app in addition to the password.

## System Architecture

### Backend Components

1. **django-otp**: Industry-standard Django package for OTP functionality
2. **pyqrcode**: Generates QR codes for easy setup
3. **TOTP Algorithm**: Time-based algorithm (RFC 6238) compatible with standard authenticator apps

### Frontend Components

1. **Setup2FAPage**: Displays QR code and handles 2FA activation
2. **Verify2FAPage**: Verifies 6-digit code during login
3. **Updated Login Flow**: Checks if user has 2FA enabled

### Database Schema

```sql
-- CustomUser model additions
ALTER TABLE accounts_customuser ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;

-- TOTP Device table (created by django-otp)
CREATE TABLE otp_totp_totpdevice (
    id INTEGER PRIMARY KEY,
    user_id UUID REFERENCES accounts_customuser(id),
    name VARCHAR(64),
    confirmed BOOLEAN DEFAULT FALSE,
    key VARCHAR(80),  -- Secret key
    step INTEGER DEFAULT 30,  -- Time step (30 seconds)
    t0 INTEGER DEFAULT 0,
    digits INTEGER DEFAULT 6,
    tolerance INTEGER DEFAULT 1,
    drift INTEGER DEFAULT 0,
    last_t INTEGER DEFAULT -1
);
```

## API Endpoints

### 1. Setup 2FA
```
POST /api/accounts/2fa/setup/
Authorization: Token <user_token>

Response:
{
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code_png": "<base64_encoded_image>",
    "qr_code_svg": "<svg_xml>",
    "otpauth_url": "otpauth://totp/PreciseOptics:username?secret=JBSWY...",
    "message": "Scan this QR code with your authenticator app"
}
```

### 2. Verify 2FA Setup
```
POST /api/accounts/2fa/verify-setup/
Authorization: Token <user_token>
Content-Type: application/json

Request:
{
    "code": "123456"
}

Response (Success):
{
    "message": "2FA has been successfully enabled",
    "backup_codes": []
}

Response (Error):
{
    "error": "Invalid verification code"
}
```

### 3. Login (Standard - No 2FA)
```
POST /api-token-auth/
Content-Type: application/json

Request:
{
    "username": "doctor1",
    "password": "password123"
}

Response (2FA Not Enabled):
{
    "token": "abc123xyz...",
    "user": {...},
    "staff_profile": {...}
}

Response (2FA Required):
{
    "requires_2fa": true,
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4. Verify 2FA Login
```
POST /api/accounts/2fa/verify-login/
Content-Type: application/json

Request:
{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "doctor1",  // Optional if user_id provided
    "password": "password123",  // Required for re-authentication
    "code": "654321"
}

Response (Success):
{
    "token": "abc123xyz...",
    "user": {...},
    "staff_profile": {...},
    "message": "Login successful"
}

Response (Error):
{
    "error": "Invalid 2FA code"
}
```

### 5. Disable 2FA
```
POST /api/accounts/2fa/disable/
Authorization: Token <user_token>
Content-Type: application/json

Request:
{
    "password": "password123"
}

Response:
{
    "message": "2FA has been successfully disabled"
}
```

### 6. Get 2FA Status
```
GET /api/accounts/2fa/status/
Authorization: Token <user_token>

Response:
{
    "enabled": true
}
```

## User Workflow

### Enabling 2FA

1. **User initiates setup** (from account settings)
   - Navigate to `/setup-2fa`
   
2. **Backend generates TOTP device**
   - Creates unconfirmed TOTPDevice
   - Generates secret key
   - Creates QR code (both PNG and SVG formats)

3. **User scans QR code**
   - Use Google Authenticator, Microsoft Authenticator, Authy, or any TOTP app
   - Alternatively, manually enter the secret key

4. **User enters verification code**
   - App generates 6-digit code
   - User enters code in verification form

5. **Backend verifies and activates**
   - Validates the code
   - Confirms the TOTP device
   - Sets `user.two_factor_enabled = True`

### Login with 2FA

1. **User enters username/password**
   - Standard login form

2. **Backend checks 2FA status**
   - If `user.two_factor_enabled == False`: Return token (normal login)
   - If `user.two_factor_enabled == True`: Return `requires_2fa` flag

3. **Frontend redirects to 2FA verification**
   - Navigate to `/verify-2fa` with user credentials

4. **User enters 6-digit code**
   - From authenticator app

5. **Backend verifies code**
   - Validates TOTP code
   - Creates token and session
   - Returns authentication token

### Disabling 2FA

1. **User requests to disable 2FA**
   - From account settings

2. **User confirms with password**
   - Re-authentication for security

3. **Backend removes 2FA**
   - Deletes all TOTP devices
   - Sets `user.two_factor_enabled = False`

## Compatible Authenticator Apps

- **Google Authenticator** (iOS, Android)
- **Microsoft Authenticator** (iOS, Android)
- **Authy** (iOS, Android, Desktop)
- **1Password** (with TOTP support)
- **LastPass Authenticator**
- **FreeOTP** (Open source)
- Any RFC 6238 compliant TOTP app

## Security Considerations

### Time Synchronization

TOTP relies on synchronized time between server and client device:
- **Time Step**: 30 seconds (standard)
- **Tolerance**: ±1 step (allows for slight time drift)
- **Total Window**: ~90 seconds (current + previous + next)

### Secret Key Security

- Secret keys are randomly generated (160-bit)
- Stored in database (ensure database encryption)
- Never transmitted except during initial setup
- Cannot be recovered if lost (requires 2FA reset)

### Brute Force Protection

- Codes are 6 digits (1,000,000 combinations)
- Valid for 30 seconds only
- Account lockout after multiple failed attempts (recommended)
- Rate limiting on verification endpoints (recommended)

### Password Requirements

- Password still required for 2FA disable
- Prevents unauthorized 2FA changes if device is stolen
- Regular password rotation recommended

## Production Configuration

### Email Configuration (for backup codes)

```python
# Backend/precise_optics/settings.py

# For production, configure real SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Or your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'noreply@preciseoptics.com'
```

### Backup Codes (Future Enhancement)

```python
# Generate backup codes when enabling 2FA
import secrets

def generate_backup_codes(count=10):
    """Generate one-time backup codes for account recovery"""
    return [
        '-'.join([secrets.token_hex(4) for _ in range(2)])
        for _ in range(count)
    ]

# Example backup codes:
# 9f3a4b2c-7d1e8f6a
# 4c2b8d9e-1f3a6c7b
```

### Database Backup

- Backup `otp_totp_totpdevice` table regularly
- Include in disaster recovery plan
- Test restore procedures

### Monitoring

```python
# Log all 2FA events
import logging
logger = logging.getLogger('two_factor_auth')

# Log setup attempts
logger.info(f"2FA setup initiated: user={user.username}")

# Log verification failures
logger.warning(f"2FA verification failed: user={user.username}, ip={ip_address}")

# Log successful authentications
logger.info(f"2FA login success: user={user.username}")
```

## Testing

### Backend Testing

```python
# Test 2FA setup
response = client.post('/api/accounts/2fa/setup/', 
    headers={'Authorization': f'Token {token}'})
assert response.status_code == 200
assert 'secret' in response.json()
assert 'qr_code_png' in response.json()

# Test verification
code = generate_totp_code(secret)  # Use test helper
response = client.post('/api/accounts/2fa/verify-setup/',
    json={'code': code},
    headers={'Authorization': f'Token {token}'})
assert response.status_code == 200

# Test login flow
response = client.post('/api-token-auth/',
    json={'username': 'testuser', 'password': 'password123'})
assert response.json()['requires_2fa'] == True
```

### Frontend Testing

```javascript
// Test 2FA setup page
cy.visit('/setup-2fa');
cy.get('img[alt="2FA QR Code"]').should('be.visible');
cy.get('input[type="text"]').type('123456');
cy.get('button[type="submit"]').click();

// Test login with 2FA
cy.visit('/login');
cy.get('#username').type('testuser');
cy.get('#password').type('password123');
cy.get('button[type="submit"]').click();
cy.url().should('include', '/verify-2fa');
```

## Troubleshooting

### "Invalid verification code" Errors

1. **Check time synchronization**
   - Server and device must have accurate time
   - Use NTP on server
   - Check device time settings

2. **Code already used**
   - TOTP codes are one-time use within their 30-second window
   - Wait for new code to generate

3. **Wrong secret key**
   - Ensure QR code was scanned correctly
   - Try manual entry of secret key

### Lost Access to Authenticator App

**Admin Recovery Process:**

```python
# Django shell or admin panel
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice

User = get_user_model()
user = User.objects.get(username='affected_user')

# Disable 2FA for user
user.two_factor_enabled = False
user.save()

# Delete TOTP devices
TOTPDevice.objects.filter(user=user).delete()

print(f"2FA disabled for {user.username}")
```

### QR Code Not Displaying

1. Check pyqrcode and pypng installation
2. Verify base64 encoding in frontend
3. Check browser console for errors
4. Try manual secret key entry as fallback

## Future Enhancements

1. **Backup Codes**
   - Generate 10 one-time backup codes
   - Store hashed in database
   - Allow recovery if authenticator lost

2. **SMS Fallback** (Optional)
   - Send code via SMS as backup
   - Configure Twilio/AWS SNS
   - Less secure than TOTP

3. **Hardware Tokens**
   - Support U2F/WebAuthn
   - YubiKey integration
   - More secure than software TOTP

4. **Remember Device**
   - Cookie-based device recognition
   - Skip 2FA on trusted devices for 30 days
   - Balance security vs convenience

5. **Admin Force 2FA**
   - Require 2FA for specific roles (doctors, admins)
   - Grace period for enablement
   - Enforce via middleware

## Compliance Notes

### HIPAA Compliance

- 2FA satisfies "Access Control" requirements (§164.312(a)(1))
- Helps meet "Person or Entity Authentication" (§164.312(d))
- Document in Security Risk Assessment

### SOC 2 Compliance

- Addresses "Logical Access Controls" (CC6.1)
- Demonstrates "Authentication" controls
- Include in compliance documentation

## Support

For issues or questions:

1. Check this documentation
2. Review error logs (`Backend/logs/`)
3. Test with known-good authenticator app
4. Contact system administrator

## Version History

- **v1.0** (2025-01-XX): Initial 2FA implementation
  - TOTP-based authentication
  - QR code setup
  - Login flow integration
  - Basic admin controls
