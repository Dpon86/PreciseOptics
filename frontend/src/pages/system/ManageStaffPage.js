import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ManageStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    specialization: '',
    user_type: ''
  });
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, specRes, userTypesRes, statsRes] = await Promise.all([
        api.getDepartments(),
        api.getSpecializations(),
        api.getUserTypes(),
        api.getStaffStatistics()
      ]);
      
      setDepartments(deptRes.data || []);
      setSpecializations(specRes.data || []);
      setUserTypes(userTypesRes.data || []);
      setStatistics(statsRes.data || {});
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    }
  };

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await api.getStaff(cleanFilters);
      setStaff(response.data?.results || response.data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await api.deleteStaff(id);
      setStaff(prevStaff => prevStaff.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member');
    }
  };

  const getDepartmentLabel = (value) => {
    const dept = departments.find(d => d.value === value);
    return dept ? dept.label : value;
  };

  const getSpecializationLabel = (value) => {
    const spec = specializations.find(s => s.value === value);
    return spec ? spec.label : value;
  };

  const getUserTypeLabel = (value) => {
    const type = userTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  return (
    <div className="manage-staff-container">
      <div className="page-header">
        <h1>Manage Staff</h1>
        <p>View and manage all staff members in the system</p>
        
        <div className="header-actions">
          <Link to="/staff/add" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Add New Staff Member
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-number">{statistics.total_staff || 0}</div>
            <div className="stat-label">Total Staff</div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.doctors || 0}</div>
            <div className="stat-label">Doctors</div>
            <div className="stat-icon">👨‍⚕️</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.nurses || 0}</div>
            <div className="stat-label">Nurses</div>
            <div className="stat-icon">👩‍⚕️</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.consultants || 0}</div>
            <div className="stat-label">Consultants</div>
            <div className="stat-icon">🩺</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3>Filter Staff</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              name="specialization"
              value={filters.specialization}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="user_type">User Type</label>
            <select
              id="user_type"
              name="user_type"
              value={filters.user_type}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Types</option>
              {userTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading staff members...</p>
        </div>
      )}

      {/* Staff Table */}
      {!loading && !error && (
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Employee ID</th>
                <th>User Type</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>License</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="staff-photo">
                        {member.user_details?.profile_picture ? (
                          <img 
                            src={member.user_details.profile_picture} 
                            alt={`${member.user_details.first_name} ${member.user_details.last_name}`}
                            className="profile-image"
                          />
                        ) : (
                          <div className="profile-placeholder">
                            {member.user_details?.first_name?.[0]}{member.user_details?.last_name?.[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="staff-name">
                        <strong>
                          {member.user_details?.first_name} {member.user_details?.last_name}
                        </strong>
                        <div className="staff-email">{member.user_details?.email}</div>
                      </div>
                    </td>
                    <td>{member.user_details?.employee_id || 'N/A'}</td>
                    <td>
                      <span className={`user-type-badge ${member.user_details?.user_type}`}>
                        {getUserTypeLabel(member.user_details?.user_type)}
                      </span>
                    </td>
                    <td>{getDepartmentLabel(member.department)}</td>
                    <td>{member.specialization ? getSpecializationLabel(member.specialization) : 'N/A'}</td>
                    <td>{member.license_number || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${member.user_details?.is_active ? 'active' : 'inactive'}`}>
                        {member.user_details?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <div className="action-btn-tooltip">
                          <Link 
                            to={`/staff/${member.id}`} 
                            className="btn btn-primary btn-sm"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <span className="tooltip-text">View Details</span>
                        </div>
                        <div className="action-btn-tooltip">
                          <Link 
                            to={`/staff/${member.id}/edit`} 
                            className="btn btn-secondary btn-sm"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <span className="tooltip-text">Edit Staff</span>
                        </div>
                        <div className="action-btn-tooltip">
                          <button 
                            onClick={() => handleDeleteStaff(member.id)}
                            className="btn btn-danger btn-sm"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <span className="tooltip-text">Delete Staff</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No staff members found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageStaffPage;