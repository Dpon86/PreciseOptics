import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AddTreatmentPage.css';

const AddTreatmentPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [medications, setMedications] = useState([]);
  
  const [formData, setFormData] = useState({
    patient: patientId || '',
    consultation: '',
    treatment_type: 'medical',
    treatment_name: '',
    treatment_description: '',
    treatment_category: 'medication',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    duration_days: '',
    treatment_status: 'active',
    priority_level: 'medium',
    prescribed_by: '',
    administered_by: '',
    treatment_goals: '',
    success_criteria: '',
    side_effects: '',
    contraindications: '',
    special_instructions: '',
    follow_up_required: false,
    follow_up_date: '',
    cost_estimate: '',
    insurance_covered: false,
    treatment_notes: '',
    emergency_instructions: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchPatientConsultations();
    }
    fetchMedications();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      const response = await api.getPatient(patientId);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient information');
    }
  };

  const fetchPatientConsultations = async () => {
    try {
      const response = await api.getConsultations({ patient: patientId });
      setConsultations(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await api.getMedications();
      setMedications(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  const handleInputChange = (e) => {
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
      // Prepare treatment data
      const treatmentData = {
        ...formData,
        patient: patientId,
        end_date: formData.end_date || null,
        follow_up_date: formData.follow_up_required ? formData.follow_up_date : null,
        cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null
      };

      // Create treatment
      await api.createTreatment(treatmentData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/patients/${patientId}/progress`);
      }, 2000);

    } catch (err) {
      console.error('Error creating treatment:', err);
      setError(err.response?.data?.message || 'Failed to create treatment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/patients/${patientId}/progress`);
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Treatment Added Successfully!</h2>
          <p>Redirecting to patient progress dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container add-treatment-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Back to Patient
          </button>
          <div className="header-info">
            <h1>Add Treatment Plan</h1>
            {patient && (
              <p className="patient-info">
                Patient: {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="treatment-form">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="consultation">Related Consultation</label>
                <select
                  id="consultation"
                  name="consultation"
                  value={formData.consultation}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Consultation (Optional)</option>
                  {consultations.map(consultation => (
                    <option key={consultation.id} value={consultation.id}>
                      {new Date(consultation.consultation_date).toLocaleDateString()} - {consultation.chief_complaint}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="treatment_type">Treatment Type *</label>
                <select
                  id="treatment_type"
                  name="treatment_type"
                  value={formData.treatment_type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="medical">Medical Treatment</option>
                  <option value="surgical">Surgical Procedure</option>
                  <option value="therapeutic">Therapeutic Intervention</option>
                  <option value="preventive">Preventive Care</option>
                  <option value="rehabilitation">Rehabilitation</option>
                  <option value="palliative">Palliative Care</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="treatment_category">Category</label>
                <select
                  id="treatment_category"
                  name="treatment_category"
                  value={formData.treatment_category}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="medication">Medication Therapy</option>
                  <option value="eye_drops">Eye Drops</option>
                  <option value="surgery">Surgical Procedure</option>
                  <option value="laser_therapy">Laser Therapy</option>
                  <option value="injection">Injection Treatment</option>
                  <option value="physical_therapy">Physical Therapy</option>
                  <option value="lifestyle">Lifestyle Modification</option>
                  <option value="monitoring">Monitoring/Observation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority_level">Priority Level</label>
                <select
                  id="priority_level"
                  name="priority_level"
                  value={formData.priority_level}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="treatment_status">Status</label>
                <select
                  id="treatment_status"
                  name="treatment_status"
                  value={formData.treatment_status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Treatment Details */}
          <div className="form-section">
            <h3>Treatment Details</h3>
            
            <div className="form-group full-width">
              <label htmlFor="treatment_name">Treatment Name *</label>
              <input
                type="text"
                id="treatment_name"
                name="treatment_name"
                value={formData.treatment_name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g., Latanoprost Eye Drops, Cataract Surgery, IOP Monitoring"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="treatment_description">Detailed Description *</label>
              <textarea
                id="treatment_description"
                name="treatment_description"
                value={formData.treatment_description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Comprehensive description of the treatment plan, methodology, and approach"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="treatment_goals">Treatment Goals</label>
              <textarea
                id="treatment_goals"
                name="treatment_goals"
                value={formData.treatment_goals}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Specific goals and expected outcomes of this treatment"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="success_criteria">Success Criteria</label>
              <textarea
                id="success_criteria"
                name="success_criteria"
                value={formData.success_criteria}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Measurable criteria to determine treatment success"
              />
            </div>
          </div>

          {/* Schedule and Duration */}
          <div className="form-section">
            <h3>Schedule and Duration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="form-control"
                  min={formData.start_date}
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration_days">Duration (Days)</label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleInputChange}
                  className="form-control"
                  min="1"
                  placeholder="e.g., 30"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cost_estimate">Cost Estimate ($)</label>
                <input
                  type="number"
                  id="cost_estimate"
                  name="cost_estimate"
                  value={formData.cost_estimate}
                  onChange={handleInputChange}
                  className="form-control"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group full-width checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="insurance_covered"
                  checked={formData.insurance_covered}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Insurance Coverage Available
              </label>
            </div>
          </div>

          {/* Safety and Instructions */}
          <div className="form-section">
            <h3>Safety and Instructions</h3>
            
            <div className="form-group full-width">
              <label htmlFor="special_instructions">Special Instructions</label>
              <textarea
                id="special_instructions"
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Specific instructions for treatment administration and patient compliance"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="side_effects">Potential Side Effects</label>
              <textarea
                id="side_effects"
                name="side_effects"
                value={formData.side_effects}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Known side effects and adverse reactions to monitor"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="contraindications">Contraindications</label>
              <textarea
                id="contraindications"
                name="contraindications"
                value={formData.contraindications}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Conditions or factors that make this treatment inadvisable"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="emergency_instructions">Emergency Instructions</label>
              <textarea
                id="emergency_instructions"
                name="emergency_instructions"
                value={formData.emergency_instructions}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="What to do in case of emergency or severe adverse reactions"
              />
            </div>
          </div>

          {/* Follow-up */}
          <div className="form-section">
            <h3>Follow-up and Monitoring</h3>
            
            <div className="form-group full-width checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Follow-up Appointment Required
              </label>
            </div>

            {formData.follow_up_required && (
              <div className="form-group">
                <label htmlFor="follow_up_date">Follow-up Date *</label>
                <input
                  type="date"
                  id="follow_up_date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                  className="form-control"
                  required={formData.follow_up_required}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="treatment_notes">Additional Notes</label>
              <textarea
                id="treatment_notes"
                name="treatment_notes"
                value={formData.treatment_notes}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Additional notes, observations, or special considerations"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Adding Treatment...
                </>
              ) : (
                'Add Treatment Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTreatmentPage;