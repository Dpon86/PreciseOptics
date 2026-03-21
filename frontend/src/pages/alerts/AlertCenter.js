import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentAlertList from '../../components/AppointmentAlertList';
import './AlertCenter.css';

const AlertCenter = () => {
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('unresolved'); // unresolved, active, acknowledged, resolved, dismissed
  const [alertTypeFilter, setAlertTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, [statusFilter, alertTypeFilter, severityFilter]);
  
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (alertTypeFilter !== 'all') params.alert_type = alertTypeFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      
      const response = await api.getAlerts(params);
      setAlerts(response.data.results || response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
      setLoading(false);
    }
  };
  
  const fetchStatistics = async () => {
    try {
      const response = await api.getAlertStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };
  
  const handleAcknowledge = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId);
      alert('Alert acknowledged successfully!');
      fetchAlerts();
      fetchStatistics();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      alert('Failed to acknowledge alert');
    }
  };
  
  const handleResolve = async (alertId) => {
    const actionTaken = prompt('Enter action taken (optional):');
    
    try {
      await api.resolveAlert(alertId, { 
        action_taken: actionTaken || 'Resolved manually',
        notes: ''
      });
      alert('Alert resolved successfully!');
      fetchAlerts();
      fetchStatistics();
    } catch (err) {
      console.error('Error resolving alert:', err);
      alert('Failed to resolve alert');
    }
  };
  
  const handleDismiss = async (alertId) => {
    const reason = prompt('Enter reason for dismissal (optional):');
    
    try {
      await api.dismissAlert(alertId, { reason: reason || 'Dismissed' });
      alert('Alert dismissed successfully!');
      fetchAlerts();
      fetchStatistics();
    } catch (err) {
      console.error('Error dismissing alert:', err);
      alert('Failed to dismiss alert');
    }
  };
  
  const handleScanAppointments = async () => {
    if (!window.confirm('Scan all scheduled appointments for late/missed alerts?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.scanAppointments();
      alert(`Scan complete: ${response.data.stats.late} late, ${response.data.stats.missed} missed alerts generated`);
      fetchAlerts();
      fetchStatistics();
    } catch (err) {
      console.error('Error scanning appointments:', err);
      alert('Failed to scan appointments');
      setLoading(false);
    }
  };
  
  return (
    <div className="alert-center-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <h1>Alert Center</h1>
            <p className="page-subtitle">Manage appointment alerts and notifications</p>
          </div>
        </div>
        <button 
          className="scan-button"
          onClick={handleScanAppointments}
          disabled={loading}
        >
          🔍 Scan Appointments
        </button>
      </div>
      
      {/* Statistics Dashboard */}
      {statistics && (
        <div className="alert-statistics">
          <div className="stat-card stat-critical">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.critical_active || 0}</div>
              <div className="stat-label">Critical</div>
            </div>
          </div>
          
          <div className="stat-card stat-high">
            <div className="stat-icon">🟠</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.high_active || 0}</div>
              <div className="stat-label">High</div>
            </div>
          </div>
          
          <div className="stat-card stat-medium">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.medium_active || 0}</div>
              <div className="stat-label">Medium</div>
            </div>
          </div>
          
          <div className="stat-card stat-low">
            <div className="stat-icon">🔵</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.low_active || 0}</div>
              <div className="stat-label">Low</div>
            </div>
          </div>
          
          <div className="stat-card stat-total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total_active || 0}</div>
              <div className="stat-label">Active Alerts</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="alert-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="unresolved">Unresolved (Active + Acknowledged)</option>
            <option value="active">Active Only</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Alert Type:</label>
          <select 
            value={alertTypeFilter} 
            onChange={(e) => setAlertTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="missed">Missed Appointments</option>
            <option value="late">Late Arrivals</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue_followup">Overdue Follow-ups</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Severity:</label>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      {/* Alerts List */}
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading alerts...</p>
        </div>
      ) : (
        <div className="alerts-container">
          <div className="alerts-header">
            <h2>
              {statusFilter === 'unresolved' ? 'Unresolved Alerts' : 
               statusFilter === 'all' ? 'All Alerts' : 
               `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Alerts`}
            </h2>
            <span className="alerts-count">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
          </div>
          
          <AppointmentAlertList
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
