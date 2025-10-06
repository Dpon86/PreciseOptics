import React from 'react';
import { useNavigate } from 'react-router-dom';

const SystemPage = () => {
  const navigate = useNavigate();

  const systemModules = [
    {
      id: 'manage-staff',
      title: 'Manage Staff',
      description: 'View and manage all staff members, their roles, and permissions',
      icon: 'fas fa-users',
      route: '/staff',
      color: 'blue'
    },
    {
      id: 'add-staff',
      title: 'Add Staff Member',
      description: 'Add new staff members to the system with complete profiles',
      icon: 'fas fa-user-plus',
      route: '/staff/add',
      color: 'green'
    },
    {
      id: 'specializations',
      title: 'Add Specialization',
      description: 'Manage medical specializations and departments',
      icon: 'fas fa-stethoscope',
      route: '/specializations',
      color: 'purple'
    },
    {
      id: 'forms-overview',
      title: 'Forms Overview',
      description: 'View and manage all system forms and templates',
      icon: 'fas fa-file-alt',
      route: '/forms-overview',
      color: 'orange'
    }
  ];

  const handleModuleClick = (route) => {
    navigate(route);
  };

  return (
    <div className="system-page">
      <div className="page-header">
        <h1>
          <i className="fas fa-cogs"></i>
          System Administration
        </h1>
        <p>Manage system settings, users, and administrative functions</p>
      </div>

      <div className="system-modules-grid">
        {systemModules.map(module => (
          <div
            key={module.id}
            className={`system-module-card ${module.color}`}
            onClick={() => handleModuleClick(module.route)}
          >
            <div className="module-icon">
              <i className={module.icon}></i>
            </div>
            <div className="module-content">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
            <div className="module-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="system-info">
        <div className="info-section">
          <h3>
            <i className="fas fa-info-circle"></i>
            System Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Application:</span>
              <span className="info-value">PreciseOptics</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Environment:</span>
              <span className="info-value">Development</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">October 2025</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>
            <i className="fas fa-shield-alt"></i>
            Security & Access
          </h3>
          <div className="security-info">
            <div className="security-item">
              <i className="fas fa-check-circle text-success"></i>
              <span>User authentication enabled</span>
            </div>
            <div className="security-item">
              <i className="fas fa-check-circle text-success"></i>
              <span>Role-based access control</span>
            </div>
            <div className="security-item">
              <i className="fas fa-check-circle text-success"></i>
              <span>Audit logging active</span>
            </div>
            <div className="security-item">
              <i className="fas fa-check-circle text-success"></i>
              <span>Data encryption enabled</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .system-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .page-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 2.5rem;
        }

        .page-header h1 i {
          margin-right: 10px;
          color: #3498db;
        }

        .page-header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .system-modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .system-module-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .system-module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .system-module-card.blue {
          border-left-color: #3498db;
        }

        .system-module-card.green {
          border-left-color: #2ecc71;
        }

        .system-module-card.purple {
          border-left-color: #9b59b6;
        }

        .system-module-card.orange {
          border-left-color: #f39c12;
        }

        .module-icon {
          flex-shrink: 0;
        }

        .module-icon i {
          font-size: 2.5rem;
          color: inherit;
        }

        .system-module-card.blue .module-icon i {
          color: #3498db;
        }

        .system-module-card.green .module-icon i {
          color: #2ecc71;
        }

        .system-module-card.purple .module-icon i {
          color: #9b59b6;
        }

        .system-module-card.orange .module-icon i {
          color: #f39c12;
        }

        .module-content {
          flex-grow: 1;
        }

        .module-content h3 {
          color: #2c3e50;
          margin: 0 0 8px 0;
          font-size: 1.3rem;
        }

        .module-content p {
          color: #7f8c8d;
          margin: 0;
          line-height: 1.5;
        }

        .module-arrow {
          flex-shrink: 0;
          color: #bdc3c7;
          font-size: 1.2rem;
        }

        .system-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .info-section {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .info-section h3 {
          color: #2c3e50;
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-section h3 i {
          color: #3498db;
        }

        .info-grid {
          display: grid;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ecf0f1;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #7f8c8d;
          font-weight: 500;
        }

        .info-value {
          color: #2c3e50;
          font-weight: 600;
        }

        .security-info {
          display: grid;
          gap: 12px;
        }

        .security-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .security-item i {
          font-size: 1.1rem;
        }

        .text-success {
          color: #27ae60 !important;
        }

        .security-item span {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .system-modules-grid {
            grid-template-columns: 1fr;
          }
          
          .system-module-card {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          
          .system-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemPage;