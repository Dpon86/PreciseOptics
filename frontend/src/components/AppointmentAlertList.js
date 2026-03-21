import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentAlertList.css';

const AppointmentAlertList = ({ alerts, onAcknowledge, onResolve, onDismiss }) => {
  const navigate = useNavigate();
  
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-list-empty">
        <div className="empty-icon">✓</div>
        <p>No active alerts</p>
      </div>
    );
  }
  
  const getAlertIcon = (alertType) => {
    switch(alertType) {
      case 'missed':
        return '❌';
      case 'late':
        return '⏰';
      case 'upcoming':
        return '📅';
      case 'overdue_followup':
        return '📋';
      default:
        return '🔔';
    }
  };
  
  const getSeverityClass = (severity) => {
    return `alert-item-${severity}`;
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', class: 'status-active' },
      acknowledged: { label: 'Acknowledged', class: 'status-acknowledged' },
      resolved: { label: 'Resolved', class: 'status-resolved' },
      dismissed: { label: 'Dismissed', class: 'status-dismissed' }
    };
    
    const badge = badges[status] || badges.active;
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };
  
  const handlePatientClick = (patientId, e) => {
    e.stopPropagation();
    navigate(`/patients/${patientId}`);
  };
  
  const handleAlertClick = (alertId) => {
    navigate(`/alerts/${alertId}`);
  };
  
  return (
    <div className="appointment-alert-list">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`alert-list-item ${getSeverityClass(alert.severity)}`}
          onClick={() => handleAlertClick(alert.id)}
        >
          <div className="alert-item-icon">{getAlertIcon(alert.alert_type)}</div>
          
          <div className="alert-item-content">
            <div className="alert-item-header">
              <h4 className="alert-item-title">{alert.title}</h4>
              {getStatusBadge(alert.status)}
            </div>
            
            <div className="alert-item-patient">
              <button
                className="patient-link"
                onClick={(e) => handlePatientClick(alert.patient, e)}
              >
                {alert.patient_name} <span className="patient-id">({alert.patient_id_display})</span>
              </button>
            </div>
            
            <div className="alert-item-time">
              {alert.time_since_trigger}
            </div>
          </div>
          
          {alert.status === 'active' && onAcknowledge && (
            <div className="alert-item-actions">
              <button
                className="alert-action-btn acknowledge-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(alert.id);
                }}
                title="Acknowledge"
              >
                ✓
              </button>
              <button
                className="alert-action-btn resolve-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(alert.id);
                }}
                title="Resolve"
              >
                ✓✓
              </button>
              <button
                className="alert-action-btn dismiss-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(alert.id);
                }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AppointmentAlertList;
