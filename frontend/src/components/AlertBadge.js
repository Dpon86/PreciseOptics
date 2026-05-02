import React from 'react';
import PropTypes from 'prop-types';
import './AlertBadge.css';

const AlertBadge = ({ count, severity = 'medium', onClick }) => {
  if (count === 0) return null;
  
  const getSeverityClass = () => {
    switch(severity) {
      case 'critical':
        return 'alert-badge-critical';
      case 'high':
        return 'alert-badge-high';
      case 'medium':
        return 'alert-badge-medium';
      case 'low':
        return 'alert-badge-low';
      default:
        return 'alert-badge-medium';
    }
  };
  
  return (
    <button 
      className={`alert-badge ${getSeverityClass()}`}
      onClick={onClick}
      title={`${count} active alert${count > 1 ? 's' : ''}`}
    >
      <span className="alert-badge-icon">🔔</span>
      <span className="alert-badge-count">{count > 99 ? '99+' : count}</span>
    </button>
  );
};

AlertBadge.propTypes = {
  count: PropTypes.number.isRequired,
  severity: PropTypes.oneOf(['critical', 'high', 'medium', 'low']),
  onClick: PropTypes.func
};

AlertBadge.defaultProps = {
  severity: 'medium'
};

export default AlertBadge;
