import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ReferralsPage.css';

const ReferralsPage = () => {
  const navigate = useNavigate();
  
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('outgoing'); // outgoing, incoming, all
  const [statistics, setStatistics] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
    fetchReferrals();
    fetchStatistics();
  }, [activeTab, statusFilter, urgencyFilter, showOverdueOnly]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      
      // Direction filter based on active tab
      if (activeTab !== 'all') {
        params.direction = activeTab;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Urgency filter
      if (urgencyFilter !== 'all') {
        params.urgency = urgencyFilter;
      }
      
      // Overdue filter
      if (showOverdueOnly) {
        params.overdue = 'true';
      }
      
      // Search
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('referrals', { params });
      const data = response.data.results || response.data;
      setReferrals(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load referrals');
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('referrals/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReferrals();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredReferrals = () => {
    let filtered = referrals;
    
    // Client-side search filter (additional to backend search)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.referral_number?.toLowerCase().includes(search) ||
        r.patient_details?.first_name?.toLowerCase().includes(search) ||
        r.patient_details?.last_name?.toLowerCase().includes(search) ||
        r.referral_source_details?.name?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  const ReferralCard = ({ referral }) => (
    <div className={`referral-card ${referral.is_overdue ? 'overdue' : ''}`}>
      <div className="referral-card-header">
        <div className="referral-number-section">
          <h3>{referral.referral_number}</h3>
          {referral.is_overdue && (
            <span className="overdue-badge">⚠️ Overdue</span>
          )}
        </div>
        <div className="referral-badges">
          <span className={`urgency-badge ${getUrgencyBadgeClass(referral.urgency)}`}>
            {referral.urgency?.toUpperCase()}
          </span>
          <span className={`status-badge ${getStatusBadgeClass(referral.current_status)}`}>
            {referral.current_status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="referral-card-body">
        <div className="referral-info-row">
          <div className="info-item">
            <span className="label">Patient:</span>
            <Link 
              to={`/patients/${referral.patient_details?.id}`}
              className="value link"
            >
              {referral.patient_details?.first_name} {referral.patient_details?.last_name}
            </Link>
          </div>
          <div className="info-item">
            <span className="label">Patient ID:</span>
            <span className="value">{referral.patient_details?.patient_id || 'N/A'}</span>
          </div>
        </div>
        
        <div className="referral-info-row">
          <div className="info-item">
            <span className="label">Source:</span>
            <span className="value">{referral.referral_source_details?.name || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Type:</span>
            <span className="value">{referral.referral_source_details?.source_type || 'N/A'}</span>
          </div>
        </div>
        
        <div className="referral-info-row">
          <div className="info-item">
            <span className="label">Reason:</span>
            <span className="value">{referral.reason?.replace('_', ' ') || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Referred By:</span>
            <span className="value">
              Dr. {referral.referred_by_details?.first_name} {referral.referred_by_details?.last_name}
            </span>
          </div>
        </div>
        
        <div className="referral-info-row">
          <div className="info-item">
            <span className="label">Referral Date:</span>
            <span className="value">{formatDate(referral.referral_date)}</span>
          </div>
          <div className="info-item">
            <span className="label">Days Since:</span>
            <span className="value">{referral.days_since_referral || 0} days</span>
          </div>
        </div>
        
        {referral.appointment_date && (
          <div className="referral-info-row">
            <div className="info-item">
              <span className="label">Appointment:</span>
              <span className="value appointment-date">
                📅 {formatDate(referral.appointment_date)}
              </span>
            </div>
          </div>
        )}
        
        <div className="referral-summary">
          <span className="label">Summary:</span>
          <p className="summary-text">
            {referral.clinical_summary?.substring(0, 120)}
            {referral.clinical_summary?.length > 120 && '...'}
          </p>
        </div>
        
        <div className="referral-meta">
          <span className="meta-item">📄 {referral.documents_count || 0} documents</span>
          <span className="meta-item">💬 {referral.responses_count || 0} responses</span>
        </div>
      </div>
      
      <div className="referral-card-footer">
        <button 
          className="btn btn-primary"
          onClick={() => navigate(`/referrals/${referral.id}`)}
        >
          View Details
        </button>
        {referral.current_status === 'draft' && (
          <button 
            className="btn btn-success"
            onClick={() => handleSendReferral(referral.id)}
          >
            Send Referral
          </button>
        )}
        {['pending', 'sent', 'acknowledged'].includes(referral.current_status) && (
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/referrals/${referral.id}/response`)}
          >
            Add Response
          </button>
        )}
      </div>
    </div>
  );

  const handleSendReferral = async (referralId) => {
    if (!window.confirm('Are you sure you want to send this referral?')) {
      return;
    }
    
    try {
      await api.post(`/api/referrals/${referralId}/send/`);
      alert('Referral sent successfully!');
      fetchReferrals();
      fetchStatistics();
    } catch (err) {
      console.error('Error sending referral:', err);
      alert('Failed to send referral: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading && !referrals.length) {
    return (
      <div className="referrals-page">
        <div className="loading">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="referrals-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Referral Management</h1>
          <button 
            className="btn btn-primary create-btn"
            onClick={() => navigate('/referrals/create')}
          >
            + Create New Referral
          </button>
        </div>
      </div>

      {statistics && (
        <div className="statistics-cards">
          <div className="stat-card">
            <div className="stat-value">{statistics.total_referrals || 0}</div>
            <div className="stat-label">Total Referrals</div>
          </div>
          <div className="stat-card outgoing">
            <div className="stat-value">{statistics.outgoing_referrals || 0}</div>
            <div className="stat-label">Outgoing</div>
          </div>
          <div className="stat-card incoming">
            <div className="stat-value">{statistics.incoming_referrals || 0}</div>
            <div className="stat-label">Incoming</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{statistics.pending_referrals || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-value">{statistics.overdue_referrals || 0}</div>
            <div className="stat-label">⚠️ Overdue</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-value">{statistics.completed_referrals || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      )}

      <div className="referrals-tabs">
        <button 
          className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing Referrals
        </button>
        <button 
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Referrals
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Referrals
        </button>
      </div>

      <div className="filters-section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by referral number, patient name, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Urgency:</label>
            <select 
              value={urgencyFilter} 
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Urgency</option>
              <option value="routine">Routine</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
              />
              Show Overdue Only
            </label>
          </div>
        </div>
        
        <div className="quick-links">
          <Link to="/referral-sources" className="quick-link">
            📋 Manage Sources
          </Link>
          <Link to="/referrals/overdue" className="quick-link overdue-link">
            ⚠️ View Overdue ({statistics?.overdue_referrals || 0})
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="referrals-grid">
        {filteredReferrals().length === 0 ? (
          <div className="no-data">
            <p>No referrals found</p>
            {activeTab !== 'all' && (
              <p className="hint">Try changing filters or switching tabs</p>
            )}
          </div>
        ) : (
          filteredReferrals().map(referral => (
            <ReferralCard key={referral.id} referral={referral} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;
