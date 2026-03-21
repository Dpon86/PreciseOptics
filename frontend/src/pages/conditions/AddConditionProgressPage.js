import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AddConditionProgressPage.css';

const AddConditionProgressPage = () => {
  const { id } = useParams(); // patientCondition id
  const navigate = useNavigate();
  
  const [conditionInfo, setConditionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    visual_acuity: '',
    intraocular_pressure: '',
    severity_progression: '',
    clinical_findings: '',
    treatment_response: '',
    recommended_actions: '',
    measurements: {}
  });

  const [measurementInputs, setMeasurementInputs] = useState([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    fetchConditionInfo();
  }, [id]);

  const fetchConditionInfo = async () => {
    try {
      const response = await api.get(`/api/conditions/patient-conditions/${id}/`);
      setConditionInfo(response.data);
      
      // Pre-fill severity if available
      if (response.data.severity) {
        setFormData(prev => ({
          ...prev,
          severity_progression: response.data.severity
        }));
      }
    } catch (err) {
      console.error('Error fetching condition info:', err);
      setError('Failed to load condition details');
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

    try {
      setLoading(true);
      setError('');

      // Build measurements object
      const measurements = {};
      measurementInputs.forEach(input => {
        if (input.key && input.value) {
          measurements[input.key] = input.value;
        }
      });

      const payload = {
        ...formData,
        patient_condition: id,
        measurements: measurements
      };

      await api.post('conditions/progress', payload);
      
      alert('Progress recorded successfully!');
      navigate(`/patient-conditions/${id}`);
      
    } catch (err) {
      console.error('Error recording progress:', err);
      setError(err.response?.data?.detail || 'Failed to record progress');
      setLoading(false);
    }
  };

  if (!conditionInfo) {
    return (
      <div className="add-condition-progress-page">
        <div className="loading-spinner">Loading condition details...</div>
      </div>
    );
  }

  return (
    <div className="add-condition-progress-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Record Progress Assessment</h1>
      </div>

      <div className="condition-banner">
        <div className="banner-content">
          <h3>{conditionInfo.condition_name}</h3>
          <p>{conditionInfo.patient_name}</p>
        </div>
        <div className="banner-badges">
          <span className="severity-badge" style={{
            backgroundColor: getSeverityColor(conditionInfo.severity)
          }}>
            {conditionInfo.severity.replace('_', ' ')}
          </span>
          <span className="eye-badge">
            {conditionInfo.eye_affected === 'both' && '👁️👁️ Both Eyes'}
            {conditionInfo.eye_affected === 'left' && '👁️ Left Eye'}
            {conditionInfo.eye_affected === 'right' && '👁️ Right Eye'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="progress-form">
        {/* Assessment Date */}
        <div className="form-section">
          <h3>Assessment Information</h3>
          
          <div className="form-group">
            <label>Assessment Date *</label>
            <input
              type="date"
              name="assessment_date"
              value={formData.assessment_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Clinical Measurements */}
        <div className="form-section">
          <h3>Clinical Measurements</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Visual Acuity</label>
              <input
                type="text"
                name="visual_acuity"
                value={formData.visual_acuity}
                onChange={handleInputChange}
                placeholder="e.g., 20/40, 6/12, etc."
              />
              <span className="field-hint">Snellen notation or equivalent</span>
            </div>

            <div className="form-group">
              <label>Intraocular Pressure (IOP)</label>
              <input
                type="text"
                name="intraocular_pressure"
                value={formData.intraocular_pressure}
                onChange={handleInputChange}
                placeholder="e.g., 18 mmHg"
              />
              <span className="field-hint">Include units (mmHg)</span>
            </div>

            <div className="form-group full-width">
              <label>Severity Progression</label>
              <select
                name="severity_progression"
                value={formData.severity_progression}
                onChange={handleInputChange}
              >
                <option value="">Select severity...</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="very_severe">Very Severe</option>
              </select>
              <span className="field-hint">
                Current assessment: {conditionInfo.severity.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Measurements */}
        <div className="form-section">
          <h3>Additional Measurements</h3>
          <p className="section-description">
            Add any other relevant measurements or test results
          </p>
          
          {measurementInputs.map((input, index) => (
            <div key={index} className="measurement-row">
              <input
                type="text"
                placeholder="Measurement name (e.g., Cup-to-Disc Ratio)"
                value={input.key}
                onChange={(e) => handleMeasurementChange(index, 'key', e.target.value)}
                className="measurement-key"
              />
              <input
                type="text"
                placeholder="Value (e.g., 0.7)"
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

        {/* Clinical Assessment */}
        <div className="form-section">
          <h3>Clinical Assessment</h3>
          
          <div className="form-group">
            <label>Clinical Findings</label>
            <textarea
              name="clinical_findings"
              value={formData.clinical_findings}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe clinical findings from examination..."
            />
          </div>

          <div className="form-group">
            <label>Treatment Response</label>
            <textarea
              name="treatment_response"
              value={formData.treatment_response}
              onChange={handleInputChange}
              rows="3"
              placeholder="How is the patient responding to current treatment?"
            />
          </div>

          <div className="form-group">
            <label>Recommended Actions</label>
            <textarea
              name="recommended_actions"
              value={formData.recommended_actions}
              onChange={handleInputChange}
              rows="3"
              placeholder="Next steps, treatment modifications, follow-up schedule..."
            />
          </div>
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
            {loading ? 'Saving...' : 'Record Progress'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function
const getSeverityColor = (severity) => {
  const colorMap = {
    'mild': '#27ae60',
    'moderate': '#f39c12',
    'severe': '#e67e22',
    'very_severe': '#e74c3c'
  };
  return colorMap[severity] || '#95a5a6';
};

export default AddConditionProgressPage;
