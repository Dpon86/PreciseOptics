import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './BatchTrackingReport.css';

const STATUS_COLOURS = {
  active: '#27ae60',
  expiring_soon: '#e67e22',
  expired: '#e74c3c',
  no_expiry: '#95a5a6',
};

const STATUS_LABELS = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  no_expiry: 'No Expiry Recorded',
};

const BatchTrackingReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getBatchTrackingReport({ search, status: statusFilter });
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to load batch data');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load batch tracking report');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const s = data?.summary;

  return (
    <div className="batch-page">
      <div className="batch-header">
        <div>
          <button onClick={() => navigate('/reports')} className="btn btn-secondary">← Back</button>
          <h1>Batch Number Tracking</h1>
          <p>Monitor medication batches — expiry dates, prescription usage, and stock levels</p>
        </div>
      </div>

      {/* Summary Cards */}
      {s && (
        <div className="batch-cards">
          <div className="batch-card batch-card--blue">
            <div className="batch-card__label">Total Batches</div>
            <div className="batch-card__value">{s.total_batches}</div>
          </div>
          <div className="batch-card batch-card--green">
            <div className="batch-card__label">Active</div>
            <div className="batch-card__value">{s.active}</div>
          </div>
          <div className="batch-card batch-card--orange">
            <div className="batch-card__label">Expiring Soon</div>
            <div className="batch-card__value">{s.expiring_soon}</div>
            <div className="batch-card__sub">within 90 days</div>
          </div>
          <div className="batch-card batch-card--red">
            <div className="batch-card__label">Expired</div>
            <div className="batch-card__value">{s.expired}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="batch-filters">
        <input
          type="text"
          className="batch-search"
          placeholder="Search by batch number or medication name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="batch-status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="no_expiry">No Expiry Recorded</option>
        </select>
      </div>

      {error && <div className="batch-error">{error}</div>}

      {loading && (
        <div className="batch-loading">
          <div className="batch-spinner" />
          <span>Loading batch data…</span>
        </div>
      )}

      {!loading && data && (
        <>
          {data.batches.length === 0 ? (
            <div className="batch-empty">
              <h3>No batches found</h3>
              <p>
                {search || statusFilter
                  ? 'No batches match your current filters.'
                  : 'No medications have batch numbers recorded. Add batch numbers when creating or editing medications.'}
              </p>
            </div>
          ) : (
            <div className="batch-section">
              <h2>
                {data.batches.length} batch{data.batches.length !== 1 ? 'es' : ''}
                {statusFilter && ` — ${STATUS_LABELS[statusFilter]}`}
              </h2>
              <table className="batch-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Strength</th>
                    <th>Batch Number</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Days Left</th>
                    <th>Stock</th>
                    <th>Prescriptions</th>
                    <th>Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {data.batches.map((row) => (
                    <tr key={row.id} className={row.status === 'expired' ? 'batch-row--expired' : ''}>
                      <td className="batch-med-name">{row.medication_name}</td>
                      <td>{row.strength || '—'}</td>
                      <td>
                        <code className="batch-code">{row.batch_number}</code>
                      </td>
                      <td>
                        {row.expiry_date
                          ? new Date(row.expiry_date).toLocaleDateString('en-GB')
                          : <span className="batch-na">—</span>}
                      </td>
                      <td>
                        <span
                          className="batch-status-pill"
                          style={{ background: STATUS_COLOURS[row.status] }}
                        >
                          {STATUS_LABELS[row.status]}
                        </span>
                      </td>
                      <td>
                        {row.days_until_expiry === null ? (
                          <span className="batch-na">—</span>
                        ) : row.days_until_expiry < 0 ? (
                          <span className="batch-overdue">{Math.abs(row.days_until_expiry)}d overdue</span>
                        ) : (
                          <span className={row.days_until_expiry <= 90 ? 'batch-warn' : ''}>
                            {row.days_until_expiry}d
                          </span>
                        )}
                      </td>
                      <td className={row.current_stock === 0 ? 'batch-zero-stock' : ''}>
                        {row.current_stock}
                      </td>
                      <td>{row.prescription_count}</td>
                      <td>{row.patient_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BatchTrackingReport;
