import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './InjectionSummaryWidget.css';

const PHASE_BADGE_COLOURS = {
  loading: '#f39c12',
  maintenance: '#27ae60',
  treat_and_extend: '#3498db',
};

const InjectionSummaryWidget = ({ patientId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getInjectionsByPatient(patientId);
      // Use the custom patient_summary endpoint for stats
      const summaryRes = await api.get('/api/treatments/api/injections/patient_summary/', { params: { patient_id: patientId } });
      setSummary(summaryRes);
    } catch (err) {
      console.error('Error loading injection summary:', err);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="inj-widget">
        <div className="inj-widget-header">💉 Injection Summary</div>
        <div className="inj-widget-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inj-widget">
        <div className="inj-widget-header">💉 Injection Summary</div>
        <div className="inj-widget-error">{error}</div>
      </div>
    );
  }

  if (!summary || summary.total_injections === 0) {
    return (
      <div className="inj-widget">
        <div className="inj-widget-header">💉 Injection Summary</div>
        <div className="inj-widget-empty">
          <p>No intravitreal injections recorded.</p>
          <a href={`/injections/record?patient=${patientId}`} className="inj-widget-link">
            Record First Injection →
          </a>
        </div>
      </div>
    );
  }

  const { total_injections, phase_counts, loading_phase_complete, days_since_last, current_phase, last_injection_date, last_injection_drug, last_injection_eye, avg_interval_days, adverse_events } = summary;

  const phaseColour = PHASE_BADGE_COLOURS[Object.keys(PHASE_BADGE_COLOURS).find(k => current_phase?.toLowerCase().includes(k))] || '#888';

  let statusColour = '#27ae60';
  let statusText = 'Up to date';
  if (adverse_events > 0) {
    statusColour = '#e74c3c';
    statusText = `${adverse_events} adverse event(s)`;
  } else if (days_since_last && days_since_last > 56) {
    statusColour = '#e74c3c';
    statusText = 'Overdue';
  } else if (days_since_last && days_since_last > 42) {
    statusColour = '#f39c12';
    statusText = 'Due soon';
  }

  return (
    <div className="inj-widget">
      <div className="inj-widget-header">💉 Injection Summary</div>
      <div className="inj-widget-body">
        <div className="inj-widget-stats">
          <div className="inj-stat">
            <div className="inj-stat-value" style={{ color: statusColour }}>{statusText}</div>
            <div className="inj-stat-label">Status</div>
          </div>
          <div className="inj-stat">
            <div className="inj-stat-value">{total_injections}</div>
            <div className="inj-stat-label">Total Injections</div>
          </div>
          <div className="inj-stat">
            <div className="inj-stat-value">{days_since_last ?? '—'}</div>
            <div className="inj-stat-label">Days Since Last</div>
          </div>
          <div className="inj-stat">
            <div className="inj-stat-value">{avg_interval_days ?? '—'}</div>
            <div className="inj-stat-label">Avg Interval (days)</div>
          </div>
        </div>

        <div className="inj-widget-detail">
          <div className="inj-phase-bar">
            <div className={`inj-phase-segment loading ${phase_counts.loading > 0 ? 'active' : ''}`} style={{ flex: phase_counts.loading || 1 }}>
              <span>Loading</span>
              <small>{phase_counts.loading}/3{loading_phase_complete ? ' ✅' : ''}</small>
            </div>
            <div className={`inj-phase-segment maintenance ${phase_counts.maintenance > 0 ? 'active' : ''}`} style={{ flex: phase_counts.maintenance || 1 }}>
              <span>Maint.</span>
              <small>{phase_counts.maintenance}</small>
            </div>
            <div className={`inj-phase-segment tne ${phase_counts.treat_and_extend > 0 ? 'active' : ''}`} style={{ flex: phase_counts.treat_and_extend || 1 }}>
              <span>T&E</span>
              <small>{phase_counts.treat_and_extend}</small>
            </div>
          </div>
        </div>

        <div className="inj-widget-last">
          <div className="inj-widget-last-header">
            <span className="inj-phase-badge" style={{ background: phaseColour }}>{current_phase}</span>
            <span>{last_injection_drug} — {last_injection_eye}</span>
          </div>
          <div className="inj-widget-last-date">
            Last: {new Date(last_injection_date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="inj-widget-actions">
          <a href={`/injections/record?patient=${patientId}`} className="btn btn-primary btn-sm">💉 Record Injection</a>
          <a href={`/patient/${patientId}/injections`} className="btn btn-secondary btn-sm">View Timeline</a>
        </div>
      </div>
    </div>
  );
};

export default InjectionSummaryWidget;