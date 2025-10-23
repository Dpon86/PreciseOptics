import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import '../../App_new.css';

const Setup2FAPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get 2FA setup data when component mounts
    const initializeSetup = async () => {
      try {
        setLoading(true);
        const response = await apiService.setup2FA();
        setQrCode(response.data.qr_code_png);
        setSecret(response.data.secret);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to initialize 2FA setup');
        setLoading(false);
      }
    };

    initializeSetup();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.verify2FASetup(verificationCode);
      setSuccess(response.data.message);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading && !qrCode) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Setting up 2FA...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '500px' }}>
        <h2>Enable Two-Factor Authentication</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!success && (
          <>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                Scan this QR code with your authenticator app
                (Google Authenticator, Microsoft Authenticator, Authy, etc.)
              </p>
              
              {qrCode && (
                <div style={{ 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  <img 
                    src={`data:image/png;base64,${qrCode}`} 
                    alt="2FA QR Code" 
                    style={{ maxWidth: '250px' }}
                  />
                </div>
              )}
            </div>

            <div style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold' }}>
                Manual Entry Code:
              </p>
              <code style={{ 
                fontSize: '14px', 
                background: 'white',
                padding: '5px 10px',
                borderRadius: '3px',
                display: 'block',
                wordBreak: 'break-all'
              }}>
                {secret}
              </code>
              <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#666' }}>
                Use this code if you can't scan the QR code
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label htmlFor="code">Enter Verification Code</label>
                <input
                  type="text"
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  required
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '18px',
                    letterSpacing: '5px',
                    fontFamily: 'monospace'
                  }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Enter the 6-digit code from your authenticator app
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading || verificationCode.length !== 6}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Setup2FAPage;
