import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ReturnDuePage.css';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const URGENCY_LABEL = {
  overdue:  { text: 'Overdue',  cls: 'rdp-badge--overdue' },
  due_soon: { text: 'Due Soon', cls: 'rdp-badge--soon' },
  upcoming: { text: 'Upcoming', cls: 'rdp-badge--upcoming' },
};

const SOURCE_ICON = {
  eye_test:        '👁️',
  treatment:       '💉',
  missed_followup: '⚠️',
  consultation:    '📋',
};

const ReturnDuePage = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, overdue: 0, due_soon: 0, upcoming: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (urgencyFilter) params.urgency = urgencyFilter;
      if (typeFilter)   params.type    = typeFilter;
      const res = await api.getFollowUpAlerts(params);
      if (res.data.success) {
        setAlerts(res.data.data.alerts);
        setSummary(res.data.data.summary);
      } else {
        setError(res.data.error || 'Failed to load return list');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load return list');
    } finally {
      setLoading(false);
    }
  }, [urgencyFilter, typeFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const visible = alerts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.patient_name?.toLowerCase().includes(s) ||
      a.source_label?.toLowerCase().includes(s) ||
      a.title?.toLowerCase().includes(s)
    );
  });

  const returnDueText = (alert) => {
    if (alert.due_date) return formatDate(alert.due_date);
    if (alert.follow_up_duration) return `~${alert.follow_up_duration} after visit`;
    return 'Not specified';
  };

  const daysText = (alert) => {
    if (alert.days_overdue != null && alert.days_overdue > 0) {
      return { text: `${alert.days_overdue}d overdue`, cls: 'rdp-days--overdue' };
    }
    if (alert.days_until_due != null) {
      if (alert.days_until_due === 0) return { text: 'Due today', cls: 'rdp-days--today' };
      return { text: `in ${alert.days_until_due}d`, cls: 'rdp-days--upcoming' };
    }
    return null;
  };

  return (
    <div className="rdp-page">
      {/* Header */}
      <div className="rdp-header">
        <div className="rdp-header__left">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">← Back</button>
          <div>
            <h1>Return Due</h1>
            <p>All patients who have been asked to return for a follow-up appointment</p>
          </div>
        </div>
        <button onClick={fetchAlerts} className="btn btn-ghost" disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Summary strip */}
      <div className="rdp-summary">
        <button
          className={`rdp-pill rdp-pill--overdue${urgencyFilter === 'overdue' ? ' rdp-pill--active' : ''}`}
          onClick={() => setUrgencyFilter(urgencyFilter === 'overdue' ? '' : 'overdue')}
        >
          <span className="rdp-pill__count">{summary.overdue}</span>
          <span className="rdp-pill__label">Overdue</span>
        </button>
        <button
          className={`rdp-pill rdp-pill--soon${urgencyFilter === 'due_soon' ? ' rdp-pill--active' : ''}`}
          onClick={() => setUrgencyFilter(urgencyFilter === 'due_soon' ? '' : 'due_soon')}
        >
          <span className="rdp-pill__count">{summary.due_soon}</span>
          <span className="rdp-pill__label">Due Soon</span>
        </button>
        <button
          className={`rdp-pill rdp-pill--upcoming${urgencyFilter === 'upcoming' ? ' rdp-pill--active' : ''}`}
          onClick={() => setUrgencyFilter(urgencyFilter === 'upcoming' ? '' : 'upcoming')}
        >
          <span className="rdp-pill__count">{summary.upcoming}</span>
          <span className="rdp-pill__label">Upcoming</span>
        </button>
        <span className="rdp-total">{summary.total} total</span>
      </div>

      {/* Filters */}
      <div className="rdp-filters">
        <input
          type="text"
          className="rdp-search"
          placeholder="Search by patient name or type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="rdp-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="eye_test">👁️ Eye Tests</option>
          <option value="treatment">💉 Treatments</option>
          <option value="missed_followup">⚠️ Missed Follow-ups</option>
          <option value="consultation">📋 Consultations</option>
        </select>
        {(urgencyFilter || typeFilter || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setUrgencyFilter(''); setTypeFilter(''); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {error && <div className="rdp-error">{error}</div>}
      {loading && <div className="rdp-loading">Loading return list…</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="rdp-empty">
          <div className="rdp-empty__icon">✅</div>
          <p>{alerts.length === 0 ? 'No patients awaiting return visits.' : 'No results match your filters.'}</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="rdp-table-wrap">
          <table className="rdp-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>What They Had</th>
                <th>Visit Date</th>
                <th>Return Due</th>
                <th>Status</th>
                <th>Days</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(alert => {
                const ub = URGENCY_LABEL[alert.urgency] || { text: alert.urgency, cls: '' };
                const days = daysText(alert);
                return (
                  <tr
                    key={`${alert.source_type}-${alert.id}`}
                    className={`rdp-row rdp-row--${alert.urgency}`}
                    onClick={() => alert.navigate_url && navigate(alert.navigate_url)}
                    style={{ cursor: alert.navigate_url ? 'pointer' : 'default' }}
                  >
                    <td className="rdp-cell rdp-cell--patient">
                      <strong>{alert.patient_name}</strong>
                    </td>
                    <td className="rdp-cell rdp-cell--what">
                      <span className="rdp-source-icon">{SOURCE_ICON[alert.source_type] || '📌'}</span>
                      <div>
                        <div className="rdp-what-label">{alert.source_label}</div>
                        {alert.performed_by && (
                          <div className="rdp-who">🩺 {alert.performed_by}</div>
                        )}
                      </div>
                    </td>
                    <td className="rdp-cell rdp-cell--date">
                      {formatDate(alert.test_date) || '—'}
                    </td>
                    <td className="rdp-cell rdp-cell--due">
                      <strong>{returnDueText(alert)}</strong>
                    </td>
                    <td className="rdp-cell">
                      <span className={`rdp-badge ${ub.cls}`}>{ub.text}</span>
                    </td>
                    <td className="rdp-cell">
                      {days && (
                        <span className={`rdp-days ${days.cls}`}>{days.text}</span>
                      )}
                    </td>
                    <td className="rdp-cell rdp-cell--action" onClick={e => e.stopPropagation()}>
                      {alert.navigate_url && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => navigate(alert.navigate_url)}
                        >
                          View →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnDuePage;
