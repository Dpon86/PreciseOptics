import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TreatmentHistoryPage.css';

const TreatmentHistoryPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  
  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatientAndTreatments();
  }, [patientId]);

  useEffect(() => {
    applyFilters();
  }, [treatments, filterType, filterStatus, filterDateFrom, filterDateTo, searchTerm]);

  const fetchPatientAndTreatments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch patient details
      const patientRes = await api.getPatient(patientId);
      setPatient(patientRes.data);
      
      // Fetch treatments for this patient
      const treatmentsRes = await api.getTreatments();
      const patientTreatments = (treatmentsRes.data.results || treatmentsRes.data)
        .filter(t => t.patient === patientId || t.patient_id === patientId);
      
      // Sort by date (most recent first)
      patientTreatments.sort((a, b) => {
        const dateA = new Date(a.actual_start_time || a.scheduled_date);
        const dateB = new Date(b.actual_start_time || b.scheduled_date);
        return dateB - dateA;
      });
      
      setTreatments(patientTreatments);
      setFilteredTreatments(patientTreatments);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load treatment history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...treatments];
    
    // Filter by type
    if (filterType) {
      filtered = filtered.filter(t => 
        t.treatment_type_name?.toLowerCase().includes(filterType.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter(t => {
        const treatmentDate = new Date(t.actual_start_time || t.scheduled_date);
        return treatmentDate >= new Date(filterDateFrom);
      });
    }
    
    if (filterDateTo) {
      filtered = filtered.filter(t => {
        const treatmentDate = new Date(t.actual_start_time || t.scheduled_date);
        return treatmentDate <= new Date(filterDateTo);
      });
    }
    
    // Search in indication or notes
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.indication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.outcome_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.treatment_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTreatments(filtered);
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace(' ', '-') || 'pending';
    return <span className={`status-badge status-${statusClass}`}>{status || 'Pending'}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading treatment history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container treatment-history-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Back
          </button>
          <div>
            <h1>Treatment History</h1>
            {patient && (
              <p className="patient-info">
                {patient.first_name} {patient.last_name} (MRN: {patient.medical_record_number})
              </p>
            )}
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => navigate(`/patient/${patientId}/add-treatment`)}
            className="btn btn-primary"
          >
            + Add Treatment
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search indication, notes, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>Treatment Type</label>
            <input
              type="text"
              placeholder="Filter by type..."
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Date From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          
          <div className="filter-item">
            <label>Date To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
          
          <div className="filter-item filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="filter-summary">
          Showing {filteredTreatments.length} of {treatments.length} treatments
        </div>
      </div>

      {/* Treatments List */}
      <div className="treatments-list">
        {filteredTreatments.length === 0 ? (
          <div className="empty-state">
            <h3>No treatments found</h3>
            <p>
              {treatments.length === 0 
                ? 'This patient has no treatment history yet.'
                : 'No treatments match your filter criteria.'}
            </p>
            {treatments.length === 0 && (
              <button 
                onClick={() => navigate(`/patient/${patientId}/add-treatment`)}
                className="btn btn-primary"
              >
                Add First Treatment
              </button>
            )}
          </div>
        ) : (
          <div className="timeline">
            {filteredTreatments.map((treatment, index) => (
              <div key={treatment.id} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  {index < filteredTreatments.length - 1 && <div className="timeline-line"></div>}
                </div>
                
                <div className="timeline-content">
                  <div className="treatment-card">
                    <div className="treatment-header">
                      <div className="treatment-title">
                        <h3>{treatment.treatment_type_name || treatment.treatment_type}</h3>
                        {getStatusBadge(treatment.status)}
                      </div>
                      <div className="treatment-date">
                        <span className="date">
                          {formatDate(treatment.actual_start_time || treatment.scheduled_date)}
                        </span>
                        <span className="time">
                          {formatTime(treatment.actual_start_time || treatment.scheduled_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="treatment-body">
                      <div className="treatment-details">
                        {treatment.indication && (
                          <div className="detail-item">
                            <strong>Indication:</strong>
                            <span>{treatment.indication}</span>
                          </div>
                        )}
                        
                        {treatment.surgeon_name && (
                          <div className="detail-item">
                            <strong>Surgeon:</strong>
                            <span>{treatment.surgeon_name}</span>
                          </div>
                        )}
                        
                        {treatment.location && (
                          <div className="detail-item">
                            <strong>Location:</strong>
                            <span>{treatment.location}</span>
                          </div>
                        )}
                        
                        {treatment.duration_minutes && (
                          <div className="detail-item">
                            <strong>Duration:</strong>
                            <span>{treatment.duration_minutes} minutes</span>
                          </div>
                        )}
                        
                        {treatment.anesthesia_type && (
                          <div className="detail-item">
                            <strong>Anesthesia:</strong>
                            <span>{treatment.anesthesia_type}</span>
                          </div>
                        )}
                        
                        {treatment.outcome_notes && (
                          <div className="detail-item full-width">
                            <strong>Outcome Notes:</strong>
                            <p>{treatment.outcome_notes}</p>
                          </div>
                        )}
                        
                        {treatment.complications && (
                          <div className="detail-item full-width complications">
                            <strong>⚠️ Complications:</strong>
                            <p>{treatment.complications}</p>
                          </div>
                        )}
                        
                        {treatment.follow_up_instructions && (
                          <div className="detail-item full-width">
                            <strong>Follow-up Instructions:</strong>
                            <p>{treatment.follow_up_instructions}</p>
                          </div>
                        )}
                      </div>
                      
                      {treatment.consultation && (
                        <div className="treatment-links">
                          <button
                            onClick={() => navigate(`/consultations/${treatment.consultation}`)}
                            className="link-btn"
                          >
                            📋 View Consultation
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="treatment-footer">
                      <small className="created-info">
                        Created: {formatDate(treatment.created_at)} by {treatment.created_by_name || 'System'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentHistoryPage;
