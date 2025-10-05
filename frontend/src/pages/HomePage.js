import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const navigationCards = [
    // Patient Management
    {
      title: 'Patients',
      description: 'Manage patient records and information',
      icon: '👥',
      links: [
        { path: '/patients', label: 'View Patients' },
        { path: '/patients/add', label: 'Add Patient' },
        { path: '/patients/insurance/add', label: 'Add Insurance' },
        { path: '/patients/emergency-contact/add', label: 'Add Emergency Contact' },
        { path: '/patients/medical-history/add', label: 'Add Medical History' }
      ]
    },
    
    // Staff Management
    {
      title: 'Staff',
      description: 'Manage hospital staff and users',
      icon: '🏥',
      links: [
        { path: '/staff', label: 'View Staff' },
        { path: '/staff/add', label: 'Add Staff Member' },
        { path: '/specializations/add', label: 'Add Specialization' },
        { path: '/staff/schedule/add', label: 'Add Schedule' }
      ]
    },
    
    // Medications
    {
      title: 'Medications',
      description: 'Manage medications and pharmacy',
      icon: '💊',
      links: [
        { path: '/medications', label: 'View Medications' },
        { path: '/medications/add', label: 'Add Medication' },
        { path: '/manufacturers/add', label: 'Add Manufacturer' },
        { path: '/medication-categories/add', label: 'Add Category' },
        { path: '/inventory/add', label: 'Add Inventory' },
        { path: '/prescriptions/add', label: 'Add Prescription' }
      ]
    },
    
    // Consultations
    {
      title: 'Consultations',
      description: 'Manage appointments and consultations',
      icon: '📋',
      links: [
        { path: '/consultations', label: 'View Consultations' },
        { path: '/consultations/add', label: 'Add Consultation' },
        { path: '/appointments/add', label: 'Add Appointment' },
        { path: '/diagnoses/add', label: 'Add Diagnosis' },
        { path: '/treatments/add', label: 'Add Treatment' },
        { path: '/surgeries/add', label: 'Add Surgery' }
      ]
    },
    
    // Eye Tests
    {
      title: 'Eye Tests',
      description: 'Manage eye examinations and tests',
      icon: '👁️',
      links: [
        { path: '/eye-tests', label: 'View Eye Tests' },
        { path: '/eye-tests/visual-acuity/add', label: 'Visual Acuity Test' },
        { path: '/eye-tests/refraction/add', label: 'Refraction Test' },
        { path: '/eye-tests/tonometry/add', label: 'Tonometry Test' },
        { path: '/eye-tests/ophthalmoscopy/add', label: 'Ophthalmoscopy' },
        { path: '/eye-tests/slit-lamp/add', label: 'Slit Lamp Exam' },
        { path: '/eye-tests/visual-field/add', label: 'Visual Field Test' },
        { path: '/eye-tests/oct/add', label: 'OCT Scan' },
        { path: '/eye-tests/fluorescein/add', label: 'Fluorescein Angiography' }
      ]
    },
    
    // Audit & Reports
    {
      title: 'Audit & Reports',
      description: 'View audit logs and generate reports',
      icon: '📊',
      links: [
        { path: '/audit', label: 'View Audit Logs' },
        { path: '/reports/patient-medications', label: 'Patient Medications Report' },
        { path: '/reports/drug-audit', label: 'Drug Audit Report' },
        { path: '/reports/patient-visits', label: 'Patient Visits Report' }
      ]
    }
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to PreciseOptics</h1>
        <p>Eye Hospital Management System Dashboard</p>
      </div>
      
      <div className="navigation-grid">
        {navigationCards.map((card, index) => (
          <div key={index} className="nav-card">
            <div className="nav-card-header">
              <span className="nav-card-icon">{card.icon}</span>
              <h3>{card.title}</h3>
            </div>
            <p className="nav-card-description">{card.description}</p>
            <div className="nav-card-links">
              {card.links.map((link, linkIndex) => (
                <Link 
                  key={linkIndex} 
                  to={link.path} 
                  className="nav-link"
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

export default HomePage;