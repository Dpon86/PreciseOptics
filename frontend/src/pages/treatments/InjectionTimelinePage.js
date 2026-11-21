import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './InjectionTimelinePage.css';

const PHASE_LABELS = {
  loading: 'Loading Dose',
  maintenance: 'Maintenance',
  treat_and_extend: 'Treat-and-Extend',
};

const getStatusColour = (phase, daysSinceLast, adverseEvent) => {
  if (adverseEvent) return '#e74c3c';
  if (phase === 'loading') return '#f39c12';
  if (daysSinceLast && daysSinceLast > 56) return '#e74c3c'; // overdue (>8 weeks)
  if (daysSinceLast && daysSinceLast > 42) return '#f39c12'; // due soon (>6 weeks)
  return '#27ae60'; // up to date
};

const InjectionTimelinePage = () => {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = routePatientId || searchParams.get('patient');

  const [patient, setPatient] = useState(null);
  const [injections, setInjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [drugFilter, setDrugFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [eyeFilter, setEyeFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!patientId) {
        setError('No patient selected. Please navigate from a patient record.');
        setLoading(false);
        return;
      }

      const [patientRes, injectionsRes] = await Promise.all([
        api.getPatient(patientId),
        api.getInjectionsByPatient(patientId),
      ]);

      setPatient(patientRes.data);
      const injList = injectionsRes.data.results || injectionsRes.data || [];
      setInjections(Array.isArray(injList) ? injList : []);
    } catch (err) {
      console.error('Error loading injection timeline:', err);
      setError('Failed to load injection history.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique drug names for filter
  const drugOptions = [...new Set(injections.map(i => i.drug_name).filter(Boolean))];
  const filteredInjections = injections.filter(i => {
    if (drugFilter && i.drug_name !== drugFilter) return false;
    if (phaseFilter && i.phase !== phaseFilter) return false;
    if (eyeFilter && i.eye !== eyeFilter) return false;
    return true;
  });

  // Compute summary stats
  const totalInjections = injections.length;
  const injectionsByDrug = {};
  injections.forEach(i => {
    if (!injectionsByDrug[i.drug_name]) injectionsByDrug[i.drug_name] = 0;
    injectionsByDrug[i.drug_name]++;
  });
  const adverseEvents = injections.filter(i => i.adverse_event).length;

  if (loading) {
    return <div className="page-container"><div className="loading-spinner">Loading injection history...</div></div>;
  }

  if (error && !injections.length) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="page-container injection-timeline-page">
      <div className="page-header">
        <h1>
          {patient ? `${patient.first_name} ${patient.last_name}` : 'Patient'} — Injection Timeline
        </h1>
        {patient && <p className="patient-meta">Patient ID: {patient.patient_id} | DOB: {patient.date_of_birth}</p>}
      </div>

      {/* Summary Cards */}
      <div className="injection-summary-cards">
        <div className="summary-card">
          <div className="summary-value">{totalInjections}</div>
          <div className="summary-label">Total Injections</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{Object.keys(injectionsByDrug).length}</div>
          <div className="summary-label">Drug Types</div>
        </div>
        <div className="summary-card adverse">
          <div className="summary-value">{adverseEvents}</div>
          <div className="summary-label">Adverse Events</div>
        </div>
        {injections.length > 0 && (
          <div className="summary-card">
            <div className="summary-value">{injections[0].days_since_last_injection ?? '—'}</div>
            <div className="summary-label">Days Since Last</div>
          </div>
        )}
      </div>

      {/* Drug Breakdown */}
      {Object.keys(injectionsByDrug).length > 0 && (
        <div className="drug-breakdown">
          {Object.entries(injectionsByDrug).map(([drug, count]) => (
            <span key={drug} className="drug-chip">{drug}: {count}</span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="timeline-filters">
        <select value={drugFilter} onChange={e => setDrugFilter(e.target.value)} className="form-control">
          <option value="">All Drugs</option>
          {drugOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} className="form-control">
          <option value="">All Phases</option>
          <option value="loading">Loading Dose</option>
          <option value="maintenance">Maintenance</option>
          <option value="treat_and_extend">Treat-and-Extend</option>
        </select>
        <select value={eyeFilter} onChange={e => setEyeFilter(e.target.value)} className="form-control">
          <option value="">Both Eyes</option>
          <option value="right">Right Eye (OD)</option>
          <option value="left">Left Eye (OS)</option>
        </select>
        <button onClick={() => { setDrugFilter(''); setPhaseFilter(''); setEyeFilter(''); }} className="btn btn-secondary btn-sm">Clear Filters</button>
      </div>

      {/* Timeline */}
      {filteredInjections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💉</div>
          <h3>No injections found</h3>
          <p>{injections.length === 0 ? 'This patient has no recorded injections yet.' : 'No injections match your filters.'}</p>
          {patientId && (
            <button onClick={() => navigate(`/injections/record?patient=${patientId}`)} className="btn btn-primary">
              Record First Injection
            </button>
          )}
        </div>
      ) : (
        <div className="timeline">
          {filteredInjections.map((inj, idx) => {
            const statusColour = getStatusColour(inj.phase, inj.days_since_last_injection, inj.adverse_event);
            return (
              <div key={inj.id} className="timeline-item">
                <div className="timeline-marker" style={{ backgroundColor: statusColour }} />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="injection-number">#{inj.injection_number}</span>
                    <span className="injection-drug">{inj.drug_name}</span>
                    <span className={`phase-badge phase-${inj.phase}`}>{PHASE_LABELS[inj.phase] || inj.phase_display}</span>
                    <span className="eye-badge">{inj.eye_display}</span>
                    {inj.adverse_event && <span className="adverse-badge">⚠ Adverse Event</span>}
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-field">
                      <strong>Date:</strong> {new Date(inj.injection_date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="timeline-field">
                      <strong>Batch:</strong> {inj.batch_number}
                    </div>
                    <div className="timeline-field">
                      <strong>Clinician:</strong> {inj.treating_clinician_name}
                    </div>
                    {inj.days_since_last_injection != null && (
                      <div className="timeline-field">
                        <strong>Interval:</strong> {inj.days_since_last_injection} days since previous
                      </div>
                    )}
                    {(inj.pre_va_right || inj.pre_va_left || inj.post_va_right || inj.post_va_left) && (
                      <div className="timeline-field va-field">
                        <strong>VA:</strong>{' '}
                        {inj.pre_va_right && <span>Pre R: {inj.pre_va_right}</span>}
                        {inj.pre_va_left && <span>Pre L: {inj.pre_va_left}</span>}
                        {inj.post_va_right && <span>Post R: {inj.post_va_right}</span>}
                        {inj.post_va_left && <span>Post L: {inj.post_va_left}</span>}
                      </div>
                    )}
                    {(inj.pre_iop || inj.post_iop) && (
                      <div className="timeline-field">
                        <strong>IOP:</strong>{' '}
                        {inj.pre_iop && <span>Pre: {inj.pre_iop} mmHg</span>}
                        {inj.post_iop && <span>Post: {inj.post_iop} mmHg</span>}
                      </div>
                    )}
                    {inj.adverse_event && inj.adverse_event_description && (
                      <div className="timeline-field adverse-description">
                        <strong>Event:</strong> {inj.adverse_event_description}
                      </div>
                    )}
                    {inj.notes && (
                      <div className="timeline-field">
                        <strong>Notes:</strong> {inj.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      {patientId && (
        <div className="timeline-actions">
          <button onClick={() => navigate(`/injections/record?patient=${patientId}`)} className="btn btn-primary">
            💉 Record New Injection
          </button>
          <button onClick={() => navigate(`/patient/${patientId}`)} className="btn btn-secondary">
            Back to Patient
          </button>
        </div>
      )}
    </div>
  );
};

export default InjectionTimelinePage;