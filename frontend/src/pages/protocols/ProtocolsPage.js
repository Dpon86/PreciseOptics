import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ProtocolsPage.css';

const ProtocolsPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [protocols, setProtocols] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://127.0.0.1:8000/api/protocols/protocols/');
      const data = await response.json();
      
      setProtocols(data.results || data || []);
    } catch (err) {
      console.error('Error fetching protocols:', err);
      setError('Failed to load protocols');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProtocols = () => {
    let filtered = [...protocols];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType) {
      filtered = filtered.filter(p => p.protocol_type === filterType);
    }
    
    // Active filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(p => 
        filterActive === 'active' ? p.is_active : !p.is_active
      );
    }
    
    return filtered;
  };

  const handleViewProtocol = (protocolId) => {
    navigate(`/protocols/${protocolId}`);
  };

  const handleEditProtocol = (protocolId) => {
    navigate(`/protocols/${protocolId}/edit`);
  };

  const filteredProtocols = getFilteredProtocols();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading protocols...</div>
      </div>
    );
  }

  return (
    <div className="page-container protocols-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Back
          </button>
          <h1>Treatment Protocols</h1>
        </div>
        <div className="header-right">
          <button 
            onClick={() => navigate('/protocols/builder')}
            className="btn btn-primary"
          >
            🏗️ Create Protocol
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search protocols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="loading_dose">Loading Dose</option>
            <option value="maintenance">Maintenance</option>
            <option value="fixed_interval">Fixed Interval</option>
            <option value="treat_extend">Treat and Extend</option>
            <option value="prn">PRN (As Needed)</option>
            <option value="post_op">Post-Operative</option>
            <option value="custom">Custom Protocol</option>
          </select>
          
          <select 
            value={filterActive} 
            onChange={(e) => setFilterActive(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Protocols</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{protocols.length}</div>
          <div className="stat-label">Total Protocols</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {protocols.filter(p => p.is_active).length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {protocols.filter(p => p.protocol_type === 'loading_dose').length}
          </div>
          <div className="stat-label">Loading Dose</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {protocols.filter(p => p.protocol_type === 'maintenance').length}
          </div>
          <div className="stat-label">Maintenance</div>
        </div>
      </div>

      {/* Protocols Grid */}
      <div className="protocols-grid">
        {filteredProtocols.length === 0 ? (
          <div className="empty-state">
            <h3>No protocols found</h3>
            <p>
              {protocols.length === 0 
                ? 'No protocols have been created yet.'
                : 'No protocols match your filters.'}
            </p>
            {protocols.length === 0 && (
              <button 
                onClick={() => navigate('/protocols/builder')}
                className="btn btn-primary"
              >
                🏗️ Create First Protocol
              </button>
            )}
          </div>
        ) : (
          filteredProtocols.map((protocol) => (
            <div key={protocol.id} className="protocol-card">
              <div className="protocol-card-header">
                <div className="protocol-title">
                  <h3>{protocol.name}</h3>
                  <span className="protocol-code">{protocol.code}</span>
                </div>
                <div className="protocol-status">
                  {protocol.is_active ? (
                    <span className="status-badge status-active">Active</span>
                  ) : (
                    <span className="status-badge status-inactive">Inactive</span>
                  )}
                </div>
              </div>
              
              <div className="protocol-card-body">
                <div className="protocol-type">
                  <strong>Type:</strong>
                  <span>{protocol.protocol_type_display || protocol.protocol_type}</span>
                </div>
                
                <div className="protocol-condition">
                  <strong>Condition:</strong>
                  <span>{protocol.condition_name || 'N/A'}</span>
                </div>
                
                {protocol.total_duration_weeks && (
                  <div className="protocol-duration">
                    <strong>Duration:</strong>
                    <span>{protocol.total_duration_weeks} weeks</span>
                  </div>
                )}
                
                <div className="protocol-description">
                  {protocol.description && protocol.description.length > 150
                    ? `${protocol.description.substring(0, 150)}...`
                    : protocol.description
                  }
                </div>
                
                {protocol.total_steps > 0 && (
                  <div className="protocol-steps-count">
                    📋 {protocol.total_steps} step{protocol.total_steps !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div className="protocol-card-footer">
                <button
                  onClick={() => handleViewProtocol(protocol.id)}
                  className="btn-secondary"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditProtocol(protocol.id)}
                  className="btn-primary"
                >
                  Edit Protocol
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredProtocols.length > 0 && (
        <div className="results-summary">
          Showing {filteredProtocols.length} of {protocols.length} protocols
        </div>
      )}
    </div>
  );
};

export default ProtocolsPage;
