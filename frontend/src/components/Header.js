import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AlertBadge from './AlertBadge';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [alertSeverity, setAlertSeverity] = useState('low');

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAlertStats = async () => {
      try {
        const response = await api.getAlertStatistics();
        const stats = response.data || {};
        const total = stats.total_active || 0;
        setActiveAlerts(total);

        if ((stats.critical_active || 0) > 0) {
          setAlertSeverity('critical');
        } else if ((stats.high_active || 0) > 0) {
          setAlertSeverity('high');
        } else if ((stats.medium_active || 0) > 0) {
          setAlertSeverity('medium');
        } else {
          setAlertSeverity('low');
        }
      } catch (error) {
        // Silent fail so header remains usable even if alerts endpoint is down
      }
    };

    fetchAlertStats();
    const timer = setInterval(fetchAlertStats, 60000);
    return () => clearInterval(timer);
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleAlertsClick = () => {
    navigate('/alerts');
  };
  
  const showBackButton = location.pathname !== '/';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            onClick={onMenuClick} 
            className="btn btn-menu"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          {showBackButton && (
            <button onClick={handleBack} className="btn btn-back">
              ← Back
            </button>
          )}
          <h1 className="header-title">PreciseOptics Eye Hospital</h1>
        </div>
        
        <div className="header-right">
          <AlertBadge count={activeAlerts} severity={alertSeverity} onClick={handleAlertsClick} />
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