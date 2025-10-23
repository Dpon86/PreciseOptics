import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditStaffPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  const [formData, setFormData] = useState({
    // User Information
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: '',
    employee_id: '',
    phone_number: '',
    date_of_birth: '',
    is_active: true,
    
    // Staff Profile Information
    department: '',
    specialization: '',
    license_number: '',
    qualification: '',
    years_of_experience: 0,
    consultation_fee: '',
    emergency_contact: '',
    address: '',
    hire_date: '',
    is_consultant: false,
    can_prescribe: false
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes, specRes, userTypesRes] = await Promise.all([
        api.getStaffMember(id),
        api.getDepartments(),
        api.getSpecializations(),
        api.getUserTypes()
      ]);

      const staffData = staffRes.data;
      
      setFormData({
        // User data
        username: staffData.user_details?.username || '',
        email: staffData.user_details?.email || '',
        first_name: staffData.user_details?.first_name || '',
        last_name: staffData.user_details?.last_name || '',
        user_type: staffData.user_details?.user_type || '',
        employee_id: staffData.user_details?.employee_id || '',
        phone_number: staffData.user_details?.phone_number || '',
        date_of_birth: staffData.user_details?.date_of_birth || '',
        is_active: staffData.user_details?.is_active !== false,
        
        // Staff profile data
        department: staffData.department || '',
        specialization: staffData.specialization || '',
        license_number: staffData.license_number || '',
        qualification: staffData.qualification || '',
        years_of_experience: staffData.years_of_experience || 0,
        consultation_fee: staffData.consultation_fee || '',
        emergency_contact: staffData.emergency_contact || '',
        address: staffData.address || '',
        hire_date: staffData.hire_date || '',
        is_consultant: staffData.is_consultant || false,
        can_prescribe: staffData.can_prescribe || false
      });

      setDepartments(deptRes.data || []);
      setSpecializations(specRes.data || []);
      setUserTypes(userTypesRes.data || []);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff member details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare the update data
      const updateData = {
        user_details: {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: formData.user_type,
          employee_id: formData.employee_id,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          is_active: formData.is_active
        },
        department: formData.department,
        specialization: formData.specialization,
        license_number: formData.license_number,
        qualification: formData.qualification,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        emergency_contact: formData.emergency_contact,
        address: formData.address,
        hire_date: formData.hire_date,
        is_consultant: formData.is_consultant,
        can_prescribe: formData.can_prescribe
      };

      await api.updateStaff(id, updateData);
      setSuccess('Staff member updated successfully!');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/staff/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating staff member:', err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        setError(errorMessages);
      } else {
        setError('Failed to update staff member. Please try again.');
      }
    } finally {
      setSaving(false);
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

  return (
    <div className="add-staff-container">
      <div className="page-header">
        <h1>Edit Staff Member</h1>
        <p>Update staff account and profile information</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="staff-form">
          
          {/* User Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <i className="fas fa-user"></i>
              User Information
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="user_type">User Type *</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select User Type</option>
                  {userTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employee_id">Employee ID *</label>
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+44 1234 567890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Active Account</span>
                </label>
              </div>
            </div>
          </div>

          {/* Staff Profile Section */}
          <div className="form-section">
            <h2 className="section-title">
              <i className="fas fa-user-md"></i>
              Professional Information
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="license_number">License Number</label>
                <input
                  type="text"
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="GMC123456"
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualification">Qualification</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="MBBS, MD, FRCOphth"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="years_of_experience">Years of Experience</label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultation_fee">Consultation Fee (£)</label>
                <input
                  type="number"
                  id="consultation_fee"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="150.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact">Emergency Contact</label>
                <input
                  type="tel"
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+44 1234 567890"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                  placeholder="123 Medical Street, London, UK"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_consultant"
                    checked={formData.is_consultant}
                    onChange={handleChange}
                  />
                  <span>Is Consultant</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="can_prescribe"
                    checked={formData.can_prescribe}
                    onChange={handleChange}
                  />
                  <span>Can Prescribe Medications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating Staff Member...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Staff Member
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/staff/${id}`)}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffPage;
