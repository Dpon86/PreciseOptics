import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigationItems = [
    {
      category: 'Dashboard',
      items: [
        { path: '/', label: 'Home', icon: '🏠' }
      ]
    },
    {
      category: 'Patient Management',
      items: [
        { path: '/patients', label: 'View Patients', icon: '👥' },
        { path: '/patients/add', label: 'Add Patient', icon: '➕' }
      ]
    },
    {
      category: 'Consultations',
      items: [
        { path: '/consultations', label: 'View Consultations', icon: '📋' },
        { path: '/consultations/add', label: 'Add Consultation', icon: '➕' }
      ]
    },
    {
      category: 'Eye Tests',
      items: [
        { path: '/eye-tests', label: 'View Eye Tests', icon: '👁️' },
        { path: '/eye-tests/visual-acuity/add', label: 'Visual Acuity Test', icon: '🔍' }
      ]
    },
    {
      category: 'Medications',
      items: [
        { path: '/medications', label: 'View Medications', icon: '💊' },
        { path: '/medications/add', label: 'Add Medication', icon: '➕' },
        { path: '/prescriptions/add', label: 'Add Prescription', icon: '📝' }
      ]
    },
    {
      category: 'Audit & Compliance',
      items: [
        { path: '/audit-logs', label: 'View Audit Logs', icon: '📊' },
        { path: '/audit-logs/add', label: 'Add Audit Entry', icon: '➕' }
      ]
    },
    {
      category: 'Overview',
      items: [
        { path: '/forms-overview', label: 'Forms Overview', icon: '📋' }
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <h3 className="nav-section-title">{section.category}</h3>
              <ul className="nav-section-items">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-item-link ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      <span className="nav-item-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      
      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        
        .sidebar {
          position: fixed;
          top: 0;
          left: -320px;
          width: 320px;
          height: 100vh;
          background: white;
          border-right: 1px solid #e9ecef;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: left 0.3s ease;
          overflow-y: auto;
        }
        
        .sidebar-open {
          left: 0;
        }
        
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        
        .sidebar-close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sidebar-close-btn:hover {
          color: #333;
          background: #e9ecef;
          border-radius: 4px;
        }
        
        .sidebar-nav {
          padding: 1rem 0;
        }
        
        .nav-section {
          margin-bottom: 1.5rem;
        }
        
        .nav-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
          margin: 0 0 0.5rem 0;
          padding: 0 1.5rem;
          letter-spacing: 0.5px;
        }
        
        .nav-section-items {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .nav-item {
          margin: 0;
        }
        
        .nav-item-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          color: #333;
          transition: all 0.2s;
        }
        
        .nav-item-link:hover {
          background: #f8f9fa;
          color: #007bff;
        }
        
        .nav-item-link.active {
          background: #e3f2fd;
          color: #1976d2;
          border-right: 3px solid #1976d2;
        }
        
        .nav-item-icon {
          margin-right: 0.75rem;
          font-size: 1.1rem;
        }
        
        .nav-item-label {
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 280px;
            left: -280px;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;