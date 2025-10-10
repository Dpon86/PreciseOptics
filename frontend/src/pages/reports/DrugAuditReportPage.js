import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DrugAuditReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [drugData, setDrugData] = useState({
    medicationEffectiveness: {
      labels: [],
      datasets: []
    },
    timelineTrends: {
      labels: [],
      datasets: []
    },
    sideEffectDistribution: {
      labels: [],
      datasets: []
    },
    adherenceRates: {
      labels: [],
      datasets: []
    }
  });
  const [filters, setFilters] = useState({
    dateRange: '30', // days
    medication: '',
    patient: '',
    testType: ''
  });

  useEffect(() => {
    fetchDrugAuditData();
  }, [filters]);

  const fetchDrugAuditData = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since API endpoint might not exist yet
      // TODO: Replace with actual API call when backend endpoint is ready
      const mockData = {
        medicationEffectiveness: {
          labels: ['Latanoprost', 'Timolol', 'Brimonidine', 'Dorzolamide', 'Bimatoprost'],
          datasets: [{
            label: 'IOP Reduction (%)',
            data: [25, 18, 22, 16, 28],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        timelineTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Average IOP (mmHg)',
            data: [18.2, 17.8, 16.5, 15.9, 15.2, 14.8],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
          }]
        },
        sideEffectDistribution: {
          labels: ['None', 'Mild', 'Moderate', 'Severe'],
          datasets: [{
            data: [65, 25, 8, 2],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 0, 0, 0.6)'
            ]
          }]
        },
        adherenceRates: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Adherence Rate (%)',
            data: [95, 88, 82, 78],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        }
      };

      setDrugData(mockData);

      // Uncomment when API endpoint is ready:
      /*
      const response = await api.getDrugAuditReport(filters);
      if (response.data.success) {
        setDrugData(response.data.data);
      } else {
        setDrugData(mockData);
      }
      */
    } catch (error) {
      console.error('Error fetching drug audit data:', error);
      // Fallback to empty safe structure
      setDrugData({
        medicationEffectiveness: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] },
        timelineTrends: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], borderColor: 'rgba(128, 128, 128, 1)' }] },
        sideEffectDistribution: { labels: ['No Data'], datasets: [{ data: [100], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] },
        adherenceRates: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'IOP Reduction Over Time (mmHg)'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'IOP (mmHg)'
        }
      }
    }
  };

  // Safe chart rendering with loading states and error handling
  const renderChart = (ChartComponent, data, options = chartOptions) => {
    if (loading) {
      return (
        <div className="chart-loading" style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading chart data...</div>
        </div>
      );
    }
    
    if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
      return (
        <div className="chart-no-data" style={{ textAlign: 'center', padding: '20px' }}>
          <div>No data available</div>
        </div>
      );
    }
    
    return <ChartComponent data={data} options={options} />;
  };

  if (loading) {
    return <div className="loading-spinner">Loading drug audit data...</div>;
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>Drug Audit Report</h1>
        <p>Analyze medication effectiveness and patient outcomes across eye tests</p>
      </div>

      {/* Filters Section */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Medication:</label>
          <select name="medication" value={filters.medication} onChange={handleFilterChange}>
            <option value="">All Medications</option>
            <option value="latanoprost">Latanoprost</option>
            <option value="timolol">Timolol</option>
            <option value="brimonidine">Brimonidine</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Test Type:</label>
          <select name="testType" value={filters.testType} onChange={handleFilterChange}>
            <option value="">All Tests</option>
            <option value="tonometry">Tonometry</option>
            <option value="visual_field">Visual Field</option>
            <option value="oct">OCT</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Medications</h3>
          <div className="metric-value">24</div>
          <div className="metric-change positive">+3 this month</div>
        </div>
        <div className="summary-card">
          <h3>Active Treatments</h3>
          <div className="metric-value">156</div>
          <div className="metric-change positive">+12 this month</div>
        </div>
        <div className="summary-card">
          <h3>Avg Improvement</h3>
          <div className="metric-value">18.5%</div>
          <div className="metric-change positive">+2.3% vs last period</div>
        </div>
        <div className="summary-card">
          <h3>Adherence Rate</h3>
          <div className="metric-value">82%</div>
          <div className="metric-change negative">-1.5% vs last period</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Medication Effectiveness */}
        <div className="chart-container">
          <h3>Medication Effectiveness (IOP Reduction)</h3>
          {renderChart(Bar, drugData.medicationEffectiveness, chartOptions)}
        </div>

        {/* Timeline Trends */}
        <div className="chart-container full-width">
          <h3>Treatment Progress Over Time</h3>
          {renderChart(Line, drugData.timelineTrends, lineChartOptions)}
        </div>

        {/* Side Effects Distribution */}
        <div className="chart-container">
          <h3>Side Effects Distribution</h3>
          {renderChart(Pie, drugData.sideEffectDistribution, chartOptions)}
        </div>

        {/* Adherence Rates */}
        <div className="chart-container">
          <h3>Patient Adherence Rates</h3>
          {renderChart(Bar, drugData.adherenceRates, chartOptions)}
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="detailed-analysis">
        <h3>Detailed Medication Analysis</h3>
        <div className="analysis-table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Patients Treated</th>
                <th>Avg IOP Reduction</th>
                <th>Success Rate</th>
                <th>Side Effects</th>
                <th>Adherence</th>
                <th>Cost Effectiveness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Latanoprost</td>
                <td>45</td>
                <td>4.2 mmHg (25%)</td>
                <td>89%</td>
                <td>12%</td>
                <td>85%</td>
                <td>High</td>
              </tr>
              <tr>
                <td>Timolol</td>
                <td>38</td>
                <td>3.1 mmHg (18%)</td>
                <td>76%</td>
                <td>18%</td>
                <td>78%</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Brimonidine</td>
                <td>32</td>
                <td>3.8 mmHg (22%)</td>
                <td>81%</td>
                <td>15%</td>
                <td>80%</td>
                <td>High</td>
              </tr>
              <tr>
                <td>Dorzolamide</td>
                <td>28</td>
                <td>2.5 mmHg (15%)</td>
                <td>68%</td>
                <td>22%</td>
                <td>72%</td>
                <td>Low</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <button className="export-btn">
          <i className="fas fa-download"></i>
          Export PDF Report
        </button>
        <button className="export-btn">
          <i className="fas fa-file-excel"></i>
          Export Excel Data
        </button>
        <button className="export-btn">
          <i className="fas fa-print"></i>
          Print Report
        </button>
      </div>
    </div>
  );
};

export default DrugAuditReportPage;