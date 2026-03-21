import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CompleteProtocolStepPage.css';

const CompleteProtocolStepPage = () => {
  const { stepCompletionId } = useParams();
  const navigate = useNavigate();
  
  const [stepCompletion, setStepCompletion] = useState(null);
  const [protocolStep, setProtocolStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [completionNotes, setCompletionNotes] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchStepDetails();
  }, [stepCompletionId]);

  const fetchStepDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch step completion details
      const completionResponse = await api.get(`/api/protocols/step-completions/${stepCompletionId}/`);
      const completionData = completionResponse.data;
      setStepCompletion(completionData);

      // Fetch protocol step details 
      const stepResponse = await api.get(`/api/protocols/steps/${completionData.protocol_step}/`);
      const stepData = stepResponse.data;
      setProtocolStep(stepData);

      // Initialize results array based on branching configuration
      if (stepData.branching_enabled && stepData.branch_condition_type) {
        initializeResults(stepData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching step details:', err);
      setError('Failed to load step details');
      setLoading(false);
    }
  };

  const initializeResults = (step) => {
    const resultType = step.branch_condition_type;
    const resultsList = [];

    // Create result entries based on the type
    if (resultType === 'yes_no') {
      resultsList.push({
        result_type: 'yes_no',
        result_label: step.step_title || 'Result',
        result_value_choice: '',
        notes: ''
      });
    } else if (resultType === 'met_not_met') {
      resultsList.push({
        result_type: 'met_not_met',
        result_label: step.step_title || 'Criteria Met',
        result_value_choice: '',
        notes: ''
      });
    } else if (resultType === 'numeric') {
      resultsList.push({
        result_type: 'numeric',
        result_label: step.step_title || 'Measurement',
        result_value_numeric: '',
        notes: ''
      });
    } else if (resultType === 'scale') {
      resultsList.push({
        result_type: 'scale',
        result_label: step.step_title || 'Rating (1-10)',
        result_value_scale: 5,
        notes: ''
      });
    } else {
      resultsList.push({
        result_type: 'free_text',
        result_label: step.step_title || 'Notes',
        result_value_text: '',
        notes: ''
      });
    }

    setResults(resultsList);
  };

  const addResult = () => {
    setResults([...results, {
      result_type: 'free_text',
      result_label: 'Additional Notes',
      result_value_text: '',
      notes: ''
    }]);
  };

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const updateResult = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const handleResultTypeChange = (index, newType) => {
    const updatedResults = [...results];
    updatedResults[index] = {
      result_type: newType,
      result_label: updatedResults[index].result_label,
      notes: updatedResults[index].notes
    };
    setResults(updatedResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (results.length === 0 && !completionNotes) {
      setError('Please provide at least one result or completion notes');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Complete the step
      const completionPayload = {
        notes: completionNotes,
        status: 'completed'
      };

      await api.post(
        `/api/protocols/patient-protocols/${stepCompletion.patient_protocol}/steps/${stepCompletionId}/complete/`,
        completionPayload
      );

      // Record results if any
      if (results.length > 0) {
        const resultsPayload = {
          step_completion: stepCompletionId,
          results: results.map(r => ({
            result_type: r.result_type,
            result_label: r.result_label || 'Result',
            result_value_choice: r.result_value_choice || null,
            result_value_numeric: r.result_value_numeric || null,
            result_value_text: r.result_value_text || null,
            result_value_scale: r.result_value_scale || null,
            notes: r.notes || ''
          }))
        };

        await api.post(`/api/protocols/completions/${stepCompletionId}/record-results/`, resultsPayload);

        // Evaluate branching logic if enabled
        if (protocolStep.branching_enabled) {
          await api.post(`/api/protocols/completions/${stepCompletionId}/evaluate-branching/`);
        }
      }

      setSuccess('Step completed successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/patient-protocols/${stepCompletion.patient_protocol}/schedule`);
      }, 1500);
      
    } catch (err) {
      console.error('Error completing step:', err);
      setError(err.response?.data?.detail || 'Failed to complete step. Please try again.');
      setSubmitting(false);
    }
  };

  const renderResultInput = (result, index) => {
    switch (result.result_type) {
      case 'yes_no':
        return (
          <div className="result-input-group">
            <label>Result</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`result-${index}`}
                  value="yes"
                  checked={result.result_value_choice === 'yes'}
                  onChange={(e) => updateResult(index, 'result_value_choice', e.target.value)}
                />
                <span className="radio-label">✓ Yes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`result-${index}`}
                  value="no"
                  checked={result.result_value_choice === 'no'}
                  onChange={(e) => updateResult(index, 'result_value_choice', e.target.value)}
                />
                <span className="radio-label">✗ No</span>
              </label>
            </div>
          </div>
        );

      case 'met_not_met':
        return (
          <div className="result-input-group">
            <label>Criteria Met</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`result-${index}`}
                  value="met"
                  checked={result.result_value_choice === 'met'}
                  onChange={(e) => updateResult(index, 'result_value_choice', e.target.value)}
                />
                <span className="radio-label">✓ Met</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`result-${index}`}
                  value="not_met"
                  checked={result.result_value_choice === 'not_met'}
                  onChange={(e) => updateResult(index, 'result_value_choice', e.target.value)}
                />
                <span className="radio-label">✗ Not Met</span>
              </label>
            </div>
          </div>
        );

      case 'numeric':
        return (
          <div className="result-input-group">
            <label>Numeric Value</label>
            <input
              type="number"
              step="0.01"
              value={result.result_value_numeric || ''}
              onChange={(e) => updateResult(index, 'result_value_numeric', parseFloat(e.target.value))}
              placeholder="Enter measurement"
              className="result-input"
            />
          </div>
        );

      case 'scale':
        return (
          <div className="result-input-group">
            <label>Rating (1-10): {result.result_value_scale || 5}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={result.result_value_scale || 5}
              onChange={(e) => updateResult(index, 'result_value_scale', parseInt(e.target.value))}
              className="scale-slider"
            />
            <div className="scale-labels">
              <span>1 (Poor)</span>
              <span>10 (Excellent)</span>
            </div>
          </div>
        );

      case 'free_text':
      default:
        return (
          <div className="result-input-group">
            <label>Notes</label>
            <textarea
              value={result.result_value_text || ''}
              onChange={(e) => updateResult(index, 'result_value_text', e.target.value)}
              placeholder="Enter detailed notes..."
              rows="4"
              className="result-textarea"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="complete-step-page">
        <div className="loading-spinner">Loading step details...</div>
      </div>
    );
  }

  if (error && !stepCompletion) {
    return (
      <div className="complete-step-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="complete-step-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Complete Protocol Step</h1>
      </div>

      {success && (
        <div className="success-message">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {stepCompletion && protocolStep && (
        <div className="step-info-card">
          <div className="step-header">
            <div className="step-number-badge">Step {protocolStep.step_number}</div>
            <h2>{protocolStep.title}</h2>
          </div>
          <p className="step-description">{protocolStep.description}</p>
          
          <div className="step-metadata">
            <div className="metadata-item">
              <strong>Scheduled Date:</strong> {new Date(stepCompletion.scheduled_date).toLocaleDateString()}
            </div>
            {protocolStep.branching_enabled && (
              <div className="metadata-item branching-indicator">
                <strong>🔀 Branching Enabled:</strong> Next step will be determined based on results
              </div>
            )}
          </div>

          {/* Display medications, treatments, tests if any */}
          {(protocolStep.medications?.length > 0 || 
            protocolStep.treatments?.length > 0 || 
            protocolStep.tests?.length > 0) && (
            <div className="step-requirements">
              {protocolStep.medications?.length > 0 && (
                <div className="requirement-section">
                  <h4>💊 Medications</h4>
                  <ul>
                    {protocolStep.medications.map((med, idx) => (
                      <li key={idx}>
                        {med.medication_name} - {med.dosage_amount} {med.dosage_unit} {med.frequency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {protocolStep.treatments?.length > 0 && (
                <div className="requirement-section">
                  <h4>🏥 Treatments</h4>
                  <ul>
                    {protocolStep.treatments.map((treat, idx) => (
                      <li key={idx}>{treat.treatment_name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {protocolStep.tests?.length > 0 && (
                <div className="requirement-section">
                  <h4>🔬 Tests Required</h4>
                  <ul>
                    {protocolStep.tests.map((test, idx) => (
                      <li key={idx}>
                        {test.test_name} {test.eye_side && `(${test.eye_side})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="completion-form">
        <div className="form-section">
          <h3>Record Results</h3>
          <p className="section-description">
            Record the outcomes and measurements from this protocol step.
          </p>

          {results.map((result, index) => (
            <div key={index} className="result-card">
              <div className="result-header">
                <div className="result-label-input">
                  <label>Result Label</label>
                  <input
                    type="text"
                    value={result.result_label}
                    onChange={(e) => updateResult(index, 'result_label', e.target.value)}
                    placeholder="e.g., Visual Acuity, IOP, Patient Response"
                    className="label-input"
                  />
                </div>
                
                <div className="result-type-selector">
                  <label>Result Type</label>
                  <select
                    value={result.result_type}
                    onChange={(e) => handleResultTypeChange(index, e.target.value)}
                    className="type-select"
                  >
                    <option value="yes_no">Yes/No</option>
                    <option value="met_not_met">Met/Not Met</option>
                    <option value="numeric">Numeric Value</option>
                    <option value="scale">Scale (1-10)</option>
                    <option value="free_text">Free Text</option>
                  </select>
                </div>

                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResult(index)}
                    className="remove-result-btn"
                    title="Remove this result"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {renderResultInput(result, index)}

              <div className="result-notes">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={result.notes || ''}
                  onChange={(e) => updateResult(index, 'notes', e.target.value)}
                  placeholder="Add any additional context or observations..."
                  rows="2"
                  className="notes-textarea"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addResult}
            className="add-result-btn"
          >
            + Add Another Result
          </button>
        </div>

        <div className="form-section">
          <h3>Completion Notes</h3>
          <p className="section-description">
            Add any general notes about completing this step.
          </p>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="e.g., Patient tolerated procedure well, no complications..."
            rows="4"
            className="completion-notes"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Completing Step...' : '✓ Complete Step'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompleteProtocolStepPage;
