import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './PatientDetailPage.css';

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const patientResponse = await api.getPatient(patientId);
      setPatient(patientResponse.data);

      // Fetch recent consultations
      try {
        const consultationsResponse = await api.getConsultations();
        const patientConsultations = (consultationsResponse.data.results || consultationsResponse.data)
          .filter(c => c.patient === patientId)
          .slice(0, 5);
        setRecentConsultations(patientConsultations);
      } catch (err) {
        console.log('Could not fetch consultations:', err);
      }

      // Fetch recent eye tests
      try {
        const visualAcuityResponse = await api.getVisualAcuityTests();
        const glaucomaResponse = await api.getGlaucomaAssessments();
        
        const allTests = [
          ...(visualAcuityResponse.data.results || visualAcuityResponse.data || []).map(t => ({...t, type: 'Visual Acuity'})),
          ...(glaucomaResponse.data.results || glaucomaResponse.data || []).map(t => ({...t, type: 'Glaucoma'}))
        ].filter(t => t.patient === patientId)
          .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
          .slice(0, 5);
        
        setRecentTests(allTests);
      } catch (err) {
        console.log('Could not fetch eye tests:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient details');
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatGender = (gender) => {
    const genderMap = {
      'M': 'Male',
      'F': 'Female',
      'O': 'Other',
      'N': 'Prefer not to say'
    };
    return genderMap[gender] || gender;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="page-container">
        <div className="error-message">{error || 'Patient not found'}</div>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="page-container patient-detail">
      {/* Header Section */}
      <div className="patient-header">
        <div className="patient-header-left">
          <div className="patient-avatar">
            <span className="avatar-initials">
              {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
            </span>
          </div>
          <div className="patient-header-info">
            <h1>{patient.first_name} {patient.middle_name} {patient.last_name}</h1>
            <div className="patient-meta">
              <span className="badge badge-info">ID: {patient.patient_id}</span>
              {patient.nhs_number && (
                <span className="badge badge-secondary">NHS: {patient.nhs_number}</span>
              )}
              <span className={`badge ${patient.is_active ? 'badge-success' : 'badge-danger'}`}>
                {patient.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="patient-header-actions">
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-primary">
            Edit Patient
          </Link>
          <Link to={`/patient/${patient.id}/consultations/add`} className="btn btn-success">
            New Consultation
          </Link>
          <button onClick={() => navigate('/patients')} className="btn btn-secondary">
            Back to Patients
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Age</div>
            <div className="stat-value">{calculateAge(patient.date_of_birth)} years</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚧</div>
          <div className="stat-content">
            <div className="stat-label">Gender</div>
            <div className="stat-value">{formatGender(patient.gender)}</div>
          </div>
        </div>
        {patient.blood_group && (
          <div className="stat-card">
            <div className="stat-icon">🩸</div>
            <div className="stat-content">
              <div className="stat-label">Blood Group</div>
              <div className="stat-value">{patient.blood_group}</div>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Registered</div>
            <div className="stat-value">
              {new Date(patient.registration_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact & Address
          </button>
          <button 
            className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            Medical Information
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Recent Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <div className="info-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-rows">
                  <div className="info-row">
                    <label>Full Name:</label>
                    <span>{patient.first_name} {patient.middle_name} {patient.last_name}</span>
                  </div>
                  <div className="info-row">
                    <label>Date of Birth:</label>
                    <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <label>Age:</label>
                    <span>{calculateAge(patient.date_of_birth)} years old</span>
                  </div>
                  <div className="info-row">
                    <label>Gender:</label>
                    <span>{formatGender(patient.gender)}</span>
                  </div>
                  {patient.blood_group && (
                    <div className="info-row">
                      <label>Blood Group:</label>
                      <span>{patient.blood_group}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-rows">
                  <div className="info-row">
                    <label>Primary Phone:</label>
                    <span>{patient.phone_number}</span>
                  </div>
                  {patient.alternate_phone && (
                    <div className="info-row">
                      <label>Alternate Phone:</label>
                      <span>{patient.alternate_phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="info-row">
                      <label>Email:</label>
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Insurance Information</h3>
                <div className="info-rows">
                  {patient.nhs_number && (
                    <div className="info-row">
                      <label>NHS Number:</label>
                      <span>{patient.nhs_number}</span>
                    </div>
                  )}
                  {patient.insurance_provider && (
                    <>
                      <div className="info-row">
                        <label>Insurance Provider:</label>
                        <span>{patient.insurance_provider}</span>
                      </div>
                      <div className="info-row">
                        <label>Insurance Number:</label>
                        <span>{patient.insurance_number}</span>
                      </div>
                    </>
                  )}
                  {!patient.insurance_provider && !patient.nhs_number && (
                    <div className="info-row">
                      <span className="text-muted">No insurance information available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Emergency Contact</h3>
                <div className="info-rows">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{patient.emergency_contact_name}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone:</label>
                    <span>{patient.emergency_contact_phone}</span>
                  </div>
                  <div className="info-row">
                    <label>Relationship:</label>
                    <span>{patient.emergency_contact_relationship}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Address Tab */}
        {activeTab === 'contact' && (
          <div className="tab-panel">
            <div className="info-grid">
              <div className="info-card full-width">
                <h3>Contact Details</h3>
                <div className="info-rows">
                  <div className="info-row">
                    <label>Primary Phone:</label>
                    <span className="contact-value">
                      <a href={`tel:${patient.phone_number}`}>{patient.phone_number}</a>
                    </span>
                  </div>
                  {patient.alternate_phone && (
                    <div className="info-row">
                      <label>Alternate Phone:</label>
                      <span className="contact-value">
                        <a href={`tel:${patient.alternate_phone}`}>{patient.alternate_phone}</a>
                      </span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="info-row">
                      <label>Email:</label>
                      <span className="contact-value">
                        <a href={`mailto:${patient.email}`}>{patient.email}</a>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Address</h3>
                <div className="address-display">
                  <p>{patient.address_line_1}</p>
                  {patient.address_line_2 && <p>{patient.address_line_2}</p>}
                  <p>{patient.city}, {patient.state}</p>
                  <p>{patient.postal_code}</p>
                  <p>{patient.country}</p>
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Emergency Contact</h3>
                <div className="info-rows">
                  <div className="info-row">
                    <label>Contact Name:</label>
                    <span>{patient.emergency_contact_name}</span>
                  </div>
                  <div className="info-row">
                    <label>Relationship:</label>
                    <span>{patient.emergency_contact_relationship}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone Number:</label>
                    <span className="contact-value">
                      <a href={`tel:${patient.emergency_contact_phone}`}>
                        {patient.emergency_contact_phone}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Information Tab */}
        {activeTab === 'medical' && (
          <div className="tab-panel">
            <div className="info-grid">
              <div className="info-card full-width">
                <h3>Allergies</h3>
                <div className="medical-info">
                  {patient.allergies ? (
                    <p className="medical-text">{patient.allergies}</p>
                  ) : (
                    <p className="text-muted">No known allergies recorded</p>
                  )}
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Current Medications</h3>
                <div className="medical-info">
                  {patient.current_medications ? (
                    <p className="medical-text">{patient.current_medications}</p>
                  ) : (
                    <p className="text-muted">No current medications recorded</p>
                  )}
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Medical History</h3>
                <div className="medical-info">
                  {patient.medical_history ? (
                    <p className="medical-text">{patient.medical_history}</p>
                  ) : (
                    <p className="text-muted">No medical history recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className="tab-panel">
            <div className="activity-section">
              <h3>Recent Consultations</h3>
              {recentConsultations.length > 0 ? (
                <div className="activity-list">
                  {recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="activity-item">
                      <div className="activity-icon">📋</div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {consultation.consultation_type_display || consultation.consultation_type}
                        </div>
                        <div className="activity-meta">
                          {new Date(consultation.scheduled_time).toLocaleString()}
                        </div>
                      </div>
                      <Link 
                        to={`/consultations/${consultation.id}`} 
                        className="btn btn-sm btn-link"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recent consultations</p>
              )}
              <Link 
                to={`/patient/${patient.id}/consultations`} 
                className="btn btn-secondary mt-3"
              >
                View All Consultations
              </Link>
            </div>

            <div className="activity-section mt-4">
              <h3>Recent Eye Tests</h3>
              {recentTests.length > 0 ? (
                <div className="activity-list">
                  {recentTests.map((test) => (
                    <div key={test.id} className="activity-item">
                      <div className="activity-icon">👁️</div>
                      <div className="activity-content">
                        <div className="activity-title">{test.type} Test</div>
                        <div className="activity-meta">
                          {new Date(test.test_date).toLocaleString()}
                        </div>
                      </div>
                      <Link 
                        to={`/eye-tests/${test.id}`} 
                        className="btn btn-sm btn-link"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recent eye tests</p>
              )}
              <Link 
                to={`/patient/${patient.id}/eye-tests`} 
                className="btn btn-secondary mt-3"
              >
                View All Eye Tests
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link 
            to={`/patient/${patient.id}/consultations/add`} 
            className="quick-action-card"
          >
            <div className="action-icon">📋</div>
            <div className="action-label">New Consultation</div>
          </Link>
          <Link 
            to={`/patient/${patient.id}/eye-tests/visual-acuity/add`} 
            className="quick-action-card"
          >
            <div className="action-icon">👁️</div>
            <div className="action-label">Eye Test</div>
          </Link>
          <Link 
            to={`/patient/${patient.id}/prescriptions/add`} 
            className="quick-action-card"
          >
            <div className="action-icon">💊</div>
            <div className="action-label">New Prescription</div>
          </Link>
          <Link 
            to={`/patients/${patient.id}/records`} 
            className="quick-action-card"
          >
            <div className="action-icon">📊</div>
            <div className="action-label">View Records</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
