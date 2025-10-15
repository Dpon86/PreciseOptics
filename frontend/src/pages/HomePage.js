import React from 'react';
import { Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import PatientSelector from '../components/PatientSelector';
import PatientDashboard from '../components/PatientDashboard';

const HomePage = () => {
  const { selectedPatient } = usePatient();

  const globalActions = [
    // Reports Section - No patient required
    {
      title: 'Reports & Analytics',
      description: 'Generate reports and view analytics',
      icon: '📊',
      links: [
        { path: '/reports/patient-medications', label: 'Patient Medications Report' },
        { path: '/reports/drug-audit', label: 'Drug Audit Report' },
        { path: '/reports/patient-visits', label: 'Patient Visits Report' },
        { path: '/reports/eye-tests-summary', label: 'Eye Tests Summary' },
        { path: '/reports/medication-effectiveness', label: 'Medication Effectiveness' },
        { path: '/reports/revenue-analysis', label: 'Revenue Analysis' },
        { path: '/audit', label: 'Audit Logs' }
      ]
    },
    
    // Medications Management - No patient required
    {
      title: 'Medications & Inventory',
      description: 'Manage medications, inventory, and suppliers',
      icon: '💊',
      links: [
        { path: '/medications', label: 'View All Medications' },
        { path: '/medications/add', label: 'Add New Medication' },
        { path: '/manufacturers/add', label: 'Add Manufacturer' },
        { path: '/medication-categories/add', label: 'Add Category' },
        { path: '/inventory/add', label: 'Manage Inventory' }
      ]
    },
    
    // Patient Management - No patient required
    {
      title: 'Patient Management',
      description: 'Manage all patient records and information',
      icon: '👥',
      links: [
        { path: '/patients', label: 'View All Patients' },
        { path: '/patients/add', label: 'Add New Patient' },
        { path: '/patients/medical-history/add', label: 'Add Medical History' }
      ]
    },
    
    // System Management - No patient required
    {
      title: 'System Administration',
      description: 'System settings and administration',
      icon: '⚙️',
      links: [
        { path: '/staff', label: 'Manage Staff' },
        { path: '/staff/add', label: 'Add Staff Member' },
        { path: '/specializations/add', label: 'Add Specialization' },
        { path: '/forms-overview', label: 'Forms Overview' }
      ]
    }
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to PreciseOptics</h1>
        <p>Eye Hospital Management System Dashboard</p>
      </div>
      
      {/* Patient Selection Section - Always Visible */}
      <div className="patient-selection-section">
        <h2>Patient Services</h2>
        {!selectedPatient ? (
          <PatientSelector />
        ) : (
          <PatientDashboard />
        )}
      </div>
      
      {/* Global Actions - Always Available */}
      <div className="global-actions-section">
        <h2>General Management</h2>
        <div className="global-actions-grid">
          {globalActions.map((section, index) => (
            <div key={index} className="global-action-card">
              <div className="global-action-header">
                <span className="global-action-icon">{section.icon}</span>
                <h3>{section.title}</h3>
              </div>
              <p className="global-action-description">{section.description}</p>
              <div className="global-action-links">
                {section.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex} 
                    to={link.path} 
                    className="global-action-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;