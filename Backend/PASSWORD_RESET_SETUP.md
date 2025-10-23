# Password Reset Email Configuration

## Overview
The password reset system uses Django's email functionality to send password reset links to users. By default, emails are printed to the console for development.

## Configuration Options

### 1. Console Email Backend (Development - Default)
Emails are printed to the console/terminal where Django is running.

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

This is already configured and works out of the box for testing.

### 2. Gmail SMTP (Production)
To use Gmail for sending actual emails:

1. Create a `.env` file in the Backend directory if it doesn't exist
2. Add these settings:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@preciseoptics.com
FRONTEND_URL=http://localhost:3000
```

**Important for Gmail:**
- You need to use an "App Password" not your regular Gmail password
- Go to: Google Account → Security → 2-Step Verification → App passwords
- Generate a new app password for "Mail"
- Use that 16-character password in EMAIL_HOST_PASSWORD

### 3. Other Email Providers

#### SendGrid
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-aws-smtp-username
EMAIL_HOST_PASSWORD=your-aws-smtp-password
```

#### Mailgun
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@your-domain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
```

## Testing the Password Reset Flow

1. Start the Django backend:
   ```bash
   cd Backend
   python manage.py runserver
   ```

2. Start the React frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Go to http://localhost:3000/login

4. Click "Forgot Password?"

5. Enter a user's email address (must exist in the database)

6. With console backend (default):
   - Check the Django console/terminal
   - You'll see the email content with the reset link
   - Copy the reset link and paste it in your browser

7. With SMTP backend (Gmail, SendGrid, etc.):
   - Check the user's email inbox
   - Click the reset link in the email
   - It will take you to the password reset form

## API Endpoints

### Request Password Reset
```
POST /password-reset/
Body: { "email": "user@example.com" }
```

### Confirm Password Reset
```
POST /password-reset/confirm/
Body: { 
  "token": "reset-token-from-email",
  "password": "new-password"
}
```

## Security Features

- Tokens expire after 1 hour
- Tokens can only be used once
- Email existence is not revealed (same response whether email exists or not)
- Passwords must be at least 8 characters
- Tokens are cryptographically secure using Python's `secrets` module

## Troubleshooting

### Email Not Sending
1. Check Django console for errors
2. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct
3. For Gmail, ensure you're using an App Password (not regular password)
4. Check your email provider's SMTP settings

### Token Expired
- Reset links expire after 1 hour
- User must request a new reset link

### Email Not Received
- Check spam folder
- Verify the email address exists in the database
- Check Django console for errors
- With console backend, the email appears in the terminal

## Database Table

The `accounts_passwordresettoken` table stores:
- `user_id`: Foreign key to the user
- `token`: Unique reset token
- `created_at`: When the token was created
- `expires_at`: When the token expires (1 hour after creation)
- `is_used`: Whether the token has been used

## Production Considerations

1. **Use a real SMTP service** (Gmail, SendGrid, AWS SES, etc.)
2. **Set up proper DNS records** (SPF, DKIM) for your domain
3. **Monitor email delivery rates**
4. **Implement rate limiting** to prevent abuse
5. **Use HTTPS** for all reset links
6. **Consider using a queue** (like Celery) for sending emails asynchronously
7. **Set up email templates** with HTML formatting for better user experience
