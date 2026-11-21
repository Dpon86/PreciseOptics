import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const VfTrendPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        api.getPatient(patientId),
        api.get(`/api/patients/${patientId}/vf-trend/`),
      ]);
      setPatient(pRes.data);
      setData(vRes.data);
    } catch (err) {
      setError('Failed to load visual field data');
    } finally { setLoading(false); }
  }, [patientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading visual field trend...</div></div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;

  const vfPoints = data?.vf_points || [];

  const allRight = vfPoints.filter(p => p.right_md != null).map(p => p.right_md);
  const allLeft = vfPoints.filter(p => p.left_md != null).map(p => p.left_md);

  return (
    <div className="page-container iop-trend-page">
      <div className="page-header">
        <h1>{patient ? `${patient.first_name} ${patient.last_name}` : ''} — Visual Field Trend</h1>
      </div>

      {vfPoints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No visual field tests recorded</h3>
        </div>
      ) : (
        <>
          <div className="chart-container">
            <svg viewBox="0 0 700 320" style={{ width: '100%', maxWidth: 700 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <g key={i}>
                  <line x1="0" y1={50 + i * 50} x2="700" y2={50 + i * 50} stroke="#eee" strokeWidth="1" />
                  <text x="5" y={55 + i * 50} fontSize="10" fill="#999">{(5 - i) * 5} dB</text>
                </g>
              ))}
              {allRight.length > 1 && (
                <polyline points={vfPoints.filter(p => p.right_md != null).map((p, i) =>
                  `${(i / Math.max(allRight.length - 1, 1)) * 680 + 10},${300 - ((p.right_md + 25) / 30) * 250}`
                ).join(' ')} fill="none" stroke="#e74c3c" strokeWidth="2" />
              )}
              {allLeft.length > 1 && (
                <polyline points={vfPoints.filter(p => p.left_md != null).map((p, i) =>
                  `${(i / Math.max(allLeft.length - 1, 1)) * 680 + 10},${300 - ((p.left_md + 25) / 30) * 250}`
                ).join(' ')} fill="none" stroke="#2980b9" strokeWidth="2" />
              )}
            </svg>
            <div className="chart-legend" style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <span><span style={{ width: 10, height: 10, background: '#e74c3c', borderRadius: 5, display: 'inline-block' }} /> Right MD</span>
              <span><span style={{ width: 10, height: 10, background: '#2980b9', borderRadius: 5, display: 'inline-block' }} /> Left MD</span>
            </div>
          </div>

          <div className="iop-table-container">
            <h3>Visual Field Readings</h3>
            <table className="iop-table">
              <thead>
                <tr><th>Date</th><th>Right MD (dB)</th><th>Right PSD</th><th>Right VFI</th><th>Left MD</th><th>Left PSD</th><th>Left VFI</th></tr>
              </thead>
              <tbody>
                {vfPoints.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.date).toLocaleDateString('en-GB')}</td>
                    <td>{p.right_md ?? '—'}</td><td>{p.right_psd ?? '—'}</td><td>{p.right_vfi ?? '—'}</td>
                    <td>{p.left_md ?? '—'}</td><td>{p.left_psd ?? '—'}</td><td>{p.left_vfi ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VfTrendPage;