import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './DrugAdministrationPage.css';

const ROUTE_OPTIONS = [
  { value: 'topical', label: 'Topical (Eye Drop/Ointment)' },
  { value: 'oral', label: 'Oral' },
  { value: 'injection_iv', label: 'Intravenous Injection' },
  { value: 'injection_im', label: 'Intramuscular Injection' },
  { value: 'injection_subconjunctival', label: 'Subconjunctival Injection' },
  { value: 'injection_intravitreal', label: 'Intravitreal Injection' },
  { value: 'injection_periocular', label: 'Periocular Injection' },
];

const EYE_SIDES = [
  { value: '', label: 'N/A' },
  { value: 'right', label: 'Right Eye (OD)' },
  { value: 'left', label: 'Left Eye (OS)' },
  { value: 'both', label: 'Both Eyes (OU)' },
];

const DrugAdministrationPage = () => {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = routePatientId || searchParams.get('patient');

  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    patient: patientId || '',
    medication: '',
    visit: '',
    route: 'topical',
    dosage_administered: '',
    eye_side: '',
    administered_by: '',
    administration_time: new Date().toISOString().slice(0, 16),
    batch_number_administered: '',
    expiry_date_administered: '',
    notes: '',
    adverse_reactions: '',
  });

  const fetchReferenceData = useCallback(async () => {
    try {
      const [patientsRes, medsRes, doctorsRes] = await Promise.all([
        api.getPatients({ page_size: 200 }),
        api.getMedications({ page_size: 200 }),
        api.getDoctors(),
      ]);
      setPatients((patientsRes.data.results || patientsRes.data || []));
      setMedications((medsRes.data.results || medsRes.data || []));
      setDoctors((doctorsRes.data.results || doctorsRes.data || []));
    } catch (err) {
      console.error('Error loading reference data:', err);
      setError('Failed to load reference data.');
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

  const fetchPatient = useCallback(async (pid) => {
    try {
      const res = await api.getPatient(pid);
      setPatient(res.data);
    } catch (err) {
      console.error('Error loading patient:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchReferenceData();
      if (patientId) {
        await Promise.all([fetchPatient(patientId), fetchVisits(patientId)]);
      }
      setInitialLoading(false);
    };
    load();
  }, [patientId, fetchReferenceData, fetchPatient, fetchVisits]);

  const handlePatientChange = async (pid) => {
    setFormData(prev => ({ ...prev, patient: pid, visit: '' }));
    setVisits([]);
    if (pid) {
      await Promise.all([fetchPatient(pid), fetchVisits(pid)]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Auto-fill batch from selected medication's stock record
  const handleMedicationChange = (medId) => {
    const med = medications.find(m => m.id === medId);
    setFormData(prev => ({
      ...prev,
      medication: medId,
      batch_number_administered: med?.batch_number || prev.batch_number_administered,
      expiry_date_administered: med?.expiry_date || prev.expiry_date_administered,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const required = ['patient', 'medication', 'route', 'dosage_administered', 'administered_by', 'administration_time'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in all required fields. Missing: ${field.replace(/_/g, ' ')}`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = { ...formData };
      payload.administration_time = new Date(formData.administration_time).toISOString();
      // Clean empty strings
      payload.eye_side = payload.eye_side || null;
      payload.visit = payload.visit || null;
      payload.expiry_date_administered = payload.expiry_date_administered || null;
      payload.batch_number_administered = payload.batch_number_administered || null;

      // API endpoint for medication administration
      await api.create('medications/api/medication-administration', payload);

      setSuccess('Medication administration recorded successfully!');
      setTimeout(() => {
        if (patientId) navigate(`/patient/${patientId}`);
        else navigate('/medications');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join('; ')
        : 'Failed to record administration.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  }

  return (
    <div className="page-container drug-admin-page">
      <div className="page-header">
        <h1>Record Drug Administration</h1>
        {patient && <p className="patient-context">Patient: {patient.first_name} {patient.last_name} ({patient.patient_id})</p>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <fieldset>
          <legend>Patient & Medication</legend>
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
              <label htmlFor="medication">Medication *</label>
              <select id="medication" name="medication" value={formData.medication} onChange={(e) => handleMedicationChange(e.target.value)} required className="form-control">
                <option value="">— Select Medication —</option>
                {medications.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.strength})</option>
                ))}
              </select>
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
          </div>
        </fieldset>

        <fieldset>
          <legend>Administration Details</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="route">Route *</label>
              <select id="route" name="route" value={formData.route} onChange={handleChange} required className="form-control">
                {ROUTE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dosage_administered">Dose *</label>
              <input type="text" id="dosage_administered" name="dosage_administered" value={formData.dosage_administered} onChange={handleChange} required className="form-control" placeholder="e.g. 2mg/0.05ml, 1 drop" />
            </div>
            <div className="form-group">
              <label htmlFor="eye_side">Eye Side</label>
              <select id="eye_side" name="eye_side" value={formData.eye_side} onChange={handleChange} className="form-control">
                {EYE_SIDES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Batch Traceability</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batch_number_administered">Batch Number Administered</label>
              <input type="text" id="batch_number_administered" name="batch_number_administered" value={formData.batch_number_administered} onChange={handleChange} className="form-control" placeholder="Pre-filled from stock; override if different" />
            </div>
            <div className="form-group">
              <label htmlFor="expiry_date_administered">Expiry Date</label>
              <input type="date" id="expiry_date_administered" name="expiry_date_administered" value={formData.expiry_date_administered} onChange={handleChange} className="form-control" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Clinician & Time</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="administered_by">Administered By *</label>
              <select id="administered_by" name="administered_by" value={formData.administered_by} onChange={handleChange} required className="form-control">
                <option value="">— Select Clinician —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="administration_time">Administration Time *</label>
              <input type="datetime-local" id="administration_time" name="administration_time" value={formData.administration_time} onChange={handleChange} required className="form-control" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Notes & Reactions</legend>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="notes">Administration Notes</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="2" className="form-control" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="adverse_reactions">Adverse Reactions</label>
              <textarea id="adverse_reactions" name="adverse_reactions" value={formData.adverse_reactions} onChange={handleChange} rows="2" className="form-control" />
            </div>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Record Administration'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DrugAdministrationPage;