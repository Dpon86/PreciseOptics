import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ReferralDetailPage.css';

const ReferralDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('clinical'); // clinical, documents, timeline, outcome
  
  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/api/referrals/${id}/`);
      setReferral(response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referral:', err);
      setError('Failed to load referral details');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert('Please select a new status');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      
      await api.post(`/api/referrals/${id}/status/`, {
        status: newStatus,
        notes: statusNotes
      });
      
      alert('Status updated successfully!');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchReferral();
      
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReferral = async () => {
    if (!window.confirm('Are you sure you want to send this referral?')) {
      return;
    }
    
    try {
      await api.post(`/api/referrals/${id}/send/`);
      alert('Referral sent successfully!');
      fetchReferral();
    } catch (err) {
      console.error('Error sending referral:', err);
      alert('Failed to send referral: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelReferral = async () => {
    const reason = prompt('Please enter a reason for cancellation:');
    if (!reason) return;
    
    try {
      await api.post(`/api/referrals/${id}/cancel/`, { reason });
      alert('Referral cancelled successfully!');
      fetchReferral();
    } catch (err) {
      console.error('Error cancelling referral:', err);
      alert('Failed to cancel referral: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getUrgencyBadgeClass = (urgency) => {
    const classMap = {
      'emergency': 'urgency-emergency',
      'urgent': 'urgency-urgent',
      'soon': 'urgency-soon',
      'routine': 'urgency-routine'
    };
    return classMap[urgency] || 'urgency-routine';
  };

  const getStatusBadgeClass = (status) => {
    const classMap = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'sent': 'status-sent',
      'acknowledged': 'status-acknowledged',
      'scheduled': 'status-scheduled',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'rejected': 'status-rejected'
    };
    return classMap[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="referral-detail-page">
        <div className="loading">Loading referral details...</div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="referral-detail-page">
        <div className="error-message">{error || 'Referral not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/referrals')}>
          ← Back to Referrals
        </button>
      </div>
    );
  }

  return (
    <div className="referral-detail-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/referrals')}>
          ← Back to Referrals
        </button>
        <h1>{referral.referral_number}</h1>
        <div className="header-actions">
          {referral.current_status === 'draft' && (
            <button className="btn btn-success" onClick={handleSendReferral}>
              Send Referral
            </button>
          )}
          {!['completed', 'cancelled', 'rejected'].includes(referral.current_status) && (
            <>
              <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>
                Update Status
              </button>
              <button className="btn btn-danger" onClick={handleCancelReferral}>
                Cancel Referral
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div className="overview-card">
          <div className="overview-header">
            <h2>Referral Information</h2>
            <div className="badges">
              <span className={`urgency-badge ${getUrgencyBadgeClass(referral.urgency)}`}>
                {referral.urgency?.toUpperCase()}
              </span>
              <span className={`status-badge ${getStatusBadgeClass(referral.current_status)}`}>
                {referral.current_status?.replace('_', ' ').toUpperCase()}
              </span>
              {referral.is_overdue && (
                <span className="overdue-badge">⚠️ OVERDUE</span>
              )}
            </div>
          </div>
          
          <div className="overview-grid">
            <div className="overview-item">
              <span className="label">Patient:</span>
              <Link to={`/patients/${referral.patient_details?.id}`} className="value link">
                {referral.patient_details?.first_name} {referral.patient_details?.last_name}
              </Link>
            </div>
            
            <div className="overview-item">
              <span className="label">Direction:</span>
              <span className="value">{referral.direction?.toUpperCase()}</span>
            </div>
            
            <div className="overview-item">
              <span className="label">Source:</span>
              <span className="value">{referral.referral_source_details?.name}</span>
            </div>
            
            <div className="overview-item">
              <span className="label">Source Type:</span>
              <span className="value">{referral.referral_source_details?.source_type}</span>
            </div>
            
            <div className="overview-item">
              <span className="label">Reason:</span>
              <span className="value">{referral.reason?.replace('_', ' ')}</span>
            </div>
            
            <div className="overview-item">
              <span className="label">Referred By:</span>
              <span className="value">
                Dr. {referral.referred_by_details?.first_name} {referral.referred_by_details?.last_name}
              </span>
            </div>
            
            <div className="overview-item">
              <span className="label">Referral Date:</span>
              <span className="value">{formatDateOnly(referral.referral_date)}</span>
            </div>
            
            <div className="overview-item">
              <span className="label">Days Since Referral:</span>
              <span className="value">{referral.days_since_referral || 0} days</span>
            </div>
          </div>
        </div>

        {/* Timeline Dates */}
        <div className="timeline-dates">
          <div className="timeline-item">
            <div className="timeline-label">Created</div>
            <div className="timeline-value">{formatDate(referral.created_at)}</div>
          </div>
          
          {referral.sent_date && (
            <div className="timeline-item">
              <div className="timeline-label">Sent</div>
              <div className="timeline-value">{formatDate(referral.sent_date)}</div>
            </div>
          )}
          
          {referral.acknowledged_date && (
            <div className="timeline-item">
              <div className="timeline-label">Acknowledged</div>
              <div className="timeline-value">{formatDate(referral.acknowledged_date)}</div>
            </div>
          )}
          
          {referral.appointment_date && (
            <div className="timeline-item highlighted">
              <div className="timeline-label">Appointment</div>
              <div className="timeline-value">{formatDate(referral.appointment_date)}</div>
            </div>
          )}
          
          {referral.completion_date && (
            <div className="timeline-item">
              <div className="timeline-label">Completed</div>
              <div className="timeline-value">{formatDate(referral.completion_date)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'clinical' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinical')}
        >
          📋 Clinical Information
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents ({referral.documents?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          💬 Responses & Timeline ({referral.responses?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'outcome' ? 'active' : ''}`}
          onClick={() => setActiveTab('outcome')}
        >
          ✅ Outcome
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'clinical' && (
          <div className="clinical-tab">
            <div className="info-section">
              <h3>Clinical Summary</h3>
              <p>{referral.clinical_summary || 'No summary provided'}</p>
            </div>
            
            {referral.relevant_history && (
              <div className="info-section">
                <h3>Relevant Medical History</h3>
                <p>{referral.relevant_history}</p>
              </div>
            )}
            
            {referral.current_medications && (
              <div className="info-section">
                <h3>Current Medications</h3>
                <p>{referral.current_medications}</p>
              </div>
            )}
            
            {referral.allergies && (
              <div className="info-section">
                <h3>Allergies</h3>
                <p>{referral.allergies}</p>
              </div>
            )}
            
            {referral.specific_questions && (
              <div className="info-section">
                <h3>Specific Questions</h3>
                <p>{referral.specific_questions}</p>
              </div>
            )}
            
            {referral.requested_services && (
              <div className="info-section">
                <h3>Requested Services</h3>
                <p>{referral.requested_services}</p>
              </div>
            )}
            
            {referral.status_notes && (
              <div className="info-section">
                <h3>Status Notes</h3>
                <p>{referral.status_notes}</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="documents-header">
              <h3>Attached Documents</h3>
              <button className="btn btn-primary" onClick={() => alert('Document upload coming soon')}>
                + Upload Document
              </button>
            </div>
            
            {referral.documents && referral.documents.length > 0 ? (
              <div className="documents-list">
                {referral.documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <h4>{doc.title}</h4>
                      <p className="document-type">{doc.document_type?.replace('_', ' ')}</p>
                      {doc.description && <p className="document-desc">{doc.description}</p>}
                      <p className="document-meta">
                        Uploaded {formatDate(doc.uploaded_at)} by {doc.uploaded_by_details?.first_name} {doc.uploaded_by_details?.last_name}
                      </p>
                    </div>
                    <div className="document-actions">
                      <a href={doc.file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No documents attached</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="timeline-tab">
            <div className="timeline-header">
              <h3>Responses & Communications</h3>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/referrals/${id}/response`)}
              >
                + Add Response
              </button>
            </div>
            
            {referral.responses && referral.responses.length > 0 ? (
              <div className="responses-timeline">
                {referral.responses.map(response => (
                  <div key={response.id} className="timeline-event">
                    <div className="event-date">{formatDate(response.response_date)}</div>
                    <div className="event-content">
                      <div className="event-header">
                        <span className="event-type">{response.response_type?.replace('_', ' ')}</span>
                        <span className="event-author">
                          by {response.created_by_details?.first_name} {response.created_by_details?.last_name}
                        </span>
                      </div>
                      <p className="event-text">{response.response_content}</p>
                      
                      {response.appointment_date && (
                        <div className="event-appointment">
                          <strong>Appointment:</strong> {formatDate(response.appointment_date)}
                          {response.appointment_location && ` at ${response.appointment_location}`}
                        </div>
                      )}
                      
                      {response.additional_tests_required && (
                        <div className="event-tests">
                          <strong>Additional Tests:</strong> {response.additional_tests_required}
                        </div>
                      )}
                      
                      {response.recommendations && (
                        <div className="event-recommendations">
                          <strong>Recommendations:</strong> {response.recommendations}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No responses yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'outcome' && (
          <div className="outcome-tab">
            <div className="info-section">
              <h3>Outcome Summary</h3>
              <p>{referral.outcome_summary || 'No outcome summary available yet'}</p>
            </div>
            
            <div className="info-section">
              <h3>Follow-up Required</h3>
              <p>{referral.follow_up_required ? 'Yes' : 'No'}</p>
            </div>
            
            {referral.follow_up_notes && (
              <div className="info-section">
                <h3>Follow-up Notes</h3>
                <p>{referral.follow_up_notes}</p>
              </div>
            )}
            
            {referral.current_status === 'completed' && (
              <div className="completion-info">
                <p className="success-message">
                  ✅ Referral completed on {formatDateOnly(referral.completion_date)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Referral Status</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Current Status:</label>
                <p className="current-status">{referral.current_status?.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <div className="form-group">
                <label>New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">-- Select new status --</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows="4"
                  placeholder="Add any notes about this status change..."
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDetailPage;
