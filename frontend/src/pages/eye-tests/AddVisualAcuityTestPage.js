import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import api from '../../services/api';

const AddVisualAcuityTestPage = () => {
  const { patientId } = useParams();
  const { selectedPatient } = usePatient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patient: patientId || selectedPatient?.id || '',
    consultation: '',
    performed_by: '',
    test_date: '',
    eye_side: 'both',
    status: 'scheduled',
    test_method: 'snellen_chart',
    
    // Right Eye Results
    right_eye_unaided: '',
    right_eye_aided: '',
    right_eye_pinhole: '',
    
    // Left Eye Results
    left_eye_unaided: '',
    left_eye_aided: '',
    left_eye_pinhole: '',
    
    // Both Eyes
    binocular_vision: '',
    
    // General
    findings: '',
    recommendations: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });
  

  const [consultations, setConsultations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testMethods = [
    { value: 'snellen_chart', label: 'Snellen Chart' },
    { value: 'logmar_chart', label: 'LogMAR Chart' },
    { value: 'etdrs_chart', label: 'ETDRS Chart' },
    { value: 'kay_pictures', label: 'Kay Pictures (Pediatric)' },
    { value: 'lea_symbols', label: 'Lea Symbols' },
    { value: 'cardiff_cards', label: 'Cardiff Acuity Cards' }
  ];

  const eyeSideOptions = [
    { value: 'both', label: 'Both Eyes' },
    { value: 'left', label: 'Left Eye' },
    { value: 'right', label: 'Right Eye' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'incomplete', label: 'Incomplete' }
  ];

  useEffect(() => {
    // Redirect to home if accessing patient route without selected patient
    if (patientId && !selectedPatient) {
      navigate('/');
      return;
    }
    fetchInitialData();
  }, [patientId, selectedPatient, navigate]);

  const fetchInitialData = async () => {
    try {
      const [, consultationsRes, staffRes] = await Promise.all([
        api.getPatients(),
        api.getConsultations(),
        api.getStaff()
      ]);
      

      setConsultations(consultationsRes.data.results || consultationsRes.data || []);
      setStaff(staffRes.data.results || staffRes.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load form data');
    }
  };

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
        alert('Visual Acuity Test created successfully!');
        if (patientId) {
          navigate(`/patient/${patientId}/eye-tests`);
        } else {
          navigate('/eye-tests');
        }
      }
    } catch (err) {
      console.error('Error creating visual acuity test:', err);
      setError(err.response?.data?.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add Visual Acuity Test</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="eye-test-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          {/* Selected Patient Display */}
          {(selectedPatient || patientId) && (
            <div className="selected-patient-display">
              <h4>Patient Information</h4>
              <div className="patient-info-card">
                <div className="patient-avatar">
                  {selectedPatient?.first_name?.[0]}{selectedPatient?.last_name?.[0]}
                </div>
                <div className="patient-details">
                  <div className="patient-name">
                    {selectedPatient?.first_name} {selectedPatient?.last_name}
                  </div>
                  <div className="patient-meta">
                    ID: {selectedPatient?.patient_id} | DOB: {selectedPatient?.date_of_birth} | Phone: {selectedPatient?.phone}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-row">
            
            <div className="form-group">
              <label htmlFor="consultation" className="form-label">
                Related Consultation
              </label>
              <select
                id="consultation"
                name="consultation"
                value={formData.consultation}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Consultation (Optional)</option>
                {consultations.map(consultation => (
                  <option key={consultation.id} value={consultation.id}>
                    {consultation.patient_name} - {consultation.consultation_type} ({new Date(consultation.scheduled_time).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="performed_by" className="form-label">
                Performed By *
              </label>
              <select
                id="performed_by"
                name="performed_by"
                value={formData.performed_by}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Staff Member</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="test_date" className="form-label">
                Test Date & Time *
              </label>
              <input
                type="datetime-local"
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
              <label htmlFor="test_method" className="form-label">
                Test Method *
              </label>
              <select
                id="test_method"
                name="test_method"
                value={formData.test_method}
                onChange={handleChange}
                className="form-input"
                required
              >
                {testMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="eye_side" className="form-label">
                Eye(s) Tested
              </label>
              <select
                id="eye_side"
                name="eye_side"
                value={formData.eye_side}
                onChange={handleChange}
                className="form-input"
              >
                {eyeSideOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Test Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Eye Results */}
        {(formData.eye_side === 'both' || formData.eye_side === 'right') && (
          <div className="form-section">
            <h3>Right Eye Results</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="right_eye_unaided" className="form-label">
                  Unaided Vision
                </label>
                <input
                  type="text"
                  id="right_eye_unaided"
                  name="right_eye_unaided"
                  value={formData.right_eye_unaided}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/60, 20/200"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_aided" className="form-label">
                  Aided Vision (with correction)
                </label>
                <input
                  type="text"
                  id="right_eye_aided"
                  name="right_eye_aided"
                  value={formData.right_eye_aided}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/6, 20/20"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="right_eye_pinhole" className="form-label">
                  Pinhole Vision
                </label>
                <input
                  type="text"
                  id="right_eye_pinhole"
                  name="right_eye_pinhole"
                  value={formData.right_eye_pinhole}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Left Eye Results */}
        {(formData.eye_side === 'both' || formData.eye_side === 'left') && (
          <div className="form-section">
            <h3>Left Eye Results</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="left_eye_unaided" className="form-label">
                  Unaided Vision
                </label>
                <input
                  type="text"
                  id="left_eye_unaided"
                  name="left_eye_unaided"
                  value={formData.left_eye_unaided}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/60, 20/200"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_aided" className="form-label">
                  Aided Vision (with correction)
                </label>
                <input
                  type="text"
                  id="left_eye_aided"
                  name="left_eye_aided"
                  value={formData.left_eye_aided}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/6, 20/20"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="left_eye_pinhole" className="form-label">
                  Pinhole Vision
                </label>
                <input
                  type="text"
                  id="left_eye_pinhole"
                  name="left_eye_pinhole"
                  value={formData.left_eye_pinhole}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6/12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Binocular Vision */}
        {formData.eye_side === 'both' && (
          <div className="form-section">
            <h3>Binocular Vision</h3>
            
            <div className="form-group">
              <label htmlFor="binocular_vision" className="form-label">
                Both Eyes Together
              </label>
              <input
                type="text"
                id="binocular_vision"
                name="binocular_vision"
                value={formData.binocular_vision}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 6/6, 20/20"
              />
            </div>
          </div>
        )}

        {/* Findings and Recommendations */}
        <div className="form-section">
          <h3>Clinical Assessment</h3>
          
          <div className="form-group">
            <label htmlFor="findings" className="form-label">
              Test Findings
            </label>
            <textarea
              id="findings"
              name="findings"
              value={formData.findings}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Detailed test findings and observations..."
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
              placeholder="Clinical recommendations based on test results..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Additional observations or notes..."
            />
          </div>
        </div>

        {/* Follow-up */}
        <div className="form-section">
          <h3>Follow-up</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={handleChange}
                />
                Follow-up Required
              </label>
            </div>
          </div>
          
          {formData.follow_up_required && (
            <div className="form-group">
              <label htmlFor="follow_up_date" className="form-label">
                Follow-up Date
              </label>
              <input
                type="date"
                id="follow_up_date"
                name="follow_up_date"
                value={formData.follow_up_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          )}
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
            {loading ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVisualAcuityTestPage;