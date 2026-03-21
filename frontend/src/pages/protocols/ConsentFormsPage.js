import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ConsentFormsPage.css';

const ConsentFormsPage = () => {
  const { patientId } = useParams(); // Optional - if viewing for specific patient
  const navigate = useNavigate();
  
  const [consents, setConsents] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // New consent form data
  const [newConsent, setNewConsent] = useState({
    protocol: '',
    consent_type: 'informed',
    title: '',
    description: '',
    consent_given: false,
    witness_required: false,
    witness_name: '',
    witness_signature: ''
  });

  useEffect(() => {
    fetchConsents();
    if (patientId) {
      fetchPatient();
      fetchPatientProtocols();
    } else {
      fetchAllProtocols();
    }
  }, [patientId]);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/protocols/consent-forms/';
      if (patientId) {
        url = `/api/protocols/patients/${patientId}/consents/`;
      }
      
      const response = await api.get(url);
      const data = response.data.results || response.data;
      setConsents(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching consents:', err);
      setError('Failed to load consent forms');
      setLoading(false);
    }
  };

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/api/patients/${patientId}/`);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient:', err);
    }
  };

  const fetchPatientProtocols = async () => {
    try {
      const response = await api.get(`/api/protocols/patient-protocols/?patient=${patientId}`);
      const data = response.data.results || response.data;
      // Get unique protocols
      const uniqueProtocols = data.map(pp => ({
        id: pp.protocol,
        name: pp.protocol_name
      }));
      setProtocols(uniqueProtocols);
    } catch (err) {
      console.error('Error fetching protocols:', err);
    }
  };

  const fetchAllProtocols = async () => {
    try {
      const response = await api.get('protocols');
      const data = response.data.results || response.data;
      setProtocols(data);
    } catch (err) {
      console.error('Error fetching protocols:', err);
    }
  };

  const handleAddConsent = async (e) => {
    e.preventDefault();
    
    if (!newConsent.protocol || !newConsent.title) {
      setError('Please select a protocol and provide a title');
      return;
    }

    if (!patientId) {
      setError('Patient ID is required to create consent');
      return;
    }

    try {
      const consentData = {
        patient: patientId,
        protocol: newConsent.protocol,
        consent_type: newConsent.consent_type,
        title: newConsent.title,
        description: newConsent.description,
        consent_given: newConsent.consent_given,
        witness_required: newConsent.witness_required,
        witness_name: newConsent.witness_name || null,
        witness_signature: newConsent.witness_signature || null
      };

      await api.post('protocols/consent-forms', consentData);
      
      setShowAddForm(false);
      setNewConsent({
        protocol: '',
        consent_type: 'informed',
        title: '',
        description: '',
        consent_given: false,
        witness_required: false,
        witness_name: '',
        witness_signature: ''
      });
      
      fetchConsents();
    } catch (err) {
      console.error('Error creating consent:', err);
      setError(err.response?.data?.detail || 'Failed to create consent form');
    }
  };

  const handleWithdrawConsent = async (consentId) => {
    if (!window.confirm('Are you sure you want to withdraw this consent? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for withdrawal:');
    if (!reason) {
      alert('Withdrawal reason is required');
      return;
    }

    try {
      await api.post(`/api/protocols/consent/${consentId}/withdraw/`, {
        withdrawal_reason: reason
      });
      
      fetchConsents();
    } catch (err) {
      console.error('Error withdrawing consent:', err);
      alert('Failed to withdraw consent');
    }
  };

  const getStatusBadgeClass = (consent) => {
    if (consent.withdrawn) return 'status-withdrawn';
    if (!consent.consent_given) return 'status-pending';
    if (consent.expiry_date && new Date(consent.expiry_date) < new Date()) {
      return 'status-expired';
    }
    return 'status-active';
  };

  const getStatusText = (consent) => {
    if (consent.withdrawn) return 'Withdrawn';
    if (!consent.consent_given) return 'Pending';
    if (consent.expiry_date && new Date(consent.expiry_date) < new Date()) {
      return 'Expired';
    }
    return 'Active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredConsents = () => {
    if (filterStatus === 'all') return consents;
    const status = filterStatus;
    return consents.filter(consent => {
      const consentStatus = getStatusText(consent).toLowerCase();
      return consentStatus === status;
    });
  };

  if (loading) {
    return (
      <div className="consent-forms-page">
        <div className="loading-spinner">Loading consent forms...</div>
      </div>
    );
  }

  return (
    <div className="consent-forms-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <div>
            <h1>Protocol Consent Forms</h1>
            {patient && (
              <p className="patient-name">
                Patient: <Link to={`/patients/${patientId}`}>{patient.first_name} {patient.last_name}</Link>
              </p>
            )}
          </div>
        </div>
        
        {patientId && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-consent-btn"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Consent Form'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Add Consent Form */}
      {showAddForm && (
        <div className="add-consent-form">
          <h3>Create New Consent Form</h3>
          <form onSubmit={handleAddConsent}>
            <div className="form-row">
              <div className="form-group">
                <label>Protocol *</label>
                <select
                  value={newConsent.protocol}
                  onChange={(e) => setNewConsent({...newConsent, protocol: e.target.value})}
                  required
                >
                  <option value="">Select Protocol</option>
                  {protocols.map(protocol => (
                    <option key={protocol.id} value={protocol.id}>
                      {protocol.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consent Type *</label>
                <select
                  value={newConsent.consent_type}
                  onChange={(e) => setNewConsent({...newConsent, consent_type: e.target.value})}
                  required
                >
                  <option value="informed">Informed Consent</option>
                  <option value="treatment">Treatment Consent</option>
                  <option value="research">Research Consent</option>
                  <option value="data_sharing">Data Sharing Consent</option>
                  <option value="photography">Photography Consent</option>
                  <option value="anesthesia">Anesthesia Consent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newConsent.title}
                onChange={(e) => setNewConsent({...newConsent, title: e.target.value})}
                placeholder="e.g., Informed Consent for Anti-VEGF Injection"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newConsent.description}
                onChange={(e) => setNewConsent({...newConsent, description: e.target.value})}
                placeholder="Detailed description of what the patient is consenting to..."
                rows="4"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newConsent.consent_given}
                  onChange={(e) => setNewConsent({...newConsent, consent_given: e.target.checked})}
                />
                <span>Consent Obtained</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newConsent.witness_required}
                  onChange={(e) => setNewConsent({...newConsent, witness_required: e.target.checked})}
                />
                <span>Witness Required</span>
              </label>
            </div>

            {newConsent.witness_required && (
              <div className="form-row">
                <div className="form-group">
                  <label>Witness Name</label>
                  <input
                    type="text"
                    value={newConsent.witness_name}
                    onChange={(e) => setNewConsent({...newConsent, witness_name: e.target.value})}
                    placeholder="Witness full name"
                  />
                </div>
                <div className="form-group">
                  <label>Witness Signature</label>
                  <input
                    type="text"
                    value={newConsent.witness_signature}
                    onChange={(e) => setNewConsent({...newConsent, witness_signature: e.target.value})}
                    placeholder="Signature confirmation"
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Consent Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All ({consents.length})
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active ({consents.filter(c => getStatusText(c) === 'Active').length})
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({consents.filter(c => getStatusText(c) === 'Pending').length})
        </button>
        <button
          className={filterStatus === 'withdrawn' ? 'active' : ''}
          onClick={() => setFilterStatus('withdrawn')}
        >
          Withdrawn ({consents.filter(c => c.withdrawn).length})
        </button>
        <button
          className={filterStatus === 'expired' ? 'active' : ''}
          onClick={() => setFilterStatus('expired')}
        >
          Expired ({consents.filter(c => getStatusText(c) === 'Expired').length})
        </button>
      </div>

      {/* Consents List */}
      {filteredConsents().length === 0 ? (
        <div className="no-consents">
          <div className="no-consents-icon">📋</div>
          <h3>No Consent Forms Found</h3>
          <p>
            {showAddForm ? 'Fill out the form above to create a consent.' : 
             patientId ? 'Click "Add Consent Form" to create one.' :
             'No consent forms in the system.'}
          </p>
        </div>
      ) : (
        <div className="consents-grid">
          {filteredConsents().map(consent => (
            <div key={consent.id} className={`consent-card ${getStatusBadgeClass(consent)}`}>
              <div className="consent-header">
                <h3>{consent.title}</h3>
                <span className={`status-badge ${getStatusBadgeClass(consent)}`}>
                  {getStatusText(consent)}
                </span>
              </div>

              <div className="consent-details">
                <div className="detail-row">
                  <strong>Protocol:</strong>
                  <span>{consent.protocol_name}</span>
                </div>
                <div className="detail-row">
                  <strong>Type:</strong>
                  <span>{consent.consent_type.replace('_', ' ')}</span>
                </div>
                {!patientId && (
                  <div className="detail-row">
                    <strong>Patient:</strong>
                    <Link to={`/patients/${consent.patient}`}>{consent.patient_name}</Link>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Date Given:</strong>
                  <span>{formatDate(consent.consent_date)}</span>
                </div>
                {consent.expiry_date && (
                  <div className="detail-row">
                    <strong>Expiry Date:</strong>
                    <span>{formatDate(consent.expiry_date)}</span>
                  </div>
                )}
                {consent.witness_required && (
                  <div className="detail-row">
                    <strong>Witness:</strong>
                    <span>{consent.witness_name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {consent.description && (
                <p className="consent-description">{consent.description}</p>
              )}

              {consent.withdrawn && (
                <div className="withdrawal-info">
                  <div className="detail-row">
                    <strong>Withdrawn:</strong>
                    <span>{formatDate(consent.withdrawal_date)}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Reason:</strong>
                    <span>{consent.withdrawal_reason}</span>
                  </div>
                </div>
              )}

              <div className="consent-actions">
                {!consent.withdrawn && consent.consent_given && (
                  <button
                    onClick={() => handleWithdrawConsent(consent.id)}
                    className="withdraw-btn"
                  >
                    Withdraw Consent
                  </button>
                )}
                <button
                  onClick={() => navigate(`/consents/${consent.id}`)}
                  className="view-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsentFormsPage;
