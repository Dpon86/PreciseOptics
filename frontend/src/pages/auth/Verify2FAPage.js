import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import '../../App_new.css';

const Verify2FAPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user credentials from navigation state
  const { user_id, username, password } = location.state || {};

  useEffect(() => {
    // Redirect to login if no credentials
    if (!user_id && !username) {
      navigate('/login');
    }
  }, [user_id, username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.verify2FALogin(user_id, username, password, code);
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      if (response.data.staff_profile) {
        localStorage.setItem('staffProfile', JSON.stringify(response.data.staff_profile));
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Two-Factor Authentication</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
          Enter the 6-digit code from your authenticator app
        </p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              autoFocus
              style={{ 
                textAlign: 'center', 
                fontSize: '24px',
                letterSpacing: '10px',
                fontFamily: 'monospace',
                padding: '15px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="login-button"
              disabled={loading || code.length !== 6}
              style={{ flex: 1 }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="login-button"
              style={{ 
                flex: 1,
                background: '#666'
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Lost access to your authenticator?<br />
            Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify2FAPage;
