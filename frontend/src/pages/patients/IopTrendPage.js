import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './IopTrendPage.css';

const IopTrendPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(24);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.getPatient(patientId),
        api.get(`/api/patients/${patientId}/iop-trend/`, { params: { months } }),
      ]);
      setPatient(pRes.data);
      setData(tRes.data);
    } catch (err) {
      setError('Failed to load IOP data');
    } finally {
      setLoading(false);
    }
  }, [patientId, months]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading IOP trend...</div></div>;

  if (error) return (
    <div className="page-container">
      <div className="alert alert-error">{error}</div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
    </div>
  );

  const iopPoints = data?.iop_points || [];
  const medChanges = data?.medication_changes || [];

  // Find min/max for chart scaling
  const allRight = iopPoints.filter(p => p.right_iop != null).map(p => p.right_iop);
  const allLeft = iopPoints.filter(p => p.left_iop != null).map(p => p.left_iop);
  const allIop = [...allRight, ...allLeft];
  const minIop = Math.max(0, Math.min(...allIop, 5) - 2);
  const maxIop = Math.max(...allIop, 25) + 2;

  const chartHeight = 300;
  const chartWidth = 700;

  const scaleY = (val) => chartHeight - ((val - minIop) / (maxIop - minIop)) * chartHeight;

  const dates = iopPoints.map(p => p.date);
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];

  const scaleX = (dateStr) => {
    if (dates.length <= 1) return chartWidth / 2;
    const d = new Date(dateStr).getTime();
    const mn = new Date(minDate).getTime();
    const mx = new Date(maxDate).getTime();
    return ((d - mn) / (mx - mn)) * chartWidth;
  };

  return (
    <div className="page-container iop-trend-page">
      <div className="page-header">
        <h1>{patient ? `${patient.first_name} ${patient.last_name}` : ''} — IOP Trend</h1>
        <div className="header-controls">
          <select value={months} onChange={e => setMonths(Number(e.target.value))} className="form-control">
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
      </div>

      {iopPoints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No IOP readings recorded</h3>
          <p>Record a tonometry test to populate the IOP trend chart.</p>
        </div>
      ) : (
        <div className="chart-container">
          <div className="chart-svg-container" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: '100%', maxWidth: chartWidth }}>
              {/* Grid lines */}
              {Array.from({ length: 6 }, (_, i) => {
                const y = scaleY(minIop + (maxIop - minIop) * i / 5);
                return (
                  <g key={i}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#eee" strokeWidth="1" />
                    <text x="5" y={y - 4} fontSize="10" fill="#999">
                      {Math.round(minIop + (maxIop - minIop) * i / 5)}
                    </text>
                  </g>
                );
              })}

              {/* Right IOP line */}
              {allRight.length > 1 && (
                <polyline
                  points={iopPoints.filter(p => p.right_iop != null).map(p =>
                    `${scaleX(p.date)},${scaleY(p.right_iop)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#e74c3c"
                  strokeWidth="2"
                />
              )}
              {/* Right IOP dots */}
              {iopPoints.filter(p => p.right_iop != null).map((p, i) => (
                <circle key={`r${i}`} cx={scaleX(p.date)} cy={scaleY(p.right_iop)} r="4" fill="#e74c3c" />
              ))}

              {/* Left IOP line */}
              {allLeft.length > 1 && (
                <polyline
                  points={iopPoints.filter(p => p.left_iop != null).map(p =>
                    `${scaleX(p.date)},${scaleY(p.left_iop)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#2980b9"
                  strokeWidth="2"
                />
              )}
              {/* Left IOP dots */}
              {iopPoints.filter(p => p.left_iop != null).map((p, i) => (
                <circle key={`l${i}`} cx={scaleX(p.date)} cy={scaleY(p.left_iop)} r="4" fill="#2980b9" />
              ))}

              {/* Target IOP line */}
              {iopPoints.find(p => p.target_iop != null) && (
                <line x1="0" y1={scaleY(iopPoints[0]?.target_iop || 12)} x2={chartWidth} y2={scaleY(iopPoints[0]?.target_iop || 12)}
                  stroke="#27ae60" strokeWidth="1" strokeDasharray="6,4" />
              )}

              {/* Medication change markers */}
              {medChanges.map((m, i) => (
                <g key={`med${i}`}>
                  <line x1={scaleX(m.date)} y1="10" x2={scaleX(m.date)} y2={chartHeight} stroke="#f39c12" strokeWidth="1" strokeDasharray="3,3" />
                  <text x={scaleX(m.date) + 4} y="20" fontSize="9" fill="#e67e22" transform={`rotate(-60, ${scaleX(m.date)}, 20)`}>
                    {m.medication_name} ({m.route})
                  </text>
                </g>
              ))}
            </svg>

            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: '#e74c3c' }} /> Right Eye (OD)</span>
              <span className="legend-item"><span className="legend-dot" style={{ background: '#2980b9' }} /> Left Eye (OS)</span>
              <span className="legend-item"><span className="legend-dash" style={{ borderTopColor: '#27ae60' }} /> Target IOP</span>
              <span className="legend-item"><span className="legend-dash" style={{ borderTopColor: '#f39c12' }} /> Med Change</span>
            </div>
          </div>
        </div>
      )}

      {/* IOP Data Table */}
      {iopPoints.length > 0 && (
        <div className="iop-table-container">
          <h3>IOP Readings</h3>
          <table className="iop-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Right IOP (mmHg)</th>
                <th>Left IOP (mmHg)</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {iopPoints.map((p, i) => (
                <tr key={i}>
                  <td>{new Date(p.date).toLocaleDateString('en-GB')}</td>
                  <td>{p.right_iop ?? '—'}</td>
                  <td>{p.left_iop ?? '—'}</td>
                  <td>{p.iop_method || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Medication Events */}
      {medChanges.length > 0 && (
        <div className="iop-table-container" style={{ marginTop: 20 }}>
          <h3>Medication Changes</h3>
          <table className="iop-table">
            <thead>
              <tr><th>Date</th><th>Medication</th><th>Route</th><th>Dose</th><th>Eye</th></tr>
            </thead>
            <tbody>
              {medChanges.map((m, i) => (
                <tr key={i}>
                  <td>{new Date(m.date).toLocaleDateString('en-GB')}</td>
                  <td>{m.medication_name}</td>
                  <td>{m.route}</td>
                  <td>{m.dosage}</td>
                  <td>{m.eye_side}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IopTrendPage;