import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddOphthalmoscopyPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'ophthalmoscopy',
    examination_type: 'direct',
    pupil_dilation: false,
    mydriatic_agent: '',
    // Right Eye Findings
    right_eye_optic_disc: '',
    right_eye_cup_disc_ratio: '',
    right_eye_macula: '',
    right_eye_vessels: '',
    right_eye_periphery: '',
    right_eye_vitreous: '',
    // Left Eye Findings
    left_eye_optic_disc: '',
    left_eye_cup_disc_ratio: '',
    left_eye_macula: '',
    left_eye_vessels: '',
    left_eye_periphery: '',
    left_eye_vitreous: '',
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
        alert('Ophthalmoscopy examination recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating ophthalmoscopy exam:', err);
      setError(err.response?.data?.message || 'Failed to record examination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Ophthalmoscopy - Fundus Examination</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="ophthalmoscopy-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Examination Details</h3>
          
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
              <label htmlFor="test_date" className="form-label">Examination Date *</label>
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
              <label htmlFor="examination_type" className="form-label">Examination Type *</label>
              <select
                id="examination_type"
                name="examination_type"
                value={formData.examination_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="direct">Direct Ophthalmoscopy</option>
                <option value="indirect">Indirect Ophthalmoscopy</option>
                <option value="slit_lamp_fundoscopy">Slit Lamp Fundoscopy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pupil_dilation"
                  checked={formData.pupil_dilation}
                  onChange={handleChange}
                />
                Pupil Dilation Used
              </label>
            </div>
            
            {formData.pupil_dilation && (
              <div className="form-group">
                <label htmlFor="mydriatic_agent" className="form-label">Mydriatic Agent</label>
                <select
                  id="mydriatic_agent"
                  name="mydriatic_agent"
                  value={formData.mydriatic_agent}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Agent</option>
                  <option value="tropicamide">Tropicamide 1%</option>
                  <option value="cyclopentolate">Cyclopentolate 1%</option>
                  <option value="phenylephrine">Phenylephrine 2.5%</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Eye Findings */}
        <div className="form-section">
          <h3>Right Eye (OD) Findings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_optic_disc" className="form-label">Optic Disc</label>
              <textarea
                id="right_eye_optic_disc"
                name="right_eye_optic_disc"
                value={formData.right_eye_optic_disc}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Color, margins, cupping..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_cup_disc_ratio" className="form-label">Cup-to-Disc Ratio</label>
              <input
                type="text"
                id="right_eye_cup_disc_ratio"
                name="right_eye_cup_disc_ratio"
                value={formData.right_eye_cup_disc_ratio}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 0.3"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_macula" className="form-label">Macula</label>
            <textarea
              id="right_eye_macula"
              name="right_eye_macula"
              value={formData.right_eye_macula}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Foveal reflex, pigmentation, lesions..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_vessels" className="form-label">Blood Vessels</label>
            <textarea
              id="right_eye_vessels"
              name="right_eye_vessels"
              value={formData.right_eye_vessels}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Arteriovenous ratio, caliber, abnormalities..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_periphery" className="form-label">Peripheral Retina</label>
            <textarea
              id="right_eye_periphery"
              name="right_eye_periphery"
              value={formData.right_eye_periphery}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Tears, holes, degeneration..."
            />
          </div>
        </div>

        {/* Left Eye Findings */}
        <div className="form-section">
          <h3>Left Eye (OS) Findings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_optic_disc" className="form-label">Optic Disc</label>
              <textarea
                id="left_eye_optic_disc"
                name="left_eye_optic_disc"
                value={formData.left_eye_optic_disc}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Color, margins, cupping..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_cup_disc_ratio" className="form-label">Cup-to-Disc Ratio</label>
              <input
                type="text"
                id="left_eye_cup_disc_ratio"
                name="left_eye_cup_disc_ratio"
                value={formData.left_eye_cup_disc_ratio}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 0.4"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_macula" className="form-label">Macula</label>
            <textarea
              id="left_eye_macula"
              name="left_eye_macula"
              value={formData.left_eye_macula}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Foveal reflex, pigmentation, lesions..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_vessels" className="form-label">Blood Vessels</label>
            <textarea
              id="left_eye_vessels"
              name="left_eye_vessels"
              value={formData.left_eye_vessels}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Arteriovenous ratio, caliber, abnormalities..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_periphery" className="form-label">Peripheral Retina</label>
            <textarea
              id="left_eye_periphery"
              name="left_eye_periphery"
              value={formData.left_eye_periphery}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Tears, holes, degeneration..."
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
              placeholder="Overall impression, comparisons with previous exams..."
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
              placeholder="Follow-up schedule, additional tests, referrals..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/eye-tests')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Recording...' : 'Record Examination'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOphthalmoscopyPage;