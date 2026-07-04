import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import PatientContext from '../../context/PatientContext';
import './ScheduleAppointmentPage.css';

const VISIT_TYPES = [
  { value: 'consultation',   label: 'Consultation' },
  { value: 'follow_up',      label: 'Follow-up' },
  { value: 'emergency',      label: 'Emergency' },
  { value: 'surgery',        label: 'Surgery' },
  { value: 'diagnostic',     label: 'Diagnostic' },
  { value: 'routine_check',  label: 'Routine Check' },
];

const ScheduleAppointmentPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { selectedPatient } = useContext(PatientContext);

  const query = new URLSearchParams(location.search);
  const prePatient = query.get('patient') || selectedPatient?.id || '';

  // Default date/time = tomorrow at 09:00
  const defaultDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [formData, setFormData] = useState({
    patient:          prePatient,
    visit_type:       'consultation',
    scheduled_date:   defaultDate,
    scheduled_time:   '09:00',
    chief_complaint:  '',
    notes:            '',
    primary_doctor:   '',
  });

  const [patients,  setPatients]  = useState([]);
  const [staff,     setStaff]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    api.getPatients({ limit: 500, is_active: true })
      .then(r => setPatients(r.data?.results || r.data || []))
      .catch(() => {});
    api.getStaff({ limit: 100 })
      .then(r => setStaff(r.data?.results || r.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) { setError('Please select a patient.'); return; }
    setLoading(true);
    setError('');
    try {
      // Combine date + time into ISO datetime
      const scheduledDatetime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`).toISOString();
      const payload = {
        patient:         formData.patient,
        visit_type:      formData.visit_type,
        scheduled_date:  scheduledDatetime,
        chief_complaint: formData.chief_complaint,
        notes:           formData.notes,
        status:          'scheduled',
      };
      if (formData.primary_doctor) payload.primary_doctor = formData.primary_doctor;

      await api.createVisit(payload);
      setSuccess(true);
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      const d = err.response?.data;
      setError(
        typeof d === 'object'
          ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          : 'Failed to schedule appointment.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="schedule-success">
        <div className="success-icon">✅</div>
        <h2>Appointment Scheduled</h2>
        <p>Redirecting to appointments…</p>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>📅 Schedule Appointment</h1>
        <p className="schedule-subtitle">Book a new patient visit. Alerts will automatically trigger if the patient is late or does not attend.</p>
      </div>

      <form className="schedule-form" onSubmit={handleSubmit}>

        <div className="form-section">
          <h2>Patient &amp; Visit Type</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient">Patient <span className="req">*</span></label>
              <select id="patient" name="patient" value={formData.patient} onChange={handleChange} required>
                <option value="">— Select patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} · {p.patient_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="visit_type">Visit Type <span className="req">*</span></label>
              <select id="visit_type" name="visit_type" value={formData.visit_type} onChange={handleChange} required>
                {VISIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Date &amp; Time</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scheduled_date">Date <span className="req">*</span></label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="scheduled_time">Time <span className="req">*</span></label>
              <input
                type="time"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="primary_doctor">Assigned Doctor (optional)</label>
              <select id="primary_doctor" name="primary_doctor" value={formData.primary_doctor} onChange={handleChange}>
                <option value="">— Not yet assigned —</option>
                {staff.map(s => (
                  <option key={s.id} value={s.user || s.id}>
                    {s.user_details?.first_name} {s.user_details?.last_name}
                    {s.user_details?.user_type ? ` (${s.user_details.user_type})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Visit Details</h2>
          <div className="form-group">
            <label htmlFor="chief_complaint">Reason for Visit <span className="req">*</span></label>
            <textarea
              id="chief_complaint"
              name="chief_complaint"
              rows={3}
              placeholder="e.g. Follow-up injection for AMD, routine IOP check, post-op review…"
              value={formData.chief_complaint}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Additional Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Any special instructions, prep requirements, accessibility needs…"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <div className="form-error"><strong>Error:</strong> {error}</div>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/appointments')}>Cancel</button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Scheduling…' : '📅 Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleAppointmentPage;
