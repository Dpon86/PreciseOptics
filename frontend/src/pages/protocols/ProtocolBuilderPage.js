import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ProtocolBuilderPage.css';

const ProtocolBuilderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Protocol basic info
  const [protocolData, setProtocolData] = useState({
    name: '',
    code: '',
    protocol_type: 'custom',
    condition: '',
    description: '',
    total_duration_weeks: '',
    requires_consent: false,
    consent_type: 'treatment',
  });

  // Steps state (support up to 10 steps)
  const [steps, setSteps] = useState([
    {
      step_number: 1,
      step_type: 'consultation',
      title: '',
      description: '',
      timing_type: 'fixed',
      timing_days: 0,
      is_recurring: false,
      recurrence_count: null,
      has_branches: false,
      branch_condition_type: '',
      branch_logic: { conditions: [], default_next_step: null },
      medications: [],
      treatments: [],
      tests: [],
      consents: [],
    },
  ]);

  // Available options
  const [medications, setMedications] = useState([]);
  const [eyeTests, setEyeTests] = useState([
    { value: 'visual_acuity', label: 'Visual Acuity Test (BCVA)' },
    { value: 'refraction', label: 'Refraction Test' },
    { value: 'iop', label: 'Intraocular Pressure (IOP/Tonometry)' },
    { value: 'visual_field', label: 'Visual Field Test (Perimetry)' },
    { value: 'oct', label: 'OCT Scan (Optical Coherence Tomography)' },
    { value: 'fundus_photo', label: 'Fundus Photography' },
    { value: 'angiography', label: 'Fluorescein Angiography (FFA)' },
    { value: 'icg_angiography', label: 'ICG Angiography' },
    { value: 'autofluorescence', label: 'Fundus Autofluorescence (FAF)' },
    { value: 'amsler_grid', label: 'Amsler Grid Test' },
    { value: 'contrast_sensitivity', label: 'Contrast Sensitivity Test' },
    { value: 'color_vision', label: 'Color Vision Test' },
    { value: 'slit_lamp', label: 'Slit Lamp Examination' },
    { value: 'dilated_exam', label: 'Dilated Fundus Examination' },
    { value: 'other', label: 'Other Test' },
  ]);

  const protocolTypes = [
    { value: 'loading_dose', label: 'Loading Dose' },
    { value: 'maintenance', label: 'Maintenance Therapy' },
    { value: 'fixed_interval', label: 'Fixed Interval' },
    { value: 'treat_extend', label: 'Treat and Extend' },
    { value: 'prn', label: 'PRN (As Needed)' },
    { value: 'post_op', label: 'Post-Operative Care' },
    { value: 'custom', label: 'Custom Protocol' },
  ];

  const stepTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'medication', label: 'Medication Administration' },
    { value: 'treatment', label: 'Treatment/Procedure' },
    { value: 'test', label: 'Diagnostic Test' },
    { value: 'assessment', label: 'Clinical Assessment' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'multiple', label: 'Multiple Actions' },
  ];

  const timingTypes = [
    { value: 'fixed', label: 'Fixed Days from Start' },
    { value: 'from_previous', label: 'Days from Previous Step' },
    { value: 'weekly', label: 'Weekly Recurring' },
    { value: 'monthly', label: 'Monthly Recurring' },
  ];

  const branchConditionTypes = [
    { value: 'yes_no', label: 'Yes/No Decision' },
    { value: 'met_not_met', label: 'Met/Not Met Criteria' },
    { value: 'test_result', label: 'Based on Test Result' },
    { value: 'measurement', label: 'Based on Measurement' },
    { value: 'free_text', label: 'Free Text Evaluation' },
    { value: 'manual', label: 'Manual Decision' },
  ];

  const treatmentTypes = [
    { value: 'injection', label: 'Intravitreal Injection (Anti-VEGF)' },
    { value: 'laser', label: 'Laser Treatment (Photocoagulation)' },
    { value: 'pdt', label: 'Photodynamic Therapy (PDT)' },
    { value: 'surgery', label: 'Surgical Procedure' },
    { value: 'implant', label: 'Ocular Implant' },
    { value: 'supplement', label: 'Nutritional Supplement' },
    { value: 'lifestyle', label: 'Lifestyle Modification' },
    { value: 'physical_therapy', label: 'Physical Therapy' },
    { value: 'observation', label: 'Observation/Monitoring' },
    { value: 'other', label: 'Other Treatment' },
  ];

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications/');
      setMedications(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  const handleProtocolChange = (field, value) => {
    setProtocolData({ ...protocolData, [field]: value });
  };

  const addStep = () => {
    if (steps.length < 10) {
      setSteps([
        ...steps,
        {
          step_number: steps.length + 1,
          step_type: 'consultation',
          title: '',
          description: '',
          timing_type: 'fixed',
          timing_days: 0,
          is_recurring: false,
          recurrence_count: null,
          has_branches: false,
          branch_condition_type: '',
          branch_logic: { conditions: [], default_next_step: null },
          medications: [],
          treatments: [],
          tests: [],
          consents: [],
        },
      ]);
    }
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.step_number = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addMedicationToStep = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].medications.push({
      medication_id: '',
      dosage_amount: '',
      dosage_unit: 'mg',
      route: 'oral',
      frequency: 'once_daily',
      duration_days: 7,
      eye_side: '',
    });
    setSteps(newSteps);
  };

  const removeMedicationFromStep = (stepIndex, medIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].medications = newSteps[stepIndex].medications.filter(
      (_, i) => i !== medIndex
    );
    setSteps(newSteps);
  };

  const updateStepMedication = (stepIndex, medIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].medications[medIndex][field] = value;
    setSteps(newSteps);
  };

  const addTreatmentToStep = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].treatments.push({
      treatment_type: 'injection',
      treatment_name: '',
      description: '',
      eye_side: '',
      expected_duration_minutes: 30,
      requires_anesthesia: false,
    });
    setSteps(newSteps);
  };

  const removeTreatmentFromStep = (stepIndex, treatIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].treatments = newSteps[stepIndex].treatments.filter(
      (_, i) => i !== treatIndex
    );
    setSteps(newSteps);
  };

  const updateStepTreatment = (stepIndex, treatIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].treatments[treatIndex][field] = value;
    setSteps(newSteps);
  };

  const addTestToStep = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tests.push({
      test_type: 'visual_acuity',
      test_name: '',
      description: '',
      eye_side: '',
      is_baseline: false,
      expected_values: '',
    });
    setSteps(newSteps);
  };

  const removeTestFromStep = (stepIndex, testIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tests = newSteps[stepIndex].tests.filter(
      (_, i) => i !== testIndex
    );
    setSteps(newSteps);
  };

  const updateStepTest = (stepIndex, testIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].tests[testIndex][field] = value;
    setSteps(newSteps);
  };

  const addBranchCondition = (stepIndex) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].branch_logic.conditions) {
      newSteps[stepIndex].branch_logic.conditions = [];
    }
    newSteps[stepIndex].branch_logic.conditions.push({
      result: '',
      operator: 'equals',
      next_step: null,
      label: '',
    });
    setSteps(newSteps);
  };

  const removeBranchCondition = (stepIndex, condIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].branch_logic.conditions = newSteps[
      stepIndex
    ].branch_logic.conditions.filter((_, i) => i !== condIndex);
    setSteps(newSteps);
  };

  const updateBranchCondition = (stepIndex, condIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].branch_logic.conditions[condIndex][field] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create protocol
      const protocolResponse = await api.post('/protocols/', protocolData);
      const protocolId = protocolResponse.data.id;

      // Create steps
      for (const step of steps) {
        const stepData = {
          protocol: protocolId,
          step_number: step.step_number,
          step_type: step.step_type,
          title: step.title,
          description: step.description,
          timing_type: step.timing_type,
          timing_days: step.timing_days,
          is_recurring: step.is_recurring,
          recurrence_count: step.recurrence_count,
          has_branches: step.has_branches,
          branch_condition_type: step.branch_condition_type,
          branch_logic: step.branch_logic,
        };

        const stepResponse = await api.post('/protocols/steps/', stepData);
        const stepId = stepResponse.data.id;

        // Add medications
        for (let i = 0; i < step.medications.length; i++) {
          const med = step.medications[i];
          await api.post('/protocols/step-medications/', {
            protocol_step: stepId,
            medication: med.medication_id,
            dosage_amount: med.dosage_amount,
            dosage_unit: med.dosage_unit,
            route: med.route,
            frequency: med.frequency,
            duration_days: med.duration_days,
            eye_side: med.eye_side,
            order: i + 1,
          });
        }

        // Add treatments
        for (let i = 0; i < step.treatments.length; i++) {
          const treat = step.treatments[i];
          await api.post('/protocols/step-treatments/', {
            protocol_step: stepId,
            treatment_type: treat.treatment_type,
            treatment_name: treat.treatment_name,
            description: treat.description,
            eye_side: treat.eye_side,
            expected_duration_minutes: treat.expected_duration_minutes,
            requires_anesthesia: treat.requires_anesthesia,
            order: i + 1,
          });
        }

        // Add tests
        for (let i = 0; i < step.tests.length; i++) {
          const test = step.tests[i];
          await api.post('/protocols/step-tests/', {
            protocol_step: stepId,
            test_type: test.test_type,
            test_name: test.test_name,
            description: test.description,
            eye_side: test.eye_side,
            is_baseline: test.is_baseline,
            expected_values: test.expected_values,
            order: i + 1,
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/protocols`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating protocol');
      console.error('Error creating protocol:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="protocol-builder-page">
      <div className="page-header">
        <h1>🏗️ Protocol Builder</h1>
        <p>Create a new treatment protocol with multiple steps and branching logic</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success!</strong> Protocol created successfully. Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="protocol-builder-form">
        {/* Protocol Basic Info */}
        <div className="form-section">
          <h2>📋 Protocol Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Protocol Name *</label>
              <input
                type="text"
                value={protocolData.name}
                onChange={(e) => handleProtocolChange('name', e.target.value)}
                required
                placeholder="e.g., Glaucoma Treatment Protocol"
              />
            </div>

            <div className="form-group">
              <label>Protocol Code *</label>
              <input
                type="text"
                value={protocolData.code}
                onChange={(e) => handleProtocolChange('code', e.target.value)}
                required
                placeholder="e.g., GTP-2025"
              />
            </div>

            <div className="form-group">
              <label>Protocol Type</label>
              <select
                value={protocolData.protocol_type}
                onChange={(e) => handleProtocolChange('protocol_type', e.target.value)}
              >
                {protocolTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Condition/Diagnosis</label>
              <input
                type="text"
                value={protocolData.condition}
                onChange={(e) => handleProtocolChange('condition', e.target.value)}
                placeholder="e.g., Primary Open-Angle Glaucoma"
              />
            </div>

            <div className="form-group">
              <label>Total Duration (weeks)</label>
              <input
                type="number"
                value={protocolData.total_duration_weeks}
                onChange={(e) => handleProtocolChange('total_duration_weeks', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={protocolData.requires_consent}
                  onChange={(e) => handleProtocolChange('requires_consent', e.target.checked)}
                />
                Requires Patient Consent
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={protocolData.description}
              onChange={(e) => handleProtocolChange('description', e.target.value)}
              rows="3"
              placeholder="Describe the protocol purpose and overview..."
            />
          </div>
        </div>

        {/* Protocol Steps */}
        <div className="form-section">
          <div className="section-header">
            <h2>🔄 Protocol Steps (Flowchart)</h2>
            <button
              type="button"
              onClick={addStep}
              disabled={steps.length >= 10}
              className="btn-add-step"
            >
              + Add Step
            </button>
          </div>

          <div className="flowchart-view">
            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="step-card">
                <div className="step-header">
                  <h3>Step {step.step_number}</h3>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(stepIndex)}
                      className="btn-remove-step"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="step-content">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Step Type *</label>
                      <select
                        value={step.step_type}
                        onChange={(e) => updateStep(stepIndex, 'step_type', e.target.value)}
                        required
                      >
                        {stepTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                        required
                        placeholder="e.g., Initial Assessment"
                      />
                    </div>

                    <div className="form-group">
                      <label>Timing Type</label>
                      <select
                        value={step.timing_type}
                        onChange={(e) => updateStep(stepIndex, 'timing_type', e.target.value)}
                      >
                        {timingTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        {step.timing_type === 'weekly' || step.timing_type === 'monthly'
                          ? 'Interval (days)'
                          : 'Days'}
                      </label>
                      <input
                        type="number"
                        value={step.timing_days}
                        onChange={(e) => updateStep(stepIndex, 'timing_days', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(stepIndex, 'description', e.target.value)}
                      rows="2"
                      placeholder="Describe what happens in this step..."
                    />
                  </div>

                  {/* Recurring Options */}
                  <div className="recurring-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={step.is_recurring}
                        onChange={(e) => updateStep(stepIndex, 'is_recurring', e.target.checked)}
                      />
                      Recurring Step
                    </label>
                    {step.is_recurring && (
                      <div className="form-group inline">
                        <label>Repeat Count:</label>
                        <input
                          type="number"
                          value={step.recurrence_count || ''}
                          onChange={(e) =>
                            updateStep(stepIndex, 'recurrence_count', parseInt(e.target.value) || null)
                          }
                          placeholder="Leave empty for indefinite"
                          min="1"
                          style={{ width: '150px' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="step-items-section">
                    <div className="items-header">
                      <h4>💊 Medications</h4>
                      <button
                        type="button"
                        onClick={() => addMedicationToStep(stepIndex)}
                        className="btn-add-item"
                      >
                        + Add
                      </button>
                    </div>
                    {step.medications.map((med, medIndex) => (
                      <div key={medIndex} className="item-card">
                        <button
                          type="button"
                          onClick={() => removeMedicationFromStep(stepIndex, medIndex)}
                          className="btn-remove-item"
                        >
                          ✕
                        </button>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Medication *</label>
                            <select
                              value={med.medication_id}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'medication_id', e.target.value)
                              }
                              required
                            >
                              <option value="">Select medication...</option>
                              {medications.map((medication) => (
                                <option key={medication.id} value={medication.id}>
                                  {medication.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Dosage</label>
                            <input
                              type="text"
                              value={med.dosage_amount}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'dosage_amount', e.target.value)
                              }
                              placeholder="e.g., 1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Unit</label>
                            <input
                              type="text"
                              value={med.dosage_unit}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'dosage_unit', e.target.value)
                              }
                              placeholder="e.g., drop"
                            />
                          </div>
                          <div className="form-group">
                            <label>Route</label>
                            <select
                              value={med.route}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'route', e.target.value)
                              }
                            >
                              <option value="oral">Oral</option>
                              <option value="topical">Topical (Eye Drops)</option>
                              <option value="intravitreal">Intravitreal Injection</option>
                              <option value="iv">Intravenous</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Frequency</label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'frequency', e.target.value)
                              }
                              placeholder="e.g., twice daily"
                            />
                          </div>
                          <div className="form-group">
                            <label>Eye Side</label>
                            <select
                              value={med.eye_side}
                              onChange={(e) =>
                                updateStepMedication(stepIndex, medIndex, 'eye_side', e.target.value)
                              }
                            >
                              <option value="">Not applicable</option>
                              <option value="OD">Right Eye (OD)</option>
                              <option value="OS">Left Eye (OS)</option>
                              <option value="OU">Both Eyes (OU)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Treatments */}
                  <div className="step-items-section">
                    <div className="items-header">
                      <h4>🔬 Treatments/Procedures</h4>
                      <button
                        type="button"
                        onClick={() => addTreatmentToStep(stepIndex)}
                        className="btn-add-item"
                      >
                        + Add
                      </button>
                    </div>
                    {step.treatments.map((treat, treatIndex) => (
                      <div key={treatIndex} className="item-card">
                        <button
                          type="button"
                          onClick={() => removeTreatmentFromStep(stepIndex, treatIndex)}
                          className="btn-remove-item"
                        >
                          ✕
                        </button>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Treatment Type *</label>
                            <select
                              value={treat.treatment_type}
                              onChange={(e) =>
                                updateStepTreatment(stepIndex, treatIndex, 'treatment_type', e.target.value)
                              }
                              required
                            >
                              {treatmentTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Treatment Name *</label>
                            <input
                              type="text"
                              value={treat.treatment_name}
                              onChange={(e) =>
                                updateStepTreatment(stepIndex, treatIndex, 'treatment_name', e.target.value)
                              }
                              required
                              placeholder="e.g., Intravitreal injection"
                            />
                          </div>
                          <div className="form-group">
                            <label>Eye Side</label>
                            <select
                              value={treat.eye_side}
                              onChange={(e) =>
                                updateStepTreatment(stepIndex, treatIndex, 'eye_side', e.target.value)
                              }
                            >
                              <option value="">Not applicable</option>
                              <option value="OD">Right Eye (OD)</option>
                              <option value="OS">Left Eye (OS)</option>
                              <option value="OU">Both Eyes (OU)</option>
                            </select>
                          </div>
                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={treat.requires_anesthesia}
                                onChange={(e) =>
                                  updateStepTreatment(
                                    stepIndex,
                                    treatIndex,
                                    'requires_anesthesia',
                                    e.target.checked
                                  )
                                }
                              />
                              Requires Anesthesia
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Eye Tests */}
                  <div className="step-items-section">
                    <div className="items-header">
                      <h4>👁️ Eye Tests</h4>
                      <button
                        type="button"
                        onClick={() => addTestToStep(stepIndex)}
                        className="btn-add-item"
                      >
                        + Add
                      </button>
                    </div>
                    {step.tests.map((test, testIndex) => (
                      <div key={testIndex} className="item-card">
                        <button
                          type="button"
                          onClick={() => removeTestFromStep(stepIndex, testIndex)}
                          className="btn-remove-item"
                        >
                          ✕
                        </button>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Test Type *</label>
                            <select
                              value={test.test_type}
                              onChange={(e) =>
                                updateStepTest(stepIndex, testIndex, 'test_type', e.target.value)
                              }
                              required
                            >
                              {eyeTests.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test Name</label>
                            <input
                              type="text"
                              value={test.test_name}
                              onChange={(e) =>
                                updateStepTest(stepIndex, testIndex, 'test_name', e.target.value)
                              }
                              placeholder="e.g., Goldmann tonometry"
                            />
                          </div>
                          <div className="form-group">
                            <label>Eye Side</label>
                            <select
                              value={test.eye_side}
                              onChange={(e) =>
                                updateStepTest(stepIndex, testIndex, 'eye_side', e.target.value)
                              }
                            >
                              <option value="">Not applicable</option>
                              <option value="OD">Right Eye (OD)</option>
                              <option value="OS">Left Eye (OS)</option>
                              <option value="OU">Both Eyes (OU)</option>
                            </select>
                          </div>
                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={test.is_baseline}
                                onChange={(e) =>
                                  updateStepTest(stepIndex, testIndex, 'is_baseline', e.target.checked)
                                }
                              />
                              Baseline Test
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Branching Logic */}
                  <div className="branching-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={step.has_branches}
                        onChange={(e) => updateStep(stepIndex, 'has_branches', e.target.checked)}
                      />
                      Enable Branching Logic
                    </label>

                    {step.has_branches && (
                      <div className="branching-config">
                        <div className="form-group">
                          <label>Branch Condition Type</label>
                          <select
                            value={step.branch_condition_type}
                            onChange={(e) =>
                              updateStep(stepIndex, 'branch_condition_type', e.target.value)
                            }
                          >
                            <option value="">Select condition type...</option>
                            {branchConditionTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="conditions-section">
                          <div className="items-header">
                            <h5>Branch Conditions</h5>
                            <button
                              type="button"
                              onClick={() => addBranchCondition(stepIndex)}
                              className="btn-add-item"
                            >
                              + Add Condition
                            </button>
                          </div>

                          {step.branch_logic.conditions &&
                            step.branch_logic.conditions.map((condition, condIndex) => (
                              <div key={condIndex} className="condition-card">
                                <button
                                  type="button"
                                  onClick={() => removeBranchCondition(stepIndex, condIndex)}
                                  className="btn-remove-item"
                                >
                                  ✕
                                </button>
                                <div className="form-grid">
                                  <div className="form-group">
                                    <label>If Result Is</label>
                                    <input
                                      type="text"
                                      value={condition.result}
                                      onChange={(e) =>
                                        updateBranchCondition(
                                          stepIndex,
                                          condIndex,
                                          'result',
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., yes, no, met, not met"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Go to Step</label>
                                    <select
                                      value={condition.next_step || ''}
                                      onChange={(e) =>
                                        updateBranchCondition(
                                          stepIndex,
                                          condIndex,
                                          'next_step',
                                          parseInt(e.target.value) || null
                                        )
                                      }
                                    >
                                      <option value="">Select step...</option>
                                      {steps.map((s) => (
                                        <option key={s.step_number} value={s.step_number}>
                                          Step {s.step_number}: {s.title || 'Untitled'}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>Branch Label</label>
                                    <input
                                      type="text"
                                      value={condition.label}
                                      onChange={(e) =>
                                        updateBranchCondition(
                                          stepIndex,
                                          condIndex,
                                          'label',
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., If improved"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="form-group">
                          <label>Default Next Step (if no conditions match)</label>
                          <select
                            value={step.branch_logic.default_next_step || ''}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[stepIndex].branch_logic.default_next_step =
                                parseInt(e.target.value) || null;
                              setSteps(newSteps);
                            }}
                          >
                            <option value="">End protocol</option>
                            {steps.map((s) => (
                              <option key={s.step_number} value={s.step_number}>
                                Step {s.step_number}: {s.title || 'Untitled'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {stepIndex < steps.length - 1 && (
                  <div className="step-connector">
                    <div className="arrow-down">↓</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/protocols')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating Protocol...' : '✅ Create Protocol'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProtocolBuilderPage;
