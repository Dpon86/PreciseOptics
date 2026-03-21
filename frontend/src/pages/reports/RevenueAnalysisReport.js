import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../../services/api';
import './RevenueAnalysisReport.css';

const PAYMENT_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  partial: 'Partial',
  insurance_claim: 'Insurance Claim',
};

const PAYMENT_STATUS_COLOURS = {
  paid: '#27ae60',
  pending: '#e74c3c',
  partial: '#f39c12',
  insurance_claim: '#3498db',
};

const VISIT_TYPE_LABELS = {
  new_patient: 'New Patient',
  follow_up: 'Follow-Up',
  emergency: 'Emergency',
  post_operative: 'Post-Op',
  routine_check: 'Routine Check',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

const RevenueAnalysisReport = () => {
  const navigate = useNavigate();
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getRevenueReport({ months });
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to load report');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const statusChartData = data?.payment_status_breakdown?.map(row => ({
    name: PAYMENT_STATUS_LABELS[row.payment_status] || row.payment_status,
    amount: row.amount,
    count: row.count,
    colour: PAYMENT_STATUS_COLOURS[row.payment_status] || '#95a5a6',
  })) || [];

  const visitTypeChartData = data?.revenue_by_visit_type?.map(row => ({
    name: VISIT_TYPE_LABELS[row.visit_type] || row.visit_type,
    amount: row.amount,
    count: row.count,
  })) || [];

  const s = data?.summary;

  return (
    <div className="rev-page">
      <div className="rev-header">
        <div>
          <button onClick={() => navigate('/reports')} className="btn btn-secondary">← Back</button>
          <h1>Revenue Analysis</h1>
          <p>Billing and payment summary for completed patient visits</p>
        </div>
        <select
          className="rev-period-select"
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
          <option value="24">Last 24 Months</option>
        </select>
      </div>

      {error && <div className="rev-error">{error}</div>}

      {loading && (
        <div className="rev-loading">
          <div className="rev-spinner" />
          <span>Loading revenue data…</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div className="rev-cards">
            <div className="rev-card rev-card--blue">
              <div className="rev-card__label">Total Billed</div>
              <div className="rev-card__value">{fmt(s.total_billed)}</div>
              <div className="rev-card__sub">{s.total_visits} completed visits</div>
            </div>
            <div className="rev-card rev-card--green">
              <div className="rev-card__label">Collected (Paid)</div>
              <div className="rev-card__value">{fmt(s.paid_amount)}</div>
              <div className="rev-card__sub">{s.paid_visits} visits fully paid</div>
            </div>
            <div className="rev-card rev-card--orange">
              <div className="rev-card__label">Outstanding</div>
              <div className="rev-card__value">{fmt(s.pending_amount + s.partial_amount)}</div>
              <div className="rev-card__sub">{s.pending_visits} visits pending</div>
            </div>
            <div className="rev-card rev-card--teal">
              <div className="rev-card__label">Insurance Claims</div>
              <div className="rev-card__value">{fmt(s.insurance_amount)}</div>
              <div className="rev-card__sub">{s.insurance_visits} claims submitted</div>
            </div>
            <div className="rev-card rev-card--purple">
              <div className="rev-card__label">Collection Rate</div>
              <div className="rev-card__value">{s.collection_rate}%</div>
              <div className="rev-card__sub">of total billed collected</div>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          {data.monthly_trend?.length > 0 && (
            <div className="rev-section">
              <h2>Monthly Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.monthly_trend} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="collected" name="Collected" fill="#27ae60" stackId="a" />
                  <Bar dataKey="insurance" name="Insurance" fill="#3498db" stackId="a" />
                  <Bar dataKey="pending" name="Pending" fill="#e74c3c" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rev-two-col">
            {/* Payment Status Breakdown */}
            {statusChartData.length > 0 && (
              <div className="rev-section">
                <h2>Payment Status Breakdown</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={statusChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={110} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="amount" name="Amount">
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.colour} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <table className="rev-table">
                  <thead>
                    <tr><th>Status</th><th>Visits</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    {statusChartData.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <span className="rev-dot" style={{ background: row.colour }} />
                          {row.name}
                        </td>
                        <td>{row.count}</td>
                        <td><strong>{fmt(row.amount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue by Visit Type */}
            {visitTypeChartData.length > 0 && (
              <div className="rev-section">
                <h2>Revenue by Visit Type</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={visitTypeChartData} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="amount" name="Revenue" fill="#8e44ad" />
                  </BarChart>
                </ResponsiveContainer>
                <table className="rev-table">
                  <thead>
                    <tr><th>Visit Type</th><th>Visits</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {visitTypeChartData.map((row, i) => (
                      <tr key={i}>
                        <td>{row.name}</td>
                        <td>{row.count}</td>
                        <td><strong>{fmt(row.amount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Treatments by Estimated Cost */}
          {data.top_treatments?.length > 0 && (
            <div className="rev-section">
              <h2>Top Treatments by Estimated Cost</h2>
              <table className="rev-table rev-table--full">
                <thead>
                  <tr>
                    <th>Treatment</th>
                    <th>Est. Cost (GBP)</th>
                    <th>Completed (this period)</th>
                    <th>Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_treatments.map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td>{fmt(row.estimated_cost_gbp)}</td>
                      <td>{row.completed_count}</td>
                      <td><strong>{fmt(row.estimated_cost_gbp * row.completed_count)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.monthly_trend?.length === 0 && statusChartData.length === 0 && (
            <div className="rev-empty">
              <h3>No billing data found</h3>
              <p>No completed visits with cost data found for the selected period. Billing totals are populated when a patient visit is marked completed with a cost entered.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RevenueAnalysisReport;
