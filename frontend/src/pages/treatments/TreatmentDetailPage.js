import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TreatmentDetailPage.css';

const STATUS_COLOURS = {
  planned: '#3498db',
  scheduled: '#9b59b6',
  in_progress: '#e67e22',
  completed: '#27ae60',
  cancelled: '#e74c3c',
  postponed: '#95a5a6',
  failed: '#c0392b',
};

const OUTCOME_COLOURS = {
  excellent: '#27ae60',
  good: '#2ecc71',
  satisfactory: '#f39c12',
  poor: '#e67e22',
  failed: '#e74c3c',
  pending: '#95a5a6',
};

const SEVERITY_COLOURS = {
  minor: '#f1c40f',
  moderate: '#e67e22',
  major: '#e74c3c',
  life_threatening: '#8e44ad',
};

const formatDate = (d, includeTime = true) => {
  if (!d) return '—';
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return new Date(d).toLocaleDateString('en-GB', opts);
};

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="td-section">
      <button className="td-section__toggle" onClick={() => setOpen(o => !o)}>
        <span>{icon} {title}</span>
        <span className="td-section__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="td-section__body">{children}</div>}
    </div>
  );
};

const Pill = ({ label, colour }) => (
  <span className="td-pill" style={{ background: colour || '#95a5a6' }}>{label}</span>
);

const InfoGrid = ({ rows }) => (
  <div className="td-info-grid">
    {rows.map(([label, value]) => (
      <div key={label} className="td-info-cell">
        <div className="td-info-label">{label}</div>
        <div className="td-info-value">{value ?? '—'}</div>
      </div>
    ))}
  </div>
);

const TreatmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treatment, setTreatment] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getTreatment(id);
        const t = res.data;
        setTreatment(t);

        // Load linked consultation in parallel with referrals
        const promises = [];
        if (t.consultation) {
          promises.push(
            api.getConsultation(t.consultation)
              .then(r => setConsultation(r.data))
              .catch(() => {})
          );
        }
        // Load referrals for this patient
        promises.push(
          api.getReferrals({ patient: t.patient })
            .then(r => {
              const list = r.data.results || r.data;
              setReferrals(Array.isArray(list) ? list : []);
            })
            .catch(() => setReferrals([]))
        );
        await Promise.all(promises);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load treatment details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="td-page">
      <div className="td-loading">Loading treatment details…</div>
    </div>
  );

  if (error) return (
    <div className="td-page">
      <div className="td-error">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  if (!treatment) return null;

  const t = treatment;
  const followUpDueDate = t.requires_follow_up && t.actual_end_time && t.follow_up_weeks
    ? new Date(new Date(t.actual_end_time).getTime() + t.follow_up_weeks * 7 * 24 * 60 * 60 * 1000)
    : null;
  const followUpOverdue = followUpDueDate && followUpDueDate < new Date();

  return (
    <div className="td-page">
      {/* Header */}
      <div className="td-header">
        <div className="td-header__left">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <div className="td-header__breadcrumb">
              <span
                className="td-header__link"
                onClick={() => t.patient && navigate(`/patient/${t.patient}/treatments`)}
              >
                {t.patient_name}
              </span>
              <span> / Treatments / Detail</span>
            </div>
            <h1 className="td-header__title">{t.treatment_type_name}</h1>
            <div className="td-header__pills">
              <Pill label={t.status_display || t.status} colour={STATUS_COLOURS[t.status]} />
              {t.outcome && t.outcome !== 'pending' &&
                <Pill label={`Outcome: ${t.outcome_display || t.outcome}`} colour={OUTCOME_COLOURS[t.outcome]} />}
              {t.priority_display && <Pill label={t.priority_display} colour="#34495e" />}
              {t.eye_treated_display && <Pill label={`Eye: ${t.eye_treated_display}`} colour="#2980b9" />}
            </div>
          </div>
        </div>
        {followUpDueDate && (
          <div className={`td-followup-banner ${followUpOverdue ? 'td-followup-banner--overdue' : 'td-followup-banner--due'}`}>
            <strong>{followUpOverdue ? '⚠️ Follow-up Overdue' : '📅 Follow-up Due'}</strong>
            <span>{formatDate(followUpDueDate, false)}</span>
          </div>
        )}
      </div>

      {/* Core Overview */}
      <Section title="Treatment Overview" icon="💉" defaultOpen={true}>
        <InfoGrid rows={[
          ['Treatment Type', t.treatment_type_name],
          ['Category', t.treatment_category || '—'],
          ['Eye Treated', t.eye_treated_display || t.eye_treated],
          ['Status', t.status_display || t.status],
          ['Priority', t.priority_display || t.priority],
          ['Outcome', t.outcome_display || t.outcome],
          ['Primary Surgeon', t.primary_surgeon_name],
          ['Anaesthesia', t.anesthesia_display || t.anesthesia_used || 'None'],
          ['Scheduled', formatDate(t.scheduled_date)],
          ['Started', formatDate(t.actual_start_time)],
          ['Ended', formatDate(t.actual_end_time)],
          ['Duration', t.duration_minutes ? `${t.duration_minutes} min` : '—'],
          ['Consent Obtained', t.consent_obtained ? `Yes (${formatDate(t.consent_date, false)})` : 'No'],
        ]} />
        {t.indication && (
          <div className="td-text-block">
            <div className="td-text-block__label">Clinical Indication</div>
            <p>{t.indication}</p>
          </div>
        )}
        {t.technique_notes && (
          <div className="td-text-block">
            <div className="td-text-block__label">Technique Notes</div>
            <p>{t.technique_notes}</p>
          </div>
        )}
        {t.complications_notes && (
          <div className="td-text-block td-text-block--warning">
            <div className="td-text-block__label">⚠️ Intra-operative Complications</div>
            <p>{t.complications_notes}</p>
          </div>
        )}
        {t.post_operative_instructions && (
          <div className="td-text-block td-text-block--info">
            <div className="td-text-block__label">Post-operative Instructions</div>
            <p>{t.post_operative_instructions}</p>
          </div>
        )}
      </Section>

      {/* Follow-up Plan */}
      <Section title="Follow-up Plan" icon="📅" defaultOpen={true}>
        {t.requires_follow_up ? (
          <div>
            <InfoGrid rows={[
              ['Follow-up Required', 'Yes'],
              ['Follow-up In', t.follow_up_weeks ? `${t.follow_up_weeks} week(s)` : '—'],
              ['Follow-up Due', followUpDueDate ? formatDate(followUpDueDate, false) : '—'],
            ]} />
            {t.follow_up_instructions && (
              <div className="td-text-block td-text-block--info">
                <div className="td-text-block__label">Follow-up Instructions</div>
                <p>{t.follow_up_instructions}</p>
              </div>
            )}
            {/* Recorded Follow-up Visits */}
            {t.follow_ups && t.follow_ups.length > 0 && (
              <div className="td-sub-list">
                <div className="td-sub-list__header">Recorded Follow-up Visits ({t.follow_ups.length})</div>
                {t.follow_ups.map(fu => (
                  <div key={fu.id} className="td-followup-item">
                    <div className="td-followup-item__row">
                      <strong>{formatDate(fu.scheduled_date)}</strong>
                      <span className={`td-followup-status td-followup-status--${fu.status}`}>
                        {fu.status_display || fu.status}
                      </span>
                    </div>
                    {fu.visual_outcome && <p><em>Visual outcome:</em> {fu.visual_outcome}</p>}
                    {fu.complications_noted && (
                      <p className="td-followup-complication"><em>Complications:</em> {fu.complications_noted}</p>
                    )}
                    {fu.additional_notes && <p>{fu.additional_notes}</p>}
                    {fu.patient_satisfaction && <p><em>Patient satisfaction:</em> {fu.patient_satisfaction}/10</p>}
                    <div className="td-followup-item__footer">
                      <span>Assessed by: {fu.assessed_by_name}</span>
                      {fu.further_treatment_required && <span className="td-badge-warning">Further treatment required</span>}
                      {fu.next_appointment_weeks && <span>Next in {fu.next_appointment_weeks} week(s)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="td-none-text">No follow-up planned for this treatment.</p>
        )}
      </Section>

      {/* Medications */}
      {t.medications && t.medications.length > 0 && (
        <Section title={`Medications (${t.medications.length})`} icon="💊" defaultOpen={true}>
          <table className="td-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Timing</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {t.medications.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.medication_name}</strong></td>
                  <td><span className="td-timing-tag">{m.timing_display || m.timing}</span></td>
                  <td>{m.dosage}</td>
                  <td>{m.frequency}</td>
                  <td>{m.duration_days ? `${m.duration_days} days` : '—'}</td>
                  <td>{m.instructions || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Complications */}
      {t.complications && t.complications.length > 0 && (
        <Section title={`Complications (${t.complications.length})`} icon="⚠️" defaultOpen={true}>
          {t.complications.map(c => (
            <div key={c.id} className="td-complication-card">
              <div className="td-complication-card__header">
                <div>
                  <strong>{c.complication_type_display || c.complication_type}</strong>
                  <span className="td-pill td-pill--sm" style={{ background: SEVERITY_COLOURS[c.severity], marginLeft: 8 }}>
                    {c.severity_display || c.severity}
                  </span>
                </div>
                <span className="td-text-muted">{formatDate(c.onset_time)}</span>
              </div>
              <p>{c.description}</p>
              {c.treatment_given && <p><strong>Treatment given:</strong> {c.treatment_given}</p>}
              {c.outcome && <p><strong>Outcome:</strong> {c.outcome}</p>}
              <div className="td-complication-card__footer">
                <span>Reported by: {c.reported_by_name}</span>
                {c.preventable !== null && <span>{c.preventable ? '⚠️ Preventable' : 'Not preventable'}</span>}
                {c.reported_to_clinical_governance && <span className="td-badge-warning">Reported to clinical governance</span>}
                {c.resolution_time && <span>Resolved: {formatDate(c.resolution_time)}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Linked Consultation */}
      {consultation ? (
        <Section title="Linked Consultation" icon="📋" defaultOpen={true}>
          <div className="td-consultation-banner">
            <InfoGrid rows={[
              ['Consultation Type', consultation.consultation_type?.replace(/_/g, ' ')],
              ['Doctor', consultation.doctor_name],
              ['Scheduled', formatDate(consultation.scheduled_time)],
              ['Status', consultation.status],
              ['Primary Diagnosis', consultation.diagnosis_primary || '—'],
              ['Secondary Diagnosis', consultation.diagnosis_secondary || '—'],
            ]} />
            {consultation.chief_complaint && (
              <div className="td-text-block">
                <div className="td-text-block__label">Chief Complaint</div>
                <p>{consultation.chief_complaint}</p>
              </div>
            )}
            {consultation.clinical_impression && (
              <div className="td-text-block">
                <div className="td-text-block__label">Clinical Impression</div>
                <p>{consultation.clinical_impression}</p>
              </div>
            )}
            {consultation.treatment_plan && (
              <div className="td-text-block td-text-block--info">
                <div className="td-text-block__label">Treatment Plan</div>
                <p>{consultation.treatment_plan}</p>
              </div>
            )}
            {/* Consultation Follow-up */}
            {consultation.follow_up_required && (
              <div className="td-text-block td-text-block--info">
                <div className="td-text-block__label">📅 Consultation Follow-up</div>
                {consultation.follow_up_duration && <p><strong>Duration:</strong> {consultation.follow_up_duration}</p>}
                {consultation.follow_up_instructions && <p>{consultation.follow_up_instructions}</p>}
              </div>
            )}
            {/* Referral from consultation */}
            {consultation.referral_required && (
              <div className="td-text-block td-text-block--warning">
                <div className="td-text-block__label">🔀 Referral Noted in Consultation</div>
                {consultation.referral_to && <p><strong>Refer to:</strong> {consultation.referral_to}</p>}
                {consultation.referral_reason && <p><strong>Reason:</strong> {consultation.referral_reason}</p>}
              </div>
            )}
            {/* Vital Signs */}
            {consultation.vital_signs && consultation.vital_signs.length > 0 && (() => {
              const vs = consultation.vital_signs[0];
              return (
                <div className="td-vitals">
                  <div className="td-sub-list__header">Vital Signs</div>
                  <InfoGrid rows={[
                    ['Blood Pressure', vs.blood_pressure || '—'],
                    ['Heart Rate', vs.heart_rate ? `${vs.heart_rate} bpm` : '—'],
                    ['Temperature', vs.temperature ? `${vs.temperature}°C` : '—'],
                    ['O₂ Saturation', vs.oxygen_saturation ? `${vs.oxygen_saturation}%` : '—'],
                  ]} />
                </div>
              );
            })()}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/consultations/${t.consultation}`)}
            >
              View Full Consultation →
            </button>
          </div>
        </Section>
      ) : t.consultation ? (
        <Section title="Linked Consultation" icon="📋" defaultOpen={false}>
          <p className="td-none-text">Failed to load consultation details.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/consultations/${t.consultation}`)}>
            Open Consultation →
          </button>
        </Section>
      ) : null}

      {/* Referrals */}
      {referrals.length > 0 && (
        <Section title={`Referrals (${referrals.length})`} icon="🔀" defaultOpen={true}>
          {referrals.map(r => (
            <div key={r.id} className="td-referral-card">
              <div className="td-referral-card__header">
                <strong>{r.referral_number} — {r.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}</strong>
                <div className="td-referral-card__badges">
                  <Pill label={r.urgency} colour={r.urgency === 'emergency' ? '#e74c3c' : r.urgency === 'urgent' ? '#e67e22' : '#3498db'} />
                  <Pill label={r.current_status} colour={r.current_status === 'completed' ? '#27ae60' : '#95a5a6'} />
                </div>
              </div>
              <InfoGrid rows={[
                ['Reason', r.reason?.replace(/_/g, ' ')],
                ['Referred To/From', r.referral_source_name || '—'],
                ['Referral Date', formatDate(r.referral_date, false)],
              ]} />
              {r.clinical_summary && <p className="td-text-muted">{r.clinical_summary}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Documents */}
      {t.documents && t.documents.length > 0 && (
        <Section title={`Documents (${t.documents.length})`} icon="📄" defaultOpen={false}>
          <div className="td-doc-list">
            {t.documents.map(doc => (
              <div key={doc.id} className="td-doc-item">
                <div className="td-doc-item__label">{doc.document_type_display || doc.document_type}</div>
                <div className="td-doc-item__title">{doc.title}</div>
                {doc.description && <p className="td-text-muted">{doc.description}</p>}
                <span className="td-text-muted">Added by {doc.created_by_name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default TreatmentDetailPage;
