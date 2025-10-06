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
  const [drugData, setDrugData] = useState({});
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
      // Fetch real data from backend
      const response = await api.getDrugAuditReport(filters);
      
      if (response.data.success) {
        setDrugData(response.data.data);
      } else {
        console.error('Error in response:', response.data.error);
        // Fallback to mock data if API fails
        setDrugData({
          medicationEffectiveness: {
            labels: ['No Data'],
            datasets: [{
              label: 'Average IOP Improvement (%)',
              data: [0],
              backgroundColor: ['rgba(128, 128, 128, 0.8)']
            }]
          },
          timelineTrends: { labels: [], datasets: [] },
          sideEffectDistribution: { labels: [], datasets: [] },
          adherenceRates: { labels: [], datasets: [] }
        });
      }
    } catch (error) {
      console.error('Error fetching drug audit data:', error);
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
          <Bar data={drugData.medicationEffectiveness} options={chartOptions} />
        </div>

        {/* Timeline Trends */}
        <div className="chart-container full-width">
          <h3>Treatment Progress Over Time</h3>
          <Line data={drugData.timelineTrends} options={lineChartOptions} />
        </div>

        {/* Side Effects Distribution */}
        <div className="chart-container">
          <h3>Side Effects Distribution</h3>
          <Pie data={drugData.sideEffectDistribution} options={chartOptions} />
        </div>

        {/* Adherence Rates */}
        <div className="chart-container">
          <h3>Patient Adherence Rates</h3>
          <Bar data={drugData.adherenceRates} options={chartOptions} />
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