import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ConditionsPage.css';

const ConditionsPage = () => {
  const navigate = useNavigate();
  
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchConditions();
    fetchStatistics();
  }, []);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('conditions');
      const data = response.data.results || response.data;
      setConditions(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conditions:', err);
      setError('Failed to load conditions');
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('conditions/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'retinal': '👁️',
      'glaucoma': '🔵',
      'cataract': '☁️',
      'corneal': '⭕',
      'diabetic': '🩺',
      'vascular': '💉',
      'other': '📋'
    };
    return iconMap[category] || '📋';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'retinal': '#e74c3c',
      'glaucoma': '#3498db',
      'cataract': '#95a5a6',
      'corneal': '#2ecc71',
      'diabetic': '#e67e22',
      'vascular': '#9b59b6',
      'other': '#34495e'
    };
    return colorMap[category] || '#34495e';
  };

  const filteredConditions = () => {
    let filtered = conditions;
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'retinal', label: 'Retinal Disorders' },
    { value: 'glaucoma', label: 'Glaucoma' },
    { value: 'cataract', label: 'Cataracts' },
    { value: 'corneal', label: 'Corneal Disorders' },
    { value: 'diabetic', label: 'Diabetic Eye Disease' },
    { value: 'vascular', label: 'Vascular Disorders' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="conditions-page">
        <div className="loading-spinner">Loading conditions...</div>
      </div>
    );
  }

  return (
    <div className="conditions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Medical Conditions</h1>
          <p>Manage eye conditions and track patient outcomes</p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total_conditions || 0}</div>
              <div className="stat-label">Total Conditions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total_patients || 0}</div>
              <div className="stat-label">Patients with Conditions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏥</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.active_cases || 0}</div>
              <div className="stat-label">Active Cases</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.overdue_assessments || 0}</div>
              <div className="stat-label">Overdue Assessments</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search conditions by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter ${categoryFilter === cat.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions Grid */}
      {filteredConditions().length === 0 ? (
        <div className="no-conditions">
          <div className="no-conditions-icon">🔍</div>
          <h3>No Conditions Found</h3>
          <p>
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No medical conditions in the system'}
          </p>
        </div>
      ) : (
        <div className="conditions-grid">
          {filteredConditions().map(condition => (
            <div
              key={condition.id}
              className="condition-card"
              style={{ borderLeftColor: getCategoryColor(condition.category) }}
              onClick={() => navigate(`/conditions/${condition.id}`)}
            >
              <div className="condition-header">
                <div className="condition-icon">
                  {getCategoryIcon(condition.category)}
                </div>
                <div className="condition-title">
                  <h3>{condition.name}</h3>
                  <span className="condition-code">{condition.code}</span>
                </div>
              </div>

              <div className="condition-category">
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(condition.category) }}
                >
                  {condition.category.replace('_', ' ')}
                </span>
                {condition.has_standard_protocol && (
                  <span className="protocol-badge">📋 Protocol Available</span>
                )}
              </div>

              <div className="condition-stats">
                <div className="stat">
                  <strong>{condition.patient_count || 0}</strong>
                  <span>Active Patients</span>
                </div>
              </div>

              <div className="condition-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/conditions/${condition.id}`);
                  }}
                  className="btn-view"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConditionsPage;
