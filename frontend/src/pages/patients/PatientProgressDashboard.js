import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const PatientProgressDashboard = () => {
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState({});
  const [timeRange, setTimeRange] = useState('180'); // days

  useEffect(() => {
    fetchPatientProgressData();
  }, [patientId, timeRange]);

  const fetchPatientProgressData = async () => {
    try {
      setLoading(true);
      // Fetch real data from backend
      const response = await api.getPatientProgressDashboard(patientId, { timeRange });
      
      if (response.data.success) {
        setPatientData(response.data.data);
      } else {
        console.error('Error in response:', response.data.error);
        // Fallback to empty data if API fails or patient not found
        setPatientData({
          patientInfo: {
            name: 'Patient Not Found',
            id: patientId,
            age: 'N/A',
            diagnosis: 'N/A',
            treatmentStartDate: 'N/A',
            nextAppointment: 'N/A'
          },
          iopProgress: { labels: [], datasets: [] },
          visualAcuityProgress: { labels: [], datasets: [] },
          medicationAdherence: { labels: [], datasets: [] },
          testHistory: [],
          medications: [],
          upcomingTests: []
        });
      }
    } catch (error) {
      console.error('Error fetching patient progress data:', error);
    } finally {
      setLoading(false);
    }
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
    return <div className="loading-spinner">Loading your progress data...</div>;
  }

  return (
    <div className="patient-dashboard">
      {/* Patient Header */}
      <div className="patient-header">
        <div className="patient-info">
          <h1>{patientData.patientInfo?.name}'s Progress Dashboard</h1>
          <div className="patient-details">
            <span>Patient ID: {patientData.patientInfo?.id}</span>
            <span>Age: {patientData.patientInfo?.age}</span>
            <span>Diagnosis: {patientData.patientInfo?.diagnosis}</span>
          </div>
        </div>
        <div className="next-appointment">
          <h3>Next Appointment</h3>
          <div className="appointment-date">{patientData.patientInfo?.nextAppointment}</div>
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="progress-summary">
        <div className="progress-card excellent">
          <h3>IOP Control</h3>
          <div className="progress-value">Excellent</div>
          <div className="progress-detail">Average: 14 mmHg</div>
          <div className="progress-trend">↓ 42% improvement</div>
        </div>
        <div className="progress-card good">
          <h3>Visual Acuity</h3>
          <div className="progress-value">Stable</div>
          <div className="progress-detail">20/22 both eyes</div>
          <div className="progress-trend">→ Maintained</div>
        </div>
        <div className="progress-card excellent">
          <h3>Medication Adherence</h3>
          <div className="progress-value">92%</div>
          <div className="progress-detail">Excellent compliance</div>
          <div className="progress-trend">↗ Keep it up!</div>
        </div>
        <div className="progress-card warning">
          <h3>Risk Level</h3>
          <div className="progress-value">Low</div>
          <div className="progress-detail">Well controlled</div>
          <div className="progress-trend">↓ Reduced risk</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="time-selector">
        <label>View Progress For:</label>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Progress Charts */}
      <div className="progress-charts">
        {/* IOP Progress */}
        <div className="chart-container full-width">
          <h3>Eye Pressure (IOP) Progress</h3>
          <p className="chart-description">Lower is better - Target: Below 18 mmHg</p>
          <Line data={patientData.iopProgress} options={{
            ...chartOptions,
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'IOP (mmHg)'
                },
                suggestedMin: 10,
                suggestedMax: 30
              }
            }
          }} />
        </div>

        {/* Visual Acuity Progress */}
        <div className="chart-container">
          <h3>Visual Acuity Progress</h3>
          <p className="chart-description">Higher is better - Target: Above 0.8</p>
          <Line data={patientData.visualAcuityProgress} options={{
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
          }} />
        </div>

        {/* Medication Adherence */}
        <div className="chart-container">
          <h3>Medication Adherence Pattern</h3>
          <p className="chart-description">Your consistency in taking medications</p>
          <Doughnut data={patientData.medicationAdherence} options={chartOptions} />
        </div>
      </div>

      {/* Current Medications */}
      <div className="medications-section">
        <h3>Current Medications</h3>
        <div className="medications-list">
          {patientData.medications?.map((med, index) => (
            <div key={index} className="medication-card">
              <div className="medication-info">
                <h4>{med.name}</h4>
                <p><strong>Dosage:</strong> {med.dosage}</p>
                <p><strong>Started:</strong> {med.startDate}</p>
                <p><strong>Side Effects:</strong> {med.sideEffects}</p>
              </div>
              <div className="adherence-badge">
                <div className="adherence-score">{med.adherence}%</div>
                <div className="adherence-label">Adherence</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Test Results */}
      <div className="test-history-section">
        <h3>Recent Test Results</h3>
        <div className="test-history-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Test Type</th>
                <th>Right Eye</th>
                <th>Left Eye</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {patientData.testHistory?.map((test, index) => (
                <tr key={index}>
                  <td>{test.date}</td>
                  <td>{test.test}</td>
                  <td>{test.rightEye}</td>
                  <td>{test.leftEye}</td>
                  <td>{test.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="upcoming-section">
        <h3>Upcoming Tests & Appointments</h3>
        <div className="upcoming-list">
          {patientData.upcomingTests?.map((test, index) => (
            <div key={index} className={`upcoming-item ${test.importance.toLowerCase()}`}>
              <div className="test-info">
                <h4>{test.test}</h4>
                <p>{test.date}</p>
              </div>
              <div className={`importance-badge ${test.importance.toLowerCase()}`}>
                {test.importance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Actions */}
      <div className="patient-actions">
        <button className="action-btn primary">
          <i className="fas fa-calendar-plus"></i>
          Book Appointment
        </button>
        <button className="action-btn">
          <i className="fas fa-pills"></i>
          Log Medication
        </button>
        <button className="action-btn">
          <i className="fas fa-download"></i>
          Download Report
        </button>
        <button className="action-btn">
          <i className="fas fa-question-circle"></i>
          Ask Question
        </button>
      </div>

      {/* Health Tips */}
      <div className="health-tips">
        <h3>Personalized Health Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <i className="fas fa-eye"></i>
            <h4>Eye Care</h4>
            <p>Continue your daily eye drops as prescribed. Your IOP control is excellent!</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-clock"></i>
            <h4>Consistency</h4>
            <p>Take your medications at the same time each day for best results.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-chart-line"></i>
            <h4>Progress</h4>
            <p>Your pressure has improved by 42% since starting treatment. Great work!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProgressDashboard;