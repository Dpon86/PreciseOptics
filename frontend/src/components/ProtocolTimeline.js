import React from 'react';
import './ProtocolTimeline.css';

const STATUS_CFG = {
  completed:   { color: '#27ae60', bg: '#e8f5e9', icon: '✔', label: 'Completed' },
  missed:      { color: '#e74c3c', bg: '#ffebee', icon: '✘', label: 'Missed' },
  scheduled:   { color: '#3498db', bg: '#e3f2fd', icon: '📅', label: 'Scheduled' },
  rescheduled: { color: '#f39c12', bg: '#fff8e1', icon: '🔄', label: 'Rescheduled' },
  cancelled:   { color: '#95a5a6', bg: '#f5f5f5', icon: '✕', label: 'Cancelled' },
};

/**
 * ProtocolTimeline — horizontal-scanned vertical timeline of patient step completions.
 * Props:
 *   completions[]  - ProtocolStepCompletion objects
 *   protocolName   - string title shown above timeline
 */
const ProtocolTimeline = ({ completions = [], protocolName = '' }) => {
  if (!completions.length) {
    return (
      <div className="ptl-empty">
        <p>No schedule data available.</p>
        <small>Assign this protocol to a patient and generate a schedule to see the timeline here.</small>
      </div>
    );
  }

  const sorted = [...completions].sort(
    (a, b) => new Date(a.scheduled_date || 0) - new Date(b.scheduled_date || 0)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (c) => {
    if (!c.scheduled_date || c.status === 'completed' || c.status === 'cancelled') return false;
    return new Date(c.scheduled_date) < today;
  };

  const relativeLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    return `in ${diff}d`;
  };

  return (
    <div className="protocol-timeline">
      {protocolName && (
        <h4 className="ptl-title">{protocolName} — Schedule Timeline</h4>
      )}

      <div className="ptl-track">
        {sorted.map((c, index) => {
          const scfg = STATUS_CFG[c.status] || STATUS_CFG.scheduled;
          const overdue = isOverdue(c);
          const dotColor = overdue ? '#e74c3c' : scfg.color;
          const borderColor = overdue ? '#e74c3c' : scfg.color;

          return (
            <div key={c.id || index} className={`ptl-item${overdue ? ' overdue' : ''}`}>
              {/* Date column */}
              <div className="ptl-date">
                {c.scheduled_date ? (
                  <>
                    <div className="ptl-date-main">
                      {new Date(c.scheduled_date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short'
                      })}
                    </div>
                    <div className="ptl-date-year">
                      {new Date(c.scheduled_date).getFullYear()}
                    </div>
                    <div className="ptl-relative" style={{ color: overdue ? '#e74c3c' : '#7f8c8d' }}>
                      {relativeLabel(c.scheduled_date)}
                    </div>
                  </>
                ) : (
                  <div className="ptl-date-main">—</div>
                )}
              </div>

              {/* Dot + line */}
              <div className="ptl-connector">
                <div
                  className="ptl-dot"
                  style={{ background: dotColor, borderColor: dotColor }}
                >
                  {scfg.icon}
                </div>
                {index < sorted.length - 1 && <div className="ptl-line" />}
              </div>

              {/* Content card */}
              <div className="ptl-card" style={{ '--bc': borderColor }}>
                <div className="ptl-card-hdr">
                  <span className="ptl-step-name">
                    {c.step_number !== undefined
                      ? `Step ${c.step_number}: `
                      : ''
                    }
                    {c.step_title || c.step_title_display || 'Protocol Step'}
                  </span>
                  <span
                    className="ptl-status"
                    style={{ color: overdue ? '#e74c3c' : scfg.color, background: overdue ? '#ffebee' : scfg.bg }}
                  >
                    {overdue ? '⚠️ Overdue' : scfg.label}
                  </span>
                </div>

                {c.completed_date && (
                  <div className="ptl-completed">
                    ✔ Completed:{' '}
                    {new Date(c.completed_date).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                    {c.completed_by_name ? ` by ${c.completed_by_name}` : ''}
                  </div>
                )}

                {c.notes && <div className="ptl-notes">{c.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProtocolTimeline;
