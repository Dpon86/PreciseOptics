import React from 'react';
import './ProtocolFlowChart.css';

const STEP_TYPE_CONFIG = {
  medication:   { icon: '💊', color: '#3498db', label: 'Medication' },
  injection:    { icon: '💉', color: '#e74c3c', label: 'Injection' },
  procedure:    { icon: '⚕️', color: '#9b59b6', label: 'Procedure' },
  test:         { icon: '🔬', color: '#27ae60', label: 'Test' },
  assessment:   { icon: '📋', color: '#f39c12', label: 'Assessment' },
  consultation: { icon: '👨‍⚕️', color: '#1abc9c', label: 'Consultation' },
  follow_up:    { icon: '📅', color: '#2980b9', label: 'Follow-up' },
  imaging:      { icon: '🖼️', color: '#8e44ad', label: 'Imaging' },
};

const COMPLETION_STATUS = {
  completed:   { color: '#27ae60', label: '✔ Completed', bg: '#e8f5e9' },
  missed:      { color: '#e74c3c', label: '✘ Missed',    bg: '#ffebee' },
  scheduled:   { color: '#3498db', label: '📅 Scheduled', bg: '#e3f2fd' },
  rescheduled: { color: '#f39c12', label: '🔄 Rescheduled', bg: '#fff8e1' },
  cancelled:   { color: '#95a5a6', label: '✕ Cancelled',  bg: '#f5f5f5' },
};

/**
 * ProtocolFlowChart — visual vertical flowchart of protocol steps.
 * Props:
 *   steps[]      - protocol step objects
 *   completions[] - optional patient step completion records (for status overlay)
 */
const ProtocolFlowChart = ({ steps = [], completions = [] }) => {
  const getCompletion = (stepId) =>
    completions.find(c => c.protocol_step === stepId || c.step_id === stepId);

  const cfg = (type) =>
    STEP_TYPE_CONFIG[type] || { icon: '📌', color: '#7f8c8d', label: type };

  if (!steps.length) {
    return (
      <div className="flowchart-empty">
        <p>No steps defined for this protocol.</p>
      </div>
    );
  }

  return (
    <div className="protocol-flowchart">
      {/* Legend */}
      <div className="flowchart-legend">
        {Object.entries(STEP_TYPE_CONFIG).map(([key, c]) => (
          <span key={key} className="legend-item" style={{ '--c': c.color }}>
            {c.icon} {c.label}
          </span>
        ))}
      </div>

      <div className="flowchart-flow">
        {/* Start node */}
        <div className="flow-node flow-start">▶ START</div>
        <div className="flow-connector"><div className="connector-line" /><div className="connector-arrow">▼</div></div>

        {steps.map((step, index) => {
          const typeCfg = cfg(step.step_type);
          const completion = getCompletion(step.id);
          const compStatus = completion ? COMPLETION_STATUS[completion.status] : null;
          const nextStep = steps[index + 1];

          return (
            <React.Fragment key={step.id || index}>
              <div
                className={`flow-node flow-step${completion ? ` status-${completion.status}` : ''}`}
                style={{ '--step-color': typeCfg.color }}
              >
                {/* Coloured step number column */}
                <div className="step-num-col" style={{ background: typeCfg.color }}>
                  {step.step_number}
                </div>

                <div className="step-body">
                  {/* Header row */}
                  <div className="step-hdr">
                    <span className="step-type-icon">{typeCfg.icon}</span>
                    <div className="step-title-wrap">
                      <h4 className="step-title">
                        {step.title || step.step_title || `Step ${step.step_number}`}
                      </h4>
                      <span className="step-type-lbl" style={{ color: typeCfg.color }}>
                        {typeCfg.label}
                      </span>
                    </div>
                    {compStatus && (
                      <span
                        className="comp-badge"
                        style={{ color: compStatus.color, background: compStatus.bg }}
                      >
                        {compStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Meta chips */}
                  <div className="step-meta">
                    {step.timing_from_start !== undefined && step.timing_from_start !== null && (
                      <span className="meta-chip">⏱ Week {step.timing_from_start}</span>
                    )}
                    {step.timing_days !== undefined && step.timing_days !== null && (
                      <span className="meta-chip">📆 Day {step.timing_days}</span>
                    )}
                    {step.is_mandatory && (
                      <span className="meta-chip mandatory">★ Required</span>
                    )}
                    {completion?.scheduled_date && (
                      <span className="meta-chip">
                        🗓 {new Date(completion.scheduled_date).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Medications */}
                  {step.medications?.length > 0 && (
                    <div className="step-section">
                      <span className="section-lbl">💊 Medications</span>
                      <div className="pills-row">
                        {step.medications.map((m, i) => (
                          <span key={i} className="detail-pill blue">
                            {m.medication_name || m.medication}
                            {m.dosage ? ` — ${m.dosage}` : ''}
                            {m.frequency ? ` ${m.frequency}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medication (single field) */}
                  {step.medication_details?.name && !step.medications?.length && (
                    <div className="step-section">
                      <span className="section-lbl">💊 Medication</span>
                      <div className="pills-row">
                        <span className="detail-pill blue">
                          {step.medication_details.name}
                          {step.dosage_amount ? ` — ${step.dosage_amount}${step.dosage_unit || ''}` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tests */}
                  {step.tests?.length > 0 && (
                    <div className="step-section">
                      <span className="section-lbl">🔬 Tests</span>
                      <div className="pills-row">
                        {step.tests.map((t, i) => (
                          <span key={i} className="detail-pill green">
                            {t.test_type_display || t.test_type}
                            {t.eye_side ? ` (${t.eye_side})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatments / Procedures */}
                  {step.treatments?.length > 0 && (
                    <div className="step-section">
                      <span className="section-lbl">⚕️ Procedures</span>
                      <div className="pills-row">
                        {step.treatments.map((t, i) => (
                          <span key={i} className="detail-pill purple">
                            {t.treatment_type_name || t.treatment_type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions / Description */}
                  {(step.instructions || step.description) && (
                    <p className="step-notes">{step.instructions || step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector to next step */}
              {index < steps.length - 1 && (
                <div className="flow-connector">
                  <div className="connector-line" />
                  <div className="connector-arrow">▼</div>
                  {nextStep && step.timing_from_start !== undefined && nextStep.timing_from_start !== undefined && (
                    <div className="connector-label">
                      +{nextStep.timing_from_start - step.timing_from_start}w
                    </div>
                  )}
                  {nextStep && step.timing_days !== undefined && nextStep.timing_days !== undefined
                    && step.timing_from_start === undefined && (
                    <div className="connector-label">
                      Day {nextStep.timing_days}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Connector to end */}
        <div className="flow-connector"><div className="connector-line" /><div className="connector-arrow">▼</div></div>
        <div className="flow-node flow-end">⬛ COMPLETE</div>
      </div>
    </div>
  );
};

export default ProtocolFlowChart;
