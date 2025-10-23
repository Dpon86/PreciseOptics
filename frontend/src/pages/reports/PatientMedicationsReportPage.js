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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Patient Medications Report</h1>
        <p style={styles.subtitle}>Overview of all patient prescriptions and medication usage</p>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>Report Filters</h3>
          <div style={styles.actionButtons}>
            <button 
              onClick={generateReport} 
              style={{...styles.button, ...styles.primaryButton}} 
              disabled={loading}
            >
              📊 {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button 
              onClick={exportToCSV} 
              style={{...styles.button, ...styles.secondaryButton}}
            >
              📥 Export to CSV
            </button>
          </div>
        </div>
        
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label htmlFor="startDate" style={styles.label}>Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label htmlFor="endDate" style={styles.label}>End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label htmlFor="medicationName" style={styles.label}>Medication Name</label>
            <input
              type="text"
              id="medicationName"
              name="medicationName"
              value={filters.medicationName}
              onChange={handleFilterChange}
              placeholder="Enter medication name..."
              style={styles.input}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label htmlFor="patientId" style={styles.label}>Patient ID</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={filters.patientId}
              onChange={handleFilterChange}
              placeholder="Enter patient ID..."
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Report Results */}
      {error && (
        <div style={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={styles.loadingMessage}>
          <div style={styles.spinner}></div>
          <p>Generating report...</p>
        </div>
      )}

      {!loading && !error && (
        <div style={styles.resultsSection}>
          <div style={styles.summarySection}>
            <h3 style={styles.summaryTitle}>Report Summary</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{reportData.length}</div>
                <div style={styles.statLabel}>Total Records</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>Active Prescriptions</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>Unique Medications</div>
              </div>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient ID</th>
                  <th style={styles.th}>Patient Name</th>
                  <th style={styles.th}>Medication</th>
                  <th style={styles.th}>Dosage</th>
                  <th style={styles.th}>Frequency</th>
                  <th style={styles.th}>Prescribed Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.slice(0, 20).map((patient, index) => (
                    <tr key={patient.id || index} style={styles.tr}>
                      <td style={styles.td}>{patient.patient_id || 'N/A'}</td>
                      <td style={styles.td}>{`${patient.first_name || ''} ${patient.last_name || ''}`}</td>
                      <td style={styles.td}>Sample Medication</td>
                      <td style={styles.td}>10mg</td>
                      <td style={styles.td}>Twice daily</td>
                      <td style={styles.td}>2025-10-05</td>
                      <td style={styles.td}><span style={styles.statusActive}>Active</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                      No data available for the selected criteria
                    </td>
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

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '25px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: '600'
  },
  subtitle: {
    margin: '0',
    fontSize: '16px',
    opacity: '0.9'
  },
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  filtersTitle: {
    margin: '0',
    fontSize: '20px',
    color: '#1f2937',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: 'white'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
  },
  spinner: {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  },
  resultsSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  },
  summarySection: {
    marginBottom: '30px'
  },
  summaryTitle: {
    fontSize: '20px',
    color: '#1f2937',
    marginBottom: '15px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  statCard: {
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  tableContainer: {
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px 16px',
    color: '#374151'
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  }
};

export default PatientMedicationsReportPage;