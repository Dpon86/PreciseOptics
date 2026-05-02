import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import ProtocolFlowChart from '../../components/ProtocolFlowChart';
import './ProtocolDetailPage.css';

const ProtocolDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [steps, setSteps] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchProtocol();
    fetchProtocolSteps();
  }, [id]);

  const fetchProtocol = async () => {
    try {
      const response = await apiService.getProtocol(id);
      setProtocol(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch protocol');
      setLoading(false);
    }
  };

  const fetchProtocolSteps = async () => {
    try {
      const response = await apiService.getProtocolSteps(id);
      setSteps(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (err) {
      console.error('Error fetching protocol steps:', err);
    }
  };

  const getProtocolTypeLabel = (type) => {
    const types = {
      'loading_dose': 'Loading Dose',
      'maintenance': 'Maintenance',
      'fixed_interval': 'Fixed Interval',
      'treat_extend': 'Treat & Extend',
      'prn': 'PRN (As Needed)',
      'post_op': 'Post-Operative',
      'custom': 'Custom'
    };
    return types[type] || type;
  };

  const getStepTypeLabel = (type) => {
    const types = {
      'medication': 'Medication',
      'injection': 'Injection',
      'procedure': 'Procedure',
      'test': 'Test',
      'assessment': 'Assessment',
      'consultation': 'Consultation',
      'follow_up': 'Follow-up',
      'imaging': 'Imaging'
    };
    return types[type] || type;
  };

  if (loading) {
    return <div className="loading-spinner">Loading protocol details...</div>;
  }

  if (error || !protocol) {
    return (
      <div className="protocol-detail-page">
        <div className="alert alert-error">
          <strong>Error:</strong> {error || 'Protocol not found'}
        </div>
        <button onClick={() => navigate('/protocols')} className="btn-back">
          ← Back to Protocols
        </button>
      </div>
    );
  }

  return (
    <div className="protocol-detail-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/protocols')} className="btn-back">
            ← Back to Protocols
          </button>
          <div>
            <h1>{protocol.name}</h1>
            <div className="protocol-code-badge">{protocol.code}</div>
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => navigate(`/protocols/${id}/edit`)} 
            className="btn-primary"
          >
            Edit Protocol
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="protocol-tabs">
        <button
          className={`protocol-tab${activeTab === 'info' ? ' active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Basic Info
        </button>
        <button
          className={`protocol-tab${activeTab === 'steps' ? ' active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          📑 Protocol Steps {steps.length > 0 && <span className="tab-count">{steps.length}</span>}
        </button>
        <button
          className={`protocol-tab${activeTab === 'flowchart' ? ' active' : ''}`}
          onClick={() => setActiveTab('flowchart')}
        >
          🔀 Flow Chart
        </button>
      </div>

      {/* Tab: Basic Info */}
      {activeTab === 'info' && (
        <div className="detail-grid">
          {/* Basic Information Card */}
          <div className="detail-card">
            <h2>Basic Information</h2>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Protocol Type:</span>
                <span className="value">{getProtocolTypeLabel(protocol.protocol_type)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Condition:</span>
                <span className="value">{protocol.condition?.name || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${protocol.is_active ? 'status-active' : 'status-inactive'}`}>
                  {protocol.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {protocol.description && (
                <div className="detail-row full-width">
                  <span className="label">Description:</span>
                  <span className="value">{protocol.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timing & Duration Card */}
          <div className="detail-card">
            <h2>Timing & Duration</h2>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Total Duration:</span>
                <span className="value">
                  {protocol.total_duration_weeks ? `${protocol.total_duration_weeks} weeks` : 'Not specified'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Repeat Interval:</span>
                <span className="value">
                  {protocol.repeat_interval_weeks ? `${protocol.repeat_interval_weeks} weeks` : 'Not specified'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Total Steps:</span>
                <span className="value">{steps.length}</span>
              </div>
            </div>
          </div>

          {/* Clinical Details Card */}
          {(protocol.indications || protocol.contraindications) && (
            <div className="detail-card full-width">
              <h2>Clinical Details</h2>
              <div className="detail-rows">
                {protocol.indications && (
                  <div className="detail-row full-width">
                    <span className="label">Indications:</span>
                    <span className="value">{protocol.indications}</span>
                  </div>
                )}
                {protocol.contraindications && (
                  <div className="detail-row full-width">
                    <span className="label">Contraindications:</span>
                    <span className="value">{protocol.contraindications}</span>
                  </div>
                )}
                {protocol.expected_outcomes && (
                  <div className="detail-row full-width">
                    <span className="label">Expected Outcomes:</span>
                    <span className="value">{protocol.expected_outcomes}</span>
                  </div>
                )}
                {protocol.potential_side_effects && (
                  <div className="detail-row full-width">
                    <span className="label">Potential Side Effects:</span>
                    <span className="value">{protocol.potential_side_effects}</span>
                  </div>
                )}
                {protocol.monitoring_requirements && (
                  <div className="detail-row full-width">
                    <span className="label">Monitoring Requirements:</span>
                    <span className="value">{protocol.monitoring_requirements}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consent Requirements Card */}
          <div className="detail-card">
            <h2>Consent Requirements</h2>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Requires Consent:</span>
                <span className="value">{protocol.requires_consent ? 'Yes' : 'No'}</span>
              </div>
              {protocol.requires_consent && protocol.consent_type && (
                <div className="detail-row">
                  <span className="label">Consent Type:</span>
                  <span className="value">{protocol.consent_type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="detail-card">
            <h2>Metadata</h2>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(protocol.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Last Updated:</span>
                <span className="value">
                  {new Date(protocol.updated_at).toLocaleDateString()}
                </span>
              </div>
              {protocol.created_by && (
                <div className="detail-row">
                  <span className="label">Created By:</span>
                  <span className="value">
                    {protocol.created_by.first_name} {protocol.created_by.last_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Protocol Steps */}
      {activeTab === 'steps' && (
        <div className="detail-grid">
          {steps.length > 0 ? (
            <div className="detail-card full-width">
              <h2>Protocol Steps ({steps.length})</h2>
              <div className="steps-list">
                {steps.map((step) => (
                  <div key={step.id} className="step-item">
                    <div className="step-header">
                      <span className="step-number">Step {step.step_number}</span>
                      <span className="step-type-badge">{getStepTypeLabel(step.step_type)}</span>
                      {step.is_mandatory && (
                        <span className="mandatory-badge">Mandatory</span>
                      )}
                    </div>
                    <div className="step-content">
                      {step.timing_days && (
                        <div className="step-detail">
                          <strong>Timing:</strong> Day {step.timing_days}
                          {step.timing_window_days && ` (±${step.timing_window_days} days)`}
                        </div>
                      )}
                      {step.timing_from_start !== undefined && step.timing_from_start !== null && (
                        <div className="step-detail">
                          <strong>Week:</strong> {step.timing_from_start}
                        </div>
                      )}
                      {step.medication_details && (
                        <div className="step-detail">
                          <strong>Medication:</strong> {step.medication_details.name}
                        </div>
                      )}
                      {step.dosage_amount && (
                        <div className="step-detail">
                          <strong>Dosage:</strong> {step.dosage_amount} {step.dosage_unit}
                        </div>
                      )}
                      {step.instructions && (
                        <div className="step-detail">
                          <strong>Instructions:</strong> {step.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="detail-card full-width">
              <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '32px' }}>
                No steps have been added to this protocol yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Flow Chart */}
      {activeTab === 'flowchart' && (
        <div className="detail-card" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '20px' }}>Protocol Flow Chart</h2>
          <ProtocolFlowChart steps={steps} />
        </div>
      )}
    </div>
  );
};

export default ProtocolDetailPage;
