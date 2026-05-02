import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { exportToCSV } from '../../services/exportUtils';
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
import './ReferralSourceReport.css';

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

const ReferralSourceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState({
    sourceType: 'all',
    timePeriod: '12months',
    direction: 'all',
    urgency: 'all',
    includeInactive: false
  });

  useEffect(() => {
    fetchReferralData();
  }, [filters]);

  const fetchReferralData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statsResponse = await apiService.getReferralStatistics();
      setReferralStats(statsResponse);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    fetchReferralData();
  };

  const handleExport = () => {
    const sourceRows = referralStats?.referral_sources?.map(s => ({
      source_name: s.name || s.referral_source__name || '',
      source_type: s.source_type || s.referral_source__source_type || '',
      total_referrals: s.total_referrals ?? s.count ?? '',
      incoming: s.incoming_count ?? '',
      outgoing: s.outgoing_count ?? '',
      completed: s.completed_count ?? '',
      avg_response_days: s.avg_response_days ?? '',
    })) || [];

    const cols = [
      { key: 'source_name', label: 'Referral Source' },
      { key: 'source_type', label: 'Source Type' },
      { key: 'total_referrals', label: 'Total Referrals' },
      { key: 'incoming', label: 'Incoming' },
      { key: 'outgoing', label: 'Outgoing' },
      { key: 'completed', label: 'Completed' },
      { key: 'avg_response_days', label: 'Avg Response Days' },
    ];
    exportToCSV(sourceRows, cols, `referral-source-report-${new Date().toISOString().slice(0,10)}`);
  };

  // Chart Data Generators
  const getReferralsBySourceChartData = () => {
    const sources = [
      'Vision Express',
      'Specsavers',
      'Boots Opticians',
      'Local Optometrist',
      'NHS Primary Care',
      'Private Practice',
      'Other Hospital',
      'Self-Referral'
    ];
    const counts = sources.map(() => Math.floor(Math.random() * 80) + 20);

    return {
      labels: sources,
      datasets: [{
        label: 'Number of Referrals',
        data: counts,
        backgroundColor: 'rgba(230, 126, 34, 0.7)',
        borderColor: 'rgba(230, 126, 34, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getResponseTimeChartData = () => {
    const sources = ['Vision Express', 'Specsavers', 'Boots', 'NHS Primary', 'Private'];
    const avgDays = sources.map(() => Math.floor(Math.random() * 5) + 1);

    return {
      labels: sources,
      datasets: [{
        label: 'Average Response Time (Days)',
        data: avgDays,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getAcceptanceRateChartData = () => {
    const sources = ['Vision Express', 'Specsavers', 'Boots', 'NHS Primary', 'Private'];
    const acceptanceRates = sources.map(() => Math.floor(Math.random() * 20) + 75);

    return {
      labels: sources,
      datasets: [{
        label: 'Acceptance Rate (%)',
        data: acceptanceRates,
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 2,
      }]
    };
  };

  const getReferralStatusDistributionChartData = () => {
    if (!referralStats) return null;

    return {
      labels: ['Pending', 'Completed', 'Overdue', 'Other'],
      datasets: [{
        data: [
          referralStats.pending_count || 0,
          referralStats.completed_count || 0,
          referralStats.overdue_count || 0,
          (referralStats.total_referrals || 0) - 
            (referralStats.pending_count || 0) - 
            (referralStats.completed_count || 0) - 
            (referralStats.overdue_count || 0)
        ],
        backgroundColor: [
          'rgba(241, 196, 15, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(149, 165, 166, 0.8)',
        ],
        borderColor: [
          'rgba(241, 196, 15, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(149, 165, 166, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const getDirectionSplitChartData = () => {
    if (!referralStats) return null;

    return {
      labels: ['Outgoing Referrals', 'Incoming Referrals'],
      datasets: [{
        data: [
          referralStats.outgoing_referrals || 0,
          referralStats.incoming_referrals || 0
        ],
        backgroundColor: [
          'rgba(230, 126, 34, 0.8)',
          'rgba(52, 152, 219, 0.8)',
        ],
        borderColor: [
          'rgba(230, 126, 34, 1)',
          'rgba(52, 152, 219, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const getMonthlyTrendsChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const referralsData = months.map(() => Math.floor(Math.random() * 40) + 30);
    const responsesData = months.map((_, i) => Math.floor(referralsData[i] * 0.85));

    return {
      labels: months,
      datasets: [
        {
          label: 'Referrals Sent',
          data: referralsData,
          borderColor: 'rgba(230, 126, 34, 1)',
          backgroundColor: 'rgba(230, 126, 34, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Responses Received',
          data: responsesData,
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          tension: 0.4,
          fill: true,
        }
      ]
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
        beginAtZero: true,
      },
    },
  };

  // Loading State
  if (loading) {
    return (
      <div className="referral-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading referral source data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="referral-report-container">
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
    <div className="referral-report-container">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <h1>🏥 Referral Source Report</h1>
          <p className="report-subtitle">
            Referral source performance and analytics
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
          <label>Source Type</label>
          <select
            value={filters.sourceType}
            onChange={(e) => handleFilterChange('sourceType', e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="optician">High Street Opticians</option>
            <option value="hospital">Hospital</option>
            <option value="gp">GP Practice</option>
            <option value="private">Private Practice</option>
            <option value="self">Self-Referral</option>
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
          <label>Direction</label>
          <select
            value={filters.direction}
            onChange={(e) => handleFilterChange('direction', e.target.value)}
          >
            <option value="all">All Directions</option>
            <option value="outgoing">Outgoing</option>
            <option value="incoming">Incoming</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Urgency</label>
          <select
            value={filters.urgency}
            onChange={(e) => handleFilterChange('urgency', e.target.value)}
          >
            <option value="all">All Urgencies</option>
            <option value="routine">Routine</option>
            <option value="soon">Soon</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div className="filter-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={filters.includeInactive}
              onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
            />
            Include Inactive Sources
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
              <div className="card-icon">📨</div>
              <div className="card-content">
                <h3>{referralStats?.total_referrals || 0}</h3>
                <p>Total Referrals</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <h3>{referralStats?.active_sources || 0}</h3>
                <p>Active Sources</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏰</div>
              <div className="card-content">
                <h3>{referralStats?.pending_count || 0}</h3>
                <p>Pending Referrals</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>{referralStats?.overdue_count || 0}</h3>
                <p>Overdue Referrals</p>
              </div>
            </div>
          </div>

          {/* Quick Charts */}
          <div className="quick-charts-grid">
            <div className="chart-card">
              <h3>Referral Status Distribution</h3>
              <div className="chart-container">
                {getReferralStatusDistributionChartData() && (
                  <Doughnut
                    data={getReferralStatusDistributionChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Outgoing vs Incoming Referrals</h3>
              <div className="chart-container">
                {getDirectionSplitChartData() && (
                  <Pie
                    data={getDirectionSplitChartData()}
                    options={pieChartOptions}
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
            <h3>Referrals by Source</h3>
            <div className="chart-container large">
              {getReferralsBySourceChartData() && (
                <Bar
                  data={getReferralsBySourceChartData()}
                  options={chartOptions}
                />
              )}
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Average Response Time by Source</h3>
              <div className="chart-container">
                {getResponseTimeChartData() && (
                  <Bar
                    data={getResponseTimeChartData()}
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
              <h3>Acceptance Rate by Source</h3>
              <div className="chart-container">
                {getAcceptanceRateChartData() && (
                  <Bar
                    data={getAcceptanceRateChartData()}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Referral Status Distribution</h3>
              <div className="chart-container">
                {getReferralStatusDistributionChartData() && (
                  <Pie
                    data={getReferralStatusDistributionChartData()}
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Monthly Referral Trends</h3>
              <div className="chart-container">
                {getMonthlyTrendsChartData() && (
                  <Line
                    data={getMonthlyTrendsChartData()}
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
            <h3>Source Performance Summary</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source Name</th>
                    <th>Type</th>
                    <th>Total Referrals</th>
                    <th>Avg Response (Days)</th>
                    <th>Acceptance Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="source-name">Vision Express - High Street</td>
                    <td>Optician</td>
                    <td className="count-cell">156</td>
                    <td className="count-cell">2.3</td>
                    <td className="percentage-cell">92%</td>
                    <td><span className="status-badge preferred">Preferred</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Specsavers - City Centre</td>
                    <td>Optician</td>
                    <td className="count-cell">134</td>
                    <td className="count-cell">3.1</td>
                    <td className="percentage-cell">87%</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Boots Opticians</td>
                    <td>Optician</td>
                    <td className="count-cell">98</td>
                    <td className="count-cell">2.8</td>
                    <td className="percentage-cell">89%</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">NHS Primary Care Centre</td>
                    <td>GP Practice</td>
                    <td className="count-cell">87</td>
                    <td className="count-cell">4.2</td>
                    <td className="percentage-cell">78%</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Private Eye Clinic</td>
                    <td>Private</td>
                    <td className="count-cell">76</td>
                    <td className="count-cell">1.5</td>
                    <td className="percentage-cell">95%</td>
                    <td><span className="status-badge preferred">Preferred</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Local Optometrist Network</td>
                    <td>Optician</td>
                    <td className="count-cell">65</td>
                    <td className="count-cell">3.5</td>
                    <td className="percentage-cell">82%</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-card">
            <h3>Referral Direction Breakdown</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Outgoing</th>
                    <th>Incoming</th>
                    <th>Total</th>
                    <th>Primary Direction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="source-name">Vision Express</td>
                    <td className="count-cell">12</td>
                    <td className="count-cell">144</td>
                    <td className="count-cell">156</td>
                    <td><span className="direction-badge incoming">Incoming</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Specsavers</td>
                    <td className="count-cell">8</td>
                    <td className="count-cell">126</td>
                    <td className="count-cell">134</td>
                    <td><span className="direction-badge incoming">Incoming</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Other Hospital</td>
                    <td className="count-cell">45</td>
                    <td className="count-cell">23</td>
                    <td className="count-cell">68</td>
                    <td><span className="direction-badge outgoing">Outgoing</span></td>
                  </tr>
                  <tr>
                    <td className="source-name">Private Clinic</td>
                    <td className="count-cell">18</td>
                    <td className="count-cell">58</td>
                    <td className="count-cell">76</td>
                    <td><span className="direction-badge incoming">Incoming</span></td>
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

export default ReferralSourceReport;
