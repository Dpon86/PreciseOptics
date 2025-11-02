import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PatientProtocolsPage.css';

const PatientProtocolsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [patientId, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const patientResponse = await api.get(`/api/patients/${patientId}/`);
      setPatient(patientResponse.data);

      // Fetch patient protocols
      let url = `/api/protocols/patient-protocols/?patient=${patientId}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const protocolsResponse = await api.get(url);
      const protocolsData = protocolsResponse.data.results || protocolsResponse.data;
      
      // Fetch step completions for each protocol
      const protocolsWithSteps = await Promise.all(
        protocolsData.map(async (protocol) => {
          try {
            const stepsResponse = await api.get(
              `/api/protocols/patient-protocols/${protocol.id}/schedule/`
            );
            return {
              ...protocol,
              steps: stepsResponse.data.results || stepsResponse.data || []
            };
          } catch (err) {
            console.error('Error fetching steps:', err);
            return { ...protocol, steps: [] };
          }
        })
      );
      
      setProtocols(protocolsWithSteps);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load patient protocols');
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'badge-warning',
      'active': 'badge-success',
      'completed': 'badge-info',
      'discontinued': 'badge-danger',
      'on_hold': 'badge-secondary'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'active': 'Active',
      'completed': 'Completed',
      'discontinued': 'Discontinued',
      'on_hold': 'On Hold'
    };
    return statusMap[status] || status;
  };

  const calculateProgress = (steps) => {
    if (!steps || steps.length === 0) return 0;
    const completed = steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  const getUpcomingSteps = (steps) => {
    const today = new Date();
    return steps.filter(step => {
      const scheduledDate = new Date(step.scheduled_date);
      return step.status === 'scheduled' && scheduledDate >= today;
    }).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  };

  const getOverdueSteps = (steps) => {
    const today = new Date();
    return steps.filter(step => {
      const scheduledDate = new Date(step.scheduled_date);
      return step.status === 'scheduled' && scheduledDate < today;
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading patient protocols...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(`/patients/${patientId}`)} className="btn btn-primary">
          Back to Patient
        </button>
      </div>
    );
  }

  return (
    <div className="page-container patient-protocols-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Treatment Protocols</h1>
          {patient && (
            <p className="patient-name">
              {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
            </p>
          )}
        </div>
        <div className="header-actions">
          <Link 
            to={`/protocols/assign/${patientId}`} 
            className="btn btn-primary"
          >
            + Assign New Protocol
          </Link>
          <button 
            onClick={() => navigate(`/patients/${patientId}`)} 
            className="btn btn-secondary"
          >
            Back to Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
          >
            <option value="all">All Protocols</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="discontinued">Discontinued</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Protocols List */}
      {protocols.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Protocols Assigned</h3>
          <p>This patient doesn't have any treatment protocols assigned yet.</p>
          <Link 
            to={`/protocols/assign/${patientId}`} 
            className="btn btn-primary"
          >
            Assign First Protocol
          </Link>
        </div>
      ) : (
        <div className="protocols-grid">
          {protocols.map((protocol) => {
            const progress = calculateProgress(protocol.steps);
            const upcomingSteps = getUpcomingSteps(protocol.steps);
            const overdueSteps = getOverdueSteps(protocol.steps);
            
            return (
              <div key={protocol.id} className="protocol-card">
                {/* Protocol Header */}
                <div className="protocol-header">
                  <div className="protocol-title-section">
                    <h3>{protocol.protocol_name}</h3>
                    <span className={`badge ${getStatusBadgeClass(protocol.status)}`}>
                      {getStatusDisplay(protocol.status)}
                    </span>
                  </div>
                  {protocol.protocol_code && (
                    <p className="protocol-code">Code: {protocol.protocol_code}</p>
                  )}
                </div>

                {/* Protocol Info */}
                <div className="protocol-info">
                  <div className="info-row">
                    <span className="label">Start Date:</span>
                    <span className="value">
                      {new Date(protocol.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  {protocol.end_date && (
                    <div className="info-row">
                      <span className="label">End Date:</span>
                      <span className="value">
                        {new Date(protocol.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Assigned By:</span>
                    <span className="value">{protocol.assigned_by_name}</span>
                  </div>
                  {protocol.assignment_reason && (
                    <div className="info-row">
                      <span className="label">Reason:</span>
                      <span className="value">{protocol.assignment_reason}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {protocol.steps.length > 0 && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-percentage">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="progress-stats">
                      <span>
                        {protocol.steps.filter(s => s.status === 'completed').length} of {protocol.steps.length} steps completed
                      </span>
                    </div>
                  </div>
                )}

                {/* Adherence */}
                {protocol.adherence_percentage !== null && (
                  <div className="adherence-section">
                    <span className="label">Adherence:</span>
                    <span className={`adherence-value ${
                      protocol.adherence_percentage >= 80 ? 'high' : 
                      protocol.adherence_percentage >= 60 ? 'medium' : 'low'
                    }`}>
                      {protocol.adherence_percentage}%
                    </span>
                  </div>
                )}

                {/* Alerts */}
                {overdueSteps.length > 0 && (
                  <div className="alert alert-warning">
                    <strong>⚠️ {overdueSteps.length} overdue step{overdueSteps.length > 1 ? 's' : ''}</strong>
                  </div>
                )}

                {/* Upcoming Steps */}
                {upcomingSteps.length > 0 && protocol.status === 'active' && (
                  <div className="upcoming-steps">
                    <h4>Next Steps</h4>
                    <div className="steps-list">
                      {upcomingSteps.slice(0, 3).map((step) => (
                        <div key={step.id} className="step-item">
                          <div className="step-info">
                            <span className="step-title">{step.protocol_step_title}</span>
                            <span className="step-date">
                              {new Date(step.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {upcomingSteps.length > 3 && (
                        <p className="more-steps">
                          +{upcomingSteps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="protocol-actions">
                  <Link 
                    to={`/protocols/patient-protocols/${protocol.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    View Details
                  </Link>
                  {protocol.status === 'active' && (
                    <button className="btn btn-sm btn-secondary">
                      Manage Schedule
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientProtocolsPage;
