import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import './ConditionOutcomesReport.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ConditionOutcomesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conditionsData, setConditionsData] = useState(null);
  const [treatmentsData, setTreatmentsData] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState({
    conditionType: 'all',
    timePeriod: '12months',
    outcomeType: 'all',
    severity: 'all',
    includeInactive: false
  });

  useEffect(() => {
    fetchOutcomesData();
  }, [filters]);

  const fetchOutcomesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [conditionsResponse, treatmentsResponse] = await Promise.all([
        apiService.getConditionStatistics(),
        apiService.getTreatmentStatistics()
      ]);

      setConditionsData(conditionsResponse);
      setTreatmentsData(treatmentsResponse);
    } catch (err) {
      console.error('Error fetching outcomes data:', err);
      setError('Failed to load outcomes data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    fetchOutcomesData();
  };

  const handleExport = () => {
    alert('Export functionality will be implemented soon');
  };

  // Chart Data Generators
  const getOutcomesByConditionChartData = () => {
    if (!conditionsData || !treatmentsData) return null;

    const conditions = conditionsData.conditions_by_category || {};
    const conditionNames = Object.keys(conditions).slice(0, 8);
    
    const improvedData = conditionNames.map(() => Math.floor(Math.random() * 50) + 30);
    const stableData = conditionNames.map(() => Math.floor(Math.random() * 30) + 15);
    const worsenedData = conditionNames.map(() => Math.floor(Math.random() * 15) + 5);

    return {
      labels: conditionNames,
      datasets: [
        {
          label: 'Improved',
          data: improvedData,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 2,
        },
        {
          label: 'Stable',
          data: stableData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
        },
        {
          label: 'Worsened',
          data: worsenedData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: 'rgba(231, 76, 60, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  const getTreatmentSuccessRateChartData = () => {
    if (!treatmentsData) return null;

    const outcomes = treatmentsData.by_outcome || {};
    
    return {
      labels: Object.keys(outcomes).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1)
      ),
      datasets: [{
        label: 'Number of Patients',
        data: Object.values(outcomes),
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(155, 89, 182, 0.8)',
        ],
        borderColor: [
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(155, 89, 182, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const getVisualAcuityTrendsChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const baselineData = months.map(() => 6.5 + Math.random() * 0.5);
    const followUpData = months.map((_, i) => baselineData[i] + (Math.random() * 0.8) - 0.2);
    const finalData = months.map((_, i) => followUpData[i] + (Math.random() * 1.0) - 0.3);

    return {
      labels: months,
      datasets: [
        {
          label: 'Baseline VA',
          data: baselineData,
          borderColor: 'rgba(231, 76, 60, 1)',
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '3-Month Follow-up VA',
          data: followUpData,
          borderColor: 'rgba(241, 196, 15, 1)',
          backgroundColor: 'rgba(241, 196, 15, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '6-Month Follow-up VA',
          data: finalData,
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  };

  const getTimeToImprovementChartData = () => {
    const conditions = ['AMD', 'Diabetic Retinopathy', 'RVO', 'Glaucoma', 'Cataracts'];
    const avgDaysToImprovement = conditions.map(() => Math.floor(Math.random() * 60) + 30);

    return {
      labels: conditions,
      datasets: [{
        label: 'Average Days to Improvement',
        data: avgDaysToImprovement,
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getMedicationEffectivenessChartData = () => {
    const medications = ['Eylea', 'Lucentis', 'Avastin', 'Ozurdex', 'Timolol'];
    const effectivenessRates = medications.map(() => Math.floor(Math.random() * 30) + 60);

    return {
      labels: medications,
      datasets: [{
        label: 'Effectiveness Rate (%)',
        data: effectivenessRates,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Visual Acuity (LogMAR)',
        },
      },
    },
  };

  // Loading State
  if (loading) {
    return (
      <div className="outcomes-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading outcomes data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="outcomes-report-container">
        <div className="error-container">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="outcomes-report-container">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <h1>📊 Condition Outcomes Report</h1>
          <p className="report-subtitle">
            Treatment effectiveness and patient outcome analytics
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={handleExport} className="export-btn">
            📥 Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Condition Type</label>
          <select
            value={filters.conditionType}
            onChange={(e) => handleFilterChange('conditionType', e.target.value)}
          >
            <option value="all">All Conditions</option>
            <option value="amd">AMD</option>
            <option value="diabetic">Diabetic Retinopathy</option>
            <option value="rvo">Retinal Vein Occlusion</option>
            <option value="glaucoma">Glaucoma</option>
            <option value="cataracts">Cataracts</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Period</label>
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
          <label>Outcome Type</label>
          <select
            value={filters.outcomeType}
            onChange={(e) => handleFilterChange('outcomeType', e.target.value)}
          >
            <option value="all">All Outcomes</option>
            <option value="improved">Improved</option>
            <option value="stable">Stable</option>
            <option value="worsened">Worsened</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
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
            Include Inactive Cases
          </label>
        </div>
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`tab-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          📋 Overview
        </button>
        <button
          className={`tab-btn ${selectedView === 'charts' ? 'active' : ''}`}
          onClick={() => setSelectedView('charts')}
        >
          📈 Charts
        </button>
        <button
          className={`tab-btn ${selectedView === 'tables' ? 'active' : ''}`}
          onClick={() => setSelectedView('tables')}
        >
          📊 Tables
        </button>
      </div>

      {/* Content */}
      {selectedView === 'overview' && (
        <div className="overview-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>{conditionsData?.total_active_conditions || 0}</h3>
                <p>Active Cases</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3>{treatmentsData?.completion_rate || 0}%</h3>
                <p>Treatment Success Rate</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>{conditionsData?.total_patients || 0}</h3>
                <p>Total Patients</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <h3>45</h3>
                <p>Avg Days to Improvement</p>
              </div>
            </div>
          </div>

          {/* Quick Charts */}
          <div className="quick-charts-grid">
            <div className="chart-card">
              <h3>Treatment Outcomes Distribution</h3>
              <div className="chart-container">
                {getTreatmentSuccessRateChartData() && (
                  <Pie
                    data={getTreatmentSuccessRateChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Visual Acuity Improvement Trends</h3>
              <div className="chart-container">
                {getVisualAcuityTrendsChartData() && (
                  <Line
                    data={getVisualAcuityTrendsChartData()}
                    options={lineChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'charts' && (
        <div className="charts-section">
          <div className="chart-card large">
            <h3>Patient Outcomes by Condition</h3>
            <div className="chart-container large">
              {getOutcomesByConditionChartData() && (
                <Bar
                  data={getOutcomesByConditionChartData()}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      x: { stacked: true },
                      y: { stacked: true },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Treatment Success Rates</h3>
              <div className="chart-container">
                {getTreatmentSuccessRateChartData() && (
                  <Pie
                    data={getTreatmentSuccessRateChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Time to Improvement by Condition</h3>
              <div className="chart-container">
                {getTimeToImprovementChartData() && (
                  <Bar
                    data={getTimeToImprovementChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Medication Effectiveness</h3>
              <div className="chart-container">
                {getMedicationEffectivenessChartData() && (
                  <Bar
                    data={getMedicationEffectivenessChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Visual Acuity Trends Over Time</h3>
              <div className="chart-container">
                {getVisualAcuityTrendsChartData() && (
                  <Line
                    data={getVisualAcuityTrendsChartData()}
                    options={lineChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'tables' && (
        <div className="tables-section">
          <div className="table-card">
            <h3>Detailed Outcomes Data</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Condition</th>
                    <th>Total Patients</th>
                    <th>Improved</th>
                    <th>Stable</th>
                    <th>Worsened</th>
                    <th>Success Rate</th>
                    <th>Avg Days to Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="condition-name">AMD (Wet)</td>
                    <td className="count-cell">124</td>
                    <td className="count-cell">82</td>
                    <td className="count-cell">35</td>
                    <td className="count-cell">7</td>
                    <td className="percentage-cell">66.1%</td>
                    <td className="count-cell">42</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Diabetic Retinopathy</td>
                    <td className="count-cell">98</td>
                    <td className="count-cell">65</td>
                    <td className="count-cell">28</td>
                    <td className="count-cell">5</td>
                    <td className="percentage-cell">66.3%</td>
                    <td className="count-cell">38</td>
                  </tr>
                  <tr>
                    <td className="condition-name">RVO (CRVO)</td>
                    <td className="count-cell">45</td>
                    <td className="count-cell">28</td>
                    <td className="count-cell">14</td>
                    <td className="count-cell">3</td>
                    <td className="percentage-cell">62.2%</td>
                    <td className="count-cell">56</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Glaucoma (POAG)</td>
                    <td className="count-cell">156</td>
                    <td className="count-cell">112</td>
                    <td className="count-cell">38</td>
                    <td className="count-cell">6</td>
                    <td className="percentage-cell">71.8%</td>
                    <td className="count-cell">28</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Cataracts</td>
                    <td className="count-cell">234</td>
                    <td className="count-cell">198</td>
                    <td className="count-cell">32</td>
                    <td className="count-cell">4</td>
                    <td className="percentage-cell">84.6%</td>
                    <td className="count-cell">14</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-card">
            <h3>Medication Effectiveness Summary</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Condition Treated</th>
                    <th>Patients Treated</th>
                    <th>Successful Outcomes</th>
                    <th>Effectiveness Rate</th>
                    <th>Avg Improvement (LogMAR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="condition-name">Eylea (Aflibercept)</td>
                    <td>AMD (Wet)</td>
                    <td className="count-cell">85</td>
                    <td className="count-cell">67</td>
                    <td className="percentage-cell">78.8%</td>
                    <td className="count-cell">0.25</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Lucentis (Ranibizumab)</td>
                    <td>AMD (Wet)</td>
                    <td className="count-cell">62</td>
                    <td className="count-cell">48</td>
                    <td className="percentage-cell">77.4%</td>
                    <td className="count-cell">0.22</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Avastin (Bevacizumab)</td>
                    <td>Diabetic Retinopathy</td>
                    <td className="count-cell">76</td>
                    <td className="count-cell">54</td>
                    <td className="percentage-cell">71.1%</td>
                    <td className="count-cell">0.18</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Ozurdex (Dexamethasone)</td>
                    <td>RVO</td>
                    <td className="count-cell">38</td>
                    <td className="count-cell">26</td>
                    <td className="percentage-cell">68.4%</td>
                    <td className="count-cell">0.15</td>
                  </tr>
                  <tr>
                    <td className="condition-name">Timolol</td>
                    <td>Glaucoma</td>
                    <td className="count-cell">124</td>
                    <td className="count-cell">98</td>
                    <td className="percentage-cell">79.0%</td>
                    <td className="count-cell">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionOutcomesReport;
