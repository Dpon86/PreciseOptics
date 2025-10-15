import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AddDiagnosisPage.css';

const AddDiagnosisPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  
  const [formData, setFormData] = useState({
    patient: patientId || '',
    consultation: '',
    diagnosis_type: 'primary',
    diagnosis_code: '',
    diagnosis_name: '',
    diagnosis_description: '',
    severity: 'mild',
    onset_date: '',
    diagnosis_status: 'active',
    differential_diagnoses: '',
    clinical_notes: '',
    icd_10_code: '',
    follow_up_required: false,
    follow_up_date: '',
    treatment_recommended: '',
    prognosis: 'good',
    diagnosed_by: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchPatientConsultations();
    }
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
      // Prepare diagnosis data
      const diagnosisData = {
        ...formData,
        patient: patientId,
        onset_date: formData.onset_date || null,
        follow_up_date: formData.follow_up_required ? formData.follow_up_date : null
      };

      // Create diagnosis
      await api.createDiagnosis(diagnosisData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/patients/${patientId}/progress`);
      }, 2000);

    } catch (err) {
      console.error('Error creating diagnosis:', err);
      setError(err.response?.data?.message || 'Failed to create diagnosis. Please try again.');
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
          <h2>Diagnosis Added Successfully!</h2>
          <p>Redirecting to patient progress dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container add-diagnosis-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleCancel} className="btn btn-secondary">
            ← Back to Patient
          </button>
          <div className="header-info">
            <h1>Add Diagnosis</h1>
            {patient && (
              <p className="patient-info">
                Patient: {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="diagnosis-form">
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
                <label htmlFor="diagnosis_type">Diagnosis Type *</label>
                <select
                  id="diagnosis_type"
                  name="diagnosis_type"
                  value={formData.diagnosis_type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="primary">Primary Diagnosis</option>
                  <option value="secondary">Secondary Diagnosis</option>
                  <option value="differential">Differential Diagnosis</option>
                  <option value="provisional">Provisional Diagnosis</option>
                  <option value="rule_out">Rule Out</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="severity">Severity Level</label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="diagnosis_status">Status</label>
                <select
                  id="diagnosis_status"
                  name="diagnosis_status"
                  value={formData.diagnosis_status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="chronic">Chronic</option>
                  <option value="inactive">Inactive</option>
                  <option value="rule_out">Rule Out</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="onset_date">Onset Date</label>
                <input
                  type="date"
                  id="onset_date"
                  name="onset_date"
                  value={formData.onset_date}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prognosis">Prognosis</label>
                <select
                  id="prognosis"
                  name="prognosis"
                  value={formData.prognosis}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="guarded">Guarded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnosis Details */}
          <div className="form-section">
            <h3>Diagnosis Details</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="diagnosis_name">Diagnosis Name *</label>
                <input
                  type="text"
                  id="diagnosis_name"
                  name="diagnosis_name"
                  value={formData.diagnosis_name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Primary Open Angle Glaucoma"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="diagnosis_code">Diagnosis Code</label>
                <input
                  type="text"
                  id="diagnosis_code"
                  name="diagnosis_code"
                  value={formData.diagnosis_code}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Internal diagnosis code"
                />
              </div>

              <div className="form-group">
                <label htmlFor="icd_10_code">ICD-10 Code</label>
                <input
                  type="text"
                  id="icd_10_code"
                  name="icd_10_code"
                  value={formData.icd_10_code}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., H40.1"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="diagnosis_description">Detailed Description *</label>
              <textarea
                id="diagnosis_description"
                name="diagnosis_description"
                value={formData.diagnosis_description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Detailed description of the diagnosis including findings and clinical presentation"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="differential_diagnoses">Differential Diagnoses</label>
              <textarea
                id="differential_diagnoses"
                name="differential_diagnoses"
                value={formData.differential_diagnoses}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Other possible diagnoses considered"
              />
            </div>
          </div>

          {/* Treatment and Follow-up */}
          <div className="form-section">
            <h3>Treatment and Follow-up</h3>
            
            <div className="form-group full-width">
              <label htmlFor="treatment_recommended">Recommended Treatment</label>
              <textarea
                id="treatment_recommended"
                name="treatment_recommended"
                value={formData.treatment_recommended}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Recommended treatment plan and interventions"
              />
            </div>

            <div className="form-group full-width checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Follow-up Required
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
          </div>

          {/* Clinical Notes */}
          <div className="form-section">
            <h3>Clinical Notes</h3>
            <div className="form-group full-width">
              <label htmlFor="clinical_notes">Additional Clinical Notes</label>
              <textarea
                id="clinical_notes"
                name="clinical_notes"
                value={formData.clinical_notes}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Additional observations, clinical findings, or notes"
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
                  Adding Diagnosis...
                </>
              ) : (
                'Add Diagnosis'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiagnosisPage;