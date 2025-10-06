import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddConsultationPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    visit: '',
    consulting_doctor: '',
    consultation_type: '',
    status: 'scheduled',
    scheduled_time: '',
    actual_start_time: '',
    actual_end_time: '',
    chief_complaint: '',
    history_of_present_illness: '',
    past_ocular_history: '',
    past_medical_history: '',
    family_history: '',
    social_history: '',
    current_medications: '',
    allergies: '',
    general_examination: '',
    clinical_impression: '',
    diagnosis_primary: '',
    diagnosis_secondary: '',
    treatment_plan: '',
    follow_up_required: false,
    follow_up_duration: '',
    follow_up_instructions: '',
    referral_required: false,
    referral_to: '',
    referral_reason: '',
    consultation_notes: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  // const [visits, setVisits] = useState([]); // Commented out - not currently used
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const consultationTypes = [
    { value: 'initial', label: 'Initial Consultation' },
    { value: 'follow_up', label: 'Follow-up Consultation' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'pre_operative', label: 'Pre-operative Assessment' },
    { value: 'post_operative', label: 'Post-operative Follow-up' },
    { value: 'routine_check', label: 'Routine Check-up' },
    { value: 'second_opinion', label: 'Second Opinion' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.getPatients(),
        api.getDoctors()
        // api.getPatientVisits() - commented out as not currently used
      ]);
      
      setPatients(patientsRes.data.results || patientsRes.data || []);
      setDoctors(doctorsRes.data.results || doctorsRes.data || []);
      // setVisits(visitsRes.data.results || visitsRes.data || []); // Commented out - visits state not currently used
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
      const response = await api.createConsultation(formData);
      
      if (response.status === 201) {
        alert('Consultation created successfully!');
        navigate('/consultations');
      }
    } catch (err) {
      console.error('Error creating consultation:', err);
      setError(err.response?.data?.message || 'Failed to create consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Consultation</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="consultation-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient" className="form-label">
                Patient *
              </label>
              <select
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.patient_id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="consulting_doctor" className="form-label">
                Consulting Doctor *
              </label>
              <select
                id="consulting_doctor"
                name="consulting_doctor"
                value={formData.consulting_doctor}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consultation_type" className="form-label">
                Consultation Type *
              </label>
              <select
                id="consultation_type"
                name="consultation_type"
                value={formData.consultation_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Type</option>
                {consultationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scheduled_time" className="form-label">
                Scheduled Time *
              </label>
              <input
                type="datetime-local"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Chief Complaint and History */}
        <div className="form-section">
          <h3>Chief Complaint & History</h3>
          
          <div className="form-group">
            <label htmlFor="chief_complaint" className="form-label">
              Chief Complaint *
            </label>
            <textarea
              id="chief_complaint"
              name="chief_complaint"
              value={formData.chief_complaint}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Patient's primary concern..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="history_of_present_illness" className="form-label">
              History of Present Illness
            </label>
            <textarea
              id="history_of_present_illness"
              name="history_of_present_illness"
              value={formData.history_of_present_illness}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="past_ocular_history" className="form-label">
                Past Ocular History
              </label>
              <textarea
                id="past_ocular_history"
                name="past_ocular_history"
                value={formData.past_ocular_history}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="past_medical_history" className="form-label">
                Past Medical History
              </label>
              <textarea
                id="past_medical_history"
                name="past_medical_history"
                value={formData.past_medical_history}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="family_history" className="form-label">
                Family History
              </label>
              <textarea
                id="family_history"
                name="family_history"
                value={formData.family_history}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="social_history" className="form-label">
                Social History
              </label>
              <textarea
                id="social_history"
                name="social_history"
                value={formData.social_history}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Current Medications & Allergies */}
        <div className="form-section">
          <h3>Current Medications & Allergies</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current_medications" className="form-label">
                Current Medications
              </label>
              <textarea
                id="current_medications"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="List current medications, dosage, frequency..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="allergies" className="form-label">
                Known Allergies
              </label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="List known allergies and reactions..."
              />
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="form-section">
          <h3>Clinical Assessment</h3>
          
          <div className="form-group">
            <label htmlFor="general_examination" className="form-label">
              General Examination
            </label>
            <textarea
              id="general_examination"
              name="general_examination"
              value={formData.general_examination}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="General physical examination findings..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="clinical_impression" className="form-label">
              Clinical Impression
            </label>
            <textarea
              id="clinical_impression"
              name="clinical_impression"
              value={formData.clinical_impression}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Overall clinical assessment..."
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="diagnosis_primary" className="form-label">
                Primary Diagnosis
              </label>
              <textarea
                id="diagnosis_primary"
                name="diagnosis_primary"
                value={formData.diagnosis_primary}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="diagnosis_secondary" className="form-label">
                Secondary Diagnosis
              </label>
              <textarea
                id="diagnosis_secondary"
                name="diagnosis_secondary"
                value={formData.diagnosis_secondary}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="treatment_plan" className="form-label">
              Treatment Plan
            </label>
            <textarea
              id="treatment_plan"
              name="treatment_plan"
              value={formData.treatment_plan}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Detailed treatment plan and recommendations..."
            />
          </div>
        </div>

        {/* Follow-up & Referrals */}
        <div className="form-section">
          <h3>Follow-up & Referrals</h3>
          
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
            <>
              <div className="form-group">
                <label htmlFor="follow_up_duration" className="form-label">
                  Follow-up Duration
                </label>
                <input
                  type="text"
                  id="follow_up_duration"
                  name="follow_up_duration"
                  value={formData.follow_up_duration}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 2 weeks, 1 month, 6 months"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="follow_up_instructions" className="form-label">
                  Follow-up Instructions
                </label>
                <textarea
                  id="follow_up_instructions"
                  name="follow_up_instructions"
                  value={formData.follow_up_instructions}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="referral_required"
                  checked={formData.referral_required}
                  onChange={handleChange}
                />
                Referral Required
              </label>
            </div>
          </div>
          
          {formData.referral_required && (
            <>
              <div className="form-group">
                <label htmlFor="referral_to" className="form-label">
                  Referral To
                </label>
                <input
                  type="text"
                  id="referral_to"
                  name="referral_to"
                  value={formData.referral_to}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Department or specialist name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="referral_reason" className="form-label">
                  Referral Reason
                </label>
                <textarea
                  id="referral_reason"
                  name="referral_reason"
                  value={formData.referral_reason}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="2"
                />
              </div>
            </>
          )}
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          
          <div className="form-group">
            <label htmlFor="consultation_notes" className="form-label">
              Consultation Notes
            </label>
            <textarea
              id="consultation_notes"
              name="consultation_notes"
              value={formData.consultation_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Additional notes and observations..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/consultations')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultationPage;