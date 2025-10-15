import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import apiService from '../../services/api';
import './MedicationEffectivenessReportPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MedicationEffectivenessReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    visualAcuityData: {},
    refractionData: {},
    iopData: {},
    visualFieldData: {},
    medications: [],
    timeRange: []
  });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedMedications: [],
    selectedTestTypes: ['visual_acuity', 'refraction', 'tonometry', 'visual_field'],
    patientAgeRange: { min: 0, max: 120 },
    includeActiveOnly: true
  });
  const [selectedView, setSelectedView] = useState('overview'); // overview, tables, graphs
  const [chartType, setChartType] = useState('line'); // line, bar

  useEffect(() => {
    fetchMedicationEffectivenessData();
  }, [filters]);

  const fetchMedicationEffectivenessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch medication effectiveness data
      const response = await apiService.getMedicationEffectivenessReport({
        start_date: filters.startDate,
        end_date: filters.endDate,
        medications: filters.selectedMedications.join(','),
        test_types: filters.selectedTestTypes.join(','),
        age_min: filters.patientAgeRange.min,
        age_max: filters.patientAgeRange.max,
        active_only: filters.includeActiveOnly
      });

      // Extract the data from the API response structure
      const apiData = response.data;
      if (apiData.success && apiData.data) {
        setReportData(apiData.data);
      } else {
        throw new Error(apiData.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching medication effectiveness data:', err);
      setError('Failed to load medication effectiveness report. Please try again.');
      // Set empty state for graceful degradation
      setReportData({
        visualAcuityData: {},
        refractionData: {},
        iopData: {},
        visualFieldData: {},
        medications: [],
        timeRange: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getMedicationColors = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    if (!reportData.medications || !Array.isArray(reportData.medications)) {
      return {};
    }
    return reportData.medications.reduce((acc, med, index) => {
      acc[med.name] = colors[index % colors.length];
      return acc;
    }, {});
  };

  const createLineChartData = (testType) => {
    const colors = getMedicationColors();
    const testData = reportData[`${testType}Data`] || {};
    
    if (!reportData.medications || !Array.isArray(reportData.medications) || !reportData.timeRange || !Array.isArray(reportData.timeRange)) {
      return { labels: [], datasets: [] };
    }
    
    // Format time labels for display
    const timeLabels = reportData.timeRange.map(timePoint => {
      const date = new Date(timePoint);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });
    
    const datasets = reportData.medications.map(medication => {
      const medicationData = testData[medication.name] || {};
      const data = reportData.timeRange.map(timePoint => 
        medicationData[timePoint]?.averageImprovement || 0
      );

      return {
        label: medication.name,
        data: data,
        borderColor: colors[medication.name],
        backgroundColor: colors[medication.name] + '20',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    return {
      labels: timeLabels,
      datasets
    };
  };

  const createBarChartData = (testType) => {
    const colors = getMedicationColors();
    const testData = reportData[`${testType}Data`] || {};
    
    if (!reportData.medications || !Array.isArray(reportData.medications)) {
      return { labels: [], datasets: [] };
    }
    
    const labels = reportData.medications.map(med => med.name);
    const data = labels.map(medName => {
      const medicationData = testData[medName] || {};
      // Calculate overall average improvement across all time periods
      const improvements = Object.values(medicationData).map(period => period?.averageImprovement || 0);
      return improvements.length > 0 ? improvements.reduce((a, b) => a + b, 0) / improvements.length : 0;
    });

    return {
      labels,
      datasets: [{
        label: 'Overall Average Improvement (%)',
        data,
        backgroundColor: labels.map(label => colors[label] + '80'),
        borderColor: labels.map(label => colors[label]),
        borderWidth: 2
      }]
    };
  };

  const renderDataTable = (testType) => {
    const testData = reportData[`${testType}Data`] || {};
    
    if (Object.keys(testData).length === 0) {
      return (
        <div className="no-data-message">
          <p>No data available for {testType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
        </div>
      );
    }

    return (
      <div className="data-table-container">
        <h3>{testType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Results vs Medications</h3>
        <div className="table-wrapper">
          <table className="effectiveness-table">
            <thead>
              <tr>
                <th>Medication</th>
                {reportData.timeRange.map(timePoint => (
                  <th key={timePoint}>
                    {new Date(timePoint).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </th>
                ))}
                <th>Overall Average</th>
              </tr>
            </thead>
            <tbody>
              {(reportData.medications || []).map(medication => {
                const medicationData = testData[medication.name] || {};
                const overallAvg = Object.values(medicationData).length > 0 
                  ? Object.values(medicationData).reduce((sum, period) => sum + (period?.averageImprovement || 0), 0) / Object.values(medicationData).length
                  : 0;

                return (
                  <tr key={medication.id}>
                    <td className="medication-name">{medication.name}</td>
                    {reportData.timeRange.map(timePoint => (
                      <td key={timePoint} className="improvement-cell">
                        <div className="improvement-value">
                          {medicationData[timePoint]?.averageImprovement?.toFixed(1) || '0.0'}%
                        </div>
                        <div className="patient-count">
                          ({medicationData[timePoint]?.patientCount || 0} patients)
                        </div>
                      </td>
                    ))}
                    <td className="overall-average">
                      <strong>{overallAvg.toFixed(1)}%</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOverviewCards = () => {
    const testTypes = [
      { key: 'visualAcuity', name: 'Visual Acuity', icon: '👁️' },
      { key: 'refraction', name: 'Refraction', icon: '🔍' },
      { key: 'iop', name: 'Intraocular Pressure', icon: '⚡' },
      { key: 'visualField', name: 'Visual Field', icon: '🎯' }
    ];

    return (
      <div className="overview-cards">
        {testTypes.map(testType => {
          const testData = reportData[`${testType.key}Data`] || {};
          const totalPatients = Object.values(testData).reduce((sum, medicationData) => {
            return sum + Object.values(medicationData).reduce((medSum, period) => medSum + (period?.patientCount || 0), 0);
          }, 0);

          const bestMedication = (reportData.medications && reportData.medications.length > 0) 
            ? (reportData.medications || []).reduce((best, medication) => {
                const medicationData = testData[medication.name] || {};
                const avgImprovement = Object.values(medicationData).length > 0
                  ? Object.values(medicationData).reduce((sum, period) => sum + (period?.averageImprovement || 0), 0) / Object.values(medicationData).length
                  : 0;
                
                return avgImprovement > (best.improvement || 0) 
                  ? { name: medication.name, improvement: avgImprovement }
                  : best;
              }, { name: 'None', improvement: 0 })
            : { name: 'None', improvement: 0 };

          return (
            <div key={testType.key} className="overview-card">
              <div className="card-header">
                <span className="card-icon">{testType.icon}</span>
                <h3>{testType.name}</h3>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <label>Total Patients:</label>
                  <span>{totalPatients}</span>
                </div>
                <div className="stat">
                  <label>Best Medication:</label>
                  <span>{bestMedication.name || 'N/A'}</span>
                </div>
                <div className="stat">
                  <label>Best Improvement:</label>
                  <span>{bestMedication.improvement ? `${bestMedication.improvement.toFixed(1)}%` : 'N/A'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="medication-effectiveness-report">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading medication effectiveness report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medication-effectiveness-report">
      <div className="report-header">
        <h1>Medication Effectiveness Analysis</h1>
        <p>Analyze eye test results compared to prescribed medications to identify treatment effectiveness</p>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Date Range:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Age Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.patientAgeRange.min}
              onChange={(e) => handleFilterChange('patientAgeRange', {
                ...filters.patientAgeRange,
                min: parseInt(e.target.value) || 0
              })}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.patientAgeRange.max}
              onChange={(e) => handleFilterChange('patientAgeRange', {
                ...filters.patientAgeRange,
                max: parseInt(e.target.value) || 120
              })}
            />
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.includeActiveOnly}
                onChange={(e) => handleFilterChange('includeActiveOnly', e.target.checked)}
              />
              Active Patients Only
            </label>
          </div>
        </div>
      </div>

      {/* View Navigation */}
      <div className="view-navigation">
        <button
          className={`nav-button ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-button ${selectedView === 'tables' ? 'active' : ''}`}
          onClick={() => setSelectedView('tables')}
        >
          📋 Data Tables
        </button>
        <button
          className={`nav-button ${selectedView === 'graphs' ? 'active' : ''}`}
          onClick={() => setSelectedView('graphs')}
        >
          📈 Charts & Graphs
        </button>
      </div>

      {/* Content based on selected view */}
      <div className="report-content">
        {selectedView === 'overview' && (
          <div className="overview-section">
            {renderOverviewCards()}
            
            <div className="summary-insights">
              <h3>Key Insights</h3>
              {!reportData.medications || reportData.medications.length === 0 ? (
                <p>No medication data available for the selected period.</p>
              ) : (
                <ul>
                  <li>Analysis covers {reportData.medications.length} different medications</li>
                  <li>Data spans {reportData.timeRange.length} time periods</li>
                  <li>Includes data from {filters.startDate} to {filters.endDate}</li>
                  <li>Age range: {filters.patientAgeRange.min} - {filters.patientAgeRange.max} years</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {selectedView === 'tables' && (
          <div className="tables-section">
            {filters.selectedTestTypes.includes('visual_acuity') && renderDataTable('visualAcuity')}
            {filters.selectedTestTypes.includes('refraction') && renderDataTable('refraction')}
            {filters.selectedTestTypes.includes('tonometry') && renderDataTable('iop')}
            {filters.selectedTestTypes.includes('visual_field') && renderDataTable('visualField')}
          </div>
        )}

        {selectedView === 'graphs' && (
          <div className="graphs-section">
            <div className="chart-controls">
              <label>Chart Type:</label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="line">Line Chart (Time Series)</option>
                <option value="bar">Bar Chart (Overall Comparison)</option>
              </select>
            </div>

            {!reportData.medications || reportData.medications.length === 0 ? (
              <div className="no-data-message">
                <p>No medication data available to display charts.</p>
              </div>
            ) : (
              <div className="charts-grid">
                {filters.selectedTestTypes.includes('visual_acuity') && (
                  <div className="chart-container">
                    {chartType === 'line' ? (
                      <Line 
                        data={createLineChartData('visualAcuity')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Visual Acuity - Medication Effectiveness Over Time'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    ) : (
                      <Bar 
                        data={createBarChartData('visualAcuity')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Visual Acuity - Overall Medication Effectiveness'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    )}
                  </div>
                )}

                {filters.selectedTestTypes.includes('refraction') && (
                  <div className="chart-container">
                    {chartType === 'line' ? (
                      <Line 
                        data={createLineChartData('refraction')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Refraction - Medication Effectiveness Over Time'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    ) : (
                      <Bar 
                        data={createBarChartData('refraction')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Refraction - Overall Medication Effectiveness'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    )}
                  </div>
                )}

                {filters.selectedTestTypes.includes('tonometry') && (
                  <div className="chart-container">
                    {chartType === 'line' ? (
                      <Line 
                        data={createLineChartData('iop')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Intraocular Pressure - Medication Effectiveness Over Time'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    ) : (
                      <Bar 
                        data={createBarChartData('iop')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Intraocular Pressure - Overall Medication Effectiveness'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    )}
                  </div>
                )}

                {filters.selectedTestTypes.includes('visual_field') && (
                  <div className="chart-container">
                    {chartType === 'line' ? (
                      <Line 
                        data={createLineChartData('visualField')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Visual Field - Medication Effectiveness Over Time'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    ) : (
                      <Bar 
                        data={createBarChartData('visualField')} 
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Visual Field - Overall Medication Effectiveness'
                            },
                            legend: { position: 'top' }
                          }
                        }} 
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="export-section">
        <button className="export-button" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
        <button 
          className="export-button"
          onClick={() => {
            // Future: Implement PDF export
            alert('PDF export feature coming soon!');
          }}
        >
          📄 Export to PDF
        </button>
        <button 
          className="export-button"
          onClick={() => {
            // Future: Implement CSV export
            alert('CSV export feature coming soon!');
          }}
        >
          📊 Export to CSV
        </button>
      </div>
    </div>
  );
};

export default MedicationEffectivenessReportPage;