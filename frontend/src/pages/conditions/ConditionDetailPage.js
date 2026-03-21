import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ConditionDetailPage.css';

const ConditionDetailPage = () => {
  const { id } = useParams(); // patientCondition id
  const navigate = useNavigate();
  
  const [condition, setCondition] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchConditionDetails();
    fetchProgressHistory();
    fetchDocuments();
  }, [id]);

  const fetchConditionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/conditions/patient-conditions/${id}/`);
      setCondition(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching condition details:', err);
      setError('Failed to load condition details');
      setLoading(false);
    }
  };

  const fetchProgressHistory = async () => {
    try {
      const response = await api.get(`/api/conditions/patient-conditions/${id}/progress/`);
      const data = response.data.results || response.data;
      setProgressHistory(data);
    } catch (err) {
      console.error('Error fetching progress history:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/api/conditions/patient-conditions/${id}/documents/`);
      const data = response.data.results || response.data;
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this condition as resolved? This action can be reversed later.')) {
      return;
    }

    try {
      const resolutionNotes = prompt('Enter resolution notes:');
      if (resolutionNotes === null) return; // User cancelled

      await api.post(`/api/conditions/patient-conditions/${id}/resolve/`, {
        resolution_notes: resolutionNotes
      });

      alert('Condition marked as resolved successfully');
      fetchConditionDetails();
    } catch (err) {
      console.error('Error resolving condition:', err);
      alert('Failed to resolve condition');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="condition-detail-page">
        <div className="loading-spinner">Loading condition details...</div>
      </div>
    );
  }

  if (error || !condition) {
    return (
      <div className="condition-detail-page">
        <div className="error-message">{error || 'Condition not found'}</div>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="condition-detail-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <div className="header-content">
          <h1>{condition.condition_name}</h1>
          <div className="subtitle">
            <Link to={`/patients/${condition.patient}`} className="patient-link">
              {condition.patient_name}
            </Link>
            <span className="separator">•</span>
            <span className="condition-code">{condition.condition_code}</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate(`/patient-conditions/${id}/progress/add`)}
            className="btn-primary"
          >
            + Record Progress
          </button>
          {condition.current_status !== 'resolved' && (
            <button onClick={handleResolve} className="btn-resolve">
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-label">Status</div>
          <span
            className="info-badge"
            style={{ backgroundColor: getStatusColor(condition.current_status) }}
          >
            {condition.current_status.replace('_', ' ')}
          </span>
        </div>
        <div className="info-card">
          <div className="info-label">Severity</div>
          <span
            className="info-badge"
            style={{ backgroundColor: getSeverityColor(condition.severity) }}
          >
            {condition.severity.replace('_', ' ')}
          </span>
        </div>
        <div className="info-card">
          <div className="info-label">Eye Affected</div>
          <span className="info-value">
            {condition.eye_affected === 'both' && '👁️👁️ Both Eyes'}
            {condition.eye_affected === 'left' && '👁️ Left Eye'}
            {condition.eye_affected === 'right' && '👁️ Right Eye'}
          </span>
        </div>
        <div className="info-card">
          <div className="info-label">Diagnosed</div>
          <span className="info-value">{formatDate(condition.diagnosis_date)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'progress' ? 'active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          Progress History ({progressHistory.length})
        </button>
        <button
          className={activeTab === 'documents' ? 'active' : ''}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({documents.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="section">
              <h3>Diagnosis Information</h3>
              <div className="info-grid">
                <div className="info-row">
                  <strong>Diagnosed By:</strong>
                  <span>{condition.diagnosed_by_name}</span>
                </div>
                <div className="info-row">
                  <strong>Diagnosis Date:</strong>
                  <span>{formatDate(condition.diagnosis_date)}</span>
                </div>
                <div className="info-row">
                  <strong>Last Assessment:</strong>
                  <span>{formatDate(condition.last_assessment_date)}</span>
                </div>
                <div className="info-row">
                  <strong>Next Assessment:</strong>
                  <span>{formatDate(condition.next_assessment_date)}</span>
                </div>
              </div>
              {condition.diagnosis_notes && (
                <div className="notes-box">
                  <strong>Diagnosis Notes:</strong>
                  <p>{condition.diagnosis_notes}</p>
                </div>
              )}
            </div>

            {condition.treatment_plan && (
              <div className="section">
                <h3>Treatment Plan</h3>
                <div className="content-box">
                  <p>{condition.treatment_plan}</p>
                </div>
              </div>
            )}

            {condition.medications_prescribed && (
              <div className="section">
                <h3>Medications Prescribed</h3>
                <div className="content-box">
                  <p>{condition.medications_prescribed}</p>
                </div>
              </div>
            )}

            {condition.initial_measurements && Object.keys(condition.initial_measurements).length > 0 && (
              <div className="section">
                <h3>Initial Measurements</h3>
                <div className="measurements-grid">
                  {Object.entries(condition.initial_measurements).map(([key, value]) => (
                    <div key={key} className="measurement-item">
                      <strong>{key.replace(/_/g, ' ')}:</strong>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {condition.patient_notes && (
              <div className="section">
                <h3>Patient Notes</h3>
                <div className="content-box">
                  <p>{condition.patient_notes}</p>
                </div>
              </div>
            )}

            {condition.current_status === 'resolved' && condition.resolved_date && (
              <div className="section resolved-section">
                <h3>Resolution Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <strong>Resolved Date:</strong>
                    <span>{formatDate(condition.resolved_date)}</span>
                  </div>
                </div>
                {condition.resolution_notes && (
                  <div className="notes-box">
                    <strong>Resolution Notes:</strong>
                    <p>{condition.resolution_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-tab">
            {progressHistory.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📊</div>
                <h3>No Progress Records</h3>
                <p>No progress assessments have been recorded for this condition yet.</p>
                <button
                  onClick={() => navigate(`/patient-conditions/${id}/progress/add`)}
                  className="btn-primary"
                >
                  Record First Assessment
                </button>
              </div>
            ) : (
              <div className="progress-timeline">
                {progressHistory.map((progress, index) => (
                  <div key={progress.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{formatDateTime(progress.assessment_date)}</h4>
                        <span className="assessed-by">by {progress.assessed_by_name}</span>
                      </div>

                      {progress.visual_acuity && (
                        <div className="progress-detail">
                          <strong>Visual Acuity:</strong> {progress.visual_acuity}
                        </div>
                      )}

                      {progress.intraocular_pressure && (
                        <div className="progress-detail">
                          <strong>Intraocular Pressure:</strong> {progress.intraocular_pressure}
                        </div>
                      )}

                      {progress.severity_progression && (
                        <div className="progress-detail">
                          <strong>Severity:</strong>
                          <span
                            className="severity-badge-small"
                            style={{ backgroundColor: getSeverityColor(progress.severity_progression) }}
                          >
                            {progress.severity_progression.replace('_', ' ')}
                          </span>
                        </div>
                      )}

                      {progress.clinical_findings && (
                        <div className="progress-detail">
                          <strong>Clinical Findings:</strong>
                          <p>{progress.clinical_findings}</p>
                        </div>
                      )}

                      {progress.treatment_response && (
                        <div className="progress-detail">
                          <strong>Treatment Response:</strong>
                          <p>{progress.treatment_response}</p>
                        </div>
                      )}

                      {progress.recommended_actions && (
                        <div className="progress-detail">
                          <strong>Recommended Actions:</strong>
                          <p>{progress.recommended_actions}</p>
                        </div>
                      )}

                      {progress.measurements && Object.keys(progress.measurements).length > 0 && (
                        <div className="measurements-inline">
                          {Object.entries(progress.measurements).map(([key, value]) => (
                            <span key={key} className="measurement-chip">
                              {key.replace(/_/g, ' ')}: {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            {documents.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📁</div>
                <h3>No Documents</h3>
                <p>No documents have been uploaded for this condition yet.</p>
              </div>
            ) : (
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <h4>{doc.document_type.replace('_', ' ')}</h4>
                      <p className="document-title">{doc.title}</p>
                      {doc.description && (
                        <p className="document-description">{doc.description}</p>
                      )}
                      <div className="document-meta">
                        <span>Uploaded by {doc.uploaded_by_name}</span>
                        <span>{formatDate(doc.uploaded_at)}</span>
                      </div>
                    </div>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionDetailPage;
