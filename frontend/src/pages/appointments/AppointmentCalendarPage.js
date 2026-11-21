/**
 * AppointmentCalendarPage
 * Week / Month calendar view for patient appointments (3.6)
 *
 * - Week view and Month view
 * - Colour-coded by clinic type (falls back to visit_type)
 * - Today highlighted, past days greyed
 * - Click any day cell to schedule an appointment on that date
 * - Appointment chips are clickable to view patient detail
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths,
  subWeeks, subMonths,
  isSameDay, isBefore,
  format, parseISO,
} from 'date-fns';
import api from '../../services/api';
import './AppointmentCalendarPage.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const CLINIC_COLOURS = {
  amd:        '#7c3aed',   // purple
  glaucoma:   '#0891b2',   // cyan
  cataract:   '#0d9488',   // teal
  diabetic:   '#d97706',   // amber
  retina:     '#dc2626',   // red
  paediatrics:'#be185d',   // pink
  corneal:    '#16a34a',   // green
  general:    '#2563eb',   // blue
  emergency:  '#b91c1c',   // dark red
  other:      '#64748b',   // grey
  // fallback visit types
  consultation:   '#2563eb',
  follow_up:      '#7c3aed',
  surgery:        '#dc2626',
  diagnostic:     '#0891b2',
  emergency_visit:'#b91c1c',
  routine_check:  '#16a34a',
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVisitColour(visit) {
  // Prefer clinic type from session, fall back to visit_type
  const key = visit.clinic_session_type || visit.clinic_type || visit.visit_type || 'other';
  return CLINIC_COLOURS[key] || CLINIC_COLOURS.other;
}

function groupByDate(visits) {
  const map = {};
  visits.forEach(v => {
    const dateKey = format(parseISO(v.scheduled_date), 'yyyy-MM-dd');
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(v);
  });
  return map;
}

// ─── Main component ────────────────────────────────────────────────────────────

const AppointmentCalendarPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('week');         // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute visible date range
  const rangeStart = mode === 'week'
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);
  const rangeEnd = mode === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getVisits({
        date_from: format(rangeStart, 'yyyy-MM-dd'),
        date_to: format(rangeEnd, 'yyyy-MM-dd'),
        limit: 500,
      });
      setVisits(res.data?.results || res.data || []);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentDate]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const goBack = () => {
    setCurrentDate(d => mode === 'week' ? subWeeks(d, 1) : subMonths(d, 1));
  };
  const goForward = () => {
    setCurrentDate(d => mode === 'week' ? addWeeks(d, 1) : addMonths(d, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    navigate(`/appointments/schedule?date=${dateStr}`);
  };

  const grouped = groupByDate(visits);
  const today = new Date();

  return (
    <div className="cal-page">
      {/* Header */}
      <div className="cal-header">
        <div>
          <h1 className="cal-title">Appointment Calendar</h1>
          <p className="cal-subtitle">
            {mode === 'week'
              ? `Week of ${format(rangeStart, 'dd MMM')}–${format(rangeEnd, 'dd MMM yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        <div className="cal-controls">
          <div className="cal-mode-toggle">
            <button className={`cal-toggle-btn${mode === 'week' ? ' active' : ''}`} onClick={() => setMode('week')}>Week</button>
            <button className={`cal-toggle-btn${mode === 'month' ? ' active' : ''}`} onClick={() => setMode('month')}>Month</button>
          </div>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={goBack}>‹</button>
            <button className="cal-nav-btn cal-nav-btn--today" onClick={goToday}>Today</button>
            <button className="cal-nav-btn" onClick={goForward}>›</button>
          </div>
          <button className="cal-btn-schedule" onClick={() => navigate('/appointments/schedule')}>
            + Schedule
          </button>
        </div>
      </div>

      {error && <div className="cal-error">{error}</div>}
      {loading && <div className="cal-loading">Loading appointments…</div>}

      {/* Legend */}
      <div className="cal-legend">
        {Object.entries(CLINIC_COLOURS).slice(0, 9).map(([type, colour]) => (
          <span key={type} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: colour }} />
            {type.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      {mode === 'week'
        ? <WeekGrid rangeStart={rangeStart} grouped={grouped} today={today} onDayClick={handleDayClick} onVisitClick={(v) => navigate(`/patients/${v.patient}`)} />
        : <MonthGrid currentDate={currentDate} grouped={grouped} today={today} onDayClick={handleDayClick} onVisitClick={(v) => navigate(`/patients/${v.patient}`)} />
      }
    </div>
  );
};

// ─── Week view ────────────────────────────────────────────────────────────────

const WeekGrid = ({ rangeStart, grouped, today, onDayClick, onVisitClick }) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i));

  return (
    <div className="cal-week-grid">
      {days.map((day, i) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayVisits = grouped[key] || [];
        const isToday = isSameDay(day, today);
        const isPast = isBefore(day, today) && !isToday;

        return (
          <div
            key={key}
            className={`cal-day-col${isToday ? ' cal-day--today' : ''}${isPast ? ' cal-day--past' : ''}`}
          >
            <div className="cal-day-label" onClick={() => onDayClick(day)} title="Click to schedule on this day">
              <span className="cal-day-name">{WEEK_DAYS[i]}</span>
              <span className={`cal-day-num${isToday ? ' cal-day-num--today' : ''}`}>{format(day, 'd')}</span>
            </div>
            <div className="cal-day-body">
              {dayVisits.length === 0 && (
                <div className="cal-day-empty" onClick={() => onDayClick(day)}>+ Add</div>
              )}
              {dayVisits.map(v => (
                <VisitChip key={v.id} visit={v} onClick={() => onVisitClick(v)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Month view ───────────────────────────────────────────────────────────────

const MonthGrid = ({ currentDate, grouped, today, onDayClick, onVisitClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Pad start to Monday
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  const currentMonth = format(currentDate, 'M');

  return (
    <div className="cal-month-grid">
      {/* Day headers */}
      {WEEK_DAYS.map(w => <div key={w} className="cal-month-header">{w}</div>)}
      {/* Day cells */}
      {days.map(day => {
        const key = format(day, 'yyyy-MM-dd');
        const dayVisits = grouped[key] || [];
        const isToday = isSameDay(day, today);
        const isPast = isBefore(day, today) && !isToday;
        const isOtherMonth = format(day, 'M') !== currentMonth;
        const MAX_VISIBLE = 3;

        return (
          <div
            key={key}
            className={[
              'cal-month-cell',
              isToday ? 'cal-month-cell--today' : '',
              isPast ? 'cal-month-cell--past' : '',
              isOtherMonth ? 'cal-month-cell--other' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onDayClick(day)}
            title="Click to schedule on this day"
          >
            <div className={`cal-month-day-num${isToday ? ' cal-day-num--today' : ''}`}>
              {format(day, 'd')}
            </div>
            {dayVisits.slice(0, MAX_VISIBLE).map(v => (
              <VisitChip key={v.id} visit={v} compact onClick={(e) => { e.stopPropagation(); onVisitClick(v); }} />
            ))}
            {dayVisits.length > MAX_VISIBLE && (
              <div className="cal-more">+{dayVisits.length - MAX_VISIBLE} more</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Visit chip ───────────────────────────────────────────────────────────────

const VisitChip = ({ visit, onClick, compact = false }) => {
  const colour = getVisitColour(visit);
  const time = format(parseISO(visit.scheduled_date), 'HH:mm');
  const name = visit.patient_name || '—';
  const status = visit.status || 'scheduled';
  const isCancelledOrNoShow = ['cancelled', 'no_show'].includes(status);

  return (
    <div
      className={`cal-chip${compact ? ' cal-chip--compact' : ''}${isCancelledOrNoShow ? ' cal-chip--cancelled' : ''}`}
      style={{ borderLeftColor: colour, '--chip-colour': colour }}
      onClick={onClick}
      title={`${name} — ${visit.visit_type} — ${status}`}
    >
      {!compact && <span className="cal-chip-time">{time}</span>}
      <span className="cal-chip-name">{compact ? name.split(' ')[0] : name}</span>
      {!compact && <span className="cal-chip-type" style={{ color: colour }}>{visit.clinic_session_name || visit.visit_type}</span>}
    </div>
  );
};

export default AppointmentCalendarPage;
