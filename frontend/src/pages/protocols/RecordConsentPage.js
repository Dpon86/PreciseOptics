import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './RecordConsentPage.css';

const CONSENT_TYPES = [
  { value: 'treatment', label: 'Treatment Consent' },
  { value: 'procedure', label: 'Procedure Consent' },
  { value: 'medication', label: 'Medication Consent' },
  { value: 'protocol', label: 'Protocol Consent' },
  { value: 'surgery', label: 'Surgery Consent' },
  { value: 'research', label: 'Research Participation' },
  { value: 'data_sharing', label: 'Data Sharing' },
];

const RecordConsentPage = () => {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = routePatientId || searchParams.get('patient');

  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientProtocols, setPatientProtocols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    patient: patientId || '',
    patient_protocol: '',
    visit: '',
    consent_type: 'treatment',
    title: '',
    description: '',
    consent_given_date: new Date().toISOString().slice(0, 10),
    consent_given_time: new Date().toTimeString().slice(0, 5),
    obtained_by: '',
    witnessed_by: '',
    patient_understood: true,
    notes: '',
  });

  const fetchReferenceData = useCallback(async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.getPatients({ page_size: 200 }),
        api.getDoctors(),
      ]);
      setPatients((patientsRes.data.results || patientsRes.data || []));
      setDoctors((doctorsRes.data.results || doctorsRes.data || []));
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  }, []);

  const fetchPatient = useCallback(async (pid) => {
    try {
      const res = await api.getPatient(pid);
      setPatient(res.data);
    } catch (err) {
      console.error('Error loading patient:', err);
    }
  }, []);

  const fetchVisits = useCallback(async (pid) => {
    try {
      const res = await api.getVisits({ patient: pid });
      setVisits(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error loading visits:', err);
    }
  }, []);

  const fetchPatientProtocols = useCallback(async (pid) => {
    try {
      const res = await api.getPatientProtocolsByPatient(pid);
      setPatientProtocols(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error loading patient protocols:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchReferenceData();
      if (patientId) {
        await Promise.all([
          fetchPatient(patientId),
          fetchVisits(patientId),
          fetchPatientProtocols(patientId),
        ]);
      }
      setInitialLoading(false);
    };
    load();
  }, [patientId, fetchReferenceData, fetchPatient, fetchVisits, fetchPatientProtocols]);

  const handlePatientChange = async (pid) => {
    setFormData(prev => ({ ...prev, patient: pid, visit: '', patient_protocol: '' }));
    setVisits([]);
    setPatientProtocols([]);
    setPatient(null);
    if (pid) {
      await Promise.all([fetchPatient(pid), fetchVisits(pid), fetchPatientProtocols(pid)]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const required = ['patient', 'consent_type', 'title', 'obtained_by', 'consent_given_date'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in all required fields. Missing: ${field.replace(/_/g, ' ')}`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        visit: formData.visit || null,
        patient_protocol: formData.patient_protocol || null,
        witnessed_by: formData.witnessed_by || null,
        status: 'obtained',
        consent_given_time: formData.consent_given_time || null,
      };

      // Use protocols consent-forms endpoint
      await api.create('protocols/api/consent-forms', payload);
      setSuccess('Consent recorded successfully!');
      setTimeout(() => {
        if (patientId) navigate(`/patient/${patientId}/consents`);
        else navigate('/protocols/consent-forms');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join('; ')
        : 'Failed to record consent.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  }

  return (
    <div className="page-container record-consent-page">
      <div className="page-header">
        <h1>Record Consent</h1>
        {patient && <p className="patient-context">Patient: {patient.first_name} {patient.last_name} ({patient.patient_id})</p>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="consent-form">
        <fieldset>
          <legend>Patient & Visit</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient">Patient *</label>
              {patientId ? (
                <input type="text" value={patient ? `${patient.first_name} ${patient.last_name}` : ''} disabled className="form-control" />
              ) : (
                <select id="patient" name="patient" value={formData.patient} onChange={(e) => handlePatientChange(e.target.value)} required className="form-control">
                  <option value="">— Select Patient —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                  ))}
                </select>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="visit">Visit</label>
              <select id="visit" name="visit" value={formData.visit} onChange={handleChange} className="form-control">
                <option value="">— Select Visit —</option>
                {visits.map(v => (
                  <option key={v.id} value={v.id}>{new Date(v.scheduled_date).toLocaleDateString()} — {v.visit_type_display || v.visit_type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="patient_protocol">Protocol</label>
              <select id="patient_protocol" name="patient_protocol" value={formData.patient_protocol} onChange={handleChange} className="form-control">
                <option value="">— Select Protocol —</option>
                {patientProtocols.map(pp => (
                  <option key={pp.id} value={pp.id}>{pp.protocol_name || pp.protocol?.name || `Protocol ${pp.id}`}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Consent Details</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consent_type">Consent Type *</label>
              <select id="consent_type" name="consent_type" value={formData.consent_type} onChange={handleChange} required className="form-control">
                {CONSENT_TYPES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="form-control" placeholder="e.g. Informed Consent for Intravitreal Injection" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="form-control" placeholder="Details of what the patient is consenting to..." />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Date & Witness</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consent_given_date">Date of Consent *</label>
              <input type="date" id="consent_given_date" name="consent_given_date" value={formData.consent_given_date} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="consent_given_time">Time</label>
              <input type="time" id="consent_given_time" name="consent_given_time" value={formData.consent_given_time} onChange={handleChange} className="form-control" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="obtained_by">Obtained By *</label>
              <select id="obtained_by" name="obtained_by" value={formData.obtained_by} onChange={handleChange} required className="form-control">
                <option value="">— Select Clinician —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="witnessed_by">Witnessed By</label>
              <select id="witnessed_by" name="witnessed_by" value={formData.witnessed_by} onChange={handleChange} className="form-control">
                <option value="">— Select Witness —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="patient_understood" checked={formData.patient_understood} onChange={handleChange} />
                {' '}Patient confirmed understanding
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Notes</legend>
          <div className="form-row">
            <div className="form-group full-width">
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" className="form-control" placeholder="Additional notes..." />
            </div>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Record Consent'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default RecordConsentPage;