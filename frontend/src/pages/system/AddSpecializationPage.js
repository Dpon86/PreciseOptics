import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddSpecializationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    code: '',
    is_active: true,
    requires_certification: false,
    minimum_experience_years: 0
  });

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const [specRes, deptRes] = await Promise.all([
        api.getSpecializations(),
        api.getDepartments()
      ]);
      
      setSpecializations(specRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load existing data');
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
    
    if (!formData.name.trim()) errors.push('Specialization name is required');
    if (!formData.code.trim()) errors.push('Specialization code is required');
    
    // Check if code already exists
    if (specializations.some(spec => spec.code?.toLowerCase() === formData.code.toLowerCase())) {
      errors.push('Specialization code already exists');
    }
    
    // Check if name already exists
    if (specializations.some(spec => spec.name?.toLowerCase() === formData.name.toLowerCase())) {
      errors.push('Specialization name already exists');
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
        minimum_experience_years: parseInt(formData.minimum_experience_years) || 0,
      };
      
      await api.createSpecialization(submitData);
      setSuccess('Specialization added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        department: '',
        code: '',
        is_active: true,
        requires_certification: false,
        minimum_experience_years: 0
      });
      
      // Refresh the list
      fetchExistingData();
      
    } catch (err) {
      console.error('Error adding specialization:', err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        setError(errorMessages);
      } else {
        setError('Failed to add specialization. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialization = async (specId) => {
    if (!window.confirm('Are you sure you want to delete this specialization? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteSpecialization(specId);
      setSuccess('Specialization deleted successfully!');
      fetchExistingData();
    } catch (err) {
      console.error('Error deleting specialization:', err);
      setError('Failed to delete specialization');
    }
  };

  return (
    <div className="add-specialization-container">
      <div className="page-header">
        <h1>Manage Specializations</h1>
        <p>Add and manage medical specializations</p>
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

      <div className="content-layout">
        {/* Add New Specialization Form */}
        <div className="form-container">
          <h2>Add New Specialization</h2>
          
          <form onSubmit={handleSubmit} className="specialization-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Specialization Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., Retinal Diseases"
                />
              </div>

              <div className="form-group">
                <label htmlFor="code" className="form-label">
                  Specialization Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., RET"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department" className="form-label">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
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
                <label htmlFor="minimum_experience_years" className="form-label">
                  Minimum Experience (Years)
                </label>
                <input
                  type="number"
                  id="minimum_experience_years"
                  name="minimum_experience_years"
                  value={formData.minimum_experience_years}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  max="20"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Enter a detailed description of this specialization"
              />
            </div>

            <div className="permissions-grid">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Active Specialization</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requires_certification"
                    checked={formData.requires_certification}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Requires Special Certification</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Add Specialization
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Specializations List */}
        <div className="specializations-list">
          <h2>Existing Specializations</h2>
          
          {specializations.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-stethoscope"></i>
              <p>No specializations found</p>
            </div>
          ) : (
            <div className="specializations-grid">
              {specializations.map(spec => (
                <div key={spec.id || spec.value} className="specialization-card">
                  <div className="card-header">
                    <h4>{spec.name || spec.label}</h4>
                    <span className="spec-code">{spec.code}</span>
                  </div>
                  
                  <div className="card-body">
                    {spec.description && (
                      <p className="description">{spec.description}</p>
                    )}
                    
                    <div className="spec-details">
                      {spec.department && (
                        <div className="detail-item">
                          <i className="fas fa-building"></i>
                          <span>Department: {spec.department}</span>
                        </div>
                      )}
                      
                      {spec.minimum_experience_years > 0 && (
                        <div className="detail-item">
                          <i className="fas fa-clock"></i>
                          <span>Min. Experience: {spec.minimum_experience_years} years</span>
                        </div>
                      )}
                      
                      {spec.requires_certification && (
                        <div className="detail-item">
                          <i className="fas fa-certificate"></i>
                          <span>Certification Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <div className="status-indicators">
                      {spec.is_active !== false ? (
                        <span className="status-badge active">Active</span>
                      ) : (
                        <span className="status-badge inactive">Inactive</span>
                      )}
                    </div>
                    
                    {spec.id && (
                      <button
                        onClick={() => handleDeleteSpecialization(spec.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete specialization"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="page-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/system')}
        >
          <i className="fas fa-arrow-left"></i>
          Back to System
        </button>
      </div>
    </div>
  );
};

export default AddSpecializationPage;