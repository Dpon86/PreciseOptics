import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AlertDetailPage.css';

const AlertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true);
        const response = await api.getAlert(id);
        setAlertData(response.data);
      } catch (err) {
        setError('Failed to load alert details');
      } finally {
        setLoading(false);
      }
    };

    loadAlert();
  }, [id]);

  if (loading) return <div className="page-container"><p>Loading alert...</p></div>;
  if (error) return <div className="page-container"><p className="error-text">{error}</p></div>;
  if (!alertData) return null;

  return (
    <div className="page-container alert-detail-page">
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/alerts')}>← Back to Alerts</button>
        <h1>{alertData.title}</h1>
      </div>

      <div className="detail-card">
        <p><strong>Patient:</strong> {alertData.patient_name} ({alertData.patient_id_display})</p>
        <p><strong>Type:</strong> {alertData.alert_type}</p>
        <p><strong>Severity:</strong> {alertData.severity}</p>
        <p><strong>Status:</strong> {alertData.status}</p>
        <p><strong>Triggered:</strong> {new Date(alertData.trigger_time).toLocaleString()}</p>
        <p><strong>Message:</strong> {alertData.message}</p>
        {alertData.action_taken && <p><strong>Action Taken:</strong> {alertData.action_taken}</p>}
        {alertData.notes && <p><strong>Notes:</strong> {alertData.notes}</p>}
      </div>
    </div>
  );
};

export default AlertDetailPage;
