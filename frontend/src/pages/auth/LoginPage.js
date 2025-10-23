import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        navigate('/');
      } else if (result.requires_2fa) {
        // Redirect to 2FA verification page
        navigate('/verify-2fa', {
          state: {
            user_id: result.user_id,
            username: result.username,
            password: result.password
          }
        });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">PreciseOptics</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Eye Hospital Management System
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter your password"
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Forgot Password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>Demo Accounts:</strong><br />
          <strong>Admin:</strong> admin / (your password)<br />
          <strong>Doctor:</strong> dr.smith / password123<br />
          <strong>Nurse:</strong> nurse.brown / password123
        </div>
      </form>
    </div>
  );
};

export default LoginPage;