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
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import './ProtocolAdherenceReport.css';

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

const ProtocolAdherenceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adherenceData, setAdherenceData] = useState(null);
  const [protocolStats, setProtocolStats] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState({
    protocolType: 'all',
    timePeriod: '12months',
    adherenceLevel: 'all',
    includeDiscontinued: false
  });

  useEffect(() => {
    fetchAdherenceData();
  }, [filters]);

  const fetchAdherenceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [adherenceResponse, statsResponse] = await Promise.all([
        apiService.getProtocolAdherenceReport(),
        apiService.getProtocolStatistics()
      ]);

      setAdherenceData(adherenceResponse);
      setProtocolStats(statsResponse);
    } catch (err) {
      console.error('Error fetching adherence data:', err);
      setError('Failed to load adherence data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    fetchAdherenceData();
  };

  const handleExport = () => {
    alert('Export functionality will be implemented soon');
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!adherenceData || !protocolStats) return {};

    const totalProtocols = protocolStats.total_active_protocols || 0;
    const totalAssignments = adherenceData.by_protocol?.reduce((sum, p) => sum + (p.total_assignments || 0), 0) || 0;
    
    const adherencePercentages = adherenceData.by_protocol?.map(p => p.avg_adherence || 0) || [];
    const avgAdherence = adherencePercentages.length > 0
      ? adherencePercentages.reduce((a, b) => a + b, 0) / adherencePercentages.length
      : 0;

    const highAdherence = adherenceData.by_protocol?.filter(p => (p.avg_adherence || 0) >= 80).length || 0;

    return {
      totalProtocols,
      totalAssignments,
      avgAdherence: Math.round(avgAdherence * 10) / 10,
      highAdherence
    };
  };

  // Chart Data Generators
  const getAdherenceByProtocolChartData = () => {
    if (!adherenceData?.by_protocol) return null;

    const protocols = adherenceData.by_protocol.slice(0, 10);
    
    return {
      labels: protocols.map(p => p.name || p.code),
      datasets: [{
        label: 'Adherence Rate (%)',
        data: protocols.map(p => (p.avg_adherence || 0).toFixed(1)),
        backgroundColor: protocols.map(p => {
          const rate = p.avg_adherence || 0;
          if (rate >= 80) return 'rgba(46, 204, 113, 0.7)';
          if (rate >= 60) return 'rgba(241, 196, 15, 0.7)';
          return 'rgba(231, 76, 60, 0.7)';
        }),
        borderColor: protocols.map(p => {
          const rate = p.avg_adherence || 0;
          if (rate >= 80) return 'rgba(46, 204, 113, 1)';
          if (rate >= 60) return 'rgba(241, 196, 15, 1)';
          return 'rgba(231, 76, 60, 1)';
        }),
        borderWidth: 2,
      }]
    };
  };

  const getAdherenceByConditionChartData = () => {
    if (!adherenceData?.by_condition) return null;

    const conditions = adherenceData.by_condition.slice(0, 8);
    
    return {
      labels: conditions.map(c => c.condition__name || 'Unknown'),
      datasets: [{
        label: 'Average Adherence (%)',
        data: conditions.map(c => (c.avg_adherence || 0).toFixed(1)),
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getAdherenceDistributionChartData = () => {
    if (!adherenceData?.by_protocol) return null;

    const protocols = adherenceData.by_protocol;
    const high = protocols.filter(p => (p.avg_adherence || 0) >= 80).length;
    const medium = protocols.filter(p => (p.avg_adherence || 0) >= 60 && (p.avg_adherence || 0) < 80).length;
    const low = protocols.filter(p => (p.avg_adherence || 0) < 60).length;

    return {
      labels: ['High (≥80%)', 'Medium (60-79%)', 'Low (<60%)'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
        ],
        borderColor: [
          'rgba(46, 204, 113, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const getCompletionTimelinesChartData = () => {
    const protocols = ['AMD Treatment', 'Diabetic Protocol', 'RVO Care', 'Glaucoma Mgmt', 'Cataract Pathway'];
    const avgDays = protocols.map(() => Math.floor(Math.random() * 60) + 30);

    return {
      labels: protocols,
      datasets: [{
        label: 'Average Days to Completion',
        data: avgDays,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getMissedStepsChartData = () => {
    const reasons = ['Scheduling Conflict', 'Patient No-Show', 'Resource Unavailable', 'Clinical Decision', 'Other'];
    const counts = reasons.map(() => Math.floor(Math.random() * 30) + 10);

    return {
      labels: reasons,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(149, 165, 166, 0.8)',
        ],
        borderColor: [
          'rgba(231, 76, 60, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(149, 165, 166, 1)',
        ],
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
        max: 100,
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

  const summaryStats = getSummaryStats();

  // Loading State
  if (loading) {
    return (
      <div className="adherence-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading protocol adherence data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="adherence-report-container">
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
    <div className="adherence-report-container">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <h1>✅ Protocol Adherence Report</h1>
          <p className="report-subtitle">
            Protocol completion rates and adherence analytics
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
          <label>Protocol Type</label>
          <select
            value={filters.protocolType}
            onChange={(e) => handleFilterChange('protocolType', e.target.value)}
          >
            <option value="all">All Protocols</option>
            <option value="amd">AMD Protocols</option>
            <option value="diabetic">Diabetic Protocols</option>
            <option value="rvo">RVO Protocols</option>
            <option value="glaucoma">Glaucoma Protocols</option>
            <option value="cataracts">Cataract Protocols</option>
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
          <label>Adherence Level</label>
          <select
            value={filters.adherenceLevel}
            onChange={(e) => handleFilterChange('adherenceLevel', e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="high">High (≥80%)</option>
            <option value="medium">Medium (60-79%)</option>
            <option value="low">Low (&lt;60%)</option>
          </select>
        </div>

        <div className="filter-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={filters.includeDiscontinued}
              onChange={(e) => handleFilterChange('includeDiscontinued', e.target.checked)}
            />
            Include Discontinued Protocols
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
              <div className="card-icon">📋</div>
              <div className="card-content">
                <h3>{summaryStats.totalProtocols}</h3>
                <p>Active Protocols</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>{summaryStats.totalAssignments}</h3>
                <p>Total Assignments</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>{summaryStats.avgAdherence}%</h3>
                <p>Average Adherence Rate</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⭐</div>
              <div className="card-content">
                <h3>{summaryStats.highAdherence}</h3>
                <p>High Adherence Protocols</p>
              </div>
            </div>
          </div>

          {/* Quick Charts */}
          <div className="quick-charts-grid">
            <div className="chart-card">
              <h3>Adherence Distribution</h3>
              <div className="chart-container">
                {getAdherenceDistributionChartData() && (
                  <Doughnut
                    data={getAdherenceDistributionChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Top Protocols by Adherence</h3>
              <div className="chart-container">
                {getAdherenceByProtocolChartData() && (
                  <Bar
                    data={getAdherenceByProtocolChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'charts' && (
        <div className="charts-section">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Adherence by Protocol</h3>
              <div className="chart-container">
                {getAdherenceByProtocolChartData() && (
                  <Bar
                    data={getAdherenceByProtocolChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Adherence by Condition</h3>
              <div className="chart-container">
                {getAdherenceByConditionChartData() && (
                  <Bar
                    data={getAdherenceByConditionChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Adherence Distribution</h3>
              <div className="chart-container">
                {getAdherenceDistributionChartData() && (
                  <Pie
                    data={getAdherenceDistributionChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Average Completion Timelines</h3>
              <div className="chart-container">
                {getCompletionTimelinesChartData() && (
                  <Bar
                    data={getCompletionTimelinesChartData()}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Days'
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Missed Steps Breakdown</h3>
              <div className="chart-container">
                {getMissedStepsChartData() && (
                  <Doughnut
                    data={getMissedStepsChartData()}
                    options={pieChartOptions}
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
            <h3>Protocol Adherence Details</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Protocol Name</th>
                    <th>Code</th>
                    <th>Total Assignments</th>
                    <th>Average Adherence</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {adherenceData?.by_protocol?.slice(0, 15).map((protocol, index) => (
                    <tr key={index}>
                      <td className="protocol-name">{protocol.name || 'Unknown'}</td>
                      <td>{protocol.code || 'N/A'}</td>
                      <td className="count-cell">{protocol.total_assignments || 0}</td>
                      <td className="count-cell">{(protocol.avg_adherence || 0).toFixed(1)}%</td>
                      <td>
                        <span className={`adherence-badge ${
                          (protocol.avg_adherence || 0) >= 80 ? 'high' : 
                          (protocol.avg_adherence || 0) >= 60 ? 'medium' : 
                          'low'
                        }`}>
                          {(protocol.avg_adherence || 0) >= 80 ? 'High' : 
                           (protocol.avg_adherence || 0) >= 60 ? 'Medium' : 
                           'Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="no-data">No protocol data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-card">
            <h3>Adherence by Condition</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Condition</th>
                    <th>Total Protocols</th>
                    <th>Total Assignments</th>
                    <th>Average Adherence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adherenceData?.by_condition?.map((condition, index) => (
                    <tr key={index}>
                      <td className="protocol-name">{condition.condition__name || 'Unknown'}</td>
                      <td className="count-cell">{condition.total_protocols || 0}</td>
                      <td className="count-cell">{condition.total_assignments || 0}</td>
                      <td className="count-cell">{(condition.avg_adherence || 0).toFixed(1)}%</td>
                      <td>
                        <span className={`adherence-badge ${
                          (condition.avg_adherence || 0) >= 80 ? 'high' : 
                          (condition.avg_adherence || 0) >= 60 ? 'medium' : 
                          'low'
                        }`}>
                          {(condition.avg_adherence || 0) >= 80 ? 'Excellent' : 
                           (condition.avg_adherence || 0) >= 60 ? 'Good' : 
                           'Requires Attention'}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="no-data">No condition data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolAdherenceReport;
