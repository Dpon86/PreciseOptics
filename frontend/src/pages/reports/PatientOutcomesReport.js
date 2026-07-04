import React, { useState, useEffect } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../../services/api';
import './PatientOutcomesReport.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
);

const CONDITION_CODES = [
  { code: '', label: 'All Conditions' },
  { code: 'AMD',          label: 'Macular Degeneration (AMD)' },
  { code: 'RVO',          label: 'Retinal Vein Occlusion (RVO)' },
  { code: 'GLAUCOMA',     label: 'Glaucoma' },
  { code: 'DIABETIC_RET', label: 'Diabetic Retinopathy' },
  { code: 'CATARACT_POST', label: 'Post-Cataract Treatment' },
];

const SATISFACTION_LABELS = {
  very_satisfied: 'Very Satisfied',
  satisfied: 'Satisfied',
  neutral: 'Neutral',
  dissatisfied: 'Dissatisfied',
  very_dissatisfied: 'Very Dissatisfied',
};

const SATISFACTION_COLORS = {
  very_satisfied:    '#10B981',
  satisfied:         '#34D399',
  neutral:           '#F59E0B',
  dissatisfied:      '#F87171',
  very_dissatisfied: '#EF4444',
};

const SEVERITY_COLORS = {
  none:     '#10B981',
  mild:     '#F59E0B',
  moderate: '#EF4444',
  severe:   '#7C3AED',
};

const ScoreBadge = ({ value, max = 10, reversed = false }) => {
  if (value == null) return <span className="badge badge--na">N/A</span>;
  const pct = (value / max) * 100;
  const good = reversed ? pct <= 30 : pct >= 60;
  const bad  = reversed ? pct >= 70 : pct <= 30;
  return (
    <span className={`badge ${good ? 'badge--good' : bad ? 'badge--bad' : 'badge--mid'}`}>
      {value}/{max}
    </span>
  );
};

