import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './RecordInjectionPage.css';

const INITIAL_FORM = {
  patient: '',
  visit: '',
  condition: '',

  drug_name: '',
  batch_number: '',
  injection_number: '',
  phase: 'loading',
  eye: 'right',

  pre_va_right: '',
  pre_va_left: '',
  pre_iop: '',
  post_va_right: '',
  post_va_left: '',
  post_iop: '',

  treating_clinician: '',
  adverse_event: false,
  adverse_event_description: '',
  notes: '',
  injection_date: new Date().toISOString().slice(0, 16),
};

const RecordInjectionPage = () => {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = routePatientId || searchParams.get('patient');

  const [formData, setFormData] = useState({ ...INITIAL_FORM, patient: patientId || '' });
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [lastInjection, setLastInjection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch reference data
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
      setError('Failed to load reference data.');
    }
  }, []);

  // Fetch patient details
  const fetchPatient = useCallback(async (pid) => {
    try {
      const res = await api.getPatient(pid);
      setPatient(res.data);
    } catch (err) {
      console.error('Error loading patient:', err);
    }
  }, []);

  // Fetch patient visits
  const fetchVisits = useCallback(async (pid) => {
    try {
      const res = await api.getVisits({ patient: pid });
      const visitsList = res.data.results || res.data || [];
      setVisits(visitsList);
    } catch (err) {
      console.error('Error loading visits:', err);
    }
  }, []);

  // Fetch patient conditions
  const fetchConditions = useCallback(async (pid) => {
    try {
      const res = await api.getPatientConditionsByPatient(pid);
      setConditions(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error loading conditions:', err);
    }
  }, []);

  // Fetch last injection for this patient
  const fetchLastInjection = useCallback(async (pid) => {
    try {
      const res = await api.getInjectionsByPatient(pid);
      const injections = res.data.results || res.data || [];
      if (injections.length > 0) {
        setLastInjection(injections[0]);
        setFormData(prev => ({
          ...prev,
          injection_number: String(injections[0].injection_number + 1),
          drug_name: injections[0].drug_name || prev.drug_name,
          eye: injections[0].eye || prev.eye,
          phase: injections[0].phase === 'loading' ? 'loading' : 'maintenance',
        }));
      } else {
        setFormData(prev => ({ ...prev, injection_number: '1' }));
      }
    } catch (err) {
      console.error('Error loading injection history:', err);
      setFormData(prev => ({ ...prev, injection_number: '1' }));
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const load = async () => {
      await fetchReferenceData();
      if (patientId) {
        setFormData(prev => ({ ...prev, patient: patientId }));
        await Promise.all([
          fetchPatient(patientId),
          fetchVisits(patientId),
          fetchConditions(patientId),
          fetchLastInjection(patientId),
        ]);
      }
      setInitialLoading(false);
    };
    load();
  }, [patientId, fetchReferenceData, fetchPatient, fetchVisits, fetchConditions, fetchLastInjection]);

  // When patient changes in dropdown
  const handlePatientChange = async (pid) => {
    setFormData(prev => ({
      ...prev,
      patient: pid,
      visit: '',
      condition: '',
    }));
    setPatient(null);
    setVisits([]);
    setConditions([]);
    setLastInjection(null);
    if (pid) {
      await Promise.all([
        fetchPatient(pid),
        fetchVisits(pid),
        fetchConditions(pid),
        fetchLastInjection(pid),
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const required = ['patient', 'drug_name', 'batch_number', 'injection_number', 'eye', 'treating_clinician', 'injection_date'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in all required fields. Missing: ${field.replace(/_/g, ' ')}`);
        setLoading(false);
        return;
      }
    }

    if (formData.adverse_event && !formData.adverse_event_description) {
      setError('Adverse event description is required when reporting an adverse event.');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      // Convert injection_date to ISO string
      payload.injection_date = new Date(formData.injection_date).toISOString();
      // Clean up empty strings to null for numeric fields
      payload.pre_iop = payload.pre_iop || null;
      payload.post_iop = payload.post_iop || null;

      await api.createInjection(payload);
      setSuccess('Injection recorded successfully!');
      setTimeout(() => {
        if (patientId) {
          navigate(`/patient/${patientId}/injections`);
        } else {
          navigate('/injections');
        }
      }, 1000);
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join('; ')
        : 'Failed to record injection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  }

  return (
    <div className="page-container record-injection-page">
      <div className="page-header">
        <h1>Record Intravitreal Injection</h1>
        {patient && <p className="patient-context">Patient: {patient.first_name} {patient.last_name} ({patient.patient_id})</p>}
      </div>

      {lastInjection && (
        <div className="last-injection-banner">
          <strong>Previous Injection:</strong> #{lastInjection.injection_number} — {lastInjection.drug_name} ({lastInjection.eye_display}) on {new Date(lastInjection.injection_date).toLocaleDateString()} — {lastInjection.days_since_last_injection} days ago
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="injection-form">
        {/* Patient Selection */}
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
              <label htmlFor="condition">Condition Being Treated *</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleChange} required className="form-control">
                <option value="">— Select Condition —</option>
                {conditions.map(c => (
                  <option key={c.id} value={c.id}>{c.condition_name || c.condition?.name || `Condition ${c.id}`}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Injection Details */}
        <fieldset>
          <legend>Injection Details</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="drug_name">Drug Name *</label>
              <select id="drug_name" name="drug_name" value={formData.drug_name} onChange={handleChange} required className="form-control">
                <option value="">— Select Drug —</option>
                <option value="Aflibercept (Eylea)">Aflibercept (Eylea)</option>
                <option value="Ranibizumab (Lucentis)">Ranibizumab (Lucentis)</option>
                <option value="Faricimab (Vabysmo)">Faricimab (Vabysmo)</option>
                <option value="Bevacizumab (Avastin)">Bevacizumab (Avastin)</option>
                <option value="Dexamethasone (Ozurdex)">Dexamethasone (Ozurdex)</option>
                <option value="Fluocinolone (Iluvien)">Fluocinolone (Iluvien)</option>
                <option value="Brolucizumab (Beovu)">Brolucizumab (Beovu)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="batch_number">Batch Number *</label>
              <input type="text" id="batch_number" name="batch_number" value={formData.batch_number} onChange={handleChange} required className="form-control" placeholder="e.g. ABC12345" />
            </div>
            <div className="form-group">
              <label htmlFor="injection_number">Injection # *</label>
              <input type="number" id="injection_number" name="injection_number" value={formData.injection_number} onChange={handleChange} required min="1" className="form-control" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phase">Treatment Phase *</label>
              <select id="phase" name="phase" value={formData.phase} onChange={handleChange} required className="form-control">
                <option value="loading">Loading Dose</option>
                <option value="maintenance">Maintenance</option>
                <option value="treat_and_extend">Treat-and-Extend</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="eye">Eye *</label>
              <select id="eye" name="eye" value={formData.eye} onChange={handleChange} required className="form-control">
                <option value="right">Right Eye (OD)</option>
                <option value="left">Left Eye (OS)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="injection_date">Injection Date/Time *</label>
              <input type="datetime-local" id="injection_date" name="injection_date" value={formData.injection_date} onChange={handleChange} required className="form-control" />
            </div>
          </div>
        </fieldset>

        {/* Pre-Injection Measurements */}
        <fieldset>
          <legend>Pre-Injection Measurements</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pre_va_right">Pre VA Right (Snellen/LogMAR)</label>
              <input type="text" id="pre_va_right" name="pre_va_right" value={formData.pre_va_right} onChange={handleChange} placeholder="e.g. 6/12 or 0.3" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="pre_va_left">Pre VA Left (Snellen/LogMAR)</label>
              <input type="text" id="pre_va_left" name="pre_va_left" value={formData.pre_va_left} onChange={handleChange} placeholder="e.g. 6/9 or 0.2" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="pre_iop">Pre IOP (mmHg)</label>
              <input type="number" step="0.1" id="pre_iop" name="pre_iop" value={formData.pre_iop} onChange={handleChange} placeholder="e.g. 15" className="form-control" />
            </div>
          </div>
        </fieldset>

        {/* Post-Injection Measurements */}
        <fieldset>
          <legend>Post-Injection Measurements (~30 min)</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="post_va_right">Post VA Right (Snellen/LogMAR)</label>
              <input type="text" id="post_va_right" name="post_va_right" value={formData.post_va_right} onChange={handleChange} placeholder="e.g. 6/12 or 0.3" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="post_va_left">Post VA Left (Snellen/LogMAR)</label>
              <input type="text" id="post_va_left" name="post_va_left" value={formData.post_va_left} onChange={handleChange} placeholder="e.g. 6/9 or 0.2" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="post_iop">Post IOP (mmHg)</label>
              <input type="number" step="0.1" id="post_iop" name="post_iop" value={formData.post_iop} onChange={handleChange} placeholder="e.g. 18" className="form-control" />
            </div>
          </div>
        </fieldset>

        {/* Clinician */}
        <fieldset>
          <legend>Clinician</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="treating_clinician">Treating Clinician *</label>
              <select id="treating_clinician" name="treating_clinician" value={formData.treating_clinician} onChange={handleChange} required className="form-control">
                <option value="">— Select Clinician —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Adverse Event */}
        <fieldset>
          <legend>Adverse Event</legend>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="adverse_event" checked={formData.adverse_event} onChange={handleChange} />
                {' '}Adverse event occurred
              </label>
            </div>
          </div>
          {formData.adverse_event && (
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="adverse_event_description">Adverse Event Description *</label>
                <textarea id="adverse_event_description" name="adverse_event_description" value={formData.adverse_event_description} onChange={handleChange} rows="3" required className="form-control" placeholder="Describe the adverse event in detail..." />
              </div>
            </div>
          )}
        </fieldset>

        {/* Notes */}
        <fieldset>
          <legend>Notes</legend>
          <div className="form-row">
            <div className="form-group full-width">
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" className="form-control" placeholder="Additional clinical notes..." />
            </div>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Record Injection'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordInjectionPage;