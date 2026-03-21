import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './PatientConditionsPage.css';

const PatientConditionsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchPatient();
    fetchPatientConditions();
  }, [patientId, statusFilter]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/api/patients/${patientId}/`);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to load patient details');
    }
  };

  const fetchPatientConditions = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/api/conditions/patient/${patientId}/conditions/`;
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await api.get(url);
      const data = response.data.results || response.data;
      setConditions(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient conditions:', err);
      setError('Failed to load patient conditions');
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      'mild': '#27ae60',
      'moderate': '#f39c12',
      'severe': '#e67e22',
      'very_severe': '#e74c3c'
    };
    return colorMap[severity] || '#95a5a6';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'newly_diagnosed': '#3498db',
      'active': '#e67e22',
      'stable': '#27ae60',
      'progressing': '#e74c3c',
      'improving': '#2ecc71',
      'resolved': '#95a5a6',
      'managed': '#16a085'
    };
    return colorMap[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (condition) => {
    if (!condition.next_assessment_date) return false;
    const nextDate = new Date(condition.next_assessment_date);
    const today = new Date();
    return nextDate < today && condition.is_active;
  };

  if (loading) {
    return (
      <div className="patient-conditions-page">
        <div className="loading-spinner">Loading patient conditions...</div>
      </div>
    );
  }

  return (
    <div className="patient-conditions-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <div className="header-content">
          <h1>Patient Conditions</h1>
          {patient && (
            <div className="patient-info">
              <Link to={`/patients/${patientId}`} className="patient-name">
                {patient.first_name} {patient.last_name}
              </Link>
              <span className="patient-id">ID: {patient.patient_id}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/patients/${patientId}/conditions/add`)}
          className="add-condition-btn"
        >
          + Add Condition
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Status Filters */}
      <div className="filters">
        <button
          className={statusFilter === 'active' ? 'active' : ''}
          onClick={() => setStatusFilter('active')}
        >
          Active ({conditions.filter(c => c.is_active).length})
        </button>
        <button
          className={statusFilter === 'stable' ? 'active' : ''}
          onClick={() => setStatusFilter('stable')}
        >
          Stable
        </button>
        <button
          className={statusFilter === 'progressing' ? 'active' : ''}
          onClick={() => setStatusFilter('progressing')}
        >
          Progressing
        </button>
        <button
          className={statusFilter === 'improving' ? 'active' : ''}
          onClick={() => setStatusFilter('improving')}
        >
          Improving
        </button>
        <button
          className={statusFilter === 'resolved' ? 'active' : ''}
          onClick={() => setStatusFilter('resolved')}
        >
          Resolved
        </button>
        <button
          className={statusFilter === 'all' ? 'active' : ''}
          onClick={() => setStatusFilter('all')}
        >
          All ({conditions.length})
        </button>
      </div>

      {/* Conditions List */}
      {conditions.length === 0 ? (
        <div className="no-conditions">
          <div className="no-conditions-icon">📋</div>
          <h3>No Conditions Found</h3>
          <p>
            {statusFilter !== 'all'
              ? 'This patient has no conditions matching the selected filter'
              : 'This patient has no diagnosed conditions on record'}
          </p>
          <button
            onClick={() => navigate(`/patients/${patientId}/conditions/add`)}
            className="add-first-btn"
          >
            Add First Condition
          </button>
        </div>
      ) : (
        <div className="conditions-list">
          {conditions.map(condition => (
            <div
              key={condition.id}
              className={`condition-item ${isOverdue(condition) ? 'overdue' : ''}`}
              onClick={() => navigate(`/patient-conditions/${condition.id}`)}
            >
              <div className="condition-main">
                <div className="condition-title-section">
                  <h3>{condition.condition_name}</h3>
                  <span className="condition-code">{condition.condition_code}</span>
                  {isOverdue(condition) && (
                    <span className="overdue-badge">⚠️ Overdue Assessment</span>
                  )}
                </div>

                <div className="condition-badges">
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(condition.severity) }}
                  >
                    {condition.severity.replace('_', ' ')}
                  </span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(condition.current_status) }}
                  >
                    {condition.current_status.replace('_', ' ')}
                  </span>
                  <span className="eye-badge">
                    {condition.eye_affected === 'both' && '👁️👁️ Both Eyes'}
                    {condition.eye_affected === 'left' && '👁️ Left Eye'}
                    {condition.eye_affected === 'right' && '👁️ Right Eye'}
                  </span>
                </div>
              </div>

              <div className="condition-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Diagnosed:</strong>
                    <span>{formatDate(condition.diagnosis_date)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Diagnosed By:</strong>
                    <span>{condition.diagnosed_by_name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Assessment:</strong>
                    <span>{formatDate(condition.last_assessment_date)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Next Assessment:</strong>
                    <span className={isOverdue(condition) ? 'overdue-text' : ''}>
                      {formatDate(condition.next_assessment_date)}
                    </span>
                  </div>
                </div>

                {condition.diagnosis_notes && (
                  <div className="notes-preview">
                    <strong>Notes:</strong> {condition.diagnosis_notes.substring(0, 100)}
                    {condition.diagnosis_notes.length > 100 && '...'}
                  </div>
                )}
              </div>

              <div className="condition-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient-conditions/${condition.id}`);
                  }}
                  className="btn-view"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient-conditions/${condition.id}/progress/add`);
                  }}
                  className="btn-progress"
                >
                  Record Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientConditionsPage;
