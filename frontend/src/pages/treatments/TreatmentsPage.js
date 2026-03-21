import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TreatmentsPage.css';

const TreatmentsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch patient if patientId is provided
      if (patientId) {
        const patientRes = await api.getPatient(patientId);
        setPatient(patientRes.data);
      }
      
      // Fetch treatments
      const treatmentsRes = await api.getTreatments();
      let allTreatments = treatmentsRes.data.results || treatmentsRes.data;
      
      // Filter by patient if viewing patient-specific treatments
      if (patientId) {
        allTreatments = allTreatments.filter(
          t => t.patient === patientId || t.patient_id === patientId
        );
      }
      
      setTreatments(allTreatments);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load treatments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedTreatments = () => {
    let filtered = [...treatments];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.treatment_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.indication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.actual_start_time || a.scheduled_date);
      const dateB = new Date(b.actual_start_time || b.scheduled_date);
      
      switch (sortBy) {
        case 'date-desc':
          return dateB - dateA;
        case 'date-asc':
          return dateA - dateB;
        case 'type':
          return (a.treatment_type_name || '').localeCompare(b.treatment_type_name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });
    
    return filtered;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTreatment = (treatmentId) => {
    navigate(`/treatments/${treatmentId}`);
  };

  const filteredTreatments = getFilteredAndSortedTreatments();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading treatments...</div>
      </div>
    );
  }

  return (
    <div className="page-container treatments-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Back
          </button>
          <div>
            <h1>Treatments</h1>
            {patient && (
              <p className="patient-info">
                {patient.first_name} {patient.last_name} (MRN: {patient.medical_record_number})
              </p>
            )}
          </div>
        </div>
        <div className="header-right">
          {patientId && (
            <>
              <button 
                onClick={() => navigate(`/patient/${patientId}/treatments/history`)}
                className="btn btn-secondary"
              >
                📜 View History Timeline
              </button>
              <button 
                onClick={() => navigate(`/patients/${patientId}/add-treatment`)}
                className="btn btn-primary"
              >
                + Add Treatment
              </button>
            </>
          )}
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
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="type">By Type</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{treatments.length}</div>
          <div className="stat-label">Total Treatments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {treatments.filter(t => t.status === 'completed').length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {treatments.filter(t => t.status === 'scheduled').length}
          </div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {treatments.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Treatments Table */}
      <div className="table-container">
        <table className="treatments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Treatment Type</th>
              {!patientId && <th>Patient</th>}
              <th>Indication</th>
              <th>Surgeon</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTreatments.length === 0 ? (
              <tr>
                <td colSpan={patientId ? "7" : "8"} className="no-data">
                  {treatments.length === 0 
                    ? 'No treatments found'
                    : 'No treatments match your filters'
                  }
                </td>
              </tr>
            ) : (
              filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="treatment-row">
                  <td className="date-cell">
                    {formatDate(treatment.actual_start_time || treatment.scheduled_date)}
                  </td>
                  <td className="type-cell">
                    <strong>{treatment.treatment_type_name || treatment.treatment_type}</strong>
                  </td>
                  {!patientId && (
                    <td className="patient-cell">
                      {treatment.patient_name || 'Unknown'}
                    </td>
                  )}
                  <td className="indication-cell">
                    {treatment.indication || '-'}
                  </td>
                  <td className="surgeon-cell">
                    {treatment.surgeon_name || '-'}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(treatment.status)}
                  </td>
                  <td className="duration-cell">
                    {treatment.duration_minutes ? `${treatment.duration_minutes} min` : '-'}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewTreatment(treatment.id)}
                      className="btn-icon"
                      title="View details"
                    >
                      👁️
                    </button>
                    {treatment.consultation && (
                      <button
                        onClick={() => navigate(`/consultations/${treatment.consultation}`)}
                        className="btn-icon"
                        title="View consultation"
                      >
                        📋
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Empty State for New Patients */}
      {treatments.length === 0 && patientId && (
        <div className="empty-state-card">
          <div className="empty-icon">💉</div>
          <h3>No Treatments Yet</h3>
          <p>This patient hasn't received any treatments yet.</p>
          <button 
            onClick={() => navigate(`/patients/${patientId}/add-treatment`)}
            className="btn btn-primary"
          >
            + Add First Treatment
          </button>
        </div>
      )}

      {/* Results Summary */}
      {filteredTreatments.length > 0 && (
        <div className="results-summary">
          Showing {filteredTreatments.length} of {treatments.length} treatments
        </div>
      )}
    </div>
  );
};

export default TreatmentsPage;
