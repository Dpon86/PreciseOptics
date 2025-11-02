import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './TreatmentEffectivenessReport.css';

const TreatmentEffectivenessReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [treatmentType, setTreatmentType] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [testType, setTestType] = useState('visual_acuity');
  const [months, setMonths] = useState(12);
  const [includeBatch, setIncludeBatch] = useState(true);
  const [viewMode, setViewMode] = useState('treatment'); // 'treatment' or 'medication'
  
  // Data states
  const [timelineData, setTimelineData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Available options
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [medications, setMedications] = useState([]);
  
  const testTypes = [
    { value: 'visual_acuity', label: 'Visual Acuity' },
    { value: 'glaucoma', label: 'Glaucoma (IOP)' },
    { value: 'oct', label: 'OCT Scan' },
    { value: 'diabetic_retinopathy', label: 'Diabetic Retinopathy' },
    { value: 'visual_field', label: 'Visual Field' },
    { value: 'refraction', label: 'Refraction' }
  ];

  useEffect(() => {
    fetchAvailableOptions();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      // Fetch available treatment types and medications
      const treatmentsRes = await api.getTreatments();
      const medicationsRes = await api.getMedications();
      
      const uniqueTreatments = [...new Set(
        (treatmentsRes.data.results || treatmentsRes.data)
          .map(t => t.treatment_type_name)
          .filter(Boolean)
      )];
      
      const uniqueMeds = (medicationsRes.data.results || medicationsRes.data)
        .map(m => m.name);
      
      setTreatmentTypes(uniqueTreatments);
      setMedications(uniqueMeds);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (viewMode === 'treatment') {
        response = await fetch(
          `http://127.0.0.1:8000/api/reports/treatment-effectiveness-timeline/?` +
          `treatment_type=${treatmentType}&test_type=${testType}&months=${months}`
        );
      } else {
        response = await fetch(
          `http://127.0.0.1:8000/api/reports/medication-effectiveness-timeline/?` +
          `medication=${medicationName}&test_type=${testType}&months=${months}&include_batch=${includeBatch}`
        );
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTimelineData(data.data.timelines);
        if (data.data.timelines.length > 0) {
          setSelectedPatient(data.data.timelines[0]);
        }
      } else {
        setError(data.error || 'Failed to load timeline data');
      }
    } catch (err) {
      setError('Error fetching timeline data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (viewMode === 'treatment') {
        // Compare all available treatment types
        response = await fetch(
          `http://127.0.0.1:8000/api/reports/compare-treatments/?` +
          `treatment_types=${treatmentTypes.join(',')}&test_type=${testType}&months=${months}`
        );
      } else {
        // Compare all available medications
        response = await fetch(
          `http://127.0.0.1:8000/api/reports/compare-medications/?` +
          `medications=${medications.join(',')}&test_type=${testType}&months=${months}`
        );
      }
      
      const data = await response.json();
      
      if (data.success) {
        setComparisonData(data.data.comparison);
      } else {
        setError(data.error || 'Failed to load comparison data');
      }
    } catch (err) {
      setError('Error fetching comparison data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for selected patient timeline
  const getChartData = () => {
    if (!selectedPatient || !selectedPatient.test_timeline) return [];
    
    return selectedPatient.test_timeline.map(test => {
      const dataPoint = {
        weeks: test.weeks_from_onset,
        months: test.months_from_onset,
        date: new Date(test.test_date).toLocaleDateString(),
      };
      
      // Add test-specific metrics
      if (testType === 'visual_acuity') {
        dataPoint.right_eye = test.va_right;
        dataPoint.left_eye = test.va_left;
      } else if (testType === 'glaucoma') {
        dataPoint.iop_right = test.iop_right;
        dataPoint.iop_left = test.iop_left;
      } else if (testType === 'oct') {
        dataPoint.thickness_right = test.retinal_thickness_right;
        dataPoint.thickness_left = test.retinal_thickness_left;
      }
      
      return dataPoint;
    });
  };

  const getMetricLabel = () => {
    if (testType === 'visual_acuity') return 'Visual Acuity';
    if (testType === 'glaucoma') return 'IOP (mmHg)';
    if (testType === 'oct') return 'Retinal Thickness (μm)';
    return 'Metric';
  };

  return (
    <div className="page-container treatment-effectiveness-report">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/reports')} className="btn btn-secondary">
            ← Back to Reports
          </button>
          <h1>Treatment & Medication Effectiveness Analysis</h1>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`toggle-btn ${viewMode === 'treatment' ? 'active' : ''}`}
          onClick={() => setViewMode('treatment')}
        >
          📊 Treatment Analysis
        </button>
        <button
          className={`toggle-btn ${viewMode === 'medication' ? 'active' : ''}`}
          onClick={() => setViewMode('medication')}
        >
          💊 Medication Analysis
        </button>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <h3>Filters</h3>
        <div className="filter-grid">
          {viewMode === 'treatment' ? (
            <div className="filter-item">
              <label>Treatment Type</label>
              <select value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}>
                <option value="">All Treatments</option>
                {treatmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="filter-item">
                <label>Medication</label>
                <select value={medicationName} onChange={(e) => setMedicationName(e.target.value)}>
                  <option value="">All Medications</option>
                  {medications.map(med => (
                    <option key={med} value={med}>{med}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={includeBatch}
                    onChange={(e) => setIncludeBatch(e.target.checked)}
                  />
                  Include Batch Information
                </label>
              </div>
            </>
          )}
          
          <div className="filter-item">
            <label>Test Type</label>
            <select value={testType} onChange={(e) => setTestType(e.target.value)}>
              {testTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Tracking Period (Months)</label>
            <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))}>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={fetchTimelineData} className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Generate Timeline Report'}
          </button>
          <button onClick={fetchComparisonData} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Compare All'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Comparison Chart */}
      {comparisonData.length > 0 && (
        <div className="report-section">
          <h2>Effectiveness Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewMode === 'treatment' ? 'treatment_type' : 'medication'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="improvement_rate" fill="#4caf50" name="Improvement %" />
              <Bar dataKey="deterioration_rate" fill="#f44336" name="Deterioration %" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>{viewMode === 'treatment' ? 'Treatment Type' : 'Medication'}</th>
                  <th>Patients</th>
                  <th>Improved</th>
                  <th>Stable</th>
                  <th>Deteriorated</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index}>
                    <td>{item[viewMode === 'treatment' ? 'treatment_type' : 'medication']}</td>
                    <td>{item.total_patients}</td>
                    <td className="improvement">{item.improvements}</td>
                    <td>{item.stable}</td>
                    <td className="deterioration">{item.deteriorations}</td>
                    <td><strong>{item.improvement_rate}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline Data */}
      {timelineData.length > 0 && (
        <>
          {/* Patient Selector */}
          <div className="report-section">
            <h2>Patient Timelines ({timelineData.length} patients)</h2>
            <div className="patient-selector">
              {timelineData.map((patient, index) => (
                <button
                  key={index}
                  className={`patient-btn ${selectedPatient === patient ? 'active' : ''}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  {patient.patient_name} ({patient.patient_mrn})
                </button>
              ))}
            </div>
          </div>

          {/* Selected Patient Timeline Chart */}
          {selectedPatient && (
            <div className="report-section">
              <h2>
                {selectedPatient.patient_name} - {viewMode === 'treatment' ? selectedPatient.treatment_type : selectedPatient.medication}
              </h2>
              <div className="timeline-info">
                <div className="info-card">
                  <strong>First {viewMode === 'treatment' ? 'Treatment' : 'Prescription'}:</strong>
                  <span>{new Date(viewMode === 'treatment' ? selectedPatient.first_treatment_date : selectedPatient.first_prescription_date).toLocaleDateString()}</span>
                </div>
                <div className="info-card">
                  <strong>Total {viewMode === 'treatment' ? 'Treatments' : 'Prescriptions'}:</strong>
                  <span>{viewMode === 'treatment' ? selectedPatient.total_treatments : selectedPatient.total_prescriptions}</span>
                </div>
                <div className="info-card">
                  <strong>Tests Tracked:</strong>
                  <span>{selectedPatient.test_timeline.length}</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weeks" label={{ value: 'Weeks from Onset', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {testType === 'visual_acuity' && (
                    <>
                      <Line type="monotone" dataKey="right_eye" stroke="#2196f3" name="Right Eye" strokeWidth={2} />
                      <Line type="monotone" dataKey="left_eye" stroke="#ff9800" name="Left Eye" strokeWidth={2} />
                    </>
                  )}
                  {testType === 'glaucoma' && (
                    <>
                      <Line type="monotone" dataKey="iop_right" stroke="#2196f3" name="IOP Right" strokeWidth={2} />
                      <Line type="monotone" dataKey="iop_left" stroke="#ff9800" name="IOP Left" strokeWidth={2} />
                    </>
                  )}
                  {testType === 'oct' && (
                    <>
                      <Line type="monotone" dataKey="thickness_right" stroke="#2196f3" name="Thickness Right" strokeWidth={2} />
                      <Line type="monotone" dataKey="thickness_left" stroke="#ff9800" name="Thickness Left" strokeWidth={2} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>

              {/* Timeline Table */}
              <div className="timeline-table">
                <h3>Detailed Timeline</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Test Date</th>
                      <th>Weeks from Onset</th>
                      <th>Months from Onset</th>
                      <th>Test Type</th>
                      <th>Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.test_timeline.map((test, index) => (
                      <tr key={index}>
                        <td>{new Date(test.test_date).toLocaleDateString()}</td>
                        <td>{test.weeks_from_onset}</td>
                        <td>{test.months_from_onset}</td>
                        <td>{test.test_type}</td>
                        <td>
                          {testType === 'visual_acuity' && `R: ${test.va_right}, L: ${test.va_left}`}
                          {testType === 'glaucoma' && `IOP R: ${test.iop_right}, L: ${test.iop_left}`}
                          {testType === 'oct' && `Thickness R: ${test.retinal_thickness_right}, L: ${test.retinal_thickness_left}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && timelineData.length === 0 && comparisonData.length === 0 && (
        <div className="empty-state">
          <h3>No Data Available</h3>
          <p>Select filters and click "Generate Timeline Report" or "Compare All" to view effectiveness analysis.</p>
        </div>
      )}
    </div>
  );
};

export default TreatmentEffectivenessReport;
