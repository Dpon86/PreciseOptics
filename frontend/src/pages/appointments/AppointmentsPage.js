import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AppointmentsPage.css';

const STATUS_CONFIG = {
  scheduled:   { label: 'Scheduled',   cls: 'status--scheduled',  icon: '📅' },
  checked_in:  { label: 'Checked In',  cls: 'status--checkedin',  icon: '✅' },
  in_progress: { label: 'In Progress', cls: 'status--inprogress', icon: '🔄' },
  completed:   { label: 'Completed',   cls: 'status--completed',  icon: '✔️' },
  cancelled:   { label: 'Cancelled',   cls: 'status--cancelled',  icon: '❌' },
  no_show:     { label: 'No Show',     cls: 'status--noshow',     icon: '⚠️' },
};

const ALERT_SEVERITY = {
  low:      { cls: 'sev--low',      icon: '🔵' },
  medium:   { cls: 'sev--medium',   icon: '🟡' },
  high:     { cls: 'sev--high',     icon: '🟠' },
  critical: { cls: 'sev--critical', icon: '🔴' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDateTime = (d) => `${fmtDate(d)} ${fmtTime(d)}`;

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: '', icon: '❓' };
  return (
    <span className={`appt-status ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('today');
  const [visits, setVisits]           = useState([]);
  const [alerts, setAlerts]           = useState([]);
  const [alertStats, setAlertStats]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [checkingIn, setCheckingIn]   = useState(null);
  const [scanning, setScanning]       = useState(false);
  const [scanMsg, setScanMsg]         = useState('');

  // Date filter for upcoming/past
  const today     = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo,   setDateTo]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0];
  });

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (activeTab === 'today') {
        res = await api.getTodaySchedule();
        // today_schedule returns a plain array
        setVisits(Array.isArray(res.data) ? res.data : []);
      } else {
        const params = activeTab === 'upcoming'
          ? { date_from: today, status: 'scheduled' }
          : { date_to: today, status__in: 'completed,no_show,cancelled' };
        if (activeTab === 'past') {
          const past = await api.getVisits({ date_to: today, limit: 50 });
          setVisits(past.data?.results || past.data || []);
        } else {
          const upcoming = await api.getVisits({ date_from: today, status: 'scheduled', limit: 100 });
          setVisits(upcoming.data?.results || upcoming.data || []);
        }
      }
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [activeTab, today]);

  const fetchAlerts = useCallback(async () => {
    try {
      const [aRes, sRes] = await Promise.allSettled([
        api.getAlerts({ status: 'unresolved', limit: 20 }),
        api.getAlertStatistics(),
      ]);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.data?.results || aRes.value.data || []);
      if (sRes.status === 'fulfilled') setAlertStats(sRes.value.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleCheckIn = async (visitId, patientName) => {
    if (!window.confirm(`Check in ${patientName}?`)) return;
    setCheckingIn(visitId);
    try {
      await api.checkInVisit(visitId);
      fetchVisits();
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleMarkNoShow = async (visitId) => {
    if (!window.confirm('Mark this appointment as No Show?')) return;
    try {
      await api.updateVisit(visitId, { status: 'no_show' });
      fetchVisits();
      fetchAlerts();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleScanAlerts = async () => {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await api.scanAppointments();
      const count = res.data?.alerts_created ?? res.data?.count ?? 0;
      setScanMsg(`Scan complete — ${count} new alert${count !== 1 ? 's' : ''} generated.`);
      fetchAlerts();
    } catch (err) {
      setScanMsg('Scan failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (_) {}
  };

  const handleResolveAlert = async (alertId) => {
    const action = window.prompt('Action taken (optional):') ?? 'Resolved manually';
    try {
      await api.resolveAlert(alertId, { action_taken: action });
      fetchAlerts();
    } catch (_) {}
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="appointments-page">

      {/* ── Header ── */}
      <div className="appt-header">
        <div>
          <h1>📅 Appointments</h1>
          <p className="appt-subtitle">Schedule, manage and track patient visits</p>
        </div>
        <div className="appt-header-actions">
          <button
            className={`btn-scan ${scanning ? 'btn-scan--busy' : ''}`}
            onClick={handleScanAlerts}
            disabled={scanning}
          >
            {scanning ? '⏳ Scanning…' : '🔍 Scan for Alerts'}
          </button>
          <Link to="/appointments/schedule" className="btn-schedule">
            + Schedule Appointment
          </Link>
        </div>
      </div>

      {scanMsg && (
        <div className={`scan-msg ${scanMsg.startsWith('Scan failed') ? 'scan-msg--error' : ''}`}>
          {scanMsg}
        </div>
      )}

      {/* ── Alert summary banner ── */}
      {alertStats && (alertStats.active > 0 || alertStats.total_unresolved > 0) && (
        <div className="alert-banner">
          <div className="alert-banner-icon">🚨</div>
          <div className="alert-banner-text">
            <strong>{alertStats.active || alertStats.total_unresolved || 0} active alert{(alertStats.active || alertStats.total_unresolved) !== 1 ? 's' : ''}</strong>
            {alertStats.critical > 0 && <span className="alert-crit"> — {alertStats.critical} critical</span>}
            {alertStats.high > 0     && <span className="alert-high"> — {alertStats.high} high</span>}
          </div>
          <button className="alert-banner-dismiss" onClick={() => setAlertStats(null)}>✕</button>
        </div>
      )}

      <div className="appt-layout">

        {/* ── LEFT: Appointments ── */}
        <div className="appt-main">
          <div className="appt-tabs">
            {[['today', '📋 Today'], ['upcoming', '🔜 Upcoming'], ['past', '🕓 Past']].map(([key, label]) => (
              <button key={key} className={`appt-tab ${activeTab === key ? 'appt-tab--active' : ''}`}
                onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>

          {error   && <div className="appt-error">{error}</div>}
          {loading && <div className="appt-loading">Loading…</div>}

          {!loading && visits.length === 0 && (
            <div className="appt-empty">
              {activeTab === 'today'
                ? 'No appointments scheduled for today.'
                : activeTab === 'upcoming'
                ? 'No upcoming scheduled appointments.'
                : 'No past appointments found.'}
              <br />
              <Link to="/appointments/schedule" className="btn-schedule mt-2">+ Schedule One</Link>
            </div>
          )}

          {!loading && visits.length > 0 && (
            <div className="visit-list">
              {visits.map(v => {
                const isToday = activeTab === 'today';
                const canCheckIn = (v.status === 'scheduled' || v.status === 'Scheduled');
                const patientName = v.patient_name || v.patient?.first_name + ' ' + v.patient?.last_name || '—';
                const patientId = v.patient_id || v.patient?.patient_id || '';
                const visitId = v.id;
                const scheduledDate = v.scheduled_date || v.scheduled_time;
                const doctor = v.doctor || v.primary_doctor_name || '—';
                const visitType = v.visit_type || v.visit_type_display || '—';
                const status = v.status?.toLowerCase().replace(' ', '_') || 'scheduled';

                return (
                  <div key={visitId} className={`visit-card visit-card--${status}`}>
                    <div className="visit-card-time">
                      {isToday
                        ? <span className="visit-time">{v.scheduled_time || fmtTime(scheduledDate)}</span>
                        : <span className="visit-time">{fmtDate(scheduledDate)}</span>}
                      <span className="visit-time-sub">{isToday ? fmtDate(scheduledDate) : fmtTime(scheduledDate)}</span>
                    </div>
                    <div className="visit-card-info">
                      <div className="visit-patient-name">{patientName}</div>
                      <div className="visit-patient-id">ID: {patientId}</div>
                      <div className="visit-meta">
                        <span>{visitType}</span>
                        <span>·</span>
                        <span>{doctor}</span>
                      </div>
                      {v.chief_complaint && (
                        <div className="visit-complaint">"{v.chief_complaint}"</div>
                      )}
                    </div>
                    <div className="visit-card-status">
                      <StatusPill status={status} />
                    </div>
                    <div className="visit-card-actions">
                      {canCheckIn && (
                        <button
                          className="btn-checkin"
                          disabled={checkingIn === visitId}
                          onClick={() => handleCheckIn(visitId, patientName)}
                        >
                          {checkingIn === visitId ? '…' : '✅ Check In'}
                        </button>
                      )}
                      {canCheckIn && (
                        <button className="btn-noshow" onClick={() => handleMarkNoShow(visitId)}>
                          No Show
                        </button>
                      )}
                      {v.patient && (
                        <Link to={`/patients/${typeof v.patient === 'object' ? v.patient.id : v.patient}`}
                          className="btn-view-patient">
                          Patient →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Alerts panel ── */}
        <div className="appt-alerts-panel">
          <div className="alerts-panel-header">
            <h3>🚨 Active Alerts</h3>
            <button className="btn-refresh-small" onClick={fetchAlerts}>↻</button>
          </div>

          {alerts.length === 0 && (
            <div className="alerts-empty">No unresolved alerts.<br/>
              <small>Click "Scan for Alerts" to check for late/missed appointments.</small>
            </div>
          )}

          {alerts.map(al => {
            const sevCfg = ALERT_SEVERITY[al.severity] || { cls: '', icon: '❓' };
            return (
              <div key={al.id} className={`alert-card ${sevCfg.cls}`}>
                <div className="alert-card-top">
                  <span className="alert-sev-icon">{sevCfg.icon}</span>
                  <span className="alert-type-label">
                    {al.alert_type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <span className="alert-time">{fmtTime(al.trigger_time || al.created_at)}</span>
                </div>
                <div className="alert-title">{al.title}</div>
                <div className="alert-patient">{al.patient_name || 'Patient'}</div>
                <div className="alert-msg">{al.message}</div>
                <div className="alert-card-actions">
                  {al.status === 'active' && (
                    <button className="btn-ack" onClick={() => handleAcknowledgeAlert(al.id)}>
                      Acknowledge
                    </button>
                  )}
                  <button className="btn-resolve" onClick={() => handleResolveAlert(al.id)}>
                    Resolve
                  </button>
                  {al.patient && (
                    <Link to={`/patients/${al.patient}`} className="btn-view-small">Patient →</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AppointmentsPage;
