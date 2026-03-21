import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CreateReferralPage.css';

const CreateReferralPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patient: '',
    referral_source: '',
    direction: 'outgoing',
    urgency: 'routine',
    reason: 'specialist_opinion',
    clinical_summary: '',
    relevant_history: '',
    current_medications: '',
    allergies: '',
    specific_questions: '',
    requested_services: '',
    referral_date: new Date().toISOString().split('T')[0],
    current_status: 'draft'
  });

  const [patients, setPatients] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [searchingSources, setSearchingSources] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchSources();
  }, []);

  const fetchPatients = async (search = '') => {
    try {
      setSearchingPatients(true);
      const params = search ? { search } : {};
      const response = await api.get('patients', { params });
      const data = response.data.results || response.data;
      setPatients(data);
      setSearchingPatients(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setSearchingPatients(false);
    }
  };

  const fetchSources = async (search = '') => {
    try {
      setSearchingSources(true);
      const params = { is_active: true };
      if (search) params.search = search;
      const response = await api.get('referrals/sources', { params });
      const data = response.data.results || response.data;
      setSources(data);
      setSearchingSources(false);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setSearchingSources(false);
    }
  };

  const handlePatientSearch = (e) => {
    const value = e.target.value;
    setPatientSearch(value);
    if (value.length >= 2) {
      fetchPatients(value);
    } else if (value.length === 0) {
      fetchPatients();
    }
  };

  const handleSourceSearch = (e) => {
    const value = e.target.value;
    setSourceSearch(value);
    if (value.length >= 2) {
      fetchSources(value);
    } else if (value.length === 0) {
      fetchSources();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, sendImmediately = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patient) {
      setError('Please select a patient');
      return;
    }
    if (!formData.referral_source) {
      setError('Please select a referral source');
      return;
    }
    if (!formData.clinical_summary || formData.clinical_summary.trim().length < 20) {
      setError('Please provide a clinical summary (minimum 20 characters)');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create referral
      const response = await api.post('referrals', formData);
      const referralId = response.data.id;
      
      // If sendImmediately is true, send the referral right away
      if (sendImmediately) {
        try {
          await api.post(`referrals/${referralId}/send`);
          alert('Referral created and sent successfully!');
        } catch (sendErr) {
          console.error('Error sending referral:', sendErr);
          alert('Referral created but failed to send. You can send it from the referrals page.');
        }
      } else {
        alert('Referral created successfully as draft!');
      }
      
      navigate('/referrals');
      
    } catch (err) {
      console.error('Error creating referral:', err);
      setError(err.response?.data?.error || 'Failed to create referral');
      setLoading(false);
    }
  };

  const getSelectedPatient = () => {
    return patients.find(p => p.id === formData.patient);
  };

  const getSelectedSource = () => {
    return sources.find(s => s.id === formData.referral_source);
  };

  return (
    <div className="create-referral-page">
      <div className="page-header">
        <h1>Create New Referral</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/referrals')}
        >
          ← Back to Referrals
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form className="referral-form" onSubmit={(e) => handleSubmit(e, false)}>
        {/* Section 1: Core Information */}
        <div className="form-section">
          <h2>Core Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Direction *</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                required
              >
                <option value="outgoing">Outgoing - Referring patient out</option>
                <option value="incoming">Incoming - Receiving referral</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Referral Date *</label>
              <input
                type="date"
                name="referral_date"
                value={formData.referral_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Urgency *</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                required
              >
                <option value="routine">Routine (30 days)</option>
                <option value="soon">Soon (21 days)</option>
                <option value="urgent">Urgent (7 days)</option>
                <option value="emergency">Emergency (1 day)</option>
              </select>
              <small className="help-text">
                Urgency determines the expected response time
              </small>
            </div>
            
            <div className="form-group">
              <label>Reason *</label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
              >
                <option value="specialist_opinion">Specialist Opinion</option>
                <option value="surgical_evaluation">Surgical Evaluation</option>
                <option value="advanced_imaging">Advanced Imaging</option>
                <option value="subspecialty_care">Subspecialty Care</option>
                <option value="second_opinion">Second Opinion</option>
                <option value="laser_treatment">Laser Treatment</option>
                <option value="complex_diagnosis">Complex Diagnosis</option>
                <option value="post_op_care">Post-Operative Care</option>
                <option value="emergency_care">Emergency Care</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Patient Selection */}
        <div className="form-section">
          <h2>Patient Selection</h2>
          
          <div className="form-group">
            <label>Search Patient *</label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={patientSearch}
              onChange={handlePatientSearch}
              className="search-input"
            />
            {searchingPatients && <small>Searching...</small>}
          </div>
          
          <div className="form-group">
            <label>Select Patient *</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a patient --</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} - {patient.patient_id || patient.id.substring(0,8)}
                </option>
              ))}
            </select>
          </div>
          
          {getSelectedPatient() && (
            <div className="patient-details-preview">
              <h4>Patient Details:</h4>
              <div className="detail-row">
                <span className="label">Name:</span>
                <span>{getSelectedPatient().first_name} {getSelectedPatient().last_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date of Birth:</span>
                <span>{getSelectedPatient().date_of_birth || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{getSelectedPatient().phone_number || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Referral Source */}
        <div className="form-section">
          <h2>Referral Source</h2>
          
          <div className="form-group">
            <label>Search Source *</label>
            <input
              type="text"
              placeholder="Search by name or type..."
              value={sourceSearch}
              onChange={handleSourceSearch}
              className="search-input"
            />
            {searchingSources && <small>Searching...</small>}
          </div>
          
          <div className="form-group">
            <label>Select Source *</label>
            <select
              name="referral_source"
              value={formData.referral_source}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a referral source --</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name} - {source.source_type} {source.is_preferred ? '⭐' : ''}
                </option>
              ))}
            </select>
            <small className="help-text">
              ⭐ indicates preferred sources | 
              <button 
                type="button"
                className="link-button"
                onClick={() => window.open('/referral-sources/add', '_blank')}
              >
                Add New Source
              </button>
            </small>
          </div>
          
          {getSelectedSource() && (
            <div className="source-details-preview">
              <h4>Source Details:</h4>
              <div className="detail-row">
                <span className="label">Name:</span>
                <span>{getSelectedSource().name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span>{getSelectedSource().source_type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Contact:</span>
                <span>{getSelectedSource().contact_person || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{getSelectedSource().phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{getSelectedSource().email || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Clinical Information */}
        <div className="form-section">
          <h2>Clinical Information</h2>
          
          <div className="form-group">
            <label>Clinical Summary * (minimum 20 characters)</label>
            <textarea
              name="clinical_summary"
              value={formData.clinical_summary}
              onChange={handleInputChange}
              rows="6"
              placeholder="Provide a comprehensive summary of the patient's condition, symptoms, and reason for referral..."
              required
            ></textarea>
            <small className="char-count">
              {formData.clinical_summary.length} characters
            </small>
          </div>
          
          <div className="form-group">
            <label>Relevant Medical History</label>
            <textarea
              name="relevant_history"
              value={formData.relevant_history}
              onChange={handleInputChange}
              rows="4"
              placeholder="Include relevant past medical history, surgeries, treatments, etc."
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                name="current_medications"
                value={formData.current_medications}
                onChange={handleInputChange}
                rows="3"
                placeholder="List current medications with dosages..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows="3"
                placeholder="List any known allergies..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-group">
            <label>Specific Questions for Specialist</label>
            <textarea
              name="specific_questions"
              value={formData.specific_questions}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any specific questions you'd like the specialist to address..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Requested Services</label>
            <textarea
              name="requested_services"
              value={formData.requested_services}
              onChange={handleInputChange}
              rows="3"
              placeholder="Specify any particular tests, procedures, or services requested..."
            ></textarea>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/referrals')}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            type="button"
            className="btn btn-success"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save and Send'}
          </button>
        </div>
      </form>

      <div className="help-section">
        <h3>Need Help?</h3>
        <ul>
          <li><strong>Draft:</strong> Save referral without sending - you can edit later</li>
          <li><strong>Send:</strong> Immediately send referral to the external provider</li>
          <li><strong>Urgency:</strong> Sets expected response time (Emergency: 1 day, Urgent: 7 days, Soon: 21 days, Routine: 30 days)</li>
          <li><strong>Direction:</strong> Outgoing = referring patient to external provider, Incoming = receiving referral from external source</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateReferralPage;
