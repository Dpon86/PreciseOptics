import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddVisualFieldTestPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'visual_field',
    test_strategy: 'sita_standard',
    test_pattern: '24-2',
    fixation_target: 'central',
    stimulus_size: 'III',
    // Right Eye Results
    right_eye_reliability_fixation_losses: '',
    right_eye_reliability_false_positives: '',
    right_eye_reliability_false_negatives: '',
    right_eye_mean_deviation: '',
    right_eye_pattern_std_deviation: '',
    right_eye_visual_field_index: '',
    right_eye_test_duration: '',
    // Left Eye Results
    left_eye_reliability_fixation_losses: '',
    left_eye_reliability_false_positives: '',
    left_eye_reliability_false_negatives: '',
    left_eye_mean_deviation: '',
    left_eye_pattern_std_deviation: '',
    left_eye_visual_field_index: '',
    left_eye_test_duration: '',
    // Defect Analysis
    right_eye_defects: '',
    left_eye_defects: '',
    glaucoma_hemifield_test_right: '',
    glaucoma_hemifield_test_left: '',
    clinical_notes: '',
    recommendations: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.createVisualAcuityTest(formData);
      
      if (response.status === 201) {
        alert('Visual field test recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating visual field test:', err);
      setError(err.response?.data?.message || 'Failed to record test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Visual Field Test (Perimetry)</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="visual-field-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Test Parameters</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient" className="form-label">Patient ID *</label>
              <input
                type="text"
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="doctor" className="form-label">Doctor *</label>
              <input
                type="text"
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="test_date" className="form-label">Test Date *</label>
              <input
                type="date"
                id="test_date"
                name="test_date"
                value={formData.test_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="test_strategy" className="form-label">Test Strategy *</label>
              <select
                id="test_strategy"
                name="test_strategy"
                value={formData.test_strategy}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="sita_standard">SITA Standard</option>
                <option value="sita_fast">SITA Fast</option>
                <option value="sita_faster">SITA Faster</option>
                <option value="full_threshold">Full Threshold</option>
                <option value="fastpac">FastPac</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="test_pattern" className="form-label">Test Pattern *</label>
              <select
                id="test_pattern"
                name="test_pattern"
                value={formData.test_pattern}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="24-2">24-2</option>
                <option value="30-2">30-2</option>
                <option value="10-2">10-2</option>
                <option value="macula">Macula</option>
                <option value="peripheral">Peripheral 60</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="stimulus_size" className="form-label">Stimulus Size</label>
              <select
                id="stimulus_size"
                name="stimulus_size"
                value={formData.stimulus_size}
                onChange={handleChange}
                className="form-input"
              >
                <option value="III">Size III (Standard)</option>
                <option value="V">Size V (Large)</option>
                <option value="I">Size I (Small)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Eye Results */}
        <div className="form-section">
          <h3>Right Eye (OD) Results</h3>
          
          <div className="form-subsection">
            <h4>Reliability Indices</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_reliability_fixation_losses" className="form-label">Fixation Losses (%)</label>
                <input
                  type="number"
                  id="right_eye_reliability_fixation_losses"
                  name="right_eye_reliability_fixation_losses"
                  value={formData.right_eye_reliability_fixation_losses}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_reliability_false_positives" className="form-label">False Positives (%)</label>
                <input
                  type="number"
                  id="right_eye_reliability_false_positives"
                  name="right_eye_reliability_false_positives"
                  value={formData.right_eye_reliability_false_positives}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_reliability_false_negatives" className="form-label">False Negatives (%)</label>
                <input
                  type="number"
                  id="right_eye_reliability_false_negatives"
                  name="right_eye_reliability_false_negatives"
                  value={formData.right_eye_reliability_false_negatives}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
            </div>
          </div>
          
          <div className="form-subsection">
            <h4>Global Indices</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_mean_deviation" className="form-label">Mean Deviation (dB)</label>
                <input
                  type="number"
                  id="right_eye_mean_deviation"
                  name="right_eye_mean_deviation"
                  value={formData.right_eye_mean_deviation}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  placeholder="e.g., -2.5"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_pattern_std_deviation" className="form-label">Pattern Standard Deviation (dB)</label>
                <input
                  type="number"
                  id="right_eye_pattern_std_deviation"
                  name="right_eye_pattern_std_deviation"
                  value={formData.right_eye_pattern_std_deviation}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.1"
                  placeholder="e.g., 3.2"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_visual_field_index" className="form-label">Visual Field Index (%)</label>
                <input
                  type="number"
                  id="right_eye_visual_field_index"
                  name="right_eye_visual_field_index"
                  value={formData.right_eye_visual_field_index}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0-100%"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_test_duration" className="form-label">Test Duration (min:sec)</label>
              <input
                type="text"
                id="right_eye_test_duration"
                name="right_eye_test_duration"
                value={formData.right_eye_test_duration}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 06:45"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="glaucoma_hemifield_test_right" className="form-label">Glaucoma Hemifield Test</label>
              <select
                id="glaucoma_hemifield_test_right"
                name="glaucoma_hemifield_test_right"
                value={formData.glaucoma_hemifield_test_right}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Result</option>
                <option value="within_normal_limits">Within Normal Limits</option>
                <option value="borderline">Borderline</option>
                <option value="outside_normal_limits">Outside Normal Limits</option>
                <option value="general_reduction_sensitivity">General Reduction of Sensitivity</option>
                <option value="abnormally_high_sensitivity">Abnormally High Sensitivity</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_defects" className="form-label">Visual Field Defects</label>
            <textarea
              id="right_eye_defects"
              name="right_eye_defects"
              value={formData.right_eye_defects}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Describe scotomas, defect patterns, arcuate defects, etc..."
            />
          </div>
        </div>

        {/* Left Eye Results */}
        <div className="form-section">
          <h3>Left Eye (OS) Results</h3>
          
          <div className="form-subsection">
            <h4>Reliability Indices</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_reliability_fixation_losses" className="form-label">Fixation Losses (%)</label>
                <input
                  type="number"
                  id="left_eye_reliability_fixation_losses"
                  name="left_eye_reliability_fixation_losses"
                  value={formData.left_eye_reliability_fixation_losses}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_reliability_false_positives" className="form-label">False Positives (%)</label>
                <input
                  type="number"
                  id="left_eye_reliability_false_positives"
                  name="left_eye_reliability_false_positives"
                  value={formData.left_eye_reliability_false_positives}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_reliability_false_negatives" className="form-label">False Negatives (%)</label>
                <input
                  type="number"
                  id="left_eye_reliability_false_negatives"
                  name="left_eye_reliability_false_negatives"
                  value={formData.left_eye_reliability_false_negatives}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0-100%"
                />
              </div>
            </div>
          </div>
          
          <div className="form-subsection">
            <h4>Global Indices</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_mean_deviation" className="form-label">Mean Deviation (dB)</label>
                <input
                  type="number"
                  id="left_eye_mean_deviation"
                  name="left_eye_mean_deviation"
                  value={formData.left_eye_mean_deviation}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  placeholder="e.g., -1.8"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_pattern_std_deviation" className="form-label">Pattern Standard Deviation (dB)</label>
                <input
                  type="number"
                  id="left_eye_pattern_std_deviation"
                  name="left_eye_pattern_std_deviation"
                  value={formData.left_eye_pattern_std_deviation}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.1"
                  placeholder="e.g., 2.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_visual_field_index" className="form-label">Visual Field Index (%)</label>
                <input
                  type="number"
                  id="left_eye_visual_field_index"
                  name="left_eye_visual_field_index"
                  value={formData.left_eye_visual_field_index}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0-100%"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_test_duration" className="form-label">Test Duration (min:sec)</label>
              <input
                type="text"
                id="left_eye_test_duration"
                name="left_eye_test_duration"
                value={formData.left_eye_test_duration}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 07:20"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="glaucoma_hemifield_test_left" className="form-label">Glaucoma Hemifield Test</label>
              <select
                id="glaucoma_hemifield_test_left"
                name="glaucoma_hemifield_test_left"
                value={formData.glaucoma_hemifield_test_left}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Result</option>
                <option value="within_normal_limits">Within Normal Limits</option>
                <option value="borderline">Borderline</option>
                <option value="outside_normal_limits">Outside Normal Limits</option>
                <option value="general_reduction_sensitivity">General Reduction of Sensitivity</option>
                <option value="abnormally_high_sensitivity">Abnormally High Sensitivity</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_defects" className="form-label">Visual Field Defects</label>
            <textarea
              id="left_eye_defects"
              name="left_eye_defects"
              value={formData.left_eye_defects}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Describe scotomas, defect patterns, arcuate defects, etc..."
            />
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="form-section">
          <h3>Clinical Assessment</h3>
          
          <div className="form-group">
            <label htmlFor="clinical_notes" className="form-label">Clinical Notes</label>
            <textarea
              id="clinical_notes"
              name="clinical_notes"
              value={formData.clinical_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Interpretation of results, progression analysis, correlation with clinical findings..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="recommendations" className="form-label">Recommendations</label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Follow-up schedule, repeat testing frequency, additional evaluations..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/eye-tests')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Recording...' : 'Record Test Results'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVisualFieldTestPage;