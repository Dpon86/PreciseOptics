import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ConsultationReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    consultationType: '',
    doctor: '',
    department: ''
  });

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      const consultationsResponse = await api.getConsultations();
      setReportData(consultationsResponse.data?.results || consultationsResponse.data || []);
    } catch (err) {
      console.error('Error generating consultation report:', err);
      setError('Failed to generate consultation report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Consultation Report</h1>
        <p>Overview of all patient consultations and appointments</p>
      </div>

      {/* Filters Section */}
      <div className="report-filters">
        <h3>Report Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="startDate" className="filter-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate" className="filter-label">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="consultationType" className="filter-label">Consultation Type</label>
            <select
              id="consultationType"
              name="consultationType"
              value={filters.consultationType}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Types</option>
              <option value="routine">Routine Check-up</option>
              <option value="emergency">Emergency</option>
              <option value="followup">Follow-up</option>
              <option value="surgical">Surgical Consultation</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="doctor" className="filter-label">Doctor</label>
            <input
              type="text"
              id="doctor"
              name="doctor"
              value={filters.doctor}
              onChange={handleFilterChange}
              placeholder="Enter doctor name..."
              className="filter-input"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={generateReport} className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <button onClick={exportToCSV} className="btn btn-secondary">
            Export to CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Generating consultation report...</p>
        </div>
      )}

      {/* Report Results */}
      {!loading && !error && (
        <div className="report-results">
          <div className="report-summary">
            <h3>Report Summary</h3>
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-number">{reportData.length}</div>
                <div className="stat-label">Total Consultations</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>

          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Consultation ID</th>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((consultation, index) => (
                    <tr key={consultation.id || index}>
                      <td>{consultation.consultation_id || consultation.id || 'N/A'}</td>
                      <td>{consultation.patient_name || 'N/A'}</td>
                      <td>{consultation.consultation_date ? new Date(consultation.consultation_date).toLocaleString() : 'N/A'}</td>
                      <td>{consultation.doctor || 'Dr. Smith'}</td>
                      <td>{consultation.consultation_type || 'Routine'}</td>
                      <td>
                        <span className={`status-${consultation.status || 'completed'}`}>
                          {consultation.status || 'Completed'}
                        </span>
                      </td>
                      <td>{consultation.notes || 'Regular eye examination'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">No consultations found for the selected criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationReportPage;