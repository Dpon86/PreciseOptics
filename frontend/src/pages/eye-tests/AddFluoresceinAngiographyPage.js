import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddFluoresceinAngiographyPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'fluorescein_angiography',
    contrast_agent: 'sodium_fluorescein',
    injection_dose: '5ml',
    injection_route: 'intravenous',
    camera_system: 'fundus_camera',
    filter_combination: 'blue_excitation_green_barrier',
    // Pre-injection Assessment
    allergy_history: false,
    renal_function_normal: true,
    pregnancy_excluded: true,
    informed_consent: true,
    // Timing Phases
    pre_injection_findings: '',
    choroidal_phase_timing: '',
    arterial_phase_timing: '',
    arteriovenous_phase_timing: '',
    venous_phase_timing: '',
    late_phase_timing: '',
    // Right Eye Findings
    right_eye_circulation_time: '',
    right_eye_arterial_filling: '',
    right_eye_venous_filling: '',
    right_eye_capillary_perfusion: '',
    right_eye_leakage_pattern: '',
    right_eye_blockage_areas: '',
    right_eye_neovascularization: '',
    // Left Eye Findings
    left_eye_circulation_time: '',
    left_eye_arterial_filling: '',
    left_eye_venous_filling: '',
    left_eye_capillary_perfusion: '',
    left_eye_leakage_pattern: '',
    left_eye_blockage_areas: '',
    left_eye_neovascularization: '',
    // Complications and Assessment
    complications: '',
    image_quality: 'good',
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
        alert('Fluorescein angiography results recorded successfully!');
        navigate('/eye-tests');
      }
    } catch (err) {
      console.error('Error creating fluorescein angiography:', err);
      setError(err.response?.data?.message || 'Failed to record examination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Fluorescein Angiography</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="fluorescein-angiography-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Procedure Details</h3>
          
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
              <label htmlFor="test_date" className="form-label">Procedure Date *</label>
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
              <label htmlFor="contrast_agent" className="form-label">Contrast Agent *</label>
              <select
                id="contrast_agent"
                name="contrast_agent"
                value={formData.contrast_agent}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="sodium_fluorescein">Sodium Fluorescein</option>
                <option value="indocyanine_green">Indocyanine Green (ICG)</option>
                <option value="fluorescein_icg_combination">Fluorescein + ICG</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="injection_dose" className="form-label">Injection Dose</label>
              <select
                id="injection_dose"
                name="injection_dose"
                value={formData.injection_dose}
                onChange={handleChange}
                className="form-input"
              >
                <option value="3ml">3ml</option>
                <option value="5ml">5ml (Standard)</option>
                <option value="10ml">10ml</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="camera_system" className="form-label">Camera System</label>
              <select
                id="camera_system"
                name="camera_system"
                value={formData.camera_system}
                onChange={handleChange}
                className="form-input"
              >
                <option value="fundus_camera">Fundus Camera</option>
                <option value="scanning_laser_ophthalmoscope">Scanning Laser Ophthalmoscope</option>
                <option value="wide_field_imaging">Wide-field Imaging System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pre-procedure Assessment */}
        <div className="form-section">
          <h3>Pre-procedure Assessment</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allergy_history"
                  checked={formData.allergy_history}
                  onChange={handleChange}
                />
                History of Allergies
              </label>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="renal_function_normal"
                  checked={formData.renal_function_normal}
                  onChange={handleChange}
                />
                Normal Renal Function
              </label>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pregnancy_excluded"
                  checked={formData.pregnancy_excluded}
                  onChange={handleChange}
                />
                Pregnancy Excluded
              </label>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="informed_consent"
                  checked={formData.informed_consent}
                  onChange={handleChange}
                />
                Informed Consent Obtained *
              </label>
            </div>
          </div>
        </div>

        {/* Timing and Phases */}
        <div className="form-section">
          <h3>Angiographic Phases</h3>
          
          <div className="form-group">
            <label htmlFor="pre_injection_findings" className="form-label">Pre-injection Findings</label>
            <textarea
              id="pre_injection_findings"
              name="pre_injection_findings"
              value={formData.pre_injection_findings}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Baseline fundus appearance, notable features..."
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="choroidal_phase_timing" className="form-label">Choroidal Phase (sec)</label>
              <input
                type="text"
                id="choroidal_phase_timing"
                name="choroidal_phase_timing"
                value={formData.choroidal_phase_timing}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 8-12"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="arterial_phase_timing" className="form-label">Arterial Phase (sec)</label>
              <input
                type="text"
                id="arterial_phase_timing"
                name="arterial_phase_timing"
                value={formData.arterial_phase_timing}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 12-15"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="arteriovenous_phase_timing" className="form-label">A-V Phase (sec)</label>
              <input
                type="text"
                id="arteriovenous_phase_timing"
                name="arteriovenous_phase_timing"
                value={formData.arteriovenous_phase_timing}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 15-20"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venous_phase_timing" className="form-label">Venous Phase (sec)</label>
              <input
                type="text"
                id="venous_phase_timing"
                name="venous_phase_timing"
                value={formData.venous_phase_timing}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 20-30"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="late_phase_timing" className="form-label">Late Phase (min)</label>
              <input
                type="text"
                id="late_phase_timing"
                name="late_phase_timing"
                value={formData.late_phase_timing}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 5-10"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image_quality" className="form-label">Image Quality</label>
              <select
                id="image_quality"
                name="image_quality"
                value={formData.image_quality}
                onChange={handleChange}
                className="form-input"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Eye Findings */}
        <div className="form-section">
          <h3>Right Eye (OD) Findings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="right_eye_circulation_time" className="form-label">Arm-to-Retina Time (sec)</label>
              <input
                type="number"
                id="right_eye_circulation_time"
                name="right_eye_circulation_time"
                value={formData.right_eye_circulation_time}
                onChange={handleChange}
                className="form-input"
                min="8"
                max="25"
                placeholder="e.g., 12"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_arterial_filling" className="form-label">Arterial Filling</label>
              <select
                id="right_eye_arterial_filling"
                name="right_eye_arterial_filling"
                value={formData.right_eye_arterial_filling}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="delayed">Delayed</option>
                <option value="patchy">Patchy</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="right_eye_venous_filling" className="form-label">Venous Filling</label>
              <select
                id="right_eye_venous_filling"
                name="right_eye_venous_filling"
                value={formData.right_eye_venous_filling}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="delayed">Delayed</option>
                <option value="segmental">Segmental</option>
                <option value="staining">Staining Present</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_capillary_perfusion" className="form-label">Capillary Perfusion</label>
            <textarea
              id="right_eye_capillary_perfusion"
              name="right_eye_capillary_perfusion"
              value={formData.right_eye_capillary_perfusion}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Macular capillary network, non-perfusion areas, capillary dropout..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_leakage_pattern" className="form-label">Leakage Pattern</label>
            <textarea
              id="right_eye_leakage_pattern"
              name="right_eye_leakage_pattern"
              value={formData.right_eye_leakage_pattern}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Location, pattern, intensity of fluorescein leakage..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_blockage_areas" className="form-label">Blockage/Hypofluorescence</label>
            <textarea
              id="right_eye_blockage_areas"
              name="right_eye_blockage_areas"
              value={formData.right_eye_blockage_areas}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Areas of blocked fluorescence, hemorrhages, pigmentation..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="right_eye_neovascularization" className="form-label">Neovascularization</label>
            <textarea
              id="right_eye_neovascularization"
              name="right_eye_neovascularization"
              value={formData.right_eye_neovascularization}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="New vessel formation, disc NV, elsewhere NV, leakage characteristics..."
            />
          </div>
        </div>

        {/* Left Eye Findings */}
        <div className="form-section">
          <h3>Left Eye (OS) Findings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="left_eye_circulation_time" className="form-label">Arm-to-Retina Time (sec)</label>
              <input
                type="number"
                id="left_eye_circulation_time"
                name="left_eye_circulation_time"
                value={formData.left_eye_circulation_time}
                onChange={handleChange}
                className="form-input"
                min="8"
                max="25"
                placeholder="e.g., 13"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_arterial_filling" className="form-label">Arterial Filling</label>
              <select
                id="left_eye_arterial_filling"
                name="left_eye_arterial_filling"
                value={formData.left_eye_arterial_filling}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="delayed">Delayed</option>
                <option value="patchy">Patchy</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="left_eye_venous_filling" className="form-label">Venous Filling</label>
              <select
                id="left_eye_venous_filling"
                name="left_eye_venous_filling"
                value={formData.left_eye_venous_filling}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="delayed">Delayed</option>
                <option value="segmental">Segmental</option>
                <option value="staining">Staining Present</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_capillary_perfusion" className="form-label">Capillary Perfusion</label>
            <textarea
              id="left_eye_capillary_perfusion"
              name="left_eye_capillary_perfusion"
              value={formData.left_eye_capillary_perfusion}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Macular capillary network, non-perfusion areas, capillary dropout..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_leakage_pattern" className="form-label">Leakage Pattern</label>
            <textarea
              id="left_eye_leakage_pattern"
              name="left_eye_leakage_pattern"
              value={formData.left_eye_leakage_pattern}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Location, pattern, intensity of fluorescein leakage..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_blockage_areas" className="form-label">Blockage/Hypofluorescence</label>
            <textarea
              id="left_eye_blockage_areas"
              name="left_eye_blockage_areas"
              value={formData.left_eye_blockage_areas}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Areas of blocked fluorescence, hemorrhages, pigmentation..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="left_eye_neovascularization" className="form-label">Neovascularization</label>
            <textarea
              id="left_eye_neovascularization"
              name="left_eye_neovascularization"
              value={formData.left_eye_neovascularization}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="New vessel formation, disc NV, elsewhere NV, leakage characteristics..."
            />
          </div>
        </div>

        {/* Complications and Assessment */}
        <div className="form-section">
          <h3>Procedure Complications & Clinical Assessment</h3>
          
          <div className="form-group">
            <label htmlFor="complications" className="form-label">Complications</label>
            <textarea
              id="complications"
              name="complications"
              value={formData.complications}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Nausea, vomiting, skin discoloration, allergic reactions, injection site issues..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="clinical_notes" className="form-label">Clinical Notes</label>
            <textarea
              id="clinical_notes"
              name="clinical_notes"
              value={formData.clinical_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Overall interpretation, diagnostic conclusions, comparison with previous studies..."
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
              placeholder="Follow-up angiography, treatment recommendations, monitoring intervals..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/eye-tests')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Recording...' : 'Record Angiography Results'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFluoresceinAngiographyPage;