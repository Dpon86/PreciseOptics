import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ReferralSourcesPage.css';

const ReferralSourcesPage = () => {
  const navigate = useNavigate();
  
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);

  useEffect(() => {
    fetchSources();
  }, [typeFilter, showActiveOnly, showPreferredOnly]);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      
      if (typeFilter !== 'all') {
        params.source_type = typeFilter;
      }
      
      if (showActiveOnly) {
        params.is_active = 'true';
      }
      
      if (showPreferredOnly) {
        params.is_preferred = 'true';
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('referrals/sources', { params });
      const data = response.data.results || response.data;
      setSources(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to load referral sources');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSources();
  };

  const handleDelete = async (sourceId, sourceName) => {
    if (!window.confirm(`Are you sure you want to deactivate "${sourceName}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/api/referrals/sources/${sourceId}/`);
      alert('Source deactivated successfully!');
      fetchSources();
    } catch (err) {
      console.error('Error deleting source:', err);
      alert('Failed to deactivate source: ' + (err.response?.data?.error || err.message));
    }
  };

  const getSourceTypeIcon = (type) => {
    const iconMap = {
      'ophthalmologist': '👁️',
      'optometrist': '👓',
      'hospital': '🏥',
      'clinic': '🏢',
      'gp': '👨‍⚕️',
      'specialist': '⚕️',
      'other': '📋'
    };
    return iconMap[type] || '📋';
  };

  const filteredSources = () => {
    let filtered = sources;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(search) ||
        s.contact_person?.toLowerCase().includes(search) ||
        s.specialties?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  const SourceCard = ({ source }) => (
    <div className="source-card">
      <div className="source-card-header">
        <div className="source-icon">{getSourceTypeIcon(source.source_type)}</div>
        <div className="source-title">
          <h3>
            {source.name}
            {source.is_preferred && <span className="preferred-star">⭐</span>}
          </h3>
          <span className="source-type">{source.source_type?.replace('_', ' ').toUpperCase()}</span>
        </div>
        {!source.is_active && (
          <span className="inactive-badge">INACTIVE</span>
        )}
      </div>
      
      <div className="source-card-body">
        {source.contact_person && (
          <div className="info-row">
            <span className="label">Contact:</span>
            <span className="value">{source.contact_person}</span>
          </div>
        )}
        
        <div className="info-row">
          <span className="label">Phone:</span>
          <span className="value">{source.phone || 'N/A'}</span>
        </div>
        
        <div className="info-row">
          <span className="label">Email:</span>
          <span className="value">{source.email || 'N/A'}</span>
        </div>
        
        {source.specialties && (
          <div className="info-row">
            <span className="label">Specialties:</span>
            <span className="value">{source.specialties}</span>
          </div>
        )}
        
        <div className="source-stats">
          <div className="stat-item">
            <span className="stat-value">{source.total_referrals_sent || 0}</span>
            <span className="stat-label">Sent</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{source.total_referrals_received || 0}</span>
            <span className="stat-label">Received</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{source.active_referrals_count || 0}</span>
            <span className="stat-label">Active</span>
          </div>
          {source.average_response_time_days && (
            <div className="stat-item">
              <span className="stat-value">{source.average_response_time_days.toFixed(1)}</span>
              <span className="stat-label">Avg Days</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="source-card-footer">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => navigate(`/referral-sources/${source.id}`)}
        >
          View Details
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => navigate(`/referral-sources/${source.id}/edit`)}
        >
          Edit
        </button>
        {source.is_active && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(source.id, source.name)}
          >
            Deactivate
          </button>
        )}
      </div>
    </div>
  );

  if (loading && !sources.length) {
    return (
      <div className="referral-sources-page">
        <div className="loading">Loading referral sources...</div>
      </div>
    );
  }

  return (
    <div className="referral-sources-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Referral Sources</h1>
          <button
            className="btn btn-primary create-btn"
            onClick={() => navigate('/referral-sources/add')}
          >
            + Add New Source
          </button>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-value">{sources.length}</div>
          <div className="stat-label">Total Sources</div>
        </div>
        <div className="stat-card preferred">
          <div className="stat-value">{sources.filter(s => s.is_preferred).length}</div>
          <div className="stat-label">⭐ Preferred</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{sources.filter(s => s.is_active).length}</div>
          <div className="stat-label">Active</div>
        </div>
      </div>

      <div className="filters-section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, contact, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        
        <div className="filters">
          <div className="filter-group">
            <label>Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="ophthalmologist">Ophthalmologist</option>
              <option value="optometrist">Optometrist</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="gp">GP</option>
              <option value="specialist">Specialist</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active Only
            </label>
          </div>
          
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showPreferredOnly}
                onChange={(e) => setShowPreferredOnly(e.target.checked)}
              />
              ⭐ Preferred Only
            </label>
          </div>
        </div>
        
        <div className="quick-actions">
          <Link to="/referrals" className="quick-link">
            ← Back to Referrals
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="sources-grid">
        {filteredSources().length === 0 ? (
          <div className="no-data">
            <p>No referral sources found</p>
            <p className="hint">Try adjusting your filters or add a new source</p>
          </div>
        ) : (
          filteredSources().map(source => (
            <SourceCard key={source.id} source={source} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReferralSourcesPage;
