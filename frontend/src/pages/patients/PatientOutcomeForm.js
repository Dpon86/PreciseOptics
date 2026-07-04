import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import PatientContext from '../../context/PatientContext';
import './PatientOutcomeForm.css';

const SATISFACTION_OPTIONS = [
  { value: 'very_satisfied',    label: '😊 Very Satisfied' },
  { value: 'satisfied',         label: '🙂 Satisfied' },
  { value: 'neutral',           label: '😐 Neutral' },
  { value: 'dissatisfied',      label: '🙁 Dissatisfied' },
  { value: 'very_dissatisfied', label: '😞 Very Dissatisfied' },
];

const SEVERITY_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'mild',     label: 'Mild – noticeable but not interfering' },
  { value: 'moderate', label: 'Moderate – affecting daily life' },
  { value: 'severe',   label: 'Severe – significantly disabling' },
];

const ScoreSlider = ({ label, sublabel, name, value, min = 1, max = 10, lowLabel, highLabel, onChange }) => (
  <div className="score-slider-group">
    <label className="score-label">
      {label}
      {sublabel && <span className="score-sublabel"> – {sublabel}</span>}
      <span className="score-value-badge">{value ?? '–'}</span>
    </label>
    <div className="slider-row">
      <span className="slider-end-label">{lowLabel || (min === 0 ? 'None (0)' : 'Very Poor (1)')}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? min}
        name={name}
        onChange={onChange}
        className="score-range"
      />
      <span className="slider-end-label">{highLabel || 'Excellent (10)'}</span>
    </div>
  </div>
);

const PatientOutcomeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPatient } = useContext(PatientContext);

  const queryParams = new URLSearchParams(location.search);
  const prefilledPatient   = queryParams.get('patient')      || (selectedPatient?.id ?? '');
  const prefilledPrescription = queryParams.get('prescription') || '';
  const prefilledTreatment    = queryParams.get('treatment')    || '';
  const prefilledConsultation = queryParams.get('consultation') || '';

  const [formData, setFormData] = useState({
    patient:                prefilledPatient,
    consultation:           prefilledConsultation,
    prescription:           prefilledPrescription,
    treatment:              prefilledTreatment,
    report_date:            new Date().toISOString().split('T')[0],
    vision_quality_score:   7,
    pain_discomfort_score:  2,
    light_sensitivity_score: 2,
    daily_activities_score: 7,
    reading_ability_score:  7,
    driving_ability_score:  '',
    treatment_satisfaction: 'satisfied',
    side_effects_reported:  '',
    side_effect_severity:   'none',
    patient_comments:       '',
  });

  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load patient list for the dropdown
  useEffect(() => {
    api.getPatients({ limit: 500, is_active: true })
      .then(res => setPatients(res.data?.results || res.data || []))
      .catch(err => console.error('Failed to load patients', err));
  }, []);

  // When patient changes, load their prescriptions, treatments, consultations
  useEffect(() => {
    if (!formData.patient) return;
    setLoadingRelated(true);
    Promise.all([
      api.get('prescriptions', null, { patient: formData.patient, limit: 100 }),
      api.getTreatments({ patient: formData.patient, limit: 100 }),
      api.getConsultations({ patient: formData.patient, limit: 100 }),
    ])
      .then(([pRes, tRes, cRes]) => {
        setPrescriptions(pRes.data?.results || pRes.data || []);
        setTreatments(tRes.data?.results || tRes.data || []);
        setConsultations(cRes.data?.results || cRes.data || []);
      })
      .catch(err => console.error('Failed to load related data', err))
      .finally(() => setLoadingRelated(false));
  }, [formData.patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      setSubmitError('Please select a patient.');
      return;
    }
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = { ...formData };
      // Convert empty optional fields to null
      ['consultation', 'prescription', 'treatment', 'driving_ability_score'].forEach(f => {
        if (!payload[f]) payload[f] = null;
      });
      await api.createPatientOutcome(payload);
      setSubmitSuccess(true);
      setTimeout(() => navigate(`/patients/${formData.patient}`), 1800);
    } catch (err) {
      const detail = err.response?.data;
      setSubmitError(
        typeof detail === 'object'
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          : 'Failed to save questionnaire. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="outcome-success">
        <div className="success-icon">✅</div>
        <h2>Questionnaire Saved</h2>
        <p>The patient outcome report has been recorded. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="outcome-form-page">
      <div className="outcome-form-header">
        <h1>📋 Patient Outcome Questionnaire</h1>
        <p className="outcome-subtitle">
          Record the patient's perspective on their vision quality, treatment satisfaction and any side effects.
        </p>
      </div>

      <form className="outcome-form" onSubmit={handleSubmit}>

        {/* ── Patient & context ───────────────────────────────────── */}
        <section className="form-section">
          <h2>Patient & Visit</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient">Patient <span className="required">*</span></label>
              <select id="patient" name="patient" value={formData.patient} onChange={handleChange} required>
                <option value="">— Select patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                    {p.date_of_birth ? ` (DOB: ${p.date_of_birth})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="report_date">Date of questionnaire <span className="required">*</span></label>
              <input type="date" id="report_date" name="report_date" value={formData.report_date} onChange={handleChange} required />
            </div>
          </div>

          {loadingRelated && <p className="loading-hint">Loading related records…</p>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consultation">Consultation (optional)</label>
              <select id="consultation" name="consultation" value={formData.consultation} onChange={handleChange} disabled={!formData.patient}>
                <option value="">— None —</option>
                {consultations.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.consultation_date || c.date} – {c.reason_for_visit || c.chief_complaint || 'Consultation'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="prescription">Prescription being evaluated (optional)</label>
              <select id="prescription" name="prescription" value={formData.prescription} onChange={handleChange} disabled={!formData.patient}>
                <option value="">— None —</option>
                {prescriptions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.date_prescribed} – {p.notes || 'Prescription'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="treatment">Treatment being evaluated (optional)</label>
              <select id="treatment" name="treatment" value={formData.treatment} onChange={handleChange} disabled={!formData.patient}>
                <option value="">— None —</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.scheduled_date || t.date} – {t.treatment_type_name || t.treatment_type || 'Treatment'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Vision quality scores ───────────────────────────────── */}
        <section className="form-section">
          <h2>Vision & Symptom Scores</h2>
          <p className="section-hint">Ask the patient to rate each area. Adjust the sliders to match their answers.</p>

          <ScoreSlider
            label="Overall vision quality"
            sublabel="How clear and sharp is your vision today?"
            name="vision_quality_score"
            value={formData.vision_quality_score}
            min={1} max={10}
            lowLabel="Very poor (1)"
            highLabel="Excellent (10)"
            onChange={handleSliderChange}
          />
          <ScoreSlider
            label="Pain or eye discomfort"
            sublabel="Any aching, stinging or pressure in or around the eye?"
            name="pain_discomfort_score"
            value={formData.pain_discomfort_score}
            min={0} max={10}
            lowLabel="None (0)"
            highLabel="Severe (10)"
            onChange={handleSliderChange}
          />
          <ScoreSlider
            label="Light sensitivity / glare"
            sublabel="Are bright lights or glare causing problems?"
            name="light_sensitivity_score"
            value={formData.light_sensitivity_score}
            min={0} max={10}
            lowLabel="None (0)"
            highLabel="Severe (10)"
            onChange={handleSliderChange}
          />
          <ScoreSlider
            label="Daily activities"
            sublabel="How easily can you carry out everyday tasks (cooking, shopping, etc.)?"
            name="daily_activities_score"
            value={formData.daily_activities_score}
            min={1} max={10}
            lowLabel="Very limited (1)"
            highLabel="No limitation (10)"
            onChange={handleSliderChange}
          />
          <ScoreSlider
            label="Reading ability"
            sublabel="Can you read newspapers, books or screens comfortably?"
            name="reading_ability_score"
            value={formData.reading_ability_score}
            min={1} max={10}
            lowLabel="Unable (1)"
            highLabel="No difficulty (10)"
            onChange={handleSliderChange}
          />

          <div className="form-group driving-group">
            <label>Driving ability (leave blank if patient does not drive)</label>
            <div className="driving-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={formData.driving_ability_score !== ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    driving_ability_score: e.target.checked ? 7 : '',
                  }))}
                />
                &nbsp;Patient drives
              </label>
            </div>
            {formData.driving_ability_score !== '' && (
              <ScoreSlider
                label=""
                sublabel="Confidence and ability when driving"
                name="driving_ability_score"
                value={formData.driving_ability_score}
                min={1} max={10}
                lowLabel="Unable (1)"
                highLabel="No difficulty (10)"
                onChange={handleSliderChange}
              />
            )}
          </div>
        </section>

        {/* ── Treatment satisfaction ──────────────────────────────── */}
        <section className="form-section">
          <h2>Treatment Satisfaction</h2>
          <p className="section-hint">How does the patient feel about their current treatment overall?</p>
          <div className="satisfaction-buttons">
            {SATISFACTION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`sat-btn ${formData.treatment_satisfaction === opt.value ? 'sat-btn--active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, treatment_satisfaction: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Side effects ────────────────────────────────────────── */}
        <section className="form-section">
          <h2>Side Effects &amp; Issues</h2>

          <div className="form-group">
            <label htmlFor="side_effect_severity">Severity of any side effects</label>
            <div className="severity-buttons">
              {SEVERITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`sev-btn sev-btn--${opt.value} ${formData.side_effect_severity === opt.value ? 'sev-btn--active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, side_effect_severity: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formData.side_effect_severity !== 'none' && (
            <div className="form-group">
              <label htmlFor="side_effects_reported">
                Describe side effects <span className="required">*</span>
              </label>
              <textarea
                id="side_effects_reported"
                name="side_effects_reported"
                rows={4}
                placeholder="e.g. Stinging after drops, redness, blurred vision for an hour after injection…"
                value={formData.side_effects_reported}
                onChange={handleChange}
                required={formData.side_effect_severity !== 'none'}
              />
            </div>
          )}
        </section>

        {/* ── Patient comments ────────────────────────────────────── */}
        <section className="form-section">
          <h2>Patient's Own Comments</h2>
          <div className="form-group">
            <textarea
              id="patient_comments"
              name="patient_comments"
              rows={4}
              placeholder="Any additional thoughts, concerns or questions from the patient…"
              value={formData.patient_comments}
              onChange={handleChange}
            />
          </div>
        </section>

        {submitError && (
          <div className="form-error">
            <strong>Error:</strong> {submitError}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : '💾 Save Questionnaire'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PatientOutcomeForm;
