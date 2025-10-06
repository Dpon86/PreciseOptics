import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAuditLogs();
      setAuditLogs(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading audit logs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <Link to="/audit-logs/add" className="btn btn-primary">
          Add Audit Entry
        </Link>
      </div>

      <div className="audit-logs-table">
        {auditLogs.length === 0 ? (
          <div className="empty-state">
            <p>No audit logs found.</p>
            <Link to="/audit-logs/add" className="btn btn-primary">
              Add First Audit Entry
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>{log.user || 'System'}</td>
                    <td>
                      <span className={`action-badge action-${log.action}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.resource_name}</td>
                    <td>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(log.severity) }}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="description-cell">
                      {log.description}
                    </td>
                    <td>
                      <Link 
                        to={`/audit-logs/${log.id}`} 
                        className="btn btn-sm btn-secondary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .audit-logs-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
        }

        .audit-table th,
        .audit-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        .audit-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
        }

        .action-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .action-create { background: #d4edda; color: #155724; }
        .action-read { background: #d1ecf1; color: #0c5460; }
        .action-update { background: #fff3cd; color: #856404; }
        .action-delete { background: #f8d7da; color: #721c24; }
        .action-login { background: #e2e3e5; color: #383d41; }
        .action-logout { background: #e2e3e5; color: #383d41; }

        .severity-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .description-cell {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default AuditLogsPage;