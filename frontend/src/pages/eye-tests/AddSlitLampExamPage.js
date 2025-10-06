import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddSlitLampExamPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'slit_lamp',
    examination_magnification: '10x',
    illumination_type: 'diffuse',
    // Right Eye Anterior Segment
    right_eye_lids: '',
    right_eye_conjunctiva: '',
    right_eye_cornea: '',
    right_eye_anterior_chamber: '',
    right_eye_iris: '',
    right_eye_lens: '',
    right_eye_pupil: '',
    right_eye_tear_film: '',
    // Left Eye Anterior Segment
    left_eye_lids: '',
    left_eye_conjunctiva: '',
    left_eye_cornea: '',
    left_eye_anterior_chamber: '',
    left_eye_iris: '',
    left_eye_lens: '',
    left_eye_pupil: '',
    left_eye_tear_film: '',
    // Posterior Segment (if applicable)
    fundus_examination: false,
    right_eye_vitreous: '',
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
        alert('Slit lamp examination recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating slit lamp exam:', err);
      setError(err.response?.data?.message || 'Failed to record examination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Slit Lamp Biomicroscopy</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="slit-lamp-form">
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
              <label htmlFor="examination_magnification" className="form-label">Magnification *</label>
              <select
                id="examination_magnification"
                name="examination_magnification"
                value={formData.examination_magnification}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="6x">6x</option>
                <option value="10x">10x</option>
                <option value="16x">16x</option>
                <option value="25x">25x</option>
                <option value="40x">40x</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="illumination_type" className="form-label">Illumination Type *</label>
              <select
                id="illumination_type"
                name="illumination_type"
                value={formData.illumination_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="diffuse">Diffuse Illumination</option>
                <option value="direct">Direct Focal Illumination</option>
                <option value="indirect">Indirect Illumination</option>
                <option value="retroillumination">Retroillumination</option>
                <option value="specular">Specular Reflection</option>
                <option value="sclerotic_scatter">Sclerotic Scatter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Eye Anterior Segment */}
        <div className="form-section">
          <h3>Right Eye (OD) - Anterior Segment</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_lids" className="form-label">Eyelids & Lashes</label>
              <textarea
                id="right_eye_lids"
                name="right_eye_lids"
                value={formData.right_eye_lids}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Position, margins, meibomian glands, lashes..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_conjunctiva" className="form-label">Conjunctiva</label>
              <textarea
                id="right_eye_conjunctiva"
                name="right_eye_conjunctiva"
                value={formData.right_eye_conjunctiva}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Bulbar and palpebral conjunctiva, injection, follicles..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_cornea" className="form-label">Cornea</label>
              <textarea
                id="right_eye_cornea"
                name="right_eye_cornea"
                value={formData.right_eye_cornea}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Clarity, epithelium, stroma, endothelium, thickness..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_anterior_chamber" className="form-label">Anterior Chamber</label>
              <textarea
                id="right_eye_anterior_chamber"
                name="right_eye_anterior_chamber"
                value={formData.right_eye_anterior_chamber}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Depth, cells, flare, hypopyon/hyphema..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_iris" className="form-label">Iris</label>
              <textarea
                id="right_eye_iris"
                name="right_eye_iris"
                value={formData.right_eye_iris}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Color, pattern, neovascularization, synechiae..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_lens" className="form-label">Crystalline Lens</label>
              <textarea
                id="right_eye_lens"
                name="right_eye_lens"
                value={formData.right_eye_lens}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Clarity, cortical/nuclear/PSC changes, position..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_pupil" className="form-label">Pupil</label>
              <input
                type="text"
                id="right_eye_pupil"
                name="right_eye_pupil"
                value={formData.right_eye_pupil}
                onChange={handleChange}
                className="form-input"
                placeholder="Size, shape, reactivity..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_tear_film" className="form-label">Tear Film</label>
              <input
                type="text"
                id="right_eye_tear_film"
                name="right_eye_tear_film"
                value={formData.right_eye_tear_film}
                onChange={handleChange}
                className="form-input"
                placeholder="Quality, breakup time, debris..."
              />
            </div>
          </div>
        </div>

        {/* Left Eye Anterior Segment */}
        <div className="form-section">
          <h3>Left Eye (OS) - Anterior Segment</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_lids" className="form-label">Eyelids & Lashes</label>
              <textarea
                id="left_eye_lids"
                name="left_eye_lids"
                value={formData.left_eye_lids}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Position, margins, meibomian glands, lashes..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_conjunctiva" className="form-label">Conjunctiva</label>
              <textarea
                id="left_eye_conjunctiva"
                name="left_eye_conjunctiva"
                value={formData.left_eye_conjunctiva}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Bulbar and palpebral conjunctiva, injection, follicles..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_cornea" className="form-label">Cornea</label>
              <textarea
                id="left_eye_cornea"
                name="left_eye_cornea"
                value={formData.left_eye_cornea}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Clarity, epithelium, stroma, endothelium, thickness..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_anterior_chamber" className="form-label">Anterior Chamber</label>
              <textarea
                id="left_eye_anterior_chamber"
                name="left_eye_anterior_chamber"
                value={formData.left_eye_anterior_chamber}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Depth, cells, flare, hypopyon/hyphema..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_iris" className="form-label">Iris</label>
              <textarea
                id="left_eye_iris"
                name="left_eye_iris"
                value={formData.left_eye_iris}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Color, pattern, neovascularization, synechiae..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_lens" className="form-label">Crystalline Lens</label>
              <textarea
                id="left_eye_lens"
                name="left_eye_lens"
                value={formData.left_eye_lens}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
                placeholder="Clarity, cortical/nuclear/PSC changes, position..."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_pupil" className="form-label">Pupil</label>
              <input
                type="text"
                id="left_eye_pupil"
                name="left_eye_pupil"
                value={formData.left_eye_pupil}
                onChange={handleChange}
                className="form-input"
                placeholder="Size, shape, reactivity..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_tear_film" className="form-label">Tear Film</label>
              <input
                type="text"
                id="left_eye_tear_film"
                name="left_eye_tear_film"
                value={formData.left_eye_tear_film}
                onChange={handleChange}
                className="form-input"
                placeholder="Quality, breakup time, debris..."
              />
            </div>
          </div>
        </div>

        {/* Posterior Segment (Optional) */}
        <div className="form-section">
          <h3>Posterior Segment Assessment</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="fundus_examination"
                checked={formData.fundus_examination}
                onChange={handleChange}
              />
              Fundus Examination Performed
            </label>
          </div>
          
          {formData.fundus_examination && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_vitreous" className="form-label">Right Eye Vitreous</label>
                <textarea
                  id="right_eye_vitreous"
                  name="right_eye_vitreous"
                  value={formData.right_eye_vitreous}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="2"
                  placeholder="Clarity, cells, debris, PVD..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_vitreous" className="form-label">Left Eye Vitreous</label>
                <textarea
                  id="left_eye_vitreous"
                  name="left_eye_vitreous"
                  value={formData.left_eye_vitreous}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="2"
                  placeholder="Clarity, cells, debris, PVD..."
                />
              </div>
            </div>
          )}
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
              placeholder="Overall findings, significant abnormalities, comparisons..."
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
              placeholder="Follow-up, additional tests, treatment recommendations..."
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

export default AddSlitLampExamPage;