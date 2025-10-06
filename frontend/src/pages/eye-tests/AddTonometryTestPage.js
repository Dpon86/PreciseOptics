import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddTonometryTestPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'tonometry',
    // Measurements
    right_eye_iop: '',
    left_eye_iop: '',
    measurement_method: 'goldmann',
    time_of_measurement: new Date().toTimeString().split(' ')[0],
    // Additional
    central_corneal_thickness_od: '',
    central_corneal_thickness_os: '',
    clinical_notes: '',
    recommendations: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const tonometryMethods = [
    { value: 'goldmann', label: 'Goldmann Applanation Tonometry' },
    { value: 'non_contact', label: 'Non-Contact Tonometry (NCT)' },
    { value: 'rebound', label: 'Rebound Tonometry' },
    { value: 'schiotz', label: 'Schiotz Tonometry' }
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
        alert('Tonometry test recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating tonometry test:', err);
      setError(err.response?.data?.message || 'Failed to record tonometry test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Tonometry Test - Intraocular Pressure</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="tonometry-form">
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
          </div>

          <div className="form-row">
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
            
            <div className="form-group">
              <label htmlFor="time_of_measurement" className="form-label">
                Time of Measurement *
              </label>
              <input
                type="time"
                id="time_of_measurement"
                name="time_of_measurement"
                value={formData.time_of_measurement}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="measurement_method" className="form-label">
                Measurement Method *
              </label>
              <select
                id="measurement_method"
                name="measurement_method"
                value={formData.measurement_method}
                onChange={handleChange}
                className="form-input"
                required
              >
                {tonometryMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* IOP Measurements */}
        <div className="form-section">
          <h3>Intraocular Pressure (IOP) Measurements</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_iop" className="form-label">
                Right Eye IOP (mmHg) *
              </label>
              <input
                type="number"
                id="right_eye_iop"
                name="right_eye_iop"
                value={formData.right_eye_iop}
                onChange={handleChange}
                className="form-input"
                required
                step="0.1"
                min="0"
                max="50"
                placeholder="e.g., 14.5"
              />
              <small className="form-help">Normal range: 10-21 mmHg</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_iop" className="form-label">
                Left Eye IOP (mmHg) *
              </label>
              <input
                type="number"
                id="left_eye_iop"
                name="left_eye_iop"
                value={formData.left_eye_iop}
                onChange={handleChange}
                className="form-input"
                required
                step="0.1"
                min="0"
                max="50"
                placeholder="e.g., 15.2"
              />
              <small className="form-help">Normal range: 10-21 mmHg</small>
            </div>
          </div>
        </div>

        {/* Central Corneal Thickness */}
        <div className="form-section">
          <h3>Central Corneal Thickness (Optional)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="central_corneal_thickness_od" className="form-label">
                Right Eye CCT (μm)
              </label>
              <input
                type="number"
                id="central_corneal_thickness_od"
                name="central_corneal_thickness_od"
                value={formData.central_corneal_thickness_od}
                onChange={handleChange}
                className="form-input"
                step="1"
                min="400"
                max="700"
                placeholder="e.g., 545"
              />
              <small className="form-help">Average: 540-560 μm</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="central_corneal_thickness_os" className="form-label">
                Left Eye CCT (μm)
              </label>
              <input
                type="number"
                id="central_corneal_thickness_os"
                name="central_corneal_thickness_os"
                value={formData.central_corneal_thickness_os}
                onChange={handleChange}
                className="form-input"
                step="1"
                min="400"
                max="700"
                placeholder="e.g., 548"
              />
              <small className="form-help">Average: 540-560 μm</small>
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
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
              placeholder="Observations, patient cooperation, measurement quality..."
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
              placeholder="Follow-up recommendations, treatment suggestions..."
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
            {loading ? 'Recording...' : 'Record IOP Measurements'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTonometryTestPage;