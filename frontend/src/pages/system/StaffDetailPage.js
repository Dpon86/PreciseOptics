import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const StaffDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getStaffMember(id);
      setStaff(response.data);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setError('Failed to load staff member details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteStaff(id);
      navigate('/staff');
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member');
    }
  };

  if (loading) {
    return (
      <div className="loading-message">
        <div className="loading-spinner"></div>
        <p>Loading staff member details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i>
        {error}
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i>
        Staff member not found
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div className="header-content">
          <button onClick={() => navigate('/staff')} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Staff List
          </button>
          <h1>Staff Member Details</h1>
          <div className="header-actions">
            <Link to={`/staff/${id}/edit`} className="btn btn-primary">
              <i className="fas fa-edit"></i> Edit Staff Member
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        {/* Personal Information */}
        <div className="info-section">
          <h2 className="section-title">
            <i className="fas fa-user"></i>
            Personal Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{staff.user_details?.first_name} {staff.user_details?.last_name}</p>
            </div>
            <div className="info-item">
              <label>Employee ID</label>
              <p>{staff.user_details?.employee_id || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{staff.user_details?.email}</p>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <p>{staff.user_details?.phone_number || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <p>{staff.user_details?.date_of_birth || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <p>
                <span className={`status-badge ${staff.user_details?.is_active ? 'active' : 'inactive'}`}>
                  {staff.user_details?.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="info-section">
          <h2 className="section-title">
            <i className="fas fa-user-md"></i>
            Professional Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>User Type</label>
              <p>
                <span className={`user-type-badge ${staff.user_details?.user_type}`}>
                  {staff.user_details?.user_type?.toUpperCase()}
                </span>
              </p>
            </div>
            <div className="info-item">
              <label>Department</label>
              <p>{staff.department || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Specialization</label>
              <p>{staff.specialization || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>License Number</label>
              <p>{staff.license_number || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Qualification</label>
              <p>{staff.qualification || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Years of Experience</label>
              <p>{staff.years_of_experience || 0} years</p>
            </div>
            <div className="info-item">
              <label>Consultation Fee</label>
              <p>{staff.consultation_fee ? `£${staff.consultation_fee}` : 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Hire Date</label>
              <p>{staff.hire_date || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Consultant Status</label>
              <p>
                <span className={`badge ${staff.is_consultant ? 'badge-success' : 'badge-secondary'}`}>
                  {staff.is_consultant ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
            <div className="info-item">
              <label>Can Prescribe</label>
              <p>
                <span className={`badge ${staff.can_prescribe ? 'badge-success' : 'badge-secondary'}`}>
                  {staff.can_prescribe ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-section">
          <h2 className="section-title">
            <i className="fas fa-address-book"></i>
            Contact Information
          </h2>
          <div className="info-grid">
            <div className="info-item full-width">
              <label>Address</label>
              <p>{staff.address || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Emergency Contact</label>
              <p>{staff.emergency_contact || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
