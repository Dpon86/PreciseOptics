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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

const PatientVisitsReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [visitsData, setVisitsData] = useState({});
  const [filters, setFilters] = useState({
    dateRange: '30',
    department: '',
    visitType: '',
    doctor: ''
  });

  useEffect(() => {
    fetchVisitsData();
  }, [filters]);

  const fetchVisitsData = async () => {
    try {
      setLoading(true);
      // Fetch real data from backend
      const response = await api.getPatientVisitsReport(filters);
      
      if (response.data.success) {
        setVisitsData(response.data.data);
      } else {
        console.error('Error in response:', response.data.error);
        // Fallback to empty data if API fails
        setVisitsData({
          dailyVisits: { labels: [], datasets: [] },
          visitsByType: { labels: [], datasets: [] },
          monthlyTrends: { labels: [], datasets: [] },
          departmentVisits: { labels: [], datasets: [] },
          waitTimes: { labels: [], datasets: [] }
        });
      }
    } catch (error) {
      console.error('Error fetching visits data:', error);
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

  if (loading) {
    return <div className="loading-spinner">Loading patient visits data...</div>;
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>Patient Visits Report</h1>
        <p>Comprehensive analysis of patient visits, trends, and department performance</p>
      </div>

      {/* Filters Section */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Department:</label>
          <select name="department" value={filters.department} onChange={handleFilterChange}>
            <option value="">All Departments</option>
            <option value="ophthalmology">Ophthalmology</option>
            <option value="optometry">Optometry</option>
            <option value="surgery">Surgery</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Visit Type:</label>
          <select name="visitType" value={filters.visitType} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="surgery">Surgery</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Visits</h3>
          <div className="metric-value">1,247</div>
          <div className="metric-change positive">+8.5% vs last month</div>
        </div>
        <div className="summary-card">
          <h3>Daily Average</h3>
          <div className="metric-value">42</div>
          <div className="metric-change positive">+3.2% vs last month</div>
        </div>
        <div className="summary-card">
          <h3>Avg Wait Time</h3>
          <div className="metric-value">28 min</div>
          <div className="metric-change negative">+2 min vs last month</div>
        </div>
        <div className="summary-card">
          <h3>No-Show Rate</h3>
          <div className="metric-value">7.2%</div>
          <div className="metric-change positive">-1.1% vs last month</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Daily Visits Trend */}
        <div className="chart-container full-width">
          <h3>Daily Visits Pattern</h3>
          <Line data={visitsData.dailyVisits} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Visits'
                }
              }
            }
          }} />
        </div>

        {/* Visit Types Distribution */}
        <div className="chart-container">
          <h3>Visits by Type</h3>
          <Doughnut data={visitsData.visitsByType} options={chartOptions} />
        </div>

        {/* Department Visits */}
        <div className="chart-container">
          <h3>Visits by Department</h3>
          <Bar data={visitsData.departmentVisits} options={chartOptions} />
        </div>

        {/* Monthly Trends */}
        <div className="chart-container full-width">
          <h3>Monthly Visits Comparison</h3>
          <Line data={visitsData.monthlyTrends} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Total Visits'
                }
              }
            }
          }} />
        </div>

        {/* Wait Times */}
        <div className="chart-container">
          <h3>Wait Time Distribution</h3>
          <Doughnut data={visitsData.waitTimes} options={chartOptions} />
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="detailed-analysis">
        <h3>Department Performance Analysis</h3>
        <div className="analysis-table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Visits</th>
                <th>Avg Wait Time</th>
                <th>Patient Satisfaction</th>
                <th>Revenue</th>
                <th>Capacity Utilization</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ophthalmology</td>
                <td>485</td>
                <td>32 min</td>
                <td>4.6/5</td>
                <td>£24,250</td>
                <td>87%</td>
                <td className="trend positive">↗ +12%</td>
              </tr>
              <tr>
                <td>Optometry</td>
                <td>342</td>
                <td>18 min</td>
                <td>4.8/5</td>
                <td>£15,840</td>
                <td>92%</td>
                <td className="trend positive">↗ +8%</td>
              </tr>
              <tr>
                <td>Surgery</td>
                <td>128</td>
                <td>45 min</td>
                <td>4.7/5</td>
                <td>£32,100</td>
                <td>76%</td>
                <td className="trend positive">↗ +15%</td>
              </tr>
              <tr>
                <td>Emergency</td>
                <td>89</td>
                <td>25 min</td>
                <td>4.4/5</td>
                <td>£8,920</td>
                <td>68%</td>
                <td className="trend negative">↘ -5%</td>
              </tr>
              <tr>
                <td>Pediatric</td>
                <td>78</td>
                <td>35 min</td>
                <td>4.5/5</td>
                <td>£6,240</td>
                <td>82%</td>
                <td className="trend positive">↗ +3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="peak-hours-analysis">
        <h3>Peak Hours Analysis</h3>
        <div className="peak-hours-grid">
          <div className="peak-hour-card">
            <h4>Busiest Day</h4>
            <div className="peak-value">Thursday</div>
            <div className="peak-detail">Avg 67 visits</div>
          </div>
          <div className="peak-hour-card">
            <h4>Peak Time</h4>
            <div className="peak-value">10:00 AM</div>
            <div className="peak-detail">25% of daily visits</div>
          </div>
          <div className="peak-hour-card">
            <h4>Quietest Day</h4>
            <div className="peak-value">Sunday</div>
            <div className="peak-detail">Avg 28 visits</div>
          </div>
          <div className="peak-hour-card">
            <h4>Low Time</h4>
            <div className="peak-value">2:00 PM</div>
            <div className="peak-detail">8% of daily visits</div>
          </div>
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
          <i className="fas fa-calendar-alt"></i>
          Schedule Report
        </button>
      </div>
    </div>
  );
};

export default PatientVisitsReportPage;