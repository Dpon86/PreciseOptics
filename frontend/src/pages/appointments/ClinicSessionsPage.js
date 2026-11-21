import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './ClinicSessionsPage.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CLINIC_TYPE_LABELS = {
  amd: 'AMD / Anti-VEGF',
  glaucoma: 'Glaucoma',
  cataract: 'Cataract',
  diabetic: 'Diabetic Retinopathy',
  retina: 'Medical Retina',
  paediatrics: 'Paediatrics',
  corneal: 'Corneal',
  general: 'General Ophthalmology',
  emergency: 'Eye Casualty / Emergency',
  other: 'Other',
};

const EMPTY_FORM = {
  name: '',
  clinic_type: 'general',
  day_of_week: 0,
  start_time: '09:00',
  end_time: '17:00',
  room_location: '',
  max_appointments: 20,
  consultant: '',
  is_active: true,
};

const ClinicSessionsPage = () => {
  const [sessions, setSessions]       = useState([]);
  const [staff, setStaff]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'week'
  const [byDay, setByDay]             = useState({});

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getClinicSessions();
      setSessions(res.data?.results || res.data || []);
    } catch {
      setError('Failed to load clinic sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByDay = useCallback(async () => {
    try {
      const res = await api.getClinicSessionsByDay();
      setByDay(res.data || {});
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchByDay();
    api.getStaff({ limit: 200, is_active: true })
      .then(r => setStaff(r.data?.results || r.data || []))
      .catch(() => {});
  }, [fetchSessions, fetchByDay]);

  const openNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (session) => {
    setEditingId(session.id);
    setFormData({
      name: session.name,
      clinic_type: session.clinic_type,
      day_of_week: session.day_of_week,
      start_time: session.start_time,
      end_time: session.end_time,
      room_location: session.room_location || '',
      max_appointments: session.max_appointments,
      consultant: session.consultant || '',
      is_active: session.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'day_of_week' || name === 'max_appointments' ? Number(value) : value),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.start_time) errs.start_time = 'Start time is required.';
    if (!formData.end_time) errs.end_time = 'End time is required.';
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errs.end_time = 'End time must be after start time.';
    }
    if (formData.max_appointments < 1) errs.max_appointments = 'Must be at least 1.';
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    setError('');
    try {
      const payload = { ...formData, consultant: formData.consultant || null };
      if (editingId) {
        await api.updateClinicSession(editingId, payload);
        setSuccessMsg('Clinic session updated.');
      } else {
        await api.createClinicSession(payload);
        setSuccessMsg('Clinic session created.');
      }
      setShowModal(false);
      fetchSessions();
      fetchByDay();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setFormErrors(data);
      } else {
        setError('Failed to save clinic session.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (session) => {
    try {
      await api.patchClinicSession(session.id, { is_active: !session.is_active });
      setSuccessMsg(`Session ${session.is_active ? 'deactivated' : 'activated'}.`);
      fetchSessions();
      fetchByDay();
    } catch {
      setError('Failed to update session.');
    }
  };

  return (
    <div className="clinic-sessions-page">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Clinic Sessions</h1>
          <p className="cs-subtitle">Manage recurring clinic sessions and capacity</p>
        </div>
        <div className="cs-header-actions">
          <div className="cs-view-toggle">
            <button
              className={`cs-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
              onClick={() => setViewMode('table')}
            >List</button>
            <button
              className={`cs-toggle-btn${viewMode === 'week' ? ' active' : ''}`}
              onClick={() => setViewMode('week')}
            >Weekly View</button>
          </div>
          <button className="cs-btn cs-btn--primary" onClick={openNew}>
            + New Session
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="cs-alert cs-alert--success" role="alert">
          {successMsg}
          <button className="cs-alert-close" onClick={() => setSuccessMsg('')}>×</button>
        </div>
      )}
      {error && (
        <div className="cs-alert cs-alert--error" role="alert">
          {error}
          <button className="cs-alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="cs-loading">Loading sessions…</div>
      ) : viewMode === 'table' ? (
        <TableView sessions={sessions} onEdit={openEdit} onToggleActive={handleToggleActive} />
      ) : (
        <WeekView byDay={byDay} onEdit={openEdit} />
      )}

      {showModal && (
        <div className="cs-modal-overlay" role="dialog" aria-modal="true">
          <div className="cs-modal">
            <div className="cs-modal-header">
              <h2>{editingId ? 'Edit' : 'New'} Clinic Session</h2>
              <button className="cs-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="cs-form" onSubmit={handleSave} noValidate>
              <div className="cs-form-row">
                <div className="cs-field">
                  <label>Session Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. AMD Monday Morning" />
                  {formErrors.name && <span className="cs-field-error">{formErrors.name}</span>}
                </div>
                <div className="cs-field">
                  <label>Clinic Type *</label>
                  <select name="clinic_type" value={formData.clinic_type} onChange={handleChange}>
                    {Object.entries(CLINIC_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cs-form-row">
                <div className="cs-field">
                  <label>Day of Week *</label>
                  <select name="day_of_week" value={formData.day_of_week} onChange={handleChange}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="cs-field">
                  <label>Room / Location</label>
                  <input name="room_location" value={formData.room_location} onChange={handleChange} placeholder="e.g. Room 4, Outpatients" />
                </div>
              </div>
              <div className="cs-form-row">
                <div className="cs-field">
                  <label>Start Time *</label>
                  <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
                  {formErrors.start_time && <span className="cs-field-error">{formErrors.start_time}</span>}
                </div>
                <div className="cs-field">
                  <label>End Time *</label>
                  <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
                  {formErrors.end_time && <span className="cs-field-error">{formErrors.end_time}</span>}
                </div>
              </div>
              <div className="cs-form-row">
                <div className="cs-field">
                  <label>Max Appointments *</label>
                  <input type="number" name="max_appointments" min={1} value={formData.max_appointments} onChange={handleChange} />
                  {formErrors.max_appointments && <span className="cs-field-error">{formErrors.max_appointments}</span>}
                </div>
                <div className="cs-field">
                  <label>Lead Consultant</label>
                  <select name="consultant" value={formData.consultant} onChange={handleChange}>
                    <option value="">— none —</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name || `${s.first_name} ${s.last_name}`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cs-field cs-field--checkbox">
                <label>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                  {' '}Active
                </label>
              </div>
              <div className="cs-modal-footer">
                <button type="button" className="cs-btn cs-btn--secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="cs-btn cs-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : (editingId ? 'Update Session' : 'Create Session')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Table view ────────────────────────────────────────────────────────────────

const TableView = ({ sessions, onEdit, onToggleActive }) => {
  if (!sessions.length) {
    return <p className="cs-empty">No clinic sessions configured yet. Click &ldquo;New Session&rdquo; to add one.</p>;
  }
  return (
    <div className="cs-table-wrap">
      <table className="cs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Day</th>
            <th>Time</th>
            <th>Room</th>
            <th>Capacity</th>
            <th>Consultant</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id} className={s.is_active ? '' : 'cs-row--inactive'}>
              <td className="cs-cell--name">{s.name}</td>
              <td>{s.clinic_type_display || s.clinic_type}</td>
              <td>{s.day_of_week_display}</td>
              <td>{s.start_time} – {s.end_time}</td>
              <td>{s.room_location || '—'}</td>
              <td className="cs-cell--capacity">{s.max_appointments}</td>
              <td>{s.consultant_name || '—'}</td>
              <td>
                <span className={`cs-status ${s.is_active ? 'cs-status--active' : 'cs-status--inactive'}`}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="cs-cell--actions">
                <button className="cs-link-btn" onClick={() => onEdit(s)}>Edit</button>
                <button
                  className={`cs-link-btn ${s.is_active ? 'cs-link-btn--warn' : 'cs-link-btn--ok'}`}
                  onClick={() => onToggleActive(s)}
                >
                  {s.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Weekly grid view ──────────────────────────────────────────────────────────

const WeekView = ({ byDay, onEdit }) => (
  <div className="cs-week-grid">
    {DAYS.map(day => {
      const daySessions = byDay[day] || [];
      return (
        <div key={day} className="cs-day-col">
          <div className="cs-day-header">{day}</div>
          {daySessions.length === 0
            ? <div className="cs-day-empty">No sessions</div>
            : daySessions.map(s => (
                <div key={s.id} className="cs-session-card" onClick={() => onEdit(s)} title="Click to edit">
                  <div className="cs-session-card__name">{s.name}</div>
                  <div className="cs-session-card__time">{s.start_time}–{s.end_time}</div>
                  <div className="cs-session-card__type">{s.clinic_type_display}</div>
                  {s.room_location && <div className="cs-session-card__room">{s.room_location}</div>}
                  <div className="cs-session-card__cap">Max {s.max_appointments} pts</div>
                </div>
              ))
          }
        </div>
      );
    })}
  </div>
);

export default ClinicSessionsPage;
