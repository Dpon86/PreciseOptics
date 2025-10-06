import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PatientMedicationsReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    medicationName: '',
    patientId: ''
  });

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      // This would be a custom API endpoint for reports
      const response = await api.getPatients(); // Placeholder - would be actual report endpoint
      setReportData(response.data?.results || response.data || []);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
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
    // CSV export functionality
    alert('CSV export functionality would be implemented here');
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Patient Medications Report</h1>
        <p>Overview of all patient prescriptions and medication usage</p>
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
            <label htmlFor="medicationName" className="filter-label">Medication Name</label>
            <input
              type="text"
              id="medicationName"
              name="medicationName"
              value={filters.medicationName}
              onChange={handleFilterChange}
              placeholder="Enter medication name..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="patientId" className="filter-label">Patient ID</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={filters.patientId}
              onChange={handleFilterChange}
              placeholder="Enter patient ID..."
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

      {/* Report Results */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="report-results">
          <div className="report-summary">
            <h3>Report Summary</h3>
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-number">{reportData.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Active Prescriptions</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Unique Medications</div>
              </div>
            </div>
          </div>

          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Prescribed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.slice(0, 20).map((patient, index) => (
                    <tr key={patient.id || index}>
                      <td>{patient.patient_id || 'N/A'}</td>
                      <td>{`${patient.first_name || ''} ${patient.last_name || ''}`}</td>
                      <td>Sample Medication</td>
                      <td>10mg</td>
                      <td>Twice daily</td>
                      <td>2025-10-05</td>
                      <td><span className="status-active">Active</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">No data available for the selected criteria</td>
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

export default PatientMedicationsReportPage;