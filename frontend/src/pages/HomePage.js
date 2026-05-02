import React from 'react';
import { Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import PatientSelector from '../components/PatientSelector';
import PatientDashboard from '../components/PatientDashboard';
import HealthWidget from '../components/HealthWidget';
import DashboardStats from '../components/DashboardStats';
import ConditionWidgets from '../components/ConditionWidgets';

const HomePage = () => {
  const { selectedPatient } = usePatient();

  const globalActions = [
    // Reports Section - No patient required
    {
      title: 'Reports & Analytics',
      description: 'Generate reports and view analytics',
      icon: '📊',
      links: [
        { path: '/reports/diseases', label: 'Disease-Specific Reports' },
        { path: '/reports/treatment-effectiveness', label: 'Treatment Effectiveness' },
        { path: '/reports/patient-medications', label: 'Patient Medications' },
        { path: '/reports/drug-audit', label: 'Drug Audit Report' },
        { path: '/reports/condition-prevalence', label: 'Condition Prevalence' },
        { path: '/reports/condition-outcomes', label: 'Condition Outcomes' },
        { path: '/reports/protocol-adherence', label: 'Protocol Adherence' },
        { path: '/reports/referral-sources', label: 'Referral Source Analysis' },
        { path: '/audit-logs', label: 'Audit Logs' }
      ]
    },
    
    // Conditions Management - No patient required
    {
      title: 'Conditions Management',
      description: 'Track and manage patient conditions by disease',
      icon: '🏥',
      links: [
        { path: '/conditions', label: 'View All Conditions' },
        { path: '/patients', label: 'Patient Conditions (Select Patient)' },
        { path: '/reports/diseases', label: 'Disease-Specific Reports' },
        { path: '/reports/condition-prevalence', label: 'Prevalence Report' },
        { path: '/reports/condition-outcomes', label: 'Outcomes Report' }
      ]
    },
    
    // Protocols - No patient required
    {
      title: 'Treatment Protocols',
      description: 'Manage clinical protocols and procedures',
      icon: '📋',
      links: [
        { path: '/protocols', label: 'View All Protocols' },
        { path: '/protocols/builder', label: 'Protocol Builder' },
        { path: '/protocols/add', label: 'Create Protocol' },
        { path: '/reports/protocol-adherence', label: 'Protocol Adherence Report' }
      ]
    },
    
    // Referrals Management
    {
      title: 'Referral Management',
      description: 'Manage incoming and outgoing patient referrals',
      icon: '🔄',
      links: [
        { path: '/referrals', label: 'View All Referrals' },
        { path: '/referrals/create', label: 'Create Referral' },
        { path: '/referral-sources', label: 'Manage Sources' },
        { path: '/referral-sources/add', label: 'Add Referral Source' },
        { path: '/reports/referral-sources', label: 'Referral Analytics' }
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
        { path: '/medications/recalls', label: 'Medication Recall Centre' },
        { path: '/reports/batch-tracking', label: 'Batch Tracking Report' }
      ]
    },
    
    // Alerts & Monitoring
    {
      title: 'Alerts & Monitoring',
      description: 'Monitor appointments, follow-ups, and system alerts',
      icon: '🔔',
      links: [
        { path: '/alerts', label: 'Alert Centre' },
        { path: '/alerts/followup', label: 'Follow-up Alerts' },
        { path: '/alerts/return-due', label: 'Return Due Alerts' }
      ]
    },
    
    // Patient Management - No patient required
    {
      title: 'Patient Management',
      description: 'Manage all patient records and information',
      icon: '👥',
      links: [
        { path: '/patients', label: 'View All Patients' },
        { path: '/patients/add', label: 'Add New Patient' }
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
      
      {/* Patient Selection Section */}
      <div className="patient-selection-section">
        <h2>Patient Services</h2>
        {!selectedPatient ? (
          <PatientSelector />
        ) : (
          <PatientDashboard />
        )}
      </div>
      
      {/* System Overview Statistics */}
      <DashboardStats />
      
      {/* Condition-Specific Metrics - Compact View */}
      <div className="compact-section">
        <ConditionWidgets compact={true} />
      </div>
      
      {/* Global Actions - General Management */}
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
      
      {/* System Health Widget - At Bottom */}
      <div className="system-health-section">
        <HealthWidget />
      </div>
    </div>
  );
};

export default HomePage;