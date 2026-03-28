/**
 * Condition Prevalence Report
 * Displays disease-specific breakdown, age distribution, severity distribution, and trends
 */
import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import apiService from '../../services/api';
import './ConditionPrevalenceReport.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConditionPrevalenceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevalenceData, setPrevalenceData] = useState([]);
  const [statisticsData, setStatisticsData] = useState(null);
  const [filters, setFilters] = useState({
    conditionType: 'all', // all, amd, diabetic, rvo, glaucoma, cataracts
    timePeriod: '12months', // 6months, 12months, 2years, all
    ageRange: { min: 0, max: 120 },
    severity: 'all', // all, mild, moderate, severe
    includeInactive: false
  });
  const [selectedView, setSelectedView] = useState('overview'); // overview, tables, charts

  useEffect(() => {
    fetchPrevalenceData();
  }, [filters]);

  const fetchPrevalenceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prevalence and statistics in parallel
      const [prevalenceResponse, statisticsResponse] = await Promise.all([
        apiService.getConditionPrevalence(),
        apiService.getConditionStatistics()
      ]);

      setPrevalenceData(prevalenceResponse.data || []);
      setStatisticsData(statisticsResponse.data || {});
    } catch (err) {
      console.error('Error fetching prevalence data:', err);
      setError('Failed to load condition prevalence report. Please try again.');
      setPrevalenceData([]);
      setStatisticsData(null);
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

  // Filter data based on selected filters
  const getFilteredData = () => {
    if (!prevalenceData || !Array.isArray(prevalenceData)) return [];

    let filtered = [...prevalenceData];

    // Filter by condition type
    if (filters.conditionType !== 'all') {
      const conditionMap = {
        'amd': ['AMD', 'Age-Related Macular Degeneration'],
        'diabetic': ['Diabetic Retinopathy', 'Diabetic'],
        'rvo': ['RVO', 'Retinal Vein Occlusion'],
        'glaucoma': ['Glaucoma'],
        'cataracts': ['Cataract']
      };
      
      const matchTerms = conditionMap[filters.conditionType] || [];
      filtered = filtered.filter(item => 
        matchTerms.some(term => item.name?.includes(term))
      );
    }

    return filtered;
  };

  // Chart Data Generators
  const getPrevalenceByConditionChartData = () => {
    const filtered = getFilteredData();
    
    return {
      labels: filtered.map(item => item.name || 'Unknown'),
      datasets: [{
        label: 'Patient Count',
        data: filtered.map(item => item.patient_count || 0),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getSeverityDistributionChartData = () => {
    if (!statisticsData?.conditions_by_severity) {
      return { labels: [], datasets: [] };
    }

    const severityData = statisticsData.conditions_by_severity;
    
    return {
      labels: Object.keys(severityData).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        label: 'Patient Count by Severity',
        data: Object.values(severityData),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',  // Mild - Green
          'rgba(255, 206, 86, 0.8)',  // Moderate - Yellow
          'rgba(255, 99, 132, 0.8)'   // Severe - Red
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const getCategoryDistributionChartData = () => {
    if (!statisticsData?.conditions_by_category) {
      return { labels: [], datasets: [] };
    }

    const categoryData = statisticsData.conditions_by_category;
    
    return {
      labels: Object.keys(categoryData).map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      title: {
        display: false
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="prevalence-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading prevalence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prevalence-report-container">
        <div className="error-container">
          <h3>Error Loading Report</h3>
          <p>{error}</p>
          <button onClick={fetchPrevalenceData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filtered = getFilteredData();
  const totalPatients = filtered.reduce((sum, item) => sum + (item.patient_count || 0), 0);

  return (
    <div className="prevalence-report-container">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <h1>Condition Prevalence Report</h1>
          <p className="report-subtitle">Disease-specific breakdown and prevalence statistics</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchPrevalenceData} className="refresh-btn">
            🔄 Refresh
          </button>
          <button className="export-btn">
            📊 Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Condition Type:</label>
          <select 
            value={filters.conditionType}
            onChange={(e) => handleFilterChange('conditionType', e.target.value)}
          >
            <option value="all">All Conditions</option>
            <option value="amd">AMD (Age-Related Macular Degeneration)</option>
            <option value="diabetic">Diabetic Retinopathy</option>
            <option value="rvo">RVO (Retinal Vein Occlusion)</option>
            <option value="glaucoma">Glaucoma</option>
            <option value="cataracts">Cataracts</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Period:</label>
          <select 
            value={filters.timePeriod}
            onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="2years">Last 2 Years</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select 
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div className="filter-group checkbox-group">
          <label>
            <input 
              type="checkbox"
              checked={filters.includeInactive}
              onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
            />
            Include Inactive Patients
          </label>
        </div>
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button 
          className={`tab-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${selectedView === 'charts' ? 'active' : ''}`}
          onClick={() => setSelectedView('charts')}
        >
          Charts & Visualizations
        </button>
        <button 
          className={`tab-btn ${selectedView === 'tables' ? 'active' : ''}`}
          onClick={() => setSelectedView('tables')}
        >
          Detailed Tables
        </button>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="overview-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">👁️</div>
              <div className="card-content">
                <h3>{statisticsData?.active_patient_conditions || 0}</h3>
                <p>Active Patient Conditions</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>{filtered.length}</h3>
                <p>Unique Conditions ({filters.conditionType === 'all' ? 'All' : filters.conditionType})</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>{totalPatients}</h3>
                <p>Total Patients Affected</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <h3>{statisticsData?.recent_diagnoses || 0}</h3>
                <p>Recent Diagnoses (30 days)</p>
              </div>
            </div>
          </div>

          {/* Quick Charts */}
          <div className="quick-charts-grid">
            <div className="chart-card">
              <h3>Prevalence by Condition</h3>
              <div className="chart-container">
                <Bar data={getPrevalenceByConditionChartData()} options={barChartOptions} />
              </div>
            </div>
            <div className="chart-card">
              <h3>Severity Distribution</h3>
              <div className="chart-container">
                <Pie data={getSeverityDistributionChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {selectedView === 'charts' && (
        <div className="charts-section">
          <div className="charts-grid">
            <div className="chart-card large">
              <h3>Condition Prevalence Distribution</h3>
              <div className="chart-container large">
                <Bar data={getPrevalenceByConditionChartData()} options={barChartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Severity Breakdown</h3>
              <div className="chart-container">
                <Pie data={getSeverityDistributionChartData()} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Category Distribution</h3>
              <div className="chart-container">
                <Pie data={getCategoryDistributionChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Tab */}
      {selectedView === 'tables' && (
        <div className="tables-section">
          <div className="table-card">
            <h3>Detailed Prevalence Data</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Condition Name</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Patient Count</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((condition, index) => {
                      const percentage = totalPatients > 0 
                        ? ((condition.patient_count / totalPatients) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={index}>
                          <td className="condition-name">{condition.name || 'Unknown'}</td>
                          <td>{condition.code || 'N/A'}</td>
                          <td><span className="category-badge">{condition.category || 'N/A'}</span></td>
                          <td className="count-cell">{condition.patient_count || 0}</td>
                          <td className="percentage-cell">{percentage}%</td>
                          <td>
                            <span className={`status-badge ${condition.is_active ? 'active' : 'inactive'}`}>
                              {condition.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No prevalence data available for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics Table */}
          {statisticsData && (
            <div className="table-card">
              <h3>System-Wide Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Conditions in System:</span>
                  <span className="stat-value">{statisticsData.total_conditions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Conditions:</span>
                  <span className="stat-value">{statisticsData.active_conditions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Upcoming Assessments (7 days):</span>
                  <span className="stat-value">{statisticsData.upcoming_assessments}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Overdue Assessments:</span>
                  <span className="stat-value critical">{statisticsData.overdue_assessments}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConditionPrevalenceReport;
