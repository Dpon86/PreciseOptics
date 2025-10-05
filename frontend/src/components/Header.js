import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const showBackButton = location.pathname !== '/';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button onClick={handleBack} className="btn btn-back">
              ← Back
            </button>
          )}
          <h1 className="header-title">PreciseOptics Eye Hospital</h1>
        </div>
        
        <div className="header-right">
          {user && <span>Welcome, {user.username || 'User'}</span>}
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;