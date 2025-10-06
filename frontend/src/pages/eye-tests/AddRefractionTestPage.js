import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddRefractionTestPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'refraction',
    // Right Eye
    right_eye_sphere: '',
    right_eye_cylinder: '',
    right_eye_axis: '',
    right_eye_add: '',
    right_eye_prism: '',
    right_eye_base: '',
    right_eye_visual_acuity: '',
    // Left Eye
    left_eye_sphere: '',
    left_eye_cylinder: '',
    left_eye_axis: '',
    left_eye_add: '',
    left_eye_prism: '',
    left_eye_base: '',
    left_eye_visual_acuity: '',
    // Additional
    pupillary_distance: '',
    refraction_method: 'auto_refractometer',
    cycloplegic_used: false,
    cycloplegic_agent: '',
    clinical_notes: '',
    recommendations: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const refractionMethods = [
    { value: 'auto_refractometer', label: 'Auto Refractometer' },
    { value: 'manual_refraction', label: 'Manual Refraction' },
    { value: 'streak_retinoscopy', label: 'Streak Retinoscopy' },
    { value: 'subjective_refraction', label: 'Subjective Refraction' }
  ];

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
        alert('Refraction test recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating refraction test:', err);
      setError(err.response?.data?.message || 'Failed to record refraction test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Refraction Test</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="refraction-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Test Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient" className="form-label">
                Patient ID *
              </label>
              <input
                type="text"
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter patient ID"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="doctor" className="form-label">
                Doctor *
              </label>
              <input
                type="text"
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter doctor ID or name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="test_date" className="form-label">
                Test Date *
              </label>
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
              <label htmlFor="refraction_method" className="form-label">
                Refraction Method *
              </label>
              <select
                id="refraction_method"
                name="refraction_method"
                value={formData.refraction_method}
                onChange={handleChange}
                className="form-input"
                required
              >
                {refractionMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="pupillary_distance" className="form-label">
                Pupillary Distance (mm)
              </label>
              <input
                type="number"
                id="pupillary_distance"
                name="pupillary_distance"
                value={formData.pupillary_distance}
                onChange={handleChange}
                className="form-input"
                step="0.5"
                min="50"
                max="80"
                placeholder="e.g., 63.0"
              />
            </div>
          </div>
        </div>

        {/* Right Eye Results */}
        <div className="form-section">
          <h3>Right Eye (OD)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_sphere" className="form-label">
                Sphere (D)
              </label>
              <input
                type="number"
                id="right_eye_sphere"
                name="right_eye_sphere"
                value={formData.right_eye_sphere}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., -2.50"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_cylinder" className="form-label">
                Cylinder (D)
              </label>
              <input
                type="number"
                id="right_eye_cylinder"
                name="right_eye_cylinder"
                value={formData.right_eye_cylinder}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., -1.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_axis" className="form-label">
                Axis (°)
              </label>
              <input
                type="number"
                id="right_eye_axis"
                name="right_eye_axis"
                value={formData.right_eye_axis}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="180"
                placeholder="e.g., 90"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_add" className="form-label">
                Add Power (D)
              </label>
              <input
                type="number"
                id="right_eye_add"
                name="right_eye_add"
                value={formData.right_eye_add}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., +2.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_visual_acuity" className="form-label">
                Visual Acuity
              </label>
              <input
                type="text"
                id="right_eye_visual_acuity"
                name="right_eye_visual_acuity"
                value={formData.right_eye_visual_acuity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 20/20"
              />
            </div>
          </div>
        </div>

        {/* Left Eye Results */}
        <div className="form-section">
          <h3>Left Eye (OS)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_sphere" className="form-label">
                Sphere (D)
              </label>
              <input
                type="number"
                id="left_eye_sphere"
                name="left_eye_sphere"
                value={formData.left_eye_sphere}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., -2.75"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_cylinder" className="form-label">
                Cylinder (D)
              </label>
              <input
                type="number"
                id="left_eye_cylinder"
                name="left_eye_cylinder"
                value={formData.left_eye_cylinder}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., -0.75"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_axis" className="form-label">
                Axis (°)
              </label>
              <input
                type="number"
                id="left_eye_axis"
                name="left_eye_axis"
                value={formData.left_eye_axis}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="180"
                placeholder="e.g., 85"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_add" className="form-label">
                Add Power (D)
              </label>
              <input
                type="number"
                id="left_eye_add"
                name="left_eye_add"
                value={formData.left_eye_add}
                onChange={handleChange}
                className="form-input"
                step="0.25"
                placeholder="e.g., +2.00"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_visual_acuity" className="form-label">
                Visual Acuity
              </label>
              <input
                type="text"
                id="left_eye_visual_acuity"
                name="left_eye_visual_acuity"
                value={formData.left_eye_visual_acuity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 20/25"
              />
            </div>
          </div>
        </div>

        {/* Cycloplegia */}
        <div className="form-section">
          <h3>Cycloplegia</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="cycloplegic_used"
                  checked={formData.cycloplegic_used}
                  onChange={handleChange}
                />
                Cycloplegic Agent Used
              </label>
            </div>
            
            {formData.cycloplegic_used && (
              <div className="form-group">
                <label htmlFor="cycloplegic_agent" className="form-label">
                  Cycloplegic Agent
                </label>
                <select
                  id="cycloplegic_agent"
                  name="cycloplegic_agent"
                  value={formData.cycloplegic_agent}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Agent</option>
                  <option value="cyclopentolate">Cyclopentolate 1%</option>
                  <option value="tropicamide">Tropicamide 1%</option>
                  <option value="atropine">Atropine 1%</option>
                  <option value="homatropine">Homatropine 5%</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="form-section">
          <h3>Clinical Assessment</h3>
          
          <div className="form-group">
            <label htmlFor="clinical_notes" className="form-label">
              Clinical Notes
            </label>
            <textarea
              id="clinical_notes"
              name="clinical_notes"
              value={formData.clinical_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Additional clinical observations..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="recommendations" className="form-label">
              Recommendations
            </label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Prescription recommendations, follow-up care..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/eye-tests')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Recording...' : 'Record Test Results'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRefractionTestPage;