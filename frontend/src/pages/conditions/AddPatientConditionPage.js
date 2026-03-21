import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AddPatientConditionPage.css';

const AddPatientConditionPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [allConditions, setAllConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    condition: '',
    diagnosis_date: new Date().toISOString().split('T')[0],
    severity: 'moderate',
    eye_affected: 'both',
    current_status: 'newly_diagnosed',
    diagnosis_notes: '',
    treatment_plan: '',
    medications_prescribed: '',
    next_assessment_date: '',
    initial_measurements: {}
  });

  const [measurementInputs, setMeasurementInputs] = useState([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    fetchPatient();
    fetchAllConditions();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/api/patients/${patientId}/`);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to load patient details');
    }
  };

  const fetchAllConditions = async () => {
    try {
      const response = await api.get('conditions');
      const data = response.data.results || response.data;
      setAllConditions(data.filter(c => c.is_active));
    } catch (err) {
      console.error('Error fetching conditions:', err);
      setError('Failed to load conditions');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasurementChange = (index, field, value) => {
    const newInputs = [...measurementInputs];
    newInputs[index][field] = value;
    setMeasurementInputs(newInputs);
  };

  const addMeasurementField = () => {
    setMeasurementInputs([...measurementInputs, { key: '', value: '' }]);
  };

  const removeMeasurementField = (index) => {
    const newInputs = measurementInputs.filter((_, i) => i !== index);
    setMeasurementInputs(newInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.condition) {
      alert('Please select a condition');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build initial measurements object
      const measurements = {};
      measurementInputs.forEach(input => {
        if (input.key && input.value) {
          measurements[input.key] = input.value;
        }
      });

      const payload = {
        ...formData,
        patient: patientId,
        initial_measurements: measurements
      };

      await api.post('conditions/patient-conditions', payload);
      
      alert('Condition assigned successfully!');
      navigate(`/patients/${patientId}/conditions`);
      
    } catch (err) {
      console.error('Error assigning condition:', err);
      setError(err.response?.data?.detail || 'Failed to assign condition');
      setLoading(false);
    }
  };

  const filteredConditions = allConditions.filter(condition =>
    condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condition.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!patient) {
    return (
      <div className="add-patient-condition-page">
        <div className="loading-spinner">Loading patient details...</div>
      </div>
    );
  }

  return (
    <div className="add-patient-condition-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Assign Condition to Patient</h1>
      </div>

      <div className="patient-banner">
        <h3>{patient.first_name} {patient.last_name}</h3>
        <span className="patient-id">ID: {patient.patient_id}</span>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="condition-form">
        {/* Condition Selection */}
        <div className="form-section">
          <h3>Select Condition</h3>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search conditions by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="conditions-grid">
            {filteredConditions.map(condition => (
              <div
                key={condition.id}
                className={`condition-option ${formData.condition === condition.id ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, condition: condition.id }))}
              >
                <div className="condition-header">
                  <h4>{condition.name}</h4>
                  <span className="condition-code">{condition.code}</span>
                </div>
                <p className="condition-description">
                  {condition.description?.substring(0, 100)}
                  {condition.description?.length > 100 && '...'}
                </p>
                {condition.has_standard_protocol && (
                  <span className="protocol-badge">Has Protocol</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis Details */}
        <div className="form-section">
          <h3>Diagnosis Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Diagnosis Date *</label>
              <input
                type="date"
                name="diagnosis_date"
                value={formData.diagnosis_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Severity *</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                required
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="very_severe">Very Severe</option>
              </select>
            </div>

            <div className="form-group">
              <label>Eye Affected *</label>
              <select
                name="eye_affected"
                value={formData.eye_affected}
                onChange={handleInputChange}
                required
              >
                <option value="both">Both Eyes</option>
                <option value="left">Left Eye</option>
                <option value="right">Right Eye</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Status *</label>
              <select
                name="current_status"
                value={formData.current_status}
                onChange={handleInputChange}
                required
              >
                <option value="newly_diagnosed">Newly Diagnosed</option>
                <option value="active">Active</option>
                <option value="stable">Stable</option>
                <option value="progressing">Progressing</option>
                <option value="improving">Improving</option>
                <option value="managed">Managed</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Next Assessment Date</label>
              <input
                type="date"
                name="next_assessment_date"
                value={formData.next_assessment_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Diagnosis Notes</label>
            <textarea
              name="diagnosis_notes"
              value={formData.diagnosis_notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter detailed diagnosis notes..."
            />
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="form-section">
          <h3>Treatment Plan</h3>
          
          <div className="form-group">
            <label>Treatment Plan</label>
            <textarea
              name="treatment_plan"
              value={formData.treatment_plan}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe the treatment plan..."
            />
          </div>

          <div className="form-group">
            <label>Medications Prescribed</label>
            <textarea
              name="medications_prescribed"
              value={formData.medications_prescribed}
              onChange={handleInputChange}
              rows="3"
              placeholder="List medications prescribed..."
            />
          </div>
        </div>

        {/* Initial Measurements */}
        <div className="form-section">
          <h3>Initial Measurements</h3>
          <p className="section-description">
            Add any relevant initial measurements or test results (e.g., Visual Acuity, IOP, etc.)
          </p>
          
          {measurementInputs.map((input, index) => (
            <div key={index} className="measurement-row">
              <input
                type="text"
                placeholder="Measurement name (e.g., Visual Acuity)"
                value={input.key}
                onChange={(e) => handleMeasurementChange(index, 'key', e.target.value)}
                className="measurement-key"
              />
              <input
                type="text"
                placeholder="Value (e.g., 20/40)"
                value={input.value}
                onChange={(e) => handleMeasurementChange(index, 'value', e.target.value)}
                className="measurement-value"
              />
              {measurementInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeasurementField(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addMeasurementField}
            className="btn-add-measurement"
          >
            + Add Measurement
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign Condition'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientConditionPage;
