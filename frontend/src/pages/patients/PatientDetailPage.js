import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './PatientDetailPage.css';

// ─── Helper utilities ────────────────────────────────────────────────────────

const calcAge = (dob) => {
  if (!dob) return '—';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtGender = (g) => ({ M: 'Male', F: 'Female', O: 'Other', N: 'Prefer not to say' }[g] || g || '—');

const CONDITION_STATUS_BADGE = {
  newly_diagnosed: { cls: 'badge-info',    label: 'New' },
  active:          { cls: 'badge-danger',  label: 'Active' },
  stable:          { cls: 'badge-success', label: 'Stable' },
  progressing:     { cls: 'badge-warning', label: 'Progressing' },
  improving:       { cls: 'badge-success', label: 'Improving' },
  resolved:        { cls: 'badge-secondary', label: 'Resolved' },
  managed:         { cls: 'badge-primary', label: 'Managed' },
};

const PROTOCOL_STATUS_BADGE = {
  pending:       { cls: 'badge-warning',   label: 'Pending' },
  active:        { cls: 'badge-success',   label: 'Active' },
  completed:     { cls: 'badge-info',      label: 'Completed' },
  discontinued:  { cls: 'badge-danger',    label: 'Discontinued' },
  on_hold:       { cls: 'badge-secondary', label: 'On Hold' },
};

const SEVERITY_BADGE = {
  mild:       { cls: 'badge-success', label: 'Mild' },
  moderate:   { cls: 'badge-warning', label: 'Moderate' },
  severe:     { cls: 'badge-danger',  label: 'Severe' },
  very_severe:{ cls: 'badge-danger',  label: 'Very Severe' },
};

const SATISFACTION_ICON = {
  very_satisfied:    { icon: '😊', cls: 'sat-great' },
  satisfied:         { icon: '🙂', cls: 'sat-good' },
  neutral:           { icon: '😐', cls: 'sat-mid' },
  dissatisfied:      { icon: '🙁', cls: 'sat-poor' },
  very_dissatisfied: { icon: '😞', cls: 'sat-bad' },
};

const StatusBadge = ({ map, value, fallback = 'Unknown' }) => {
  const item = map[value] || { cls: 'badge-secondary', label: fallback };
  return <span className={`badge ${item.cls}`}>{item.label}</span>;
};

const SectionLoading = () => <div className="tab-loading">Loading…</div>;
const SectionError = ({ msg }) => <div className="tab-error">{msg}</div>;

const ProgressBar = ({ pct, color = '#3B82F6' }) => (
  <div className="pbar-track">
    <div className="pbar-fill" style={{ width: `${Math.min(100, pct || 0)}%`, background: color }} />
  </div>
);

const ScorePill = ({ value, max = 10, reversed = false }) => {
  if (value == null) return <span className="score-pill score-pill--na">—</span>;
  const good = reversed ? value <= 3 : value >= 7;
  const bad  = reversed ? value >= 7 : value <= 3;
  return (
    <span className={`score-pill ${good ? 'score-pill--good' : bad ? 'score-pill--bad' : 'score-pill--mid'}`}>
      {value}/{max}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient]               = useState(null);
  const [activeTab, setActiveTab]           = useState('overview');
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  const [recentConsultations, setRecentConsultations] = useState([]);
  const [recentTests, setRecentTests]       = useState([]);
  const [conditions, setConditions]         = useState(null);
  const [protocols, setProtocols]           = useState(null);
  const [outcomes, setOutcomes]             = useState(null);
  const [tabLoading, setTabLoading]         = useState({});
  const [tabError, setTabError]             = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getPatient(patientId);
        setPatient(res.data);
      } catch (err) {
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const load = async () => {
      try {
        const [cRes, vaRes, glRes] = await Promise.allSettled([
          api.getConsultations({ patient: patientId, limit: 5 }),
          api.getVisualAcuityTests({ patient: patientId, limit: 5 }),
          api.getGlaucomaAssessments({ patient: patientId, limit: 5 }),
        ]);
        if (cRes.status === 'fulfilled')
          setRecentConsultations(cRes.value.data?.results || cRes.value.data || []);
        if (vaRes.status === 'fulfilled' || glRes.status === 'fulfilled') {
          const va = (vaRes.status === 'fulfilled' ? vaRes.value.data?.results || vaRes.value.data || [] : []).map(t => ({ ...t, testType: 'Visual Acuity' }));
          const gl = (glRes.status === 'fulfilled' ? glRes.value.data?.results || glRes.value.data || [] : []).map(t => ({ ...t, testType: 'Glaucoma' }));
          setRecentTests([...va, ...gl].sort((a, b) => new Date(b.test_date) - new Date(a.test_date)).slice(0, 5));
        }
      } catch (_) {}
    };
    load();
  }, [patientId]);

  const loadTab = useCallback(async (tab) => {
    if (tab === 'conditions' && conditions === null) {
      setTabLoading(p => ({ ...p, conditions: true }));
      try {
        const res = await api.getPatientConditionsByPatient(patientId);
        setConditions(res.data?.results || res.data || []);
      } catch (err) {
        setTabError(p => ({ ...p, conditions: 'Could not load conditions.' }));
        setConditions([]);
      } finally { setTabLoading(p => ({ ...p, conditions: false })); }
    }
    if (tab === 'protocols' && protocols === null) {
      setTabLoading(p => ({ ...p, protocols: true }));
      try {
        const res = await api.getPatientProtocols({ patient: patientId });
        setProtocols(res.data?.results || res.data || []);
      } catch (err) {
        setTabError(p => ({ ...p, protocols: 'Could not load protocols.' }));
        setProtocols([]);
      } finally { setTabLoading(p => ({ ...p, protocols: false })); }
    }
    if (tab === 'outcomes' && outcomes === null) {
      setTabLoading(p => ({ ...p, outcomes: true }));
      try {
        const res = await api.getPatientOutcomesForPatient(patientId);
        setOutcomes(res.data?.results || []);
      } catch (err) {
        setTabError(p => ({ ...p, outcomes: 'Could not load outcomes.' }));
        setOutcomes([]);
      } finally { setTabLoading(p => ({ ...p, outcomes: false })); }
    }
  }, [patientId, conditions, protocols, outcomes]);

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  if (loading) return <div className="page-container"><div className="loading">Loading patient details…</div></div>;
  if (error || !patient) return (
    <div className="page-container">
      <div className="error-message">{error || 'Patient not found'}</div>
      <button onClick={() => navigate('/patients')} className="btn btn-primary">Back to Patients</button>
    </div>
  );

  const tabs = [
    { key: 'overview',   label: 'Overview' },
    { key: 'contact',    label: 'Contact & Address' },
    { key: 'medical',    label: 'Medical Information' },
    { key: 'conditions', label: conditions?.length > 0 ? `Conditions (${conditions.length})` : 'Conditions' },
    { key: 'protocols',  label: protocols?.length  > 0 ? `Protocols (${protocols.length})`  : 'Protocols' },
    { key: 'outcomes',   label: outcomes?.length   > 0 ? `Outcomes (${outcomes.length})`    : 'Outcomes' },
    { key: 'activity',   label: 'Recent Activity' },
  ];

  return (
    <div className="page-container patient-detail">

      <div className="patient-header">
        <div className="patient-header-left">
          <div className="patient-avatar">
            <span className="avatar-initials">{patient.first_name?.[0]}{patient.last_name?.[0]}</span>
          </div>
          <div className="patient-header-info">
            <h1>{patient.first_name} {patient.middle_name} {patient.last_name}</h1>
            <div className="patient-meta">
              <span className="badge badge-info">ID: {patient.patient_id}</span>
              {patient.nhs_number && <span className="badge badge-secondary">NHS: {patient.nhs_number}</span>}
              <span className={`badge ${patient.is_active ? 'badge-success' : 'badge-danger'}`}>
                {patient.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="patient-header-actions">
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-primary">Edit Patient</Link>
          <Link to={`/consultations/add?patient=${patient.id}`} className="btn btn-success">New Consultation</Link>
          <button onClick={() => navigate('/patients')} className="btn btn-secondary">Back</button>
        </div>
      </div>

      <div className="quick-stats">
        {[
          { icon: '👤', label: 'Age',          value: `${calcAge(patient.date_of_birth)} yrs` },
          { icon: '🎂', label: 'Date of Birth', value: fmtDate(patient.date_of_birth) },
          { icon: '⚧',  label: 'Gender',        value: fmtGender(patient.gender) },
          patient.blood_group && { icon: '🩸', label: 'Blood Group', value: patient.blood_group },
          { icon: '📅', label: 'Registered',    value: fmtDate(patient.registration_date || patient.created_at) },
        ].filter(Boolean).map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="tab-content">

        {activeTab === 'overview' && (
          <div className="tab-panel">
            <div className="info-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-rows">
                  {[['Full Name', `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim()],
                    ['Date of Birth', fmtDate(patient.date_of_birth)],
                    ['Age', `${calcAge(patient.date_of_birth)} years old`],
                    ['Gender', fmtGender(patient.gender)],
                    patient.blood_group && ['Blood Group', patient.blood_group],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="info-row"><label>{label}:</label><span>{val}</span></div>
                  ))}
                </div>
              </div>
              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-rows">
                  {[['Primary Phone', patient.phone_number],
                    patient.alternate_phone && ['Alternate Phone', patient.alternate_phone],
                    patient.email && ['Email', patient.email],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="info-row"><label>{label}:</label><span>{val}</span></div>
                  ))}
                </div>
              </div>
              <div className="info-card">
                <h3>Insurance / NHS</h3>
                <div className="info-rows">
                  {[patient.nhs_number && ['NHS Number', patient.nhs_number],
                    patient.insurance_provider && ['Insurance Provider', patient.insurance_provider],
                    patient.insurance_number && ['Insurance Number', patient.insurance_number],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="info-row"><label>{label}:</label><span>{val}</span></div>
                  ))}
                  {!patient.nhs_number && !patient.insurance_provider &&
                    <p className="text-muted">No insurance information on record</p>}
                </div>
              </div>
              <div className="info-card">
                <h3>Emergency Contact</h3>
                <div className="info-rows">
                  {[['Name', patient.emergency_contact_name],
                    ['Phone', patient.emergency_contact_phone],
                    ['Relationship', patient.emergency_contact_relationship],
                  ].map(([l, v]) => (
                    <div key={l} className="info-row"><label>{l}:</label><span>{v || '—'}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="tab-panel">
            <div className="info-grid">
              <div className="info-card full-width">
                <h3>Contact Details</h3>
                <div className="info-rows">
                  <div className="info-row"><label>Primary Phone:</label><span><a href={`tel:${patient.phone_number}`}>{patient.phone_number}</a></span></div>
                  {patient.alternate_phone && <div className="info-row"><label>Alternate Phone:</label><span><a href={`tel:${patient.alternate_phone}`}>{patient.alternate_phone}</a></span></div>}
                  {patient.email && <div className="info-row"><label>Email:</label><span><a href={`mailto:${patient.email}`}>{patient.email}</a></span></div>}
                </div>
              </div>
              <div className="info-card full-width">
                <h3>Address</h3>
                <div className="address-display">
                  <p>{patient.address_line_1}</p>
                  {patient.address_line_2 && <p>{patient.address_line_2}</p>}
                  <p>{[patient.city, patient.state].filter(Boolean).join(', ')}</p>
                  <p>{patient.postal_code}</p><p>{patient.country}</p>
                </div>
              </div>
              <div className="info-card full-width">
                <h3>Emergency Contact</h3>
                <div className="info-rows">
                  {[['Name', patient.emergency_contact_name],['Relationship', patient.emergency_contact_relationship],['Phone', patient.emergency_contact_phone]].map(([l,v]) => (
                    <div key={l} className="info-row"><label>{l}:</label>
                      <span>{l === 'Phone' && v ? <a href={`tel:${v}`}>{v}</a> : (v || '—')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="tab-panel">
            <div className="info-grid">
              {[['Allergies', patient.allergies],['Current Medications', patient.current_medications],['Medical History', patient.medical_history]].map(([title, text]) => (
                <div key={title} className="info-card full-width">
                  <h3>{title}</h3>
                  <div className="medical-info">
                    {text ? <p className="medical-text">{text}</p> : <p className="text-muted">No {title.toLowerCase()} recorded</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className="tab-panel">
            <div className="tab-panel-header">
              <h3>Diagnosed Conditions</h3>
              <Link to={`/patients/${patientId}/conditions/add`} className="btn btn-success btn-sm">+ Add Condition</Link>
            </div>
            {tabLoading.conditions && <SectionLoading />}
            {tabError.conditions   && <SectionError msg={tabError.conditions} />}
            {!tabLoading.conditions && conditions?.length === 0 && (
              <div className="empty-state">
                <p>No conditions recorded yet.</p>
                <Link to={`/patients/${patientId}/conditions/add`} className="btn btn-primary">Record First Condition</Link>
              </div>
            )}
            {!tabLoading.conditions && conditions?.map(pc => {
              const overdue = pc.next_assessment_date && new Date(pc.next_assessment_date) < new Date();
              return (
                <div key={pc.id} className={`condition-row ${overdue ? 'condition-row--overdue' : ''}`}>
                  <div className="condition-row-top">
                    <div className="condition-name">
                      <span className="condition-icon">🏥</span>
                      <strong>{pc.condition_details?.name || pc.condition}</strong>
                      <span className="condition-category">{pc.condition_details?.category}</span>
                    </div>
                    <div className="condition-badges">
                      <StatusBadge map={CONDITION_STATUS_BADGE} value={pc.current_status} />
                      <StatusBadge map={SEVERITY_BADGE} value={pc.severity} />
                      <span className="badge badge-secondary">
                        {pc.eye_affected === 'both' ? 'Both eyes' : pc.eye_affected === 'left' ? 'Left eye' : pc.eye_affected === 'right' ? 'Right eye' : pc.eye_affected}
                      </span>
                    </div>
                  </div>
                  <div className="condition-row-detail">
                    <span>Diagnosed: {fmtDate(pc.diagnosis_date)}</span>
                    {pc.days_since_diagnosis != null && <span className="text-muted">({pc.days_since_diagnosis} days ago)</span>}
                    {pc.next_assessment_date && (
                      <span className={overdue ? 'text-danger' : 'text-muted'}>
                        {overdue ? '⚠️ Assessment overdue – ' : 'Next assessment: '}{fmtDate(pc.next_assessment_date)}
                      </span>
                    )}
                  </div>
                  {pc.treatment_plan && <div className="condition-plan"><strong>Treatment plan:</strong> {pc.treatment_plan}</div>}
                  <div className="condition-row-actions">
                    <Link to={`/conditions/patient/${pc.id}/progress/add`} className="btn btn-sm btn-primary">Log Progress</Link>
                    <Link to={`/conditions/${pc.id}`} className="btn btn-sm btn-secondary">View Detail</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="tab-panel">
            <div className="tab-panel-header">
              <h3>Treatment Protocols</h3>
              <Link to={`/protocols/assign/${patientId}`} className="btn btn-success btn-sm">+ Assign Protocol</Link>
            </div>
            {tabLoading.protocols && <SectionLoading />}
            {tabError.protocols   && <SectionError msg={tabError.protocols} />}
            {!tabLoading.protocols && protocols?.length === 0 && (
              <div className="empty-state">
                <p>No protocols assigned yet.</p>
                <Link to={`/protocols/assign/${patientId}`} className="btn btn-primary">Assign First Protocol</Link>
              </div>
            )}
            {!tabLoading.protocols && protocols?.map(pp => {
              const progress = pp.completion_progress || {};
              const upcoming = pp.upcoming_steps || [];
              const nextStep = upcoming[0];
              const pct = progress.completion_percentage ?? (pp.adherence_percentage ?? 0);
              return (
                <div key={pp.id} className={`protocol-card ${pp.status === 'active' ? 'protocol-card--active' : ''}`}>
                  <div className="protocol-card-header">
                    <div>
                      <h4 className="protocol-name">{pp.protocol_name || pp.protocol_details?.name}</h4>
                      <span className="protocol-code">{pp.protocol_code || pp.protocol_details?.code}</span>
                    </div>
                    <StatusBadge map={PROTOCOL_STATUS_BADGE} value={pp.status} />
                  </div>
                  <div className="protocol-progress">
                    <div className="protocol-progress-label">
                      <span>Progress: {Math.round(pct)}%</span>
                      <span>{progress.completed || 0} / {progress.total_steps || '—'} steps</span>
                    </div>
                    <ProgressBar pct={pct} color={pp.status === 'active' ? '#10B981' : '#9CA3AF'} />
                  </div>
                  <div className="protocol-dates">
                    <span>Started: {fmtDate(pp.start_date)}</span>
                    {pp.expected_end_date && <span>Expected end: {fmtDate(pp.expected_end_date)}</span>}
                    {pp.days_remaining != null && pp.days_remaining >= 0 && (
                      <span className={pp.days_remaining < 14 ? 'text-warning' : ''}>
                        {pp.days_remaining} days remaining
                      </span>
                    )}
                  </div>
                  {nextStep && pp.status === 'active' && (
                    <div className="next-step-banner">
                      <div className="next-step-badge">▶ Next Step Due</div>
                      <div className="next-step-detail">
                        <strong>{nextStep.step_details?.name || nextStep.step_name || 'Step'}</strong>
                        <span> — due {fmtDate(nextStep.scheduled_date)}</span>
                        {nextStep.step_details?.description && <p className="next-step-desc">{nextStep.step_details.description}</p>}
                        {nextStep.step_details?.required_action && <p className="next-step-action"><strong>Action required:</strong> {nextStep.step_details.required_action}</p>}
                        {nextStep.step_details?.medications && <p className="next-step-meds"><strong>Medication:</strong> {nextStep.step_details.medications}</p>}
                      </div>
                    </div>
                  )}
                  {upcoming.length > 1 && (
                    <div className="upcoming-steps">
                      <strong>Upcoming:</strong>
                      <ol>
                        {upcoming.map((s, i) => (
                          <li key={s.id || i} className={i === 0 ? 'step-next' : ''}>
                            {s.step_details?.name || s.step_name || `Step ${i + 1}`}
                            <span className="step-date"> – {fmtDate(s.scheduled_date)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <div className="protocol-card-actions">
                    <Link to={`/protocols/schedule/${pp.id}`} className="btn btn-sm btn-primary">Full Schedule</Link>
                    <Link to={`/protocols/patient/${pp.id}`} className="btn btn-sm btn-secondary">View Protocol</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'outcomes' && (
          <div className="tab-panel">
            <div className="tab-panel-header">
              <h3>Patient Reported Outcomes</h3>
              <Link to={`/patients/outcome/add?patient=${patientId}`} className="btn btn-success btn-sm">+ Record Outcome</Link>
            </div>
            {tabLoading.outcomes && <SectionLoading />}
            {tabError.outcomes   && <SectionError msg={tabError.outcomes} />}
            {!tabLoading.outcomes && outcomes?.length === 0 && (
              <div className="empty-state">
                <p>No outcome questionnaires recorded yet.</p>
                <p className="text-muted">Record the patient's perspective on vision quality, treatment satisfaction and side effects.</p>
                <Link to={`/patients/outcome/add?patient=${patientId}`} className="btn btn-primary mt-2">Record First Outcome</Link>
              </div>
            )}
            {!tabLoading.outcomes && outcomes?.length > 0 && (
              <>
                <div className="outcomes-summary">
                  <h4>Latest – {fmtDate(outcomes[0].report_date)}</h4>
                  <div className="outcomes-scores-row">
                    {[['Vision', outcomes[0].vision_quality_score, false],
                      ['Activities', outcomes[0].daily_activities_score, false],
                      ['Reading', outcomes[0].reading_ability_score, false],
                      ['Pain', outcomes[0].pain_discomfort_score, true],
                      ['Light Sensitivity', outcomes[0].light_sensitivity_score, true],
                    ].map(([label, val, rev]) => (
                      <div key={label} className="outcome-score-item">
                        <span className="outcome-score-label">{label}</span>
                        <ScorePill value={val} reversed={rev} />
                      </div>
                    ))}
                    <div className="outcome-score-item">
                      <span className="outcome-score-label">Satisfaction</span>
                      <span className={`sat-icon ${SATISFACTION_ICON[outcomes[0].treatment_satisfaction]?.cls || ''}`}>
                        {SATISFACTION_ICON[outcomes[0].treatment_satisfaction]?.icon || '—'}
                      </span>
                    </div>
                  </div>
                  {outcomes[0].side_effect_severity !== 'none' && outcomes[0].side_effects_reported && (
                    <div className={`side-effect-alert side-effect-alert--${outcomes[0].side_effect_severity}`}>
                      ⚠️ Side effects ({outcomes[0].side_effect_severity}): {outcomes[0].side_effects_reported}
                    </div>
                  )}
                  {outcomes[0].patient_comments && (
                    <div className="patient-comment">"{outcomes[0].patient_comments}"</div>
                  )}
                </div>
                <div className="outcomes-history">
                  <h4>History</h4>
                  <div className="outcomes-table-scroll">
                    <table className="outcomes-table">
                      <thead>
                        <tr><th>Date</th><th>Vision</th><th>Activities</th><th>Reading</th><th>Pain</th><th>Light</th><th>Satisfaction</th><th>Side Effects</th></tr>
                      </thead>
                      <tbody>
                        {outcomes.map(o => (
                          <tr key={o.id}>
                            <td>{fmtDate(o.report_date)}</td>
                            <td><ScorePill value={o.vision_quality_score} /></td>
                            <td><ScorePill value={o.daily_activities_score} /></td>
                            <td><ScorePill value={o.reading_ability_score} /></td>
                            <td><ScorePill value={o.pain_discomfort_score} reversed /></td>
                            <td><ScorePill value={o.light_sensitivity_score} reversed /></td>
                            <td><span title={o.satisfaction_display}>{SATISFACTION_ICON[o.treatment_satisfaction]?.icon || '—'}</span></td>
                            <td>{o.side_effect_severity !== 'none' ? <span className={`badge badge-${o.side_effect_severity === 'severe' ? 'danger' : 'warning'}`}>{o.side_effect_severity}</span> : <span className="text-muted">None</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="tab-panel">
            <div className="activity-section">
              <h3>Recent Consultations</h3>
              {recentConsultations.length > 0 ? (
                <div className="activity-list">
                  {recentConsultations.map(c => (
                    <div key={c.id} className="activity-item">
                      <div className="activity-icon">📋</div>
                      <div className="activity-content">
                        <div className="activity-title">{c.consultation_type_display || c.consultation_type || 'Consultation'}</div>
                        <div className="activity-meta">{fmtDate(c.scheduled_time || c.consultation_date)}</div>
                      </div>
                      <Link to={`/consultations/${c.id}`} className="btn btn-sm btn-link">View →</Link>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted">No recent consultations</p>}
            </div>
            <div className="activity-section mt-4">
              <h3>Recent Eye Tests</h3>
              {recentTests.length > 0 ? (
                <div className="activity-list">
                  {recentTests.map(t => (
                    <div key={t.id} className="activity-item">
                      <div className="activity-icon">👁️</div>
                      <div className="activity-content">
                        <div className="activity-title">{t.testType} Test</div>
                        <div className="activity-meta">{fmtDate(t.test_date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted">No recent eye tests</p>}
            </div>
          </div>
        )}

      </div>

      <div className="quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { to: `/consultations/add?patient=${patientId}`, icon: '📋', label: 'New Consultation' },
            { to: `/eye-tests/visual-acuity/add?patient=${patientId}`, icon: '👁️', label: 'Eye Test' },
            { to: `/prescriptions/add?patient=${patientId}`, icon: '💊', label: 'Prescription' },
            { to: `/patients/${patientId}/treatments/add`, icon: '💉', label: 'Add Treatment' },
            { to: `/patients/outcome/add?patient=${patientId}`, icon: '📋', label: 'Record Outcome' },
            { to: `/protocols/assign/${patientId}`, icon: '📄', label: 'Assign Protocol' },
            { to: `/patients/${patientId}/conditions/add`, icon: '🏥', label: 'Add Condition' },
            { to: `/patients/${patientId}/records`, icon: '📊', label: 'View Records' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="quick-action-card">
              <div className="action-icon">{a.icon}</div>
              <div className="action-label">{a.label}</div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PatientDetailPage;
