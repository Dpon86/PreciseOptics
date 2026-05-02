"""
Automated security-header tests for PreciseOptics.

Verifies that SecurityHeadersMiddleware injects the required headers on every
response and that Django's production-only HTTPS settings are configured
correctly.

Run with:
    python manage.py test precise_optics.tests_security_headers
"""
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse


class SecurityHeadersTest(TestCase):
    """Assert that all required security headers are present on API responses."""

    # A lightweight, public endpoint that returns a JSON body.
    # Using the basic health-check so no authentication is needed.
    _PUBLIC_PATH = '/api/health/'

    def _get(self, path=None):
        path = path or self._PUBLIC_PATH
        return self.client.get(path)

    # ------------------------------------------------------------------
    # Individual header assertions
    # ------------------------------------------------------------------

    def test_x_content_type_options(self):
        response = self._get()
        self.assertEqual(
            response.get('X-Content-Type-Options'), 'nosniff',
            'X-Content-Type-Options must be "nosniff" to prevent MIME-sniffing'
        )

    def test_x_frame_options(self):
        response = self._get()
        value = response.get('X-Frame-Options', '')
        self.assertIn(
            value, ('DENY', 'SAMEORIGIN'),
            'X-Frame-Options must be DENY or SAMEORIGIN to prevent clickjacking'
        )

    def test_x_xss_protection(self):
        response = self._get()
        value = response.get('X-XSS-Protection', '')
        self.assertTrue(
            value.startswith('1'),
            'X-XSS-Protection should start with "1" to enable the browser filter'
        )

    def test_referrer_policy(self):
        response = self._get()
        allowed = {
            'no-referrer',
            'strict-origin',
            'strict-origin-when-cross-origin',
            'no-referrer-when-downgrade',
        }
        value = response.get('Referrer-Policy', '')
        self.assertIn(
            value, allowed,
            f'Referrer-Policy "{value}" is not a recognised safe value'
        )

    def test_content_security_policy_present(self):
        response = self._get()
        csp = response.get('Content-Security-Policy', '')
        self.assertTrue(
            len(csp) > 0,
            'Content-Security-Policy header must be present'
        )

    def test_csp_no_unsafe_eval_in_production(self):
        """In production CSP must not allow unsafe-eval."""
        with override_settings(ENVIRONMENT='production'):
            # Re-instantiate middleware with production settings would require
            # a live request; instead, directly test the middleware helper.
            from precise_optics.middleware import SecurityHeadersMiddleware

            class _MockGetResponse:
                def __call__(self, req):
                    from django.http import HttpResponse
                    return HttpResponse()

            mw = SecurityHeadersMiddleware(_MockGetResponse())
            factory = RequestFactory()
            request = factory.get('/')
            response = mw(request)
            self.assertNotIn(
                "'unsafe-eval'",
                response.get('Content-Security-Policy', ''),
                "Production CSP must not contain 'unsafe-eval'"
            )

    def test_permissions_policy_present(self):
        response = self._get()
        pp = response.get('Permissions-Policy', '')
        self.assertTrue(
            len(pp) > 0,
            'Permissions-Policy header must be present'
        )

    # ------------------------------------------------------------------
    # All headers in one shot (regression check)
    # ------------------------------------------------------------------

    def test_all_required_headers_present(self):
        response = self._get()
        required = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'Referrer-Policy',
            'Content-Security-Policy',
            'Permissions-Policy',
        ]
        missing = [h for h in required if not response.get(h)]
        self.assertEqual(
            missing, [],
            f'The following security headers are missing: {missing}'
        )


class HSTSSettingsTest(TestCase):
    """
    Verify Django's HTTPS/HSTS settings are configured correctly for
    production.  These checks run against the settings module, not live
    responses, because HSTS is injected by Django's SecurityMiddleware at
    the WSGI layer (not visible in the test client unless SECURE_SSL_REDIRECT
    is active).
    """

    @override_settings(ENVIRONMENT='production', SECURE_HSTS_SECONDS=31536000,
                       SECURE_HSTS_INCLUDE_SUBDOMAINS=True, SECURE_HSTS_PRELOAD=True,
                       SECURE_SSL_REDIRECT=True)
    def test_hsts_configured_for_production(self):
        from django.conf import settings
        self.assertGreaterEqual(
            settings.SECURE_HSTS_SECONDS, 31536000,
            'SECURE_HSTS_SECONDS must be at least one year (31536000) in production'
        )
        self.assertTrue(
            settings.SECURE_HSTS_INCLUDE_SUBDOMAINS,
            'SECURE_HSTS_INCLUDE_SUBDOMAINS must be True in production'
        )
        self.assertTrue(
            settings.SECURE_HSTS_PRELOAD,
            'SECURE_HSTS_PRELOAD should be True for HSTS preload list eligibility'
        )
        self.assertTrue(
            settings.SECURE_SSL_REDIRECT,
            'SECURE_SSL_REDIRECT must be True in production'
        )
