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
  RadarController,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Radar, Scatter } from 'react-chartjs-2';
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
  ArcElement,
  RadarController,
  RadialLinearScale
);

const EyeTestsSummaryReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [eyeTestData, setEyeTestData] = useState({
    iopTrends: { labels: [], datasets: [] },
    visualAcuityProgress: { labels: [], datasets: [] },
    testFrequency: { labels: [], datasets: [] },
    medicationCorrelation: { datasets: [] },
    comprehensiveAssessment: { labels: [], datasets: [] }
  });
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '180',
    testType: '',
    medication: '',
    patientAge: '',
    showTrends: true
  });

  useEffect(() => {
    fetchEyeTestData();
  }, [filters, selectedPatient, selectedTest]);

  const fetchEyeTestData = async () => {
    try {
      setLoading(true);
      
      // Fetch actual data from API
      try {
        const response = await api.getEyeTestsSummaryReport({ ...filters, selectedPatient, selectedTest });
        if (response.data.success) {
          setEyeTestData(response.data.data);
        } else {
          // No data available - show empty state
          setEyeTestData({
            iopTrends: {
              labels: ['No Data'],
              datasets: [{
                label: 'IOP (mmHg)',
                data: [0],
                borderColor: 'rgba(128, 128, 128, 1)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)'
              }]
            },
            visualAcuityProgress: {
              labels: ['No Data'],
              datasets: [{
                label: 'No Data Available',
                data: [0],
                borderColor: 'rgba(128, 128, 128, 1)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)'
              }]
            },
            testFrequency: {
              labels: ['No Data'],
              datasets: [{
                label: 'Test Count',
                data: [0],
                backgroundColor: 'rgba(128, 128, 128, 0.6)'
              }]
            },
            medicationCorrelation: {
              datasets: [{
                label: 'No Data Available',
                data: [],
                backgroundColor: 'rgba(128, 128, 128, 0.6)'
              }]
            },
            comprehensiveAssessment: {
              labels: ['No Data'],
              datasets: [{
                label: 'No Data Available',
                data: [0],
                borderColor: 'rgba(128, 128, 128, 1)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)'
              }]
            }
          });
        }
      } catch (apiError) {
        console.log('API endpoint not available, showing empty state');
        setEyeTestData({
          iopTrends: {
            labels: ['No Data'],
            datasets: [{
              label: 'IOP (mmHg)',
              data: [0],
              borderColor: 'rgba(128, 128, 128, 1)',
              backgroundColor: 'rgba(128, 128, 128, 0.2)'
            }]
          },
          visualAcuityProgress: {
            labels: ['No Data'],
            datasets: [{
              label: 'No Data Available',
              data: [0],
              borderColor: 'rgba(128, 128, 128, 1)',
              backgroundColor: 'rgba(128, 128, 128, 0.2)'
            }]
          },
          testFrequency: {
            labels: ['No Data'],
            datasets: [{
              label: 'Test Count',
              data: [0],
              backgroundColor: 'rgba(128, 128, 128, 0.6)'
            }]
          },
          medicationCorrelation: {
            datasets: [{
              label: 'No Data Available',
              data: [],
              backgroundColor: 'rgba(128, 128, 128, 0.6)'
            }]
          },
          comprehensiveAssessment: {
            labels: ['No Data'],
            datasets: [{
              label: 'No Data Available',
              data: [0],
              borderColor: 'rgba(128, 128, 128, 1)',
              backgroundColor: 'rgba(128, 128, 128, 0.2)'
            }]
          }
        });
      }
    } catch (error) {
      console.error('Error fetching eye test data:', error);
      // Fallback to safe empty structure
      setEyeTestData({
        iopTrends: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], borderColor: 'rgba(128, 128, 128, 1)' }] },
        visualAcuityProgress: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], borderColor: 'rgba(128, 128, 128, 1)' }] },
        testFrequency: { labels: ['No Data'], datasets: [{ label: 'No Data', data: [0], backgroundColor: ['rgba(128, 128, 128, 0.8)'] }] },
        medicationCorrelation: { datasets: [{ label: 'No Data', data: [], backgroundColor: 'rgba(128, 128, 128, 0.8)' }] },
        comprehensiveAssessment: { labels: ['No Data'], datasets: [{ data: [0], backgroundColor: 'rgba(128, 128, 128, 0.8)' }] }
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

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Medication Adherence vs Treatment Effectiveness'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Medication Adherence (%)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'IOP Reduction (mmHg)'
        }
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading eye tests analysis...</div>;
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>Eye Tests Summary & Progress Analysis</h1>
        <p>Comprehensive tracking of eye test results, medication effectiveness, and patient improvement over time</p>
      </div>

      {/* Advanced Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Test Type:</label>
          <select name="testType" value={filters.testType} onChange={handleFilterChange}>
            <option value="">All Tests</option>
            <option value="tonometry">Tonometry (IOP)</option>
            <option value="visual_acuity">Visual Acuity</option>
            <option value="visual_field">Visual Field</option>
            <option value="oct">OCT Scan</option>
            <option value="refraction">Refraction</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Medication Filter:</label>
          <select name="medication" value={filters.medication} onChange={handleFilterChange}>
            <option value="">All Medications</option>
            <option value="latanoprost">Latanoprost</option>
            <option value="timolol">Timolol</option>
            <option value="brimonidine">Brimonidine</option>
            <option value="none">No Medication</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Patient Age Group:</label>
          <select name="patientAge" value={filters.patientAge} onChange={handleFilterChange}>
            <option value="">All Ages</option>
            <option value="18-30">18-30 years</option>
            <option value="31-50">31-50 years</option>
            <option value="51-70">51-70 years</option>
            <option value="70+">70+ years</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Tests Completed</h3>
          <div className="metric-value">2,847</div>
          <div className="metric-change positive">+15.2% vs last period</div>
        </div>
        <div className="summary-card">
          <h3>Patients Improving</h3>
          <div className="metric-value">82%</div>
          <div className="metric-change positive">+5.1% vs last period</div>
        </div>
        <div className="summary-card">
          <h3>Avg IOP Reduction</h3>
          <div className="metric-value">6.8 mmHg</div>
          <div className="metric-change positive">+0.9 mmHg vs last period</div>
        </div>
        <div className="summary-card">
          <h3>Treatment Success Rate</h3>
          <div className="metric-value">76%</div>
          <div className="metric-change positive">+3.2% vs last period</div>
        </div>
      </div>

      {/* Main Analysis Charts */}
      <div className="charts-grid">
        {/* IOP Trends Over Time */}
        <div className="chart-container full-width">
          <h3>IOP Progression Analysis - Medication Impact Over Time</h3>
          {renderChart(Line, eyeTestData.iopTrends, {
            ...chartOptions,
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'IOP (mmHg)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Time Period'
                }
              }
            }
          })}
        </div>

        {/* Visual Acuity Progress */}
        <div className="chart-container">
          <h3>Visual Acuity Improvement</h3>
          {renderChart(Line, eyeTestData.visualAcuityProgress, {
            ...chartOptions,
            scales: {
              y: {
                min: 0,
                max: 1,
                title: {
                  display: true,
                  text: 'Visual Acuity (Decimal)'
                }
              }
            }
          })}
        </div>

        {/* Test Frequency */}
        <div className="chart-container">
          <h3>Test Performance Frequency</h3>
          {renderChart(Bar, eyeTestData.testFrequency, chartOptions)}
        </div>

        {/* Medication Correlation */}
        <div className="chart-container">
          <h3>Medication Adherence vs Effectiveness</h3>
          {renderChart(Scatter, eyeTestData.medicationCorrelation, scatterOptions)}
        </div>

        {/* Comprehensive Assessment Radar */}
        <div className="chart-container">
          <h3>Comprehensive Patient Assessment</h3>
          {renderChart(Radar, eyeTestData.comprehensiveAssessment, {
            ...chartOptions,
            scales: {
              r: {
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 20
                }
              }
            }
          })}
        </div>
      </div>

      {/* Detailed Patient Analysis Table */}
      <div className="detailed-analysis">
        <h3>Individual Patient Progress Tracking</h3>
        <div className="analysis-table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Age</th>
                <th>Diagnosis</th>
                <th>Medication</th>
                <th>Baseline IOP</th>
                <th>Current IOP</th>
                <th>Improvement</th>
                <th>Visual Acuity Change</th>
                <th>Test Frequency</th>
                <th>Overall Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PAT001</td>
                <td>45</td>
                <td>Primary Glaucoma</td>
                <td>Latanoprost</td>
                <td>24 mmHg</td>
                <td>15 mmHg</td>
                <td className="improvement excellent">37.5%</td>
                <td>0.6 → 0.9</td>
                <td>Bi-weekly</td>
                <td className="progress excellent">Excellent</td>
              </tr>
              <tr>
                <td>PAT002</td>
                <td>62</td>
                <td>Secondary Glaucoma</td>
                <td>Timolol + Dorzolamide</td>
                <td>28 mmHg</td>
                <td>19 mmHg</td>
                <td className="improvement good">32.1%</td>
                <td>0.4 → 0.7</td>
                <td>Monthly</td>
                <td className="progress good">Good</td>
              </tr>
              <tr>
                <td>PAT003</td>
                <td>38</td>
                <td>Ocular Hypertension</td>
                <td>Brimonidine</td>
                <td>22 mmHg</td>
                <td>16 mmHg</td>
                <td className="improvement good">27.3%</td>
                <td>0.8 → 0.9</td>
                <td>Monthly</td>
                <td className="progress good">Good</td>
              </tr>
              <tr>
                <td>PAT004</td>
                <td>71</td>
                <td>Primary Glaucoma</td>
                <td>Latanoprost</td>
                <td>26 mmHg</td>
                <td>22 mmHg</td>
                <td className="improvement fair">15.4%</td>
                <td>0.3 → 0.4</td>
                <td>Bi-weekly</td>
                <td className="progress fair">Fair</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Analysis Summary */}
      <div className="trend-analysis">
        <h3>Key Findings & Trends</h3>
        <div className="findings-grid">
          <div className="finding-card positive">
            <h4>Most Effective Treatment</h4>
            <p>Latanoprost shows 35% average IOP reduction</p>
            <div className="finding-value">Best Results</div>
          </div>
          <div className="finding-card warning">
            <h4>Adherence Impact</h4>
            <p>90%+ adherence correlates with 8+ mmHg reduction</p>
            <div className="finding-value">Critical Factor</div>
          </div>
          <div className="finding-card info">
            <h4>Age Factor</h4>
            <p>Patients 50+ show slower but steady improvement</p>
            <div className="finding-value">Consider Age</div>
          </div>
          <div className="finding-card positive">
            <h4>Early Detection</h4>
            <p>Patients starting treatment early show 40% better outcomes</p>
            <div className="finding-value">Early Intervention</div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="export-section">
        <button className="export-btn primary">
          <i className="fas fa-download"></i>
          Export Comprehensive Report
        </button>
        <button className="export-btn">
          <i className="fas fa-chart-line"></i>
          Create Treatment Plan
        </button>
        <button className="export-btn">
          <i className="fas fa-bell"></i>
          Set Alerts
        </button>
        <button className="export-btn">
          <i className="fas fa-share"></i>
          Share with Team
        </button>
      </div>
    </div>
  );
};

export default EyeTestsSummaryReportPage;