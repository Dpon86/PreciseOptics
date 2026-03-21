import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './RecallCenter.css';

const SEVERITY_COLOURS = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c',
};

const STATUS_COLOURS = {
  active: '#e74c3c',
  acknowledged: '#e67e22',
  resolved: '#27ae60',
  closed: '#95a5a6',
};

const RECALL_TYPE_LABELS = {
  safety: 'Safety Issue',
  contamination: 'Contamination',
  labelling: 'Labelling Error',
  quality: 'Quality Defect',
  expiry: 'Expired Batch',
  other: 'Other',
};

const RecallCenter = () => {
  const navigate = useNavigate();

  // List state
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ active: 0, acknowledged: 0, resolved: 0, critical: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Selected recall for detail panel
  const [selected, setSelected] = useState(null);
  const [affectedPatients, setAffectedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [medications, setMedications] = useState([]);
  const [formData, setFormData] = useState({
    medication: '',
    batch_number: '',
    recall_type: 'safety',
    severity: 'high',
    title: '',
    description: '',
    action_required: '',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Resolve modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveTarget, setResolveTarget] = useState(null);

  const fetchRecalls = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await api.getMedicationRecalls(params);
      const list = res.data.results || res.data;
      setRecalls(Array.isArray(list) ? list : []);

      // Build summary from list
      const all = Array.isArray(list) ? list : [];
      setSummary({
        active: all.filter(r => r.status === 'active').length,
        acknowledged: all.filter(r => r.status === 'acknowledged').length,
        resolved: all.filter(r => r.status === 'resolved').length,
        critical: all.filter(r => r.severity === 'critical' && r.status !== 'closed').length,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load recalls');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, severityFilter]);

  useEffect(() => {
    fetchRecalls();
  }, [fetchRecalls]);

  useEffect(() => {
    api.getMedications().then(res => {
      const list = res.data.results || res.data;
      setMedications(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  const handleSelectRecall = async (recall) => {
    setSelected(recall);
    setAffectedPatients([]);
    try {
      setLoadingPatients(true);
      const res = await api.getRecallAffectedPatients(recall.id);
      setAffectedPatients(res.data || []);
    } catch {
      setAffectedPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleAcknowledge = async (recall) => {
    try {
      await api.acknowledgeRecall(recall.id);
      fetchRecalls();
      if (selected?.id === recall.id) {
        const res = await api.getMedicationRecall(recall.id);
        setSelected(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to acknowledge recall');
    }
  };

  const openResolveModal = (recall) => {
    setResolveTarget(recall);
    setResolveNotes('');
    setShowResolveModal(true);
  };

  const handleResolve = async () => {
    try {
      await api.resolveRecall(resolveTarget.id, resolveNotes);
      setShowResolveModal(false);
      fetchRecalls();
      if (selected?.id === resolveTarget.id) {
        const res = await api.getMedicationRecall(resolveTarget.id);
        setSelected(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve recall');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.medication) { setFormError('Please select a medication'); return; }
    if (!formData.title.trim()) { setFormError('Title is required'); return; }
    if (!formData.description.trim()) { setFormError('Description is required'); return; }
    if (!formData.action_required.trim()) { setFormError('Action required is required'); return; }

    try {
      setFormSubmitting(true);
      await api.createMedicationRecall(formData);
      setShowCreateForm(false);
      setFormData({ medication: '', batch_number: '', recall_type: 'safety', severity: 'high', title: '', description: '', action_required: '' });
      fetchRecalls();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
        setFormError(msgs);
      } else {
        setFormError('Failed to create recall');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="recall-page">
      {/* Header */}
      <div className="recall-header">
        <div className="recall-header__left">
          <button onClick={() => navigate('/medications')} className="btn btn-secondary">← Back</button>
          <div>
            <h1>Medication Recall Centre</h1>
            <p>Issue, track, and resolve medication recalls to protect patient safety</p>
          </div>
        </div>
        <button className="btn btn-danger" onClick={() => setShowCreateForm(true)}>
          ⚠️ Issue New Recall
        </button>
      </div>

      {/* Summary Cards */}
      <div className="recall-cards">
        <div className="recall-card recall-card--red">
          <div className="recall-card__label">Active Recalls</div>
          <div className="recall-card__value">{summary.active}</div>
        </div>
        <div className="recall-card recall-card--orange">
          <div className="recall-card__label">Acknowledged</div>
          <div className="recall-card__value">{summary.acknowledged}</div>
        </div>
        <div className="recall-card recall-card--green">
          <div className="recall-card__label">Resolved</div>
          <div className="recall-card__value">{summary.resolved}</div>
        </div>
        <div className="recall-card recall-card--critical">
          <div className="recall-card__label">Critical (Open)</div>
          <div className="recall-card__value">{summary.critical}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="recall-filters">
        <input
          type="text"
          className="recall-search"
          placeholder="Search by title, batch number, or medication…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="recall-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="recall-select"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <div className="recall-error">{error}</div>}

      {/* Main content: list + detail panel */}
      <div className="recall-content">
        {/* Recall List */}
        <div className="recall-list">
          {loading && <div className="recall-loading">Loading recalls…</div>}
          {!loading && recalls.length === 0 && (
            <div className="recall-empty">
              <span>✅</span>
              <p>No recalls found matching your filters.</p>
            </div>
          )}
          {recalls.map(recall => (
            <div
              key={recall.id}
              className={`recall-item ${selected?.id === recall.id ? 'recall-item--selected' : ''} ${recall.severity === 'critical' && recall.status === 'active' ? 'recall-item--critical' : ''}`}
              onClick={() => handleSelectRecall(recall)}
            >
              <div className="recall-item__header">
                <span
                  className="recall-pill recall-pill--severity"
                  style={{ background: SEVERITY_COLOURS[recall.severity] }}
                >
                  {recall.severity_display}
                </span>
                <span
                  className="recall-pill recall-pill--status"
                  style={{ background: STATUS_COLOURS[recall.status] }}
                >
                  {recall.status_display}
                </span>
              </div>
              <div className="recall-item__title">{recall.title}</div>
              <div className="recall-item__meta">
                <span>💊 {recall.medication_name}</span>
                {recall.batch_number && <span>📦 Batch: {recall.batch_number}</span>}
                <span>🏷 {recall.recall_type_display}</span>
              </div>
              <div className="recall-item__footer">
                <span>{recall.affected_patient_count} patient{recall.affected_patient_count !== 1 ? 's' : ''} affected</span>
                <span>{recall.issued_by_name} · {new Date(recall.issued_date).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="recall-detail">
            <div className="recall-detail__top">
              <div>
                <span
                  className="recall-pill recall-pill--severity"
                  style={{ background: SEVERITY_COLOURS[selected.severity] }}
                >
                  {selected.severity_display}
                </span>
                <span
                  className="recall-pill recall-pill--status"
                  style={{ background: STATUS_COLOURS[selected.status] }}
                >
                  {selected.status_display}
                </span>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <h2 className="recall-detail__title">{selected.title}</h2>

            <div className="recall-detail__grid">
              <div><strong>Medication</strong><p>{selected.medication_name}</p></div>
              <div><strong>Batch Number</strong><p>{selected.batch_number || 'All batches'}</p></div>
              <div><strong>Type</strong><p>{selected.recall_type_display}</p></div>
              <div><strong>Issued By</strong><p>{selected.issued_by_name}</p></div>
              <div><strong>Issued Date</strong><p>{new Date(selected.issued_date).toLocaleDateString('en-GB')}</p></div>
              <div><strong>Affected Patients</strong><p>{selected.affected_patient_count}</p></div>
            </div>

            <div className="recall-detail__section">
              <h3>Description</h3>
              <p>{selected.description}</p>
            </div>

            <div className="recall-detail__section">
              <h3>⚠️ Action Required</h3>
              <p className="recall-detail__action">{selected.action_required}</p>
            </div>

            {selected.resolution_notes && (
              <div className="recall-detail__section">
                <h3>Resolution Notes</h3>
                <p>{selected.resolution_notes}</p>
              </div>
            )}

            {/* Lifecycle timestamps */}
            {(selected.acknowledged_at || selected.resolved_at) && (
              <div className="recall-detail__timeline">
                <h3>Timeline</h3>
                {selected.acknowledged_at && (
                  <div className="recall-timeline-step recall-timeline-step--ack">
                    <span>✓ Acknowledged</span>
                    <span>{selected.acknowledged_by_name} · {new Date(selected.acknowledged_at).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {selected.resolved_at && (
                  <div className="recall-timeline-step recall-timeline-step--res">
                    <span>✓ Resolved</span>
                    <span>{selected.resolved_by_name} · {new Date(selected.resolved_at).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="recall-detail__actions">
              {selected.status === 'active' && (
                <button className="btn btn-warning" onClick={() => handleAcknowledge(selected)}>
                  ✓ Acknowledge
                </button>
              )}
              {(selected.status === 'active' || selected.status === 'acknowledged') && (
                <button className="btn btn-success" onClick={() => openResolveModal(selected)}>
                  ✅ Mark Resolved
                </button>
              )}
            </div>

            {/* Affected Patients */}
            <div className="recall-detail__section">
              <h3>Affected Patients ({affectedPatients.length})</h3>
              {loadingPatients && <p className="recall-loading">Loading patients…</p>}
              {!loadingPatients && affectedPatients.length === 0 && (
                <p className="recall-no-patients">No affected patients found for this recall.</p>
              )}
              {affectedPatients.length > 0 && (
                <table className="recall-patients-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date of Birth</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affectedPatients.map(p => (
                      <tr key={p.id}>
                        <td>{p.first_name} {p.last_name}</td>
                        <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-GB') : '—'}</td>
                        <td>{p.phone_number || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="recall-placeholder">
            <span>📋</span>
            <p>Select a recall from the list to view details and take action.</p>
          </div>
        )}
      </div>

      {/* Create Recall Modal */}
      {showCreateForm && (
        <div className="recall-modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="recall-modal" onClick={e => e.stopPropagation()}>
            <div className="recall-modal__header">
              <h2>⚠️ Issue New Medication Recall</h2>
              <button className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            {formError && <div className="recall-form-error">{formError}</div>}
            <form onSubmit={handleCreateSubmit} className="recall-form">
              <div className="recall-form__row">
                <label>Medication *
                  <select
                    value={formData.medication}
                    onChange={e => setFormData({ ...formData, medication: e.target.value })}
                    required
                  >
                    <option value="">Select medication…</option>
                    {medications.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </label>
                <label>Batch Number (optional)
                  <input
                    type="text"
                    placeholder="Leave blank to recall all batches"
                    value={formData.batch_number}
                    onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </label>
              </div>
              <div className="recall-form__row">
                <label>Recall Type *
                  <select
                    value={formData.recall_type}
                    onChange={e => setFormData({ ...formData, recall_type: e.target.value })}
                  >
                    {Object.entries(RECALL_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </label>
                <label>Severity *
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
              </div>
              <label>Title *
                <input
                  type="text"
                  placeholder="Brief recall title…"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </label>
              <label>Description *
                <textarea
                  rows={3}
                  placeholder="Detailed description of the recall reason…"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </label>
              <label>Action Required *
                <textarea
                  rows={3}
                  placeholder="What steps must be taken immediately…"
                  value={formData.action_required}
                  onChange={e => setFormData({ ...formData, action_required: e.target.value })}
                  required
                />
              </label>
              <div className="recall-form__footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={formSubmitting}>
                  {formSubmitting ? 'Issuing…' : '⚠️ Issue Recall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="recall-modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="recall-modal recall-modal--small" onClick={e => e.stopPropagation()}>
            <div className="recall-modal__header">
              <h2>✅ Resolve Recall</h2>
              <button className="btn btn-ghost" onClick={() => setShowResolveModal(false)}>✕</button>
            </div>
            <p>You are marking <strong>{resolveTarget?.title}</strong> as resolved.</p>
            <label>Resolution Notes
              <textarea
                rows={4}
                placeholder="Describe how the recall was resolved…"
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
              />
            </label>
            <div className="recall-form__footer">
              <button className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleResolve}>Confirm Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecallCenter;
