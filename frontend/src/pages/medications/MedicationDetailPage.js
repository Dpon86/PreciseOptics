import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './MedicationDetailPage.css';

const MedicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInternalNotes, setShowInternalNotes] = useState(false);

  useEffect(() => {
    fetchMedication();
  }, [id]);

  const fetchMedication = async () => {
    try {
      setLoading(true);
      const response = await api.getMedication(id);
      setMedication(response.data);
    } catch (err) {
      console.error('Error fetching medication:', err);
      setError('Failed to load medication details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status || typeof status !== 'string') return 'status-pending';
    
    const statusMap = {
      'approved': 'status-approved',
      'pending': 'status-pending',
      'rejected': 'status-rejected'
    };
    return statusMap[status.toLowerCase()] || 'status-pending';
  };

  const getStockStatus = () => {
    if (!medication) return null;
    const stock = medication.current_stock || medication.stock_quantity || 0;
    const minLevel = medication.minimum_stock_level || 0;
    
    if (stock === 0) return { label: 'Out of Stock', class: 'stock-out' };
    if (stock <= minLevel) return { label: 'Low Stock', class: 'stock-low' };
    return { label: 'In Stock', class: 'stock-good' };
  };

  if (loading) {
    return <div className="loading">Loading medication details...</div>;
  }

  if (error || !medication) {
    return (
      <div className="error-container">
        <p>{error || 'Medication not found'}</p>
        <button onClick={() => navigate('/medications')} className="btn btn-primary">
          Back to Medications
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="medication-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <h1>{medication.name || medication.generic_name}</h1>
          <div className="header-badges">
            <span className={`status-badge ${getStatusClass(medication.approval_status)}`}>
              {typeof medication.approval_status === 'string' 
                ? medication.approval_status.charAt(0).toUpperCase() + medication.approval_status.slice(1)
                : 'Pending'}
            </span>
            {stockStatus && (
              <span className={`stock-badge ${stockStatus.class}`}>
                {stockStatus.label}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/medications/${id}/edit`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit Medication
          </Link>
          <button onClick={() => navigate('/medications')} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Basic Information */}
        <div className="info-card">
          <h2><i className="fas fa-info-circle"></i> Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Medicine Name:</label>
              <span>{medication.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Generic Name:</label>
              <span>{medication.generic_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Brand Name:</label>
              <span>{medication.brand_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Manufacturer:</label>
              <span>{medication.manufacturer || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Dosage Information */}
        <div className="info-card">
          <h2><i className="fas fa-pills"></i> Dosage Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Strength:</label>
              <span>{medication.strength || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Dosage Form:</label>
              <span className="capitalize">{medication.dosage_form || medication.type || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Inventory Information */}
        <div className="info-card">
          <h2><i className="fas fa-warehouse"></i> Inventory Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Current Stock:</label>
              <span className={stockStatus?.class}>
                {medication.current_stock || medication.stock_quantity || 0} units
              </span>
            </div>
            <div className="info-item">
              <label>Minimum Stock Level:</label>
              <span>{medication.minimum_stock_level || 0} units</span>
            </div>
            <div className="info-item">
              <label>Price per Unit:</label>
              <span>£{parseFloat(medication.price || 0).toFixed(2)}</span>
            </div>
            <div className="info-item">
              <label>Batch Number:</label>
              <span>{medication.batch_number || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Expiry Date:</label>
              <span>
                {medication.expiry_date 
                  ? new Date(medication.expiry_date).toLocaleDateString('en-GB')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* NICE BNF Clinical Information */}
        <div className="info-card nice-bnf-card">
          <h2><i className="fas fa-book-medical"></i> Clinical Information (NICE BNF)</h2>
          <p className="nice-info">
            For comprehensive clinical information including indications, dosage, side effects, 
            contraindications, and interactions, please refer to the official NICE BNF (British National Formulary).
          </p>
          
          <div className="nice-links">
            <a 
              href={`https://bnf.nice.org.uk/drugs/${encodeURIComponent((medication.generic_name || medication.name || '').toLowerCase().replace(/\s+/g, '-'))}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="nice-link-button primary"
            >
              <i className="fas fa-external-link-alt"></i>
              View on NICE BNF
            </a>
            
            <a 
              href="https://bnf.nice.org.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="nice-link-button secondary"
            >
              <i className="fas fa-search"></i>
              Search NICE BNF
            </a>
          </div>

          <div className="nice-disclaimer">
            <i className="fas fa-info-circle"></i>
            <span>
              NICE BNF provides authoritative, evidence-based information on medicines used in the UK. 
              Always check the latest edition for the most current guidance.
            </span>
          </div>
        </div>

        {/* Internal Notes - Collapsible section */}
        {(medication.description || medication.side_effects || medication.contraindications) && (
          <div className="info-card internal-notes-card">
            <div 
              className="internal-notes-header" 
              onClick={() => setShowInternalNotes(!showInternalNotes)}
            >
              <h2>
                <i className="fas fa-clipboard"></i> 
                Internal Notes
              </h2>
              <button className="toggle-notes-btn">
                <i className={`fas fa-chevron-${showInternalNotes ? 'up' : 'down'}`}></i>
                {showInternalNotes ? 'Hide' : 'Show'} Notes
              </button>
            </div>
            
            {showInternalNotes && (
              <div className="internal-notes-content">
                {medication.description && (
                  <div className="note-section">
                    <h4>Description:</h4>
                    <p className="description-text">{medication.description}</p>
                  </div>
                )}

                {medication.side_effects && (
                  <div className="note-section warning-note">
                    <h4><i className="fas fa-exclamation-triangle"></i> Side Effects Notes:</h4>
                    <p className="description-text">{medication.side_effects}</p>
                  </div>
                )}

                {medication.contraindications && (
                  <div className="note-section danger-note">
                    <h4><i className="fas fa-ban"></i> Contraindications Notes:</h4>
                    <p className="description-text">{medication.contraindications}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="info-card timestamps">
          <div className="info-grid">
            {medication.created_at && (
              <div className="info-item">
                <label>Created:</label>
                <span>{new Date(medication.created_at).toLocaleString('en-GB')}</span>
              </div>
            )}
            {medication.updated_at && (
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(medication.updated_at).toLocaleString('en-GB')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetailPage;
