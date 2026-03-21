import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ProtocolSchedulePage.css';

const ProtocolSchedulePage = () => {
  const { patientProtocolId } = useParams();
  const navigate = useNavigate();
  
  const [patientProtocol, setPatientProtocol] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSchedule();
  }, [patientProtocolId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch patient protocol details
      const protocolResponse = await api.get(`/api/protocols/patient-protocols/${patientProtocolId}/`);
      setPatientProtocol(protocolResponse.data);

      // Fetch schedule
      const scheduleResponse = await api.get(`/api/protocols/patient-protocols/${patientProtocolId}/schedule/`);
      const stepsData = scheduleResponse.data.results || scheduleResponse.data;
      setSteps(stepsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load protocol schedule');
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'scheduled': 'status-scheduled',
      'completed': 'status-completed',
      'missed': 'status-missed',
      'rescheduled': 'status-rescheduled',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'scheduled': '📅',
      'completed': '✅',
      'missed': '⚠️',
      'rescheduled': '🔄',
      'cancelled': '❌'
    };
    return iconMap[status] || '⏺️';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not completed';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (step) => {
    if (step.status === 'completed' || step.status === 'cancelled') return false;
    if (!step.scheduled_date) return false;
    const scheduledDate = new Date(step.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduledDate < today;
  };

  const isUpcoming = (step) => {
    if (step.status !== 'scheduled') return false;
    const scheduledDate = new Date(step.scheduled_date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return scheduledDate >= today && scheduledDate <= weekFromNow;
  };

  const handleCompleteStep = (stepId) => {
    navigate(`/protocol-steps/${stepId}/complete`);
  };

  const handleRescheduleStep = async (stepId) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;

    try {
      await api.post(`/api/protocols/steps/${stepId}/reschedule/`, {
        new_scheduled_date: newDate
      });
      fetchSchedule();
    } catch (err) {
      console.error('Error rescheduling:', err);
      alert('Failed to reschedule step');
    }
  };

  const filteredSteps = () => {
    if (filterStatus === 'all') return steps;
    if (filterStatus === 'upcoming') {
      return steps.filter(step => step.status === 'scheduled' && new Date(step.scheduled_date) >= new Date());
    }
    if (filterStatus === 'overdue') {
      return steps.filter(step => isOverdue(step));
    }
    return steps.filter(step => step.status === filterStatus);
  };

  if (loading) {
    return (
      <div className="protocol-schedule-page">
        <div className="loading-spinner">Loading schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="protocol-schedule-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const overdueCount = steps.filter(s => isOverdue(s)).length;
  const upcomingCount = steps.filter(s => isUpcoming(s)).length;
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="protocol-schedule-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <div className="header-info">
            <h1>Protocol Schedule</h1>
            {patientProtocol && (
              <div className="protocol-info">
                <h2>{patientProtocol.protocol_name}</h2>
                <p>
                  Patient: <Link to={`/patients/${patientProtocol.patient}`}>
                    {patientProtocol.patient_name}
                  </Link>
                </p>
                <p>Start Date: {formatDate(patientProtocol.start_date)}</p>
                <p>Status: <span className={`status-badge ${getStatusBadgeClass(patientProtocol.status)}`}>
                  {patientProtocol.status}
                </span></p>
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'timeline' ? 'active' : ''}
              onClick={() => setViewMode('timeline')}
            >
              📊 Timeline
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}>
            {progressPercentage}%
          </div>
        </div>
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-value">{completedCount}/{totalCount}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat upcoming">
            <span className="stat-value">{upcomingCount}</span>
            <span className="stat-label">Upcoming (7 days)</span>
          </div>
          <div className="stat overdue">
            <span className="stat-value">{overdueCount}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All ({totalCount})
        </button>
        <button
          className={filterStatus === 'upcoming' ? 'active' : ''}
          onClick={() => setFilterStatus('upcoming')}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          className={filterStatus === 'overdue' ? 'active' : ''}
          onClick={() => setFilterStatus('overdue')}
        >
          Overdue ({overdueCount})
        </button>
        <button
          className={filterStatus === 'completed' ? 'active' : ''}
          onClick={() => setFilterStatus('completed')}
        >
          Completed ({completedCount})
        </button>
        <button
          className={filterStatus === 'scheduled' ? 'active' : ''}
          onClick={() => setFilterStatus('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={filterStatus === 'missed' ? 'active' : ''}
          onClick={() => setFilterStatus('missed')}
        >
          Missed
        </button>
      </div>

      {/* Timeline or List View */}
      {viewMode === 'timeline' ? (
        <div className="timeline-view">
          {filteredSteps().map((step, index) => (
            <div
              key={step.id}
              className={`timeline-item ${step.status} ${isOverdue(step) ? 'overdue' : ''} ${isUpcoming(step) ? 'upcoming' : ''}`}
            >
              <div className="timeline-marker">
                <div className="step-number">{step.step_number}</div>
                <div className="status-icon">{getStatusIcon(step.status)}</div>
              </div>
              <div className="timeline-content">
                <div className="step-header">
                  <h3>{step.step_title}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(step.status)}`}>
                    {step.status}
                  </span>
                </div>
                <p className="step-description">{step.step_description}</p>
                
                <div className="step-details">
                  <div className="detail">
                    <strong>Scheduled:</strong> {formatDate(step.scheduled_date)}
                    {isOverdue(step) && <span className="overdue-label">OVERDUE</span>}
                    {isUpcoming(step) && <span className="upcoming-label">UPCOMING</span>}
                  </div>
                  {step.completed_date && (
                    <div className="detail">
                      <strong>Completed:</strong> {formatDateTime(step.completed_date)}
                    </div>
                  )}
                  {step.completed_by_name && (
                    <div className="detail">
                      <strong>Completed By:</strong> {step.completed_by_name}
                    </div>
                  )}
                  {step.notes && (
                    <div className="detail">
                      <strong>Notes:</strong> {step.notes}
                    </div>
                  )}
                </div>

                <div className="step-actions">
                  {step.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleCompleteStep(step.id)}
                        className="btn-complete"
                      >
                        ✓ Complete Step
                      </button>
                      <button
                        onClick={() => handleRescheduleStep(step.id)}
                        className="btn-reschedule"
                      >
                        🔄 Reschedule
                      </button>
                    </>
                  )}
                  {(step.status === 'completed' || step.status === 'missed') && (
                    <button
                      onClick={() => navigate(`/protocol-steps/${step.id}/details`)}
                      className="btn-view"
                    >
                      👁️ View Details
                    </button>
                  )}
                </div>
              </div>
              {index < filteredSteps().length - 1 && <div className="timeline-connector"></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="list-view">
          <table className="steps-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Title</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSteps().map((step) => (
                <tr key={step.id} className={isOverdue(step) ? 'overdue-row' : ''}>
                  <td>{step.step_number}</td>
                  <td>
                    {step.step_title}
                    {isOverdue(step) && <span className="overdue-label">OVERDUE</span>}
                    {isUpcoming(step) && <span className="upcoming-label">UPCOMING</span>}
                  </td>
                  <td>{formatDate(step.scheduled_date)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(step.status)}`}>
                      {getStatusIcon(step.status)} {step.status}
                    </span>
                  </td>
                  <td>{step.completed_date ? formatDateTime(step.completed_date) : '-'}</td>
                  <td>
                    {step.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleCompleteStep(step.id)}
                          className="btn-small btn-complete"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleRescheduleStep(step.id)}
                          className="btn-small btn-reschedule"
                        >
                          Reschedule
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredSteps().length === 0 && (
        <div className="no-steps">
          <p>No steps match the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default ProtocolSchedulePage;
