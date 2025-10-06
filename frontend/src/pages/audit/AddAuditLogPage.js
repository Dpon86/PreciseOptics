import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddAuditLogPage = () => {
  const [formData, setFormData] = useState({
    action: '',
    resource_name: '',
    resource_id: '',
    description: '',
    severity: 'low',
    tags: '',
    gdpr_relevant: false,
    hipaa_relevant: false,
    changes: '',
    old_values: '',
    new_values: '',
    ip_address: '',
    user_agent: '',
    request_method: 'GET',
    request_url: ''
  });
  
  // const [users, setUsers] = useState([]); // Commented out - not currently used
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const actionTypes = [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read/View' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'export', label: 'Export Data' },
    { value: 'print', label: 'Print Document' },
    { value: 'access_denied', label: 'Access Denied' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const requestMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' }
  ];

  useEffect(() => {
    fetchUsers();
    // Auto-detect user's IP address and user agent
    detectClientInfo();
  }, []);

  const fetchUsers = async () => {
    try {
      await api.get('/api/users/');
      // setUsers(response.data.results || response.data); // Commented out - users state not currently used
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const detectClientInfo = () => {
    // Get user agent
    setFormData(prev => ({
      ...prev,
      user_agent: navigator.userAgent
    }));

    // Try to get IP address (this is limited in browsers)
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          ip_address: data.ip
        }));
      })
      .catch(err => {
        console.log('Could not detect IP address:', err);
        // Fallback to localhost for development
        setFormData(prev => ({
          ...prev,
          ip_address: '127.0.0.1'
        }));
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleJsonChange = (fieldName) => (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateJson = (jsonString) => {
    if (!jsonString.trim()) return true;
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate JSON fields
    if (formData.changes && !validateJson(formData.changes)) {
      setError('Changes field must contain valid JSON');
      setLoading(false);
      return;
    }
    
    if (formData.old_values && !validateJson(formData.old_values)) {
      setError('Old values field must contain valid JSON');
      setLoading(false);
      return;
    }
    
    if (formData.new_values && !validateJson(formData.new_values)) {
      setError('New values field must contain valid JSON');
      setLoading(false);
      return;
    }
    
    try {
      // Parse JSON fields before sending
      const submitData = { ...formData };
      if (submitData.changes) {
        submitData.changes = JSON.parse(submitData.changes);
      }
      if (submitData.old_values) {
        submitData.old_values = JSON.parse(submitData.old_values);
      }
      if (submitData.new_values) {
        submitData.new_values = JSON.parse(submitData.new_values);
      }
      
      const response = await api.createAuditLog(submitData);
      
      if (response.status === 201) {
        alert('Audit log entry created successfully!');
        navigate('/audit-logs');
      }
    } catch (err) {
      console.error('Error creating audit log:', err);
      setError(err.response?.data?.message || 'Failed to create audit log entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add Audit Log Entry</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="audit-form">
        {/* Basic Action Information */}
        <div className="form-section">
          <h3>Action Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="action" className="form-label">
                Action Type *
              </label>
              <select
                id="action"
                name="action"
                value={formData.action}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Action</option>
                {actionTypes.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="severity" className="form-label">
                Severity Level *
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="form-input"
                required
              >
                {severityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resource_name" className="form-label">
                Resource Name *
              </label>
              <input
                type="text"
                id="resource_name"
                name="resource_name"
                value={formData.resource_name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="e.g., Patient, Consultation, Medication"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="resource_id" className="form-label">
                Resource ID *
              </label>
              <input
                type="text"
                id="resource_id"
                name="resource_id"
                value={formData.resource_id}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="ID of the affected resource"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              required
              placeholder="Human readable description of the action..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="Comma-separated tags"
            />
          </div>
        </div>

        {/* Change Details */}
        <div className="form-section">
          <h3>Change Details</h3>
          
          <div className="form-group">
            <label htmlFor="changes" className="form-label">
              Changes (JSON)
            </label>
            <textarea
              id="changes"
              name="changes"
              value={formData.changes}
              onChange={handleJsonChange('changes')}
              className="form-textarea"
              rows="3"
              placeholder='{"field": "value", "another_field": "another_value"}'
            />
            <small className="form-help">
              JSON object describing what changed
            </small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="old_values" className="form-label">
                Old Values (JSON)
              </label>
              <textarea
                id="old_values"
                name="old_values"
                value={formData.old_values}
                onChange={handleJsonChange('old_values')}
                className="form-textarea"
                rows="3"
                placeholder='{"field": "old_value"}'
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new_values" className="form-label">
                New Values (JSON)
              </label>
              <textarea
                id="new_values"
                name="new_values"
                value={formData.new_values}
                onChange={handleJsonChange('new_values')}
                className="form-textarea"
                rows="3"
                placeholder='{"field": "new_value"}'
              />
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="form-section">
          <h3>Request Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ip_address" className="form-label">
                IP Address *
              </label>
              <input
                type="text"
                id="ip_address"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="xxx.xxx.xxx.xxx"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="request_method" className="form-label">
                Request Method
              </label>
              <select
                id="request_method"
                name="request_method"
                value={formData.request_method}
                onChange={handleChange}
                className="form-input"
              >
                {requestMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="request_url" className="form-label">
              Request URL
            </label>
            <input
              type="url"
              id="request_url"
              name="request_url"
              value={formData.request_url}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/api/endpoint"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="user_agent" className="form-label">
              User Agent
            </label>
            <textarea
              id="user_agent"
              name="user_agent"
              value={formData.user_agent}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              readOnly
            />
            <small className="form-help">
              Auto-detected from browser
            </small>
          </div>
        </div>

        {/* Compliance */}
        <div className="form-section">
          <h3>Compliance Flags</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="gdpr_relevant"
                  checked={formData.gdpr_relevant}
                  onChange={handleChange}
                />
                GDPR Relevant
              </label>
              <small className="form-help">
                Check if this action involves personal data processing
              </small>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hipaa_relevant"
                  checked={formData.hipaa_relevant}
                  onChange={handleChange}
                />
                HIPAA Relevant
              </label>
              <small className="form-help">
                Check if this action involves protected health information
              </small>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/audit-logs')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Audit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAuditLogPage;