import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AddConsultationPage = () => {
  const { selectedPatient } = usePatient();
  const { user } = useAuth();
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

  // Auto-select patient from context when component loads
  useEffect(() => {
    if (selectedPatient && selectedPatient.id) {
      setFormData(prev => ({
        ...prev,
        patient: selectedPatient.id,
        // Auto-fill from selected patient data
        current_medications: selectedPatient.current_medications || '',
        allergies: selectedPatient.allergies || '',
        past_medical_history: selectedPatient.medical_history || ''
      }));
    }
  }, [selectedPatient]);

  // Auto-select current user as consulting doctor/nurse when doctors data loads
  useEffect(() => {
    if (user && doctors.length > 0) {
      // Find current user in the doctors/nurses list
      const currentUserStaff = doctors.find(doctor => 
        doctor.user_details?.id === user.id || 
        doctor.user_details?.username === user.username ||
        doctor.user === user.id
      );
      
      if (currentUserStaff) {
        setFormData(prev => ({
          ...prev,
          consulting_doctor: currentUserStaff.id
        }));
      }
    }
  }, [user, doctors]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [patientsRes, doctorsRes, nursesRes] = await Promise.all([
        api.getPatients(),
        api.getDoctors(),
        api.getNurses()
      ]);
      
      console.log('Raw Patients response:', patientsRes);
      console.log('Raw Doctors response:', doctorsRes);
      console.log('Raw Nurses response:', nursesRes);
      
      // Handle different response structures
      const patientsData = patientsRes.data?.results || patientsRes.data || [];
      const doctorsData = doctorsRes.data?.results || doctorsRes.data || [];
      const nursesData = nursesRes.data?.results || nursesRes.data || [];
      
      // Combine doctors and nurses for the consulting staff dropdown
      const allStaffData = [...doctorsData, ...nursesData];
      
      console.log('Processed Patients data:', patientsData);
      console.log('Processed All Staff data:', allStaffData);
      
      setPatients(patientsData);
      setDoctors(allStaffData);
      
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(`Failed to load form data: ${err.response?.status} - ${err.response?.statusText || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-fill patient information when patient is selected
    if (name === 'patient' && value) {
      const selectedPatient = patients.find(patient => patient.id === value);
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
          // Auto-fill from patient data
          current_medications: selectedPatient.current_medications || '',
          allergies: selectedPatient.allergies || '',
          past_medical_history: selectedPatient.medical_history || ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Get selected patient details
  const getSelectedPatient = () => {
    if (!formData.patient) return null;
    return patients.find(patient => patient.id.toString() === formData.patient.toString());
  };

  // Get selected doctor details
  const getSelectedDoctor = () => {
    if (!formData.consulting_doctor) return null;
    return doctors.find(doctor => doctor.id.toString() === formData.consulting_doctor.toString());
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
      
      {/* Selected Patient Information */}
      {getSelectedPatient() && (
        <div className="form-section patient-info-section">
          <h3>Selected Patient Information</h3>
          {(() => {
            const selectedPatient = getSelectedPatient();
            return (
              <div className="patient-summary">
                <div className="patient-basic-info">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date of Birth:</span>
                    <span className="info-value">
                      {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>
                </div>
                
                <details className="patient-details-dropdown">
                  <summary>View Additional Patient Details</summary>
                  <div className="patient-info-grid">
                    <div className="info-item">
                      <span className="info-label">Patient ID:</span>
                      <span className="info-value">{selectedPatient.patient_id || selectedPatient.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">
                        {selectedPatient.age || 'Unknown'} years
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Gender:</span>
                      <span className="info-value">{selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedPatient.phone_number || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedPatient.email || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Blood Group:</span>
                      <span className="info-value">{selectedPatient.blood_group || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">NHS Number:</span>
                      <span className="info-value">{selectedPatient.nhs_number || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Allergies:</span>
                      <span className="info-value">{selectedPatient.allergies || 'None known'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Current Medications:</span>
                      <span className="info-value">{selectedPatient.current_medications || 'None'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Emergency Contact:</span>
                      <span className="info-value">
                        {selectedPatient.emergency_contact_name 
                          ? `${selectedPatient.emergency_contact_name} (${selectedPatient.emergency_contact_relationship}) - ${selectedPatient.emergency_contact_phone}`
                          : 'Not provided'
                        }
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <span className="info-label">Address:</span>
                      <span className="info-value">
                        {[
                          selectedPatient.address_line_1,
                          selectedPatient.address_line_2,
                          selectedPatient.city,
                          selectedPatient.state,
                          selectedPatient.postal_code,
                          selectedPatient.country
                        ].filter(Boolean).join(', ') || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </details>
              </div>
            );
          })()}
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
                {patients.length > 0 ? (
                  patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name || `${patient.first_name} ${patient.last_name}`} ({patient.patient_id}) - Age: {patient.age} - {patient.phone_number || 'No phone'}
                    </option>
                  ))
                ) : (
                  !loading && <option value="" disabled>No patients available</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="consulting_doctor" className="form-label">
                Consulting Staff (Doctor/Nurse) *
              </label>
              <select
                id="consulting_doctor"
                name="consulting_doctor"
                value={formData.consulting_doctor}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Staff Member</option>
                {doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user_details?.user_type === 'doctor' ? 'Dr.' : 'Nurse'} {doctor.user_details?.first_name} {doctor.user_details?.last_name} - {doctor.specialization} ({doctor.department})
                    </option>
                  ))
                ) : (
                  !loading && <option value="" disabled>No staff available</option>
                )}
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

        {/* Add Tests Section */}
        {getSelectedPatient() && (
          <div className="form-section add-tests-section">
            <details className="add-tests-dropdown">
              <summary className="add-tests-header">
                <i className="fas fa-plus-circle"></i>
                <span>Add Tests</span>
                <i className="fas fa-chevron-down dropdown-arrow"></i>
              </summary>
              
              <div className="add-tests-content">
                <p className="section-description">Manage eye examinations and tests for this patient</p>
                
                <div className="eye-tests-grid">
                  <div className="eye-test-card">
                    <h4>General</h4>
                    <div className="test-links">
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests`} className="test-link">
                        <i className="fas fa-list"></i>
                        View All Eye Tests
                      </a>
                    </div>
                  </div>
                  
                  <div className="eye-test-card">
                    <h4>Vision Tests</h4>
                    <div className="test-links">
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/visual-acuity/add`} className="test-link">
                        <i className="fas fa-eye-dropper"></i>
                        Visual Acuity Test
                      </a>
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/refraction/add`} className="test-link">
                        <i className="fas fa-glasses"></i>
                        Refraction Test
                      </a>
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/visual-field/add`} className="test-link">
                        <i className="fas fa-circle-notch"></i>
                        Visual Field Test
                      </a>
                    </div>
                  </div>
                  
                  <div className="eye-test-card">
                    <h4>Pressure & Examination</h4>
                    <div className="test-links">
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/tonometry/add`} className="test-link">
                        <i className="fas fa-compress"></i>
                        Tonometry Test
                      </a>
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/ophthalmoscopy/add`} className="test-link">
                        <i className="fas fa-search"></i>
                        Ophthalmoscopy
                      </a>
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/slit-lamp/add`} className="test-link">
                        <i className="fas fa-microscope"></i>
                        Slit Lamp Exam
                      </a>
                    </div>
                  </div>
                  
                  <div className="eye-test-card">
                    <h4>Advanced Imaging</h4>
                    <div className="test-links">
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/oct/add`} className="test-link">
                        <i className="fas fa-camera"></i>
                        OCT Scan
                      </a>
                      <a href={`/patient/${getSelectedPatient().id}/eye-tests/fluorescein/add`} className="test-link">
                        <i className="fas fa-tint"></i>
                        Fluorescein Angiography
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

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