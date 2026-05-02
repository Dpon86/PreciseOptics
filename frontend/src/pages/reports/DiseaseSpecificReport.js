import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../../services/api';
import { exportToCSV } from '../../services/exportUtils';
import './DiseaseSpecificReport.css';

const DISEASES = [
  { id: 'glaucoma', label: 'Glaucoma', fullName: 'Glaucoma', icon: '🔵', color: '#27ae60' },
  { id: 'amd', label: 'AMD', fullName: 'Age-Related Macular Degeneration', icon: '👁️', color: '#3498db' },
  { id: 'diabetic_retinopathy', label: 'Diabetic Retinopathy', fullName: 'Diabetic Retinopathy', icon: '🩺', color: '#f39c12' },
  { id: 'rvo', label: 'RVO', fullName: 'Retinal Vein Occlusion', icon: '🩸', color: '#e74c3c' },
  { id: 'cataract', label: 'Cataracts', fullName: 'Cataracts', icon: '⚪', color: '#9b59b6' },
];

const SEVERITY_COLORS = {
  mild: '#27ae60',
  moderate: '#f39c12',
  severe: '#e74c3c',
  very_severe: '#c0392b',
};

const STATUS_COLORS = {
  newly_diagnosed: '#3498db',
  active: '#e74c3c',
  stable: '#27ae60',
  progressing: '#e67e22',
  improving: '#2ecc71',
  resolved: '#95a5a6',
  managed: '#1abc9c',
};

const SEVERITY_LABELS = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  very_severe: 'Very Severe',
};

const STATUS_LABELS = {
  newly_diagnosed: 'New',
  active: 'Active',
  stable: 'Stable',
  progressing: 'Progressing',
  improving: 'Improving',
  resolved: 'Resolved',
  managed: 'Managed',
};

