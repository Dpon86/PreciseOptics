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
              <div className="card-header">
                <h3>{medication.name}</h3>
                <div className="status-container">
                  <span className={`status-badge ${medication.approval_status ? 'approved' : 'pending'}`}>
                    {medication.approval_status ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="card-content">
                <div className="medication-details">
                  <p><strong>Generic Name:</strong> {medication.generic_name}</p>
                  <p><strong>Strength:</strong> {medication.strength}</p>
                  <p><strong>Type:</strong> {medication.medication_type}</p>
                  <p><strong>Manufacturer:</strong> {medication.manufacturer}</p>
                  {medication.current_stock !== undefined && (
                    <p><strong>Stock:</strong> {medication.current_stock}</p>
                  )}
                </div>
              </div>
              <div className="card-actions">
                <Link to={`/medications/${medication.id}`} className="btn btn-secondary">
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