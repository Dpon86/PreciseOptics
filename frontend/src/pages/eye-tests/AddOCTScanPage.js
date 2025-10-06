import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddOCTScanPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'oct_scan',
    oct_device: 'zeiss_cirrus',
    scan_protocol: 'macula_cube',
    scan_quality: 'good',
    pupil_dilation: false,
    mydriatic_agent: '',
    // Right Eye Measurements
    right_eye_central_thickness: '',
    right_eye_total_volume: '',
    right_eye_average_thickness: '',
    right_eye_rnfl_average: '',
    right_eye_rnfl_superior: '',
    right_eye_rnfl_nasal: '',
    right_eye_rnfl_inferior: '',
    right_eye_rnfl_temporal: '',
    // Left Eye Measurements  
    left_eye_central_thickness: '',
    left_eye_total_volume: '',
    left_eye_average_thickness: '',
    left_eye_rnfl_average: '',
    left_eye_rnfl_superior: '',
    left_eye_rnfl_nasal: '',
    left_eye_rnfl_inferior: '',
    left_eye_rnfl_temporal: '',
    // Morphological Analysis
    right_eye_morphology: '',
    left_eye_morphology: '',
    right_eye_pathology: '',
    left_eye_pathology: '',
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
        alert('OCT scan results recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating OCT scan:', err);
      setError(err.response?.data?.message || 'Failed to record scan results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Optical Coherence Tomography (OCT) Scan</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="oct-scan-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Scan Parameters</h3>
          
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
              <label htmlFor="test_date" className="form-label">Scan Date *</label>
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
              <label htmlFor="oct_device" className="form-label">OCT Device *</label>
              <select
                id="oct_device"
                name="oct_device"
                value={formData.oct_device}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="zeiss_cirrus">Zeiss Cirrus HD-OCT</option>
                <option value="topcon_triton">Topcon Triton DRI-OCT</option>
                <option value="heidelberg_spectralis">Heidelberg Spectralis</option>
                <option value="optovue_rtvu">Optovue RTVue XR</option>
                <option value="nidek_mirante">Nidek Mirante</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="scan_protocol" className="form-label">Scan Protocol *</label>
              <select
                id="scan_protocol"
                name="scan_protocol"
                value={formData.scan_protocol}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="macula_cube">Macular Cube 512x128</option>
                <option value="optic_disc_cube">Optic Disc Cube 200x200</option>
                <option value="5_line_raster">5 Line Raster</option>
                <option value="hd_21_line">HD 21 Line</option>
                <option value="ganglion_cell_analysis">Ganglion Cell Analysis</option>
                <option value="angiography">OCT Angiography</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="scan_quality" className="form-label">Scan Quality *</label>
              <select
                id="scan_quality"
                name="scan_quality"
                value={formData.scan_quality}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="excellent">Excellent (9-10)</option>
                <option value="good">Good (7-8)</option>
                <option value="fair">Fair (5-6)</option>
                <option value="poor">Poor (3-4)</option>
                <option value="unacceptable">Unacceptable (1-2)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
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

        {/* Right Eye Measurements */}
        <div className="form-section">
          <h3>Right Eye (OD) Measurements</h3>
          
          <div className="form-subsection">
            <h4>Macular Thickness Analysis</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_central_thickness" className="form-label">Central Subfield Thickness (μm)</label>
                <input
                  type="number"
                  id="right_eye_central_thickness"
                  name="right_eye_central_thickness"
                  value={formData.right_eye_central_thickness}
                  onChange={handleChange}
                  className="form-input"
                  min="100"
                  max="800"
                  placeholder="e.g., 245"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_total_volume" className="form-label">Total Macular Volume (mm³)</label>
                <input
                  type="number"
                  id="right_eye_total_volume"
                  name="right_eye_total_volume"
                  value={formData.right_eye_total_volume}
                  onChange={handleChange}
                  className="form-input"
                  step="0.01"
                  min="6"
                  max="12"
                  placeholder="e.g., 8.45"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_average_thickness" className="form-label">Average Thickness (μm)</label>
                <input
                  type="number"
                  id="right_eye_average_thickness"
                  name="right_eye_average_thickness"
                  value={formData.right_eye_average_thickness}
                  onChange={handleChange}
                  className="form-input"
                  min="200"
                  max="350"
                  placeholder="e.g., 278"
                />
              </div>
            </div>
          </div>
          
          <div className="form-subsection">
            <h4>Retinal Nerve Fiber Layer (RNFL) Analysis</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_rnfl_average" className="form-label">Average RNFL (μm)</label>
                <input
                  type="number"
                  id="right_eye_rnfl_average"
                  name="right_eye_rnfl_average"
                  value={formData.right_eye_rnfl_average}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="150"
                  placeholder="e.g., 94"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_rnfl_superior" className="form-label">Superior RNFL (μm)</label>
                <input
                  type="number"
                  id="right_eye_rnfl_superior"
                  name="right_eye_rnfl_superior"
                  value={formData.right_eye_rnfl_superior}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="200"
                  placeholder="e.g., 118"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_rnfl_nasal" className="form-label">Nasal RNFL (μm)</label>
                <input
                  type="number"
                  id="right_eye_rnfl_nasal"
                  name="right_eye_rnfl_nasal"
                  value={formData.right_eye_rnfl_nasal}
                  onChange={handleChange}
                  className="form-input"
                  min="40"
                  max="120"
                  placeholder="e.g., 73"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_rnfl_inferior" className="form-label">Inferior RNFL (μm)</label>
                <input
                  type="number"
                  id="right_eye_rnfl_inferior"
                  name="right_eye_rnfl_inferior"
                  value={formData.right_eye_rnfl_inferior}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="200"
                  placeholder="e.g., 125"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_rnfl_temporal" className="form-label">Temporal RNFL (μm)</label>
                <input
                  type="number"
                  id="right_eye_rnfl_temporal"
                  name="right_eye_rnfl_temporal"
                  value={formData.right_eye_rnfl_temporal}
                  onChange={handleChange}
                  className="form-input"
                  min="40"
                  max="120"
                  placeholder="e.g., 69"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_morphology" className="form-label">Morphological Findings</label>
            <textarea
              id="right_eye_morphology"
              name="right_eye_morphology"
              value={formData.right_eye_morphology}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Describe retinal architecture, layer boundaries, foveal contour..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_pathology" className="form-label">Pathological Findings</label>
            <textarea
              id="right_eye_pathology"
              name="right_eye_pathology"
              value={formData.right_eye_pathology}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Fluid, drusen, pigment epithelial detachments, epiretinal membranes..."
            />
          </div>
        </div>

        {/* Left Eye Measurements */}
        <div className="form-section">
          <h3>Left Eye (OS) Measurements</h3>
          
          <div className="form-subsection">
            <h4>Macular Thickness Analysis</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_central_thickness" className="form-label">Central Subfield Thickness (μm)</label>
                <input
                  type="number"
                  id="left_eye_central_thickness"
                  name="left_eye_central_thickness"
                  value={formData.left_eye_central_thickness}
                  onChange={handleChange}
                  className="form-input"
                  min="100"
                  max="800"
                  placeholder="e.g., 252"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_total_volume" className="form-label">Total Macular Volume (mm³)</label>
                <input
                  type="number"
                  id="left_eye_total_volume"
                  name="left_eye_total_volume"
                  value={formData.left_eye_total_volume}
                  onChange={handleChange}
                  className="form-input"
                  step="0.01"
                  min="6"
                  max="12"
                  placeholder="e.g., 8.67"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_average_thickness" className="form-label">Average Thickness (μm)</label>
                <input
                  type="number"
                  id="left_eye_average_thickness"
                  name="left_eye_average_thickness"
                  value={formData.left_eye_average_thickness}
                  onChange={handleChange}
                  className="form-input"
                  min="200"
                  max="350"
                  placeholder="e.g., 285"
                />
              </div>
            </div>
          </div>
          
          <div className="form-subsection">
            <h4>Retinal Nerve Fiber Layer (RNFL) Analysis</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_rnfl_average" className="form-label">Average RNFL (μm)</label>
                <input
                  type="number"
                  id="left_eye_rnfl_average"
                  name="left_eye_rnfl_average"
                  value={formData.left_eye_rnfl_average}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="150"
                  placeholder="e.g., 97"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_rnfl_superior" className="form-label">Superior RNFL (μm)</label>
                <input
                  type="number"
                  id="left_eye_rnfl_superior"
                  name="left_eye_rnfl_superior"
                  value={formData.left_eye_rnfl_superior}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="200"
                  placeholder="e.g., 121"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_rnfl_nasal" className="form-label">Nasal RNFL (μm)</label>
                <input
                  type="number"
                  id="left_eye_rnfl_nasal"
                  name="left_eye_rnfl_nasal"
                  value={formData.left_eye_rnfl_nasal}
                  onChange={handleChange}
                  className="form-input"
                  min="40"
                  max="120"
                  placeholder="e.g., 76"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_rnfl_inferior" className="form-label">Inferior RNFL (μm)</label>
                <input
                  type="number"
                  id="left_eye_rnfl_inferior"
                  name="left_eye_rnfl_inferior"
                  value={formData.left_eye_rnfl_inferior}
                  onChange={handleChange}
                  className="form-input"
                  min="50"
                  max="200"
                  placeholder="e.g., 132"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_rnfl_temporal" className="form-label">Temporal RNFL (μm)</label>
                <input
                  type="number"
                  id="left_eye_rnfl_temporal"
                  name="left_eye_rnfl_temporal"
                  value={formData.left_eye_rnfl_temporal}
                  onChange={handleChange}
                  className="form-input"
                  min="40"
                  max="120"
                  placeholder="e.g., 65"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_morphology" className="form-label">Morphological Findings</label>
            <textarea
              id="left_eye_morphology"
              name="left_eye_morphology"
              value={formData.left_eye_morphology}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Describe retinal architecture, layer boundaries, foveal contour..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_pathology" className="form-label">Pathological Findings</label>
            <textarea
              id="left_eye_pathology"
              name="left_eye_pathology"
              value={formData.left_eye_pathology}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Fluid, drusen, pigment epithelial detachments, epiretinal membranes..."
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
              placeholder="Overall interpretation, comparison with normative database, progression analysis..."
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
              placeholder="Follow-up imaging frequency, additional tests, treatment considerations..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/eye-tests')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Recording...' : 'Record Scan Results'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOCTScanPage;