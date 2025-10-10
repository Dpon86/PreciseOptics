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
  const [visitsData, setVisitsData] = useState({
    dailyVisits: { labels: [], datasets: [] },
    visitsByType: { labels: [], datasets: [] },
    monthlyTrends: { labels: [], datasets: [] },
    departmentVisits: { labels: [], datasets: [] },
    waitTimes: { labels: [], datasets: [] }
  });
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
      
      // Use mock data for now until API endpoint is ready
      const mockData = {
        dailyVisits: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Visits',
            data: [45, 52, 38, 67, 73, 28, 15],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
          }]
        },
        visitsByType: {
          labels: ['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Screening'],
          datasets: [{
            label: 'Visits by Type',
            data: [156, 89, 23, 45, 67],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ]
          }]
        },
        monthlyTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Visits',
            data: [1250, 1180, 1420, 1380, 1560, 1480],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4
          }]
        },
        departmentVisits: {
          labels: ['Ophthalmology', 'Optometry', 'Surgery', 'Emergency', 'Pediatric'],
          datasets: [{
            label: 'Department Visits',
            data: [320, 245, 180, 95, 140],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        waitTimes: {
          labels: ['0-15 min', '15-30 min', '30-45 min', '45-60 min', '60+ min'],
          datasets: [{
            data: [35, 45, 15, 3, 2],
            backgroundColor: [
              'rgba(34, 197, 94, 0.6)',
              'rgba(234, 179, 8, 0.6)',
              'rgba(249, 115, 22, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(147, 51, 234, 0.6)'
            ]
          }]
        }
      };

      setVisitsData(mockData);

      // TODO: Uncomment when API endpoint is ready
      /*
      const response = await api.getPatientVisitsReport(filters);
      if (response.data.success) {
        setVisitsData(response.data.data);
      } else {
        setVisitsData(mockData);
      }
      */
    } catch (error) {
      console.error('Error fetching visits data:', error);
      // Fallback to safe empty structure
      setVisitsData({
        dailyVisits: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], borderColor: 'rgba(128, 128, 128, 1)' }] },
        visitsByType: { labels: ['No Data'], datasets: [{ data: [100], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] },
        monthlyTrends: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], borderColor: 'rgba(128, 128, 128, 1)' }] },
        departmentVisits: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] },
        waitTimes: { labels: ['No Data'], datasets: [{ data: [100], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] }
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
          {renderChart(Line, visitsData.dailyVisits, {
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
          })}
        </div>

        {/* Visit Types Distribution */}
        <div className="chart-container">
          <h3>Visits by Type</h3>
          {renderChart(Doughnut, visitsData.visitsByType, chartOptions)}
        </div>

        {/* Department Visits */}
        <div className="chart-container">
          <h3>Visits by Department</h3>
          {renderChart(Bar, visitsData.departmentVisits, chartOptions)}
        </div>

        {/* Monthly Trends */}
        <div className="chart-container full-width">
          <h3>Monthly Visits Comparison</h3>
          {renderChart(Line, visitsData.monthlyTrends, {
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
          })}
        </div>

        {/* Wait Times */}
        <div className="chart-container">
          <h3>Wait Time Distribution</h3>
          {renderChart(Doughnut, visitsData.waitTimes, chartOptions)}
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