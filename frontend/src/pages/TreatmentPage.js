import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TreatmentForm from '../components/TreatmentForm';
import './TreatmentPage.css';

const TreatmentPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchTreatments();
    } else {
      fetchAllTreatments();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else {
        setError('Failed to load patient data');
      }
    } catch (error) {
      setError('Error loading patient data');
    }
  };

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const url = patientId 
        ? `/api/treatments/treatments/?patient=${patientId}` 
        : '/api/treatments/treatments/';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTreatments(data.results || data);
      } else {
        setError('Failed to load treatments');
      }
    } catch (error) {
      setError('Error loading treatments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTreatments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/treatments/treatments/');
      if (response.ok) {
        const data = await response.json();
        setTreatments(data.results || data);
      } else {
        setError('Failed to load treatments');
      }
    } catch (error) {
      setError('Error loading treatments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTreatment = async (treatmentData) => {
    try {
      const response = await fetch('/api/treatments/treatments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchTreatments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create treatment');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTreatment = async (treatmentData) => {
    try {
      const response = await fetch(`/api/treatments/treatments/${editingTreatment.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        setEditingTreatment(null);
        fetchTreatments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update treatment');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleStartTreatment = async (treatmentId) => {
    try {
      const response = await fetch(`/api/treatments/treatments/${treatmentId}/start_treatment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchTreatments();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start treatment');
      }
    } catch (error) {
      setError('Error starting treatment');
    }
  };

  const handleCompleteTreatment = async (treatmentId, outcomeData) => {
    try {
      const response = await fetch(`/api/treatments/treatments/${treatmentId}/complete_treatment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outcomeData),
      });

      if (response.ok) {
        fetchTreatments();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete treatment');
      }
    } catch (error) {
      setError('Error completing treatment');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'planned': 'badge-secondary',
      'scheduled': 'badge-info',
      'in_progress': 'badge-warning',
      'completed': 'badge-success',
      'cancelled': 'badge-danger',
      'postponed': 'badge-secondary',
      'failed': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      'routine': 'badge-secondary',
      'urgent': 'badge-warning',
      'emergency': 'badge-danger'
    };
    return priorityClasses[priority] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="treatment-page-loading">
        <div className="spinner"></div>
        <p>Loading treatments...</p>
      </div>
    );
  }

  if (showForm || editingTreatment) {
    return (
      <TreatmentForm
        patient={patient}
        initialData={editingTreatment}
        onSubmit={editingTreatment ? handleUpdateTreatment : handleCreateTreatment}
        onCancel={() => {
          setShowForm(false);
          setEditingTreatment(null);
        }}
      />
    );
  }

  return (
    <div className="treatment-page">
      <div className="treatment-header">
        <div className="header-content">
          <h1>
            {patientId ? (
              <>Treatments for {patient?.first_name} {patient?.last_name}</>
            ) : (
              'Treatment Management'
            )}
          </h1>
          {patientId && patient && (
            <div className="patient-info">
              <span>Patient ID: {patient.patient_id}</span>
              <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          {patientId && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Schedule New Treatment
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {treatments.length === 0 ? (
        <div className="no-treatments">
          <div className="no-treatments-icon">🏥</div>
          <h3>No Treatments Found</h3>
          <p>
            {patientId 
              ? 'This patient has no scheduled treatments yet.' 
              : 'No treatments have been scheduled in the system.'}
          </p>
          {patientId && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Schedule First Treatment
            </button>
          )}
        </div>
      ) : (
        <div className="treatments-grid">
          {treatments.map(treatment => (
            <div key={treatment.id} className="treatment-card">
              <div className="treatment-card-header">
                <h3>{treatment.treatment_type_name}</h3>
                <div className="treatment-badges">
                  <span className={`badge ${getStatusBadgeClass(treatment.status)}`}>
                    {treatment.status_display}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(treatment.priority)}`}>
                    {treatment.priority}
                  </span>
                </div>
              </div>

              <div className="treatment-details">
                <div className="detail-row">
                  <span className="label">Patient:</span>
                  <span>{treatment.patient_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Eye:</span>
                  <span>{treatment.eye_treated_display}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Surgeon:</span>
                  <span>{treatment.primary_surgeon_name}</span>
                </div>
                {treatment.scheduled_date && (
                  <div className="detail-row">
                    <span className="label">Scheduled:</span>
                    <span>{new Date(treatment.scheduled_date).toLocaleString()}</span>
                  </div>
                )}
                {treatment.actual_start_time && (
                  <div className="detail-row">
                    <span className="label">Started:</span>
                    <span>{new Date(treatment.actual_start_time).toLocaleString()}</span>
                  </div>
                )}
                {treatment.duration_minutes && (
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span>{treatment.duration_minutes} minutes</span>
                  </div>
                )}
                {treatment.outcome !== 'pending' && (
                  <div className="detail-row">
                    <span className="label">Outcome:</span>
                    <span className={`outcome-${treatment.outcome}`}>
                      {treatment.outcome_display}
                    </span>
                  </div>
                )}
              </div>

              <div className="treatment-actions">
                {treatment.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartTreatment(treatment.id)}
                    className="btn btn-small btn-success"
                  >
                    Start Treatment
                  </button>
                )}
                
                {treatment.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      const outcome = prompt('Enter treatment outcome (excellent/good/satisfactory/poor/failed):');
                      if (outcome) {
                        handleCompleteTreatment(treatment.id, { outcome });
                      }
                    }}
                    className="btn btn-small btn-primary"
                  >
                    Complete Treatment
                  </button>
                )}

                {['planned', 'scheduled'].includes(treatment.status) && (
                  <button
                    onClick={() => setEditingTreatment(treatment)}
                    className="btn btn-small btn-secondary"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => navigate(`/treatments/${treatment.id}`)}
                  className="btn btn-small btn-info"
                >
                  View Details
                </button>
              </div>

              {treatment.indication && (
                <div className="treatment-indication">
                  <strong>Indication:</strong> {treatment.indication}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentPage;