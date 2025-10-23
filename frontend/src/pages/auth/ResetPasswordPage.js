import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.resetPassword(token, formData.password);
      setSuccess('Password reset successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to reset password. The link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Set New Password</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Enter your new password below.
        </p>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '1rem' }}>
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter new password (min 8 characters)"
            minLength="8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Confirm new password"
            minLength="8"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !token}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
