import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AlertDetailPage.css';

const SEVERITY_MAP = {
  critical: { label: 'Critical', cls: 'sev-critical' },
  high:     { label: 'High',     cls: 'sev-high' },
  medium:   { label: 'Medium',   cls: 'sev-medium' },
  low:      { label: 'Low',      cls: 'sev-low' },
};

const TYPE_ICONS = {
  missed: '❌',
  late: '⏰',
  upcoming: '📅',
  overdue_followup: '📋',
};

const AlertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showDismissForm, setShowDismissForm] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [dismissReason, setDismissReason] = useState('');

  const loadAlert = async () => {
    try {
      setLoading(true);
      const response = await api.getAlert(id);
      setAlertData(response.data);
    } catch (err) {
      setError('Failed to load alert details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlert(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      await api.acknowledgeAlert(id);
      await loadAlert();
    } catch (err) {
      setError('Failed to acknowledge alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      await api.resolveAlert(id, { action_taken: actionTaken || 'Resolved manually', notes: '' });
      setShowResolveForm(false);
      setActionTaken('');
      await loadAlert();
    } catch (err) {
      setError('Failed to resolve alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      setActionLoading(true);
      await api.dismissAlert(id, { reason: dismissReason || 'Dismissed' });
      setShowDismissForm(false);
      setDismissReason('');
      await loadAlert();
    } catch (err) {
      setError('Failed to dismiss alert');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="adp-page"><div className="adp-loading">Loading alert...</div></div>;
  if (error && !alertData) return <div className="adp-page"><p className="adp-error">{error}</p></div>;
  if (!alertData) return null;

  const sev = SEVERITY_MAP[alertData.severity] || { label: alertData.severity, cls: 'sev-low' };
  const canAct = alertData.status === 'active' || alertData.status === 'acknowledged';

  return (
    <div className="adp-page">
      {/* Header */}
      <div className="adp-header">
        <button className="adp-back-btn" onClick={() => navigate('/alerts')}>← Back to Alerts</button>
        <div className="adp-title-row">
          <span className="adp-type-icon">{TYPE_ICONS[alertData.alert_type] || '🔔'}</span>
          <h1>{alertData.title}</h1>
          <span className={`adp-severity ${sev.cls}`}>{sev.label}</span>
          <span className={`adp-status adp-status-${alertData.status}`}>
            {alertData.status.charAt(0).toUpperCase() + alertData.status.slice(1)}
          </span>
        </div>
      </div>

      {error && <div className="adp-error-banner">{error}</div>}

      <div className="adp-grid">
        {/* Main details */}
        <div className="adp-card">
          <h3>Alert Details</h3>
          <div className="adp-rows">
            <div className="adp-row">
              <span className="adp-label">Patient</span>
              <span className="adp-value">
                <button
                  className="adp-patient-link"
                  onClick={() => navigate(`/patients/${alertData.patient}`)}
                >
                  {alertData.patient_name}
                  {alertData.patient_id_display && (
                    <span className="adp-pid"> ({alertData.patient_id_display})</span>
                  )}
                </button>
              </span>
            </div>
            <div className="adp-row">
              <span className="adp-label">Alert Type</span>
              <span className="adp-value">
                {TYPE_ICONS[alertData.alert_type]} {alertData.alert_type?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="adp-row">
              <span className="adp-label">Triggered</span>
              <span className="adp-value">
                {new Date(alertData.trigger_time).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
                {alertData.time_since_trigger && (
                  <span className="adp-muted"> ({alertData.time_since_trigger})</span>
                )}
              </span>
            </div>
            <div className="adp-row full">
              <span className="adp-label">Message</span>
              <span className="adp-value adp-message">{alertData.message}</span>
            </div>
          </div>
        </div>

        {/* Timeline / resolution info */}
        <div className="adp-card">
          <h3>Timeline</h3>
          <div className="adp-timeline">
            <div className="adp-tl-item">
              <div className="adp-tl-dot created"></div>
              <div className="adp-tl-content">
                <strong>Alert Created</strong>
                <span className="adp-muted">
                  {new Date(alertData.created_at).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {alertData.acknowledged_at && (
              <div className="adp-tl-item">
                <div className="adp-tl-dot acknowledged"></div>
                <div className="adp-tl-content">
                  <strong>Acknowledged</strong>
                  <span className="adp-muted">
                    {new Date(alertData.acknowledged_at).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                    {alertData.acknowledged_by_name && ` by ${alertData.acknowledged_by_name}`}
                  </span>
                </div>
              </div>
            )}

            {alertData.resolved_at && (
              <div className="adp-tl-item">
                <div className={`adp-tl-dot ${alertData.status}`}></div>
                <div className="adp-tl-content">
                  <strong>{alertData.status === 'dismissed' ? 'Dismissed' : 'Resolved'}</strong>
                  <span className="adp-muted">
                    {new Date(alertData.resolved_at).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                    {alertData.resolved_by_name && ` by ${alertData.resolved_by_name}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {alertData.action_taken && (
            <div className="adp-note-box">
              <strong>Action Taken:</strong> {alertData.action_taken}
            </div>
          )}
          {alertData.notes && (
            <div className="adp-note-box adp-note-muted">
              <strong>Notes:</strong> {alertData.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {canAct && (
        <div className="adp-actions-card">
          <h3>Take Action</h3>

          {!showResolveForm && !showDismissForm && (
            <div className="adp-action-btns">
              {alertData.status === 'active' && (
                <button
                  className="adp-btn adp-btn-acknowledge"
                  onClick={handleAcknowledge}
                  disabled={actionLoading}
                >
                  ✓ Acknowledge
                </button>
              )}
              <button
                className="adp-btn adp-btn-resolve"
                onClick={() => setShowResolveForm(true)}
                disabled={actionLoading}
              >
                ✓✓ Mark Resolved
              </button>
              <button
                className="adp-btn adp-btn-dismiss"
                onClick={() => setShowDismissForm(true)}
                disabled={actionLoading}
              >
                ✕ Dismiss
              </button>
            </div>
          )}

          {showResolveForm && (
            <div className="adp-form">
              <label>What action was taken?</label>
              <textarea
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="Describe the action taken to resolve this alert..."
                rows={3}
              />
              <div className="adp-form-btns">
                <button className="adp-btn adp-btn-resolve" onClick={handleResolve} disabled={actionLoading}>
                  Confirm Resolve
                </button>
                <button className="adp-btn adp-btn-cancel" onClick={() => setShowResolveForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showDismissForm && (
            <div className="adp-form">
              <label>Reason for dismissal (optional):</label>
              <textarea
                value={dismissReason}
                onChange={e => setDismissReason(e.target.value)}
                placeholder="Why is this alert being dismissed?"
                rows={2}
              />
              <div className="adp-form-btns">
                <button className="adp-btn adp-btn-dismiss" onClick={handleDismiss} disabled={actionLoading}>
                  Confirm Dismiss
                </button>
                <button className="adp-btn adp-btn-cancel" onClick={() => setShowDismissForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertDetailPage;
