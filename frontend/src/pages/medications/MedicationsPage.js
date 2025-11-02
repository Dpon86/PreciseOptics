import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './MedicationsPage.css';

const MedicationsPage = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await api.getMedications();
      setMedications(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading medications...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medications</h1>
        <div className="header-actions">
          <Link to="/medications/add" className="btn btn-primary">
            Add New Medication
          </Link>
          <Link to="/prescriptions/add" className="btn btn-secondary">
            Create Prescription
          </Link>
        </div>
      </div>

      <div className="medications-grid">
        {medications.length === 0 ? (
          <div className="empty-state">
            <p>No medications found in database.</p>
            <Link to="/medications/add" className="btn btn-primary">
              Add First Medication
            </Link>
          </div>
        ) : (
          medications.map((medication) => (
            <div key={medication.id} className="medication-card">
              <div className="card-left-section">
                <div className="medication-icon">
                  {medication.name.charAt(0)}
                </div>
              </div>
              <div className="card-main-section">
                <div className="card-header">
                  <div className="header-title-section">
                    <h3>{medication.name}</h3>
                    <span className={`status-badge ${medication.approval_status ? 'approved' : 'pending'}`}>
                      {medication.approval_status ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="medication-details">
                    <div className="detail-row">
                      <span className="detail-label">Generic Name:</span>
                      <span className="detail-value">{medication.generic_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Strength:</span>
                      <span className="detail-value">{medication.strength}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{medication.medication_type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Manufacturer:</span>
                      <span className="detail-value">{medication.manufacturer}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-right-section">
                <Link to={`/medications/${medication.id}`} className="btn btn-view">
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

export default MedicationsPage;