import React from 'react';
import { Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';

const PatientDashboard = () => {
  const { selectedPatient, clearSelectedPatient } = usePatient();

  if (!selectedPatient) {
    return null;
  }

  const patientActions = [
    // Consultations
    {
      title: 'Consultations',
      description: 'Manage appointments and consultations for this patient',
      icon: '📋',
      links: [
        { path: `/patient/${selectedPatient.id}/consultations`, label: 'View Consultations' },
        { path: `/consultations/add`, label: 'Add Consultation' },
        { path: `/patient/${selectedPatient.id}/appointments/add`, label: 'Book Appointment' },
        { path: `/patient/${selectedPatient.id}/diagnoses/add`, label: 'Add Diagnosis' },
        { path: `/patient/${selectedPatient.id}/treatments/add`, label: 'Add Treatment' }
      ]
    },
    
    // Eye Tests
    {
      title: 'Eye Tests',
      description: 'Manage eye examinations and tests for this patient',
      icon: '👁️',
      links: [
        { path: `/patient/${selectedPatient.id}/eye-tests`, label: 'View Eye Tests' },
        { path: `/patient/${selectedPatient.id}/eye-tests/visual-acuity/add`, label: 'Visual Acuity Test' },
        { path: `/patient/${selectedPatient.id}/eye-tests/refraction/add`, label: 'Refraction Test' },
        { path: `/patient/${selectedPatient.id}/eye-tests/tonometry/add`, label: 'Tonometry Test' },
        { path: `/patient/${selectedPatient.id}/eye-tests/ophthalmoscopy/add`, label: 'Ophthalmoscopy' },
        { path: `/patient/${selectedPatient.id}/eye-tests/slit-lamp/add`, label: 'Slit Lamp Exam' },
        { path: `/patient/${selectedPatient.id}/eye-tests/visual-field/add`, label: 'Visual Field Test' },
        { path: `/patient/${selectedPatient.id}/eye-tests/oct/add`, label: 'OCT Scan' },
        { path: `/patient/${selectedPatient.id}/eye-tests/fluorescein/add`, label: 'Fluorescein Angiography' }
      ]
    },
    
    // Medications
    {
      title: 'Medications',
      description: 'Manage medications and prescriptions for this patient',
      icon: '💊',
      links: [
        { path: `/patient/${selectedPatient.id}/medications`, label: 'View Medications' },
        { path: `/patient/${selectedPatient.id}/prescriptions/add`, label: 'Add Prescription' },
        { path: `/patient/${selectedPatient.id}/medications/history`, label: 'Medication History' }
      ]
    }
  ];

  return (
    <div className="patient-dashboard">
      <div className="selected-patient-header">
        <div className="selected-patient-info">
          <div className="selected-patient-avatar">
            {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
          </div>
          <div className="selected-patient-details">
            <h2>{selectedPatient.first_name} {selectedPatient.last_name}</h2>
            <div className="selected-patient-meta">
              <span>ID: {selectedPatient.patient_id}</span>
              <span>DOB: {selectedPatient.date_of_birth}</span>
              <span>Age: {selectedPatient.age || 'N/A'}</span>
              <span>Phone: {selectedPatient.phone}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearSelectedPatient}
          className="btn btn-secondary change-patient-btn"
        >
          Change Patient
        </button>
      </div>
      
      <div className="patient-actions-grid">
        {patientActions.map((section, index) => (
          <div key={index} className="patient-action-card">
            <div className="patient-action-header">
              <span className="patient-action-icon">{section.icon}</span>
              <h3>{section.title}</h3>
            </div>
            <p className="patient-action-description">{section.description}</p>
            <div className="patient-action-links">
              {section.links.map((link, linkIndex) => (
                <Link 
                  key={linkIndex} 
                  to={link.path} 
                  className="patient-action-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;