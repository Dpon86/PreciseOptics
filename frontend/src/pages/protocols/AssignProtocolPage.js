import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import './AssignProtocolPage.css';

const AssignProtocolPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [protocols, setProtocols] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [protocolDetails, setProtocolDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    patient: patientId || '',
    protocol: '',
    start_date: new Date().toISOString().split('T')[0],
    assignment_reason: ''
  });

  useEffect(() => {
    fetchProtocols();
    if (!patientId) {
      fetchPatients();
    }
  }, [patientId]);

  useEffect(() => {
    if (formData.protocol) {
      fetchProtocolDetails(formData.protocol);
    }
  }, [formData.protocol]);

  const fetchProtocols = async () => {
    try {
      const response = await apiService.getProtocols({ is_active: true });
      setProtocols(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (err) {
      console.error('Error fetching protocols:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiService.getPatients();
      setPatients(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchProtocolDetails = async (protocolId) => {
    try {
      const response = await apiService.getProtocol(protocolId);
      setProtocolDetails(response.data);
      setSelectedProtocol(response.data);
    } catch (err) {
      console.error('Error fetching protocol details:', err);
      setProtocolDetails(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiService.assignProtocolToPatient(formData);
      setSuccess(true);
      
      setTimeout(() => {
        if (patientId) {
          navigate(`/patients/${patientId}/protocols`);
        } else {
          navigate(`/patients/${formData.patient}/protocols`);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to assign protocol');
    } finally {
      setLoading(false);
    }
  };

  const calculateStepDates = () => {
    if (!protocolDetails || !formData.start_date) return [];
    
    const startDate = new Date(formData.start_date);
    const steps = [];
    
    protocolDetails.steps.forEach((step, index) => {
      const stepDate = new Date(startDate);
      stepDate.setDate(stepDate.getDate() + step.timing_days);
      
      steps.push({
        ...step,
        calculated_date: stepDate.toLocaleDateString(),
        medications_count: step.medications?.length || 0,
        treatments_count: step.treatments?.length || 0,
        tests_count: step.tests?.length || 0
      });
    });
    
    return steps;
  };

  const scheduledSteps = calculateStepDates();

  return (
    <div className="assign-protocol-page">
      <div className="page-header">
        <div className="header-left">
          <button 
            onClick={() => navigate(patientId ? `/patients/${patientId}` : '/protocols')} 
            className="btn-back"
          >
            ← Back
          </button>
          <h1>Assign Protocol to Patient</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success!</strong> Protocol assigned successfully. Redirecting...
        </div>
      )}

      <div className="assign-protocol-content">
        <form onSubmit={handleSubmit} className="assignment-form">
          <div className="form-section">
            <h2>Assignment Details</h2>
            
            {!patientId && (
              <div className="form-group">
                <label htmlFor="patient">Patient *</label>
                <select
                  id="patient"
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.patient_id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="protocol">Protocol *</label>
              <select
                id="protocol"
                name="protocol"
                value={formData.protocol}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a protocol</option>
                {protocols.map(protocol => (
                  <option key={protocol.id} value={protocol.id}>
                    {protocol.name} ({protocol.code})
                  </option>
                ))}
              </select>
              {selectedProtocol && (
                <small className="form-help">
                  Type: {selectedProtocol.protocol_type_display} | 
                  Steps: {selectedProtocol.step_count || 0} | 
                  Duration: {selectedProtocol.total_duration_weeks ? `${selectedProtocol.total_duration_weeks} weeks` : 'Ongoing'}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignment_reason">Clinical Reason *</label>
              <textarea
                id="assignment_reason"
                name="assignment_reason"
                value={formData.assignment_reason}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter the clinical indication for this protocol..."
                required
              />
            </div>
          </div>

          {protocolDetails && (
            <div className="protocol-preview">
              <h2>Protocol Preview</h2>
              
              <div className="protocol-info-card">
                <h3>{protocolDetails.name}</h3>
                <p className="protocol-code">{protocolDetails.code}</p>
                <p className="protocol-description">{protocolDetails.description}</p>
                
                <div className="protocol-stats">
                  <div className="stat">
                    <span className="stat-label">Type:</span>
                    <span className="stat-value">{protocolDetails.protocol_type_display}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Condition:</span>
                    <span className="stat-value">{protocolDetails.condition_name}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">
                      {protocolDetails.total_duration_weeks 
                        ? `${protocolDetails.total_duration_weeks} weeks`
                        : 'Ongoing'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Steps:</span>
                    <span className="stat-value">{scheduledSteps.length}</span>
                  </div>
                </div>

                {protocolDetails.requires_consent && (
                  <div className="consent-warning">
                    ⚠️ This protocol requires patient consent
                  </div>
                )}
              </div>

              <div className="scheduled-steps-preview">
                <h3>Scheduled Steps</h3>
                <div className="steps-timeline">
                  {scheduledSteps.map((step, index) => (
                    <div key={index} className="timeline-step">
                      <div className="step-marker">
                        <div className="step-number">{step.step_number}</div>
                      </div>
                      <div className="step-content">
                        <div className="step-header">
                          <span className="step-title">{step.title}</span>
                          <span className="step-date">{step.calculated_date}</span>
                        </div>
                        <div className="step-type-badge">{step.step_type_display}</div>
                        <div className="step-details">
                          {step.medications_count > 0 && (
                            <span className="detail-badge medications">
                              💊 {step.medications_count} medication{step.medications_count !== 1 ? 's' : ''}
                            </span>
                          )}
                          {step.treatments_count > 0 && (
                            <span className="detail-badge treatments">
                              🏥 {step.treatments_count} treatment{step.treatments_count !== 1 ? 's' : ''}
                            </span>
                          )}
                          {step.tests_count > 0 && (
                            <span className="detail-badge tests">
                              🔬 {step.tests_count} test{step.tests_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {step.description && (
                          <p className="step-description">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(patientId ? `/patients/${patientId}` : '/protocols')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.protocol}
            >
              {loading ? 'Assigning Protocol...' : 'Assign Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignProtocolPage;