const PatientOutcomesReport = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [conditionCode, setConditionCode] = useState('');
  const [months, setMonths]       = useState(12);
  const [expandedCondition, setExpandedCondition] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.getConditionMedicationOutcomes({ condition_code: conditionCode, months })
      .then(res => {
        setData(res.data);
        if (res.data?.data?.length > 0 && !expandedCondition) {
          setExpandedCondition(res.data.data[0].condition_code);
        }
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load report.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [conditionCode, months]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build radar chart for a single condition's PRO scores
  const buildRadarData = (pro) => ({
    labels: ['Vision Quality', 'Daily Activities', 'Reading Ability', 'Comfort\n(pain inverted)', 'Light Tolerance\n(inverted)'],
    datasets: [{
      label: 'Patient Avg Score (0–10)',
      data: [
        pro.avg_vision_quality,
        pro.avg_daily_activities,
        pro.avg_reading_ability,
        pro.avg_pain_score != null ? 10 - pro.avg_pain_score : null,
        pro.avg_light_sensitivity != null ? 10 - pro.avg_light_sensitivity : null,
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3B82F6',
      pointBackgroundColor: '#3B82F6',
    }],
  });

  // Build bar chart for medication comparison
  const buildMedBarData = (medications) => {
    const top = medications.slice(0, 8);
    return {
      labels: top.map(m => m.name.length > 22 ? m.name.slice(0, 20) + '…' : m.name),
      datasets: [
        {
          label: 'Avg Vision Quality (PRO)',
          data: top.map(m => m.avg_vision_quality),
          backgroundColor: '#3B82F6',
        },
        {
          label: 'Satisfaction Score (1–5)',
          data: top.map(m => m.avg_satisfaction_score ? (m.avg_satisfaction_score / 5) * 10 : null),
          backgroundColor: '#10B981',
        },
      ],
    };
  };

  const buildSatisfactionPieData = (dist) => {
    const entries = Object.entries(dist).filter(([, v]) => v > 0);
    return {
      labels: entries.map(([k]) => SATISFACTION_LABELS[k] || k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => SATISFACTION_COLORS[k] || '#9CA3AF'),
      }],
    };
  };

  return (
    <div className="outcomes-report-page">
      <div className="report-header">
        <h1>🎯 Patient Reported Outcomes &amp; Medication Effectiveness</h1>
        <p className="report-subtitle">
          Combines clinical eye test results with patient questionnaire scores to show how each medication performs per condition — from both the clinician's and patient's perspective.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Condition</label>
          <select value={conditionCode} onChange={e => setConditionCode(e.target.value)}>
            {CONDITION_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Lookback period</label>
          <select value={months} onChange={e => setMonths(Number(e.target.value))}>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
            <option value={36}>36 months</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading…' : '🔄 Refresh'}
        </button>
      </div>

      {error && <div className="report-error">{error}</div>}
      {loading && <div className="report-loading">Loading outcomes data…</div>}

      {!loading && data && data.data?.length === 0 && (
        <div className="report-empty">
          <p>No data found for the selected filters. Try extending the lookback period or ensuring patients have been assigned conditions.</p>
          <p className="report-empty-hint">
            To add patient outcome questionnaires, go to a patient's detail page and click <strong>+ Record Outcome</strong>.
          </p>
        </div>
      )}

      {/* ── Condition cards ── */}
      {!loading && data?.data?.map(cond => (
        <div key={cond.condition_code} className="condition-card" style={{ '--cond-color': cond.color }}>

          {/* Header */}
          <div
            className="condition-card-header"
            onClick={() => setExpandedCondition(
              expandedCondition === cond.condition_code ? null : cond.condition_code
            )}
          >
            <div className="condition-title">
              <span className="condition-dot" />
              <h2>{cond.condition_name}</h2>
              <span className="condition-badge">{cond.patient_count} patients</span>
              <span className="condition-badge">{cond.medication_count} medications</span>
              {cond.patient_reported_outcomes.total_questionnaires > 0 && (
                <span className="condition-badge condition-badge--pro">
                  {cond.patient_reported_outcomes.total_questionnaires} questionnaires
                </span>
              )}
            </div>
            <span className="expand-icon">{expandedCondition === cond.condition_code ? '▲' : '▼'}</span>
          </div>

          {expandedCondition === cond.condition_code && (
            <div className="condition-card-body">

              {/* ── Clinical outcomes summary ── */}
              <div className="outcomes-grid">
                <div className="summary-panel">
                  <h3>Clinical Outcomes</h3>
                  <div className="stat-row">
                    <span>Average VA improvement (LOGMAR)</span>
                    <span className={`improvement-badge ${
                      cond.clinical_outcomes.improvement_description === 'Improving' ? 'improving'
                      : cond.clinical_outcomes.improvement_description === 'Declining' ? 'declining' : 'stable'
                    }`}>
                      {cond.clinical_outcomes.improvement_description}
                      {cond.clinical_outcomes.avg_logmar_improvement != null
                        ? ` (${cond.clinical_outcomes.avg_logmar_improvement > 0 ? '−' : '+'}${Math.abs(cond.clinical_outcomes.avg_logmar_improvement)} LOGMAR)`
                        : ' – no data'}
                    </span>
                  </div>
                  <p className="stat-note">Based on {cond.clinical_outcomes.patients_with_va_data} patients with ≥2 visual acuity tests</p>
                </div>

                {/* ── PRO summary ── */}
                {cond.patient_reported_outcomes.total_questionnaires > 0 ? (
                  <div className="summary-panel">
                    <h3>Patient Reported Outcomes (avg scores)</h3>
                    <div className="pro-scores-grid">
                      <div className="pro-score-item">
                        <span>Vision Quality</span>
                        <ScoreBadge value={cond.patient_reported_outcomes.avg_vision_quality} />
                      </div>
                      <div className="pro-score-item">
                        <span>Daily Activities</span>
                        <ScoreBadge value={cond.patient_reported_outcomes.avg_daily_activities} />
                      </div>
                      <div className="pro-score-item">
                        <span>Reading Ability</span>
                        <ScoreBadge value={cond.patient_reported_outcomes.avg_reading_ability} />
                      </div>
                      <div className="pro-score-item">
                        <span>Pain / Discomfort</span>
                        <ScoreBadge value={cond.patient_reported_outcomes.avg_pain_score} reversed />
                      </div>
                      <div className="pro-score-item">
                        <span>Light Sensitivity</span>
                        <ScoreBadge value={cond.patient_reported_outcomes.avg_light_sensitivity} reversed />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="summary-panel summary-panel--empty">
                    <h3>Patient Reported Outcomes</h3>
                    <p>No questionnaires recorded yet for this condition.</p>
                    <p className="stat-note">Add them from the patient detail page → <em>Record Outcome</em>.</p>
                  </div>
                )}
              </div>

              {/* ── Satisfaction + side effects ── */}
              {cond.patient_reported_outcomes.total_questionnaires > 0 && (
                <div className="outcomes-grid">
                  <div className="summary-panel">
                    <h3>Treatment Satisfaction</h3>
                    <div className="dist-bars">
                      {Object.entries(cond.patient_reported_outcomes.satisfaction_distribution)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => (
                          <div key={k} className="dist-bar-row">
                            <span className="dist-label">{SATISFACTION_LABELS[k] || k}</span>
                            <div className="dist-bar-track">
                              <div
                                className="dist-bar-fill"
                                style={{
                                  width: `${(v / cond.patient_reported_outcomes.total_questionnaires) * 100}%`,
                                  background: SATISFACTION_COLORS[k] || '#9CA3AF',
                                }}
                              />
                            </div>
                            <span className="dist-count">{v}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="summary-panel">
                    <h3>Side Effect Severity</h3>
                    <div className="dist-bars">
                      {Object.entries(cond.patient_reported_outcomes.side_effect_severity_distribution)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => (
                          <div key={k} className="dist-bar-row">
                            <span className="dist-label" style={{ textTransform: 'capitalize' }}>{k}</span>
                            <div className="dist-bar-track">
                              <div
                                className="dist-bar-fill"
                                style={{
                                  width: `${(v / cond.patient_reported_outcomes.total_questionnaires) * 100}%`,
                                  background: SEVERITY_COLORS[k] || '#9CA3AF',
                                }}
                              />
                            </div>
                            <span className="dist-count">{v}</span>
                          </div>
                        ))}
                    </div>
                    {cond.patient_reported_outcomes.side_effect_free_text_count > 0 && (
                      <p className="stat-note">
                        {cond.patient_reported_outcomes.side_effect_free_text_count} patients described side effects in free text.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── PRO radar chart ── */}
              {cond.patient_reported_outcomes.total_questionnaires > 0 && (
                <div className="chart-panel">
                  <h3>PRO Radar – Patient Experience Profile</h3>
                  <div className="radar-container">
                    <Radar
                      data={buildRadarData(cond.patient_reported_outcomes)}
                      options={{
                        scales: { r: { min: 0, max: 10, ticks: { stepSize: 2 } } },
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Medications table ── */}
              {cond.medications?.length > 0 ? (
                <div className="med-table-panel">
                  <h3>Medications Used – Patient Outcomes Breakdown</h3>
                  <div className="med-bar-chart">
                    <Bar
                      data={buildMedBarData(cond.medications)}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' } },
                        scales: { y: { min: 0, max: 10, title: { display: true, text: 'Score (0–10)' } } },
                      }}
                    />
                  </div>
                  <div className="med-table-scroll">
                    <table className="med-table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Type</th>
                          <th>Patients</th>
                          <th>Prescriptions</th>
                          <th>Avg Vision Quality (PRO)</th>
                          <th>Satisfaction (1–5)</th>
                          <th>Side Effect Reports</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cond.medications.map(med => (
                          <tr key={med.id}>
                            <td className="med-name">{med.name}</td>
                            <td>{med.medication_type || '—'}</td>
                            <td>{med.patient_count}</td>
                            <td>{med.prescription_count}</td>
                            <td>
                              {med.avg_vision_quality != null
                                ? <><span className="pro-bar" style={{ '--pct': `${med.avg_vision_quality * 10}%` }} />{med.avg_vision_quality.toFixed(1)}</>
                                : <span className="text-muted">No data</span>}
                            </td>
                            <td>
                              {med.avg_satisfaction_score != null
                                ? med.avg_satisfaction_score.toFixed(1)
                                : <span className="text-muted">No data</span>}
                            </td>
                            <td>{med.side_effect_reports}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="summary-panel summary-panel--empty">
                  <p>No prescriptions recorded for patients with this condition in the selected period.</p>
                </div>
              )}

            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PatientOutcomesReport;