const DiseaseSpecificReport = () => {
  const [selectedDisease, setSelectedDisease] = useState('glaucoma');
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getDiseaseReport({ category: selectedDisease, months });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching disease report:', err);
      setError(err.response?.data?.error || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [selectedDisease, months]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const severityChartData = data?.severity_distribution?.map(item => ({
    name: SEVERITY_LABELS[item.severity] || item.severity,
    count: item.count,
    fill: SEVERITY_COLORS[item.severity] || '#95a5a6',
  })) || [];

  const statusChartData = data?.status_distribution?.map(item => ({
    name: STATUS_LABELS[item.current_status] || item.current_status,
    count: item.count,
    fill: STATUS_COLORS[item.current_status] || '#95a5a6',
  })) || [];

  const disease = DISEASES.find(d => d.id === selectedDisease);

  return (
    <div className="disease-report-page">
      <div className="report-header">
        <div>
          <h1>Disease-Specific Reports</h1>
          <p>Track patient outcomes, treatment trends, and medication effectiveness by condition</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={months}
            onChange={e => setMonths(Number(e.target.value))}
            className="period-select"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>
          <button
            className="export-btn"
            onClick={() => {
              const rows = (data?.patient_list || []).map(p => ({
                patient_name: p.patient_name || '',
                disease: disease?.fullName || selectedDisease,
                severity: p.severity || '',
                status: p.current_status || '',
                diagnosis_date: p.diagnosis_date || '',
                last_assessment: p.last_assessment_date || '',
              }));
              const cols = [
                { key: 'patient_name', label: 'Patient' },
                { key: 'disease', label: 'Disease' },
                { key: 'severity', label: 'Severity' },
                { key: 'status', label: 'Status' },
                { key: 'diagnosis_date', label: 'Diagnosis Date' },
                { key: 'last_assessment', label: 'Last Assessment' },
              ];
              exportToCSV(rows, cols, `disease-report-${selectedDisease}-${new Date().toISOString().slice(0,10)}`);
            }}
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Disease Selector Tabs */}
      <div className="disease-tabs">
        {DISEASES.map(d => (
          <button
            key={d.id}
            className={`disease-tab ${selectedDisease === d.id ? 'active' : ''}`}
            style={{ '--tab-color': d.color }}
            onClick={() => setSelectedDisease(d.id)}
          >
            <span className="tab-icon">{d.icon}</span>
            <span className="tab-label">{d.label}</span>
            <span className="tab-fullname">{d.fullName}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner-lg" />
          <p>Loading {disease?.fullName} report...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-value">{data.summary.total_patients}</div>
              <div className="card-label">Total Patients</div>
            </div>
            <div className="summary-card red">
              <div className="card-value">{data.summary.active_cases}</div>
              <div className="card-label">Active Cases</div>
            </div>
            <div className="summary-card green">
              <div className="card-value">{data.summary.stable_cases}</div>
              <div className="card-label">Stable / Managed</div>
            </div>
            <div className="summary-card teal">
              <div className="card-value">{data.summary.improving_cases}</div>
              <div className="card-label">Improving</div>
            </div>
            <div className="summary-card blue">
              <div className="card-value">{data.summary.improvement_rate}%</div>
              <div className="card-label">Improvement Rate</div>
            </div>
            <div className="summary-card purple">
              <div className="card-value">{data.summary.new_diagnoses}</div>
              <div className="card-label">New in Period</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card">
              <h3>Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={severityChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Patients">
                    {severityChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Current Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Patients">
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outcome Trends */}
          {data.outcome_trends?.length > 0 && (
            <div className="chart-card full-width">
              <h3>Outcome Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.outcome_trends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="improved" stroke="#27ae60" strokeWidth={2} name="Improved" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="stable" stroke="#3498db" strokeWidth={2} name="Stable" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="worsened" stroke="#e74c3c" strokeWidth={2} name="Worsened" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom Row: Medications + Eye Distribution */}
          <div className="bottom-row">
            <div className="table-card">
              <h3>Top Medications in Use</h3>
              {data.top_medications?.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Generic Name</th>
                      <th>Prescriptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_medications.map((med, i) => (
                      <tr key={i}>
                        <td>{med['medication__name']}</td>
                        <td className="muted">{med['medication__generic_name'] || '—'}</td>
                        <td><span className="count-badge">{med.count}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-msg">No medication data for this period</p>
              )}
            </div>

            <div className="table-card">
              <h3>Eye Affected Distribution</h3>
              {data.eye_affected_distribution?.length > 0 ? (
                <div className="eye-dist">
                  {data.eye_affected_distribution.map((item, i) => {
                    const total = data.summary.total_patients || 1;
                    const pct = Math.round(item.count / total * 100);
                    const label =
                      item.eye_affected === 'both' ? '👁️👁️ Both Eyes' :
                      item.eye_affected === 'left' ? '👁️ Left Eye' :
                      item.eye_affected === 'right' ? '👁️ Right Eye' :
                      item.eye_affected;
                    return (
                      <div key={i} className="eye-dist-item">
                        <span className="eye-label">{label}</span>
                        <div className="eye-bar-wrap">
                          <div className="eye-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="eye-count">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-data-msg">No data</p>
              )}
            </div>
          </div>

          {/* Patient List */}
          <div className="table-card full-width">
            <div className="table-header">
              <h3>Patient List ({data.patient_list?.length || 0} shown)</h3>
              <span className="muted" style={{ fontSize: '0.85rem' }}>Most recent 50 patients</span>
            </div>
            {data.patient_list?.length > 0 ? (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>ID</th>
                      <th>Diagnosis Date</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Eye</th>
                      <th>Last Assessment</th>
                      <th>Latest Change</th>
                      <th>Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.patient_list.map(p => (
                      <tr key={p.id}>
                        <td>
                          <a href={`/patients/${p.id}`}>{p.patient_name}</a>
                        </td>
                        <td className="muted">{p.patient_id}</td>
                        <td className="muted">{p.diagnosis_date || '—'}</td>
                        <td>
                          <span className={`severity-badge severity-${p.severity}`}>
                            {(p.severity || '').replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill status-${p.current_status}`}>
                            {(p.current_status || '').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="muted">{p.eye_affected}</td>
                        <td className="muted">{p.last_assessment || '—'}</td>
                        <td>
                          {p.latest_change ? (
                            <span className={`change-badge change-${p.latest_change}`}>
                              {p.latest_change}
                            </span>
                          ) : '—'}
                        </td>
                        <td>{p.progress_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No patients with {disease?.fullName} recorded</p>
                <small>Add patient conditions through the patient record to see data here</small>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DiseaseSpecificReport;
