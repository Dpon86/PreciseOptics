import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddStaffPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    user_type: 'doctor',
    employee_id: '',
    phone_number: '',
    date_of_birth: '',
    password: '',
    password_confirm: '',
    
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
    can_prescribe: false,
    can_perform_surgery: false,
    
    // Availability Schedule (simplified for now)
    availability_schedule: {}
  });

  useEffect(() => {
    fetchLookupData();
  }, []);

  const fetchLookupData = async () => {
    try {
      const [deptRes, specRes, userTypesRes] = await Promise.all([
        api.getDepartments(),
        api.getSpecializations(),
        api.getUserTypes()
      ]);
      
      setDepartments(deptRes.data || []);
      setSpecializations(specRes.data || []);
      setUserTypes(userTypesRes.data || []);
    } catch (err) {
      console.error('Error fetching lookup data:', err);
      setError('Failed to load form data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields validation
    if (!formData.username) errors.push('Username is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.first_name) errors.push('First name is required');
    if (!formData.last_name) errors.push('Last name is required');
    if (!formData.employee_id) errors.push('Employee ID is required');
    if (!formData.department) errors.push('Department is required');
    if (!formData.password) errors.push('Password is required');
    if (!formData.password_confirm) errors.push('Password confirmation is required');
    
    // Password validation
    if (formData.password !== formData.password_confirm) {
      errors.push('Passwords do not match');
    }
    
    if (formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
      };
      
      await api.createStaff(submitData);
      setSuccess('Staff member added successfully!');
      
      // Reset form or redirect
      setTimeout(() => {
        navigate('/staff');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding staff member:', err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        setError(errorMessages);
      } else {
        setError('Failed to add staff member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-staff-container">
      <div className="page-header">
        <h1>Add New Staff Member</h1>
        <p>Create a new staff account with profile information</p>
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
            <h3>User Account Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="user_type" className="form-label">
                  User Type <span className="required">*</span>
                </label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {userTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employee_id" className="form-label">
                  Employee ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="form-section">
            <h3>Account Security</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter password (min 8 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm" className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="department" className="form-label">
                  Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="specialization" className="form-label">Specialization</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select specialization</option>
                  {specializations.map(spec => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="license_number" className="form-label">License Number</label>
                <input
                  type="text"
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter professional license number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="years_of_experience" className="form-label">Years of Experience</label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultation_fee" className="form-label">Consultation Fee ($)</label>
                <input
                  type="number"
                  id="consultation_fee"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="Enter consultation fee"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hire_date" className="form-label">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="qualification" className="form-label">Qualifications</label>
              <textarea
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Enter qualifications, certifications, and education background"
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergency_contact" className="form-label">Emergency Contact</label>
                <input
                  type="tel"
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Enter full address"
              />
            </div>
          </div>

          {/* Permissions Section */}
          <div className="form-section">
            <h3>Permissions & Access</h3>
            <div className="permissions-grid">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_consultant"
                    checked={formData.is_consultant}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Is Consultant</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="can_prescribe"
                    checked={formData.can_prescribe}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Can Prescribe Medications</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="can_perform_surgery"
                    checked={formData.can_perform_surgery}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Can Perform Surgery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Adding Staff Member...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Add Staff Member
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/staff')}
            >
              <i className="fas fa-arrow-left"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffPage;