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
        { path: `/patients/${selectedPatient.id}/consultations`, label: 'View Consultations' },
        { path: `/consultations/add`, label: 'Add Consultation' },
        { path: `/patients/${selectedPatient.id}/appointments/add`, label: 'Book Appointment' },
        { path: `/patients/${selectedPatient.id}/add-diagnosis`, label: 'Add Diagnosis' },
        { path: `/patients/${selectedPatient.id}/add-treatment`, label: 'Add Treatment' }
      ]
    },
    
    // Eye Tests
    {
      title: 'Eye Tests',
      description: 'Manage eye examinations and tests for this patient',
      icon: '👁️',
      links: [
        { path: `/eye-tests`, label: 'View Eye Tests' },
        { path: `/eye-tests/visual-acuity/add`, label: 'Visual Acuity Test' },
        { path: `/eye-tests/refraction/add`, label: 'Refraction Test' },
        { path: `/eye-tests/tonometry/add`, label: 'Tonometry Test' },
        { path: `/eye-tests/ophthalmoscopy/add`, label: 'Ophthalmoscopy' },
        { path: `/eye-tests/slit-lamp/add`, label: 'Slit Lamp Exam' },
        { path: `/eye-tests/visual-field/add`, label: 'Visual Field Test' },
        { path: `/eye-tests/oct/add`, label: 'OCT Scan' },
        { path: `/eye-tests/fluorescein/add`, label: 'Fluorescein Angiography' }
      ]
    },
    
    // Medications
    {
      title: 'Medications',
      description: 'Manage medications and prescriptions for this patient',
      icon: '💊',
      links: [
        { path: `/medications`, label: 'View Medications' },
        { path: `/prescriptions/add`, label: 'Add Prescription' },
        { path: `/medications`, label: 'Medication History' }
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