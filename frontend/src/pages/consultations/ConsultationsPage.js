import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await api.getConsultations();
      setConsultations(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading consultations...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Consultations</h1>
        <Link to="/consultations/add" className="btn btn-primary">
          Add New Consultation
        </Link>
      </div>

      <div className="consultations-grid">
        {consultations.length === 0 ? (
          <div className="empty-state">
            <p>No consultations found.</p>
            <Link to="/consultations/add" className="btn btn-primary">
              Add First Consultation
            </Link>
          </div>
        ) : (
          consultations.map((consultation) => (
            <div key={consultation.id} className="consultation-card">
              <div className="card-header">
                <h3>Patient: {consultation.patient_name || consultation.patient}</h3>
                <span className="consultation-date">
                  {new Date(consultation.consultation_date).toLocaleDateString()}
                </span>
              </div>
              <div className="card-content">
                <p><strong>Chief Complaint:</strong> {consultation.chief_complaint}</p>
                <p><strong>Doctor:</strong> {consultation.doctor_name || consultation.doctor}</p>
                {consultation.diagnosis && (
                  <p><strong>Diagnosis:</strong> {consultation.diagnosis}</p>
                )}
              </div>
              <div className="card-actions">
                <Link to={`/consultations/${consultation.id}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultationsPage;