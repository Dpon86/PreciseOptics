import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './FollowUpAlertsPage.css';

const URGENCY_CONFIG = {
  overdue: { label: 'Overdue', colour: '#e74c3c', bg: '#ffeaea' },
  due_soon: { label: 'Due Soon', colour: '#e67e22', bg: '#fff3e0' },
  upcoming: { label: 'Upcoming', colour: '#27ae60', bg: '#e8f5e9' },
};

const SEVERITY_COLOUR = {
  critical: '#c0392b',
  high: '#e74c3c',
  medium: '#e67e22',
  low: '#27ae60',
};

const SOURCE_ICON = {
  eye_test: '👁️',
  treatment: '💉',
  missed_followup: '⚠️',
  consultation: '📋',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const FollowUpAlertsPage = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, overdue: 0, due_soon: 0, upcoming: 0, critical: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;
      const res = await api.getFollowUpAlerts(params);
      if (res.data.success) {
        setAlerts(res.data.data.alerts);
        setSummary(res.data.data.summary);
      } else {
        setError(res.data.error || 'Failed to load alerts');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load follow-up alerts');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, urgencyFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.patient_name?.toLowerCase().includes(s) ||
      a.title?.toLowerCase().includes(s) ||
      a.source_label?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="fua-page">
      {/* Header */}
      <div className="fua-header">
        <div className="fua-header__left">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">← Back</button>
          <div>
            <h1>Follow-up Alerts</h1>
            <p>All overdue and upcoming follow-ups — eye tests, treatments, consultations</p>
          </div>
        </div>
        <button onClick={fetchAlerts} className="btn btn-ghost" disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="fua-cards">
        <div className="fua-card fua-card--red" onClick={() => setUrgencyFilter(urgencyFilter === 'overdue' ? '' : 'overdue')} style={{ cursor: 'pointer', outline: urgencyFilter === 'overdue' ? '2px solid #e74c3c' : 'none' }}>
          <div className="fua-card__label">Overdue</div>
          <div className="fua-card__value">{summary.overdue}</div>
          <div className="fua-card__sub">Require immediate action</div>
        </div>
        <div className="fua-card fua-card--orange" onClick={() => setUrgencyFilter(urgencyFilter === 'due_soon' ? '' : 'due_soon')} style={{ cursor: 'pointer', outline: urgencyFilter === 'due_soon' ? '2px solid #e67e22' : 'none' }}>
          <div className="fua-card__label">Due Soon</div>
          <div className="fua-card__value">{summary.due_soon}</div>
          <div className="fua-card__sub">Within 14 days</div>
        </div>
        <div className="fua-card fua-card--green">
          <div className="fua-card__label">Upcoming</div>
          <div className="fua-card__value">{summary.upcoming}</div>
          <div className="fua-card__sub">Scheduled ahead</div>
        </div>
        <div className="fua-card fua-card--critical">
          <div className="fua-card__label">Critical</div>
          <div className="fua-card__value">{summary.critical}</div>
          <div className="fua-card__sub">High severity overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="fua-filters">
        <input
          type="text"
          className="fua-search"
          placeholder="Search by patient, test type or title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="fua-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="eye_test">👁️ Eye Tests</option>
          <option value="treatment">💉 Treatments</option>
          <option value="missed_followup">⚠️ Missed Follow-ups</option>
          <option value="consultation">📋 Consultations</option>
        </select>
        <select className="fua-select" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}>
          <option value="">All Urgencies</option>
          <option value="overdue">Overdue</option>
          <option value="due_soon">Due Soon</option>
          <option value="upcoming">Upcoming</option>
        </select>
        {(typeFilter || urgencyFilter || search) && (
          <button className="btn btn-ghost" onClick={() => { setTypeFilter(''); setUrgencyFilter(''); setSearch(''); }}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {error && <div className="fua-error">{error}</div>}

      {/* Alert List */}
      {loading && <div className="fua-loading">Loading follow-up alerts…</div>}

      {!loading && filteredAlerts.length === 0 && (
        <div className="fua-empty">
          <span>✅</span>
          <p>{alerts.length === 0 ? 'No follow-ups requiring attention right now.' : 'No alerts match your filters.'}</p>
        </div>
      )}

      {!loading && filteredAlerts.length > 0 && (
        <div className="fua-list">
          {/* Group header helpers */}
          {(() => {
            let lastUrgency = null;
            return filteredAlerts.map(alert => {
              const showGroup = alert.urgency !== lastUrgency;
              lastUrgency = alert.urgency;
              const uc = URGENCY_CONFIG[alert.urgency] || { label: alert.urgency, colour: '#666', bg: '#f5f5f5' };
              return (
                <React.Fragment key={alert.id}>
                  {showGroup && (
                    <div className="fua-group-header" style={{ background: uc.bg, borderColor: uc.colour }}>
                      <span style={{ color: uc.colour }}>{uc.label}</span>
                      <span className="fua-group-count">
                        {filteredAlerts.filter(a => a.urgency === alert.urgency).length} item(s)
                      </span>
                    </div>
                  )}
                  <div
                    className="fua-item"
                    onClick={() => alert.navigate_url && navigate(alert.navigate_url)}
                    style={{ borderLeftColor: URGENCY_CONFIG[alert.urgency]?.colour || '#ccc', cursor: alert.navigate_url ? 'pointer' : 'default' }}
                  >
                    <div className="fua-item__left">
                      <div className="fua-item__icon">{SOURCE_ICON[alert.source_type] || '📌'}</div>
                    </div>
                    <div className="fua-item__body">
                      <div className="fua-item__top">
                        <div>
                          <div className="fua-item__title">{alert.title}</div>
                          <div className="fua-item__meta">
                            <span className="fua-item__patient">👤 {alert.patient_name}</span>
                            <span className="fua-item__source">{alert.source_label}</span>
                            {alert.performed_by && <span>🩺 {alert.performed_by}</span>}
                          </div>
                        </div>
                        <div className="fua-item__badges">
                          <span
                            className="fua-severity-badge"
                            style={{ background: SEVERITY_COLOUR[alert.severity] }}
                          >
                            {alert.severity}
                          </span>
                          {alert.urgency === 'overdue' && alert.days_overdue != null && (
                            <span className="fua-overdue-badge">
                              {alert.days_overdue === 0 ? 'Due today' : `${alert.days_overdue}d overdue`}
                            </span>
                          )}
                          {alert.urgency === 'due_soon' && alert.days_until_due != null && (
                            <span className="fua-soon-badge">
                              in {alert.days_until_due}d
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="fua-item__dates">
                        <div className="fua-date-block">
                          <span className="fua-date-label">
                            {alert.source_type === 'eye_test' || alert.source_type === 'consultation' ? 'Last test/visit' : 'Completed'}
                          </span>
                          <span className="fua-date-value">{formatDate(alert.test_date)}</span>
                        </div>
                        <div className="fua-date-arrow">→</div>
                        <div className="fua-date-block fua-date-block--due">
                          <span className="fua-date-label">Advised return</span>
                          <span className="fua-date-value" style={{ color: alert.urgency === 'overdue' ? '#e74c3c' : 'inherit', fontWeight: alert.urgency === 'overdue' ? '700' : '500' }}>
                            {alert.due_date ? formatDate(alert.due_date) : (alert.follow_up_duration ? `~${alert.follow_up_duration} after visit` : 'No date set')}
                          </span>
                        </div>
                      </div>

                      {alert.detail && (
                        <p className="fua-item__detail">{alert.detail.length > 120 ? alert.detail.slice(0, 120) + '…' : alert.detail}</p>
                      )}
                    </div>
                    {alert.navigate_url && (
                      <div className="fua-item__arrow">›</div>
                    )}
                  </div>
                </React.Fragment>
              );
            });
          })()}
        </div>
      )}

      {!loading && filteredAlerts.length > 0 && (
        <div className="fua-footer">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
      )}
    </div>
  );
};

export default FollowUpAlertsPage;
