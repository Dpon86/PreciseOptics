import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PrescriptionDetailPage.css';

const PrescriptionDetailPage = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptionDetails();
  }, [prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getPrescription(prescriptionId);
      setPrescription(response.data);
    } catch (err) {
      setError(`Failed to load prescription details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading prescription details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="error-container">
        <div className="error-message">Prescription not found.</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="prescription-detail-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
            ← Back
          </button>
          <h1>Prescription Details</h1>
          <p className="subtitle">
            Prescription #{prescription.prescription_number || prescription.id}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            🖨️ Print Prescription
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="status-banner">
        <span className={`status-badge-large badge-${prescription.status?.toLowerCase() || 'success'}`}>
          {prescription.status || 'Active'}
        </span>
      </div>

      {/* Main Content */}
      <div className="prescription-content">
        {/* Patient & Doctor Information */}
        <div className="info-section">
          <h2>Prescription Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Patient:</label>
              <span>{prescription.patient_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Prescribed By:</label>
              <span>Dr. {prescription.prescribed_by_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Date Prescribed:</label>
              <span>{prescription.date_prescribed ? new Date(prescription.date_prescribed).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Valid Until:</label>
              <span>{prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Prescription Number:</label>
              <span>{prescription.prescription_number || prescription.id}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge badge-${prescription.status?.toLowerCase() || 'success'}`}>
                {prescription.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        {prescription.diagnosis && (
          <div className="info-section">
            <h2>Diagnosis</h2>
            <p className="text-content highlight-primary">{prescription.diagnosis}</p>
          </div>
        )}

        {/* Medications */}
        {prescription.items && prescription.items.length > 0 && (
          <div className="info-section">
            <h2>Prescribed Medications</h2>
            <div className="medications-table">
              <table>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Strength</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Eye</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.items.map((item, index) => (
                    <tr key={index}>
                      <td className="medication-name">{item.medication_name || 'N/A'}</td>
                      <td>{item.medication_strength || '-'}</td>
                      <td>{item.dosage || '-'}</td>
                      <td>{item.frequency || item.custom_frequency || '-'}</td>
                      <td>{item.duration_days ? `${item.duration_days} days` : '-'}</td>
                      <td>{item.eye_side || '-'}</td>
                      <td>{item.quantity_prescribed || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special Instructions for Each Medication */}
            {prescription.items.some(item => item.special_instructions) && (
              <div className="special-instructions-section">
                <h3>Special Instructions:</h3>
                {prescription.items.filter(item => item.special_instructions).map((item, index) => (
                  <div key={index} className="instruction-item">
                    <strong>{item.medication_name}:</strong> {item.special_instructions}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* General Instructions */}
        {prescription.instructions && (
          <div className="info-section">
            <h2>General Instructions</h2>
            <p className="text-content instruction-text">{prescription.instructions}</p>
          </div>
        )}

        {/* Doctor's Notes */}
        {prescription.doctor_notes && (
          <div className="info-section">
            <h2>Doctor's Notes</h2>
            <p className="text-content">{prescription.doctor_notes}</p>
          </div>
        )}

        {/* Pharmacy Notes */}
        {prescription.pharmacy_notes && (
          <div className="info-section">
            <h2>Pharmacy Notes</h2>
            <p className="text-content">{prescription.pharmacy_notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="info-section">
          <h2>Record Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Created:</label>
              <span>{prescription.created_at ? new Date(prescription.created_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{prescription.updated_at ? new Date(prescription.updated_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="print-footer">
        <p>This is a valid prescription issued by {prescription.prescribed_by_name}</p>
        <p>Prescription Number: {prescription.prescription_number || prescription.id}</p>
        <p>Valid until: {prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  );
};

export default PrescriptionDetailPage;
