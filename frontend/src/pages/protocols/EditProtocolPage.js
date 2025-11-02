import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AddProtocolPage.css';

const EditProtocolPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    protocol_type: 'loading_dose',
    condition: '',
    description: '',
    indications: '',
    contraindications: '',
    total_duration_weeks: '',
    repeat_interval_weeks: '',
    requires_consent: false,
    consent_type: '',
    expected_outcomes: '',
    potential_side_effects: '',
    monitoring_requirements: '',
    is_active: true
  });

  useEffect(() => {
    fetchProtocol();
    fetchConditions();
  }, [id]);

  const fetchProtocol = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/protocols/protocols/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch protocol');
      const data = await response.json();
      
      setFormData({
        name: data.name || '',
        code: data.code || '',
        protocol_type: data.protocol_type || 'loading_dose',
        condition: data.condition?.id || '',
        description: data.description || '',
        indications: data.indications || '',
        contraindications: data.contraindications || '',
        total_duration_weeks: data.total_duration_weeks || '',
        repeat_interval_weeks: data.repeat_interval_weeks || '',
        requires_consent: data.requires_consent || false,
        consent_type: data.consent_type || '',
        expected_outcomes: data.expected_outcomes || '',
        potential_side_effects: data.potential_side_effects || '',
        monitoring_requirements: data.monitoring_requirements || '',
        is_active: data.is_active !== undefined ? data.is_active : true
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch protocol');
      setLoading(false);
    }
  };

  const fetchConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/medications/conditions/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conditions');
      const data = await response.json();
      setConditions(data);
    } catch (err) {
      console.error('Error fetching conditions:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - convert empty strings to null
      const submitData = {
        ...formData,
        condition: formData.condition || null,
        total_duration_weeks: formData.total_duration_weeks ? parseInt(formData.total_duration_weeks) : null,
        repeat_interval_weeks: formData.repeat_interval_weeks ? parseInt(formData.repeat_interval_weeks) : null,
        consent_type: formData.consent_type || null
      };

      const response = await fetch(`http://127.0.0.1:8000/api/protocols/protocols/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Object.values(errorData).flat().join(', '));
      }

      navigate(`/protocols/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update protocol');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this protocol? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/protocols/protocols/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete protocol');

      navigate('/protocols');
    } catch (err) {
      setError(err.message || 'Failed to delete protocol');
      setDeleting(false);
    }
  };

  const protocolTypes = [
    { value: 'loading_dose', label: 'Loading Dose' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'fixed_interval', label: 'Fixed Interval' },
    { value: 'treat_extend', label: 'Treat & Extend' },
    { value: 'prn', label: 'PRN (As Needed)' },
    { value: 'post_op', label: 'Post-Operative' },
    { value: 'custom', label: 'Custom' }
  ];

  if (loading) {
    return <div className="loading-spinner">Loading protocol...</div>;
  }

  return (
    <div className="edit-protocol-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate(`/protocols/${id}`)} className="btn-back">
            ← Back to Protocol
          </button>
          <h1>Edit Protocol</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="protocol-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Protocol Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Anti-VEGF Loading Dose Protocol"
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Protocol Code *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., VEGF-LD-001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="protocol_type">Protocol Type *</label>
              <select
                id="protocol_type"
                name="protocol_type"
                value={formData.protocol_type}
                onChange={handleInputChange}
                required
              >
                {protocolTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="">Select a condition</option>
                {conditions.map(condition => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe the protocol..."
            />
          </div>
        </div>

        {/* Clinical Details */}
        <div className="form-section">
          <h2>Clinical Details</h2>

          <div className="form-group">
            <label htmlFor="indications">Indications</label>
            <textarea
              id="indications"
              name="indications"
              value={formData.indications}
              onChange={handleInputChange}
              rows="3"
              placeholder="When is this protocol indicated?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraindications">Contraindications</label>
            <textarea
              id="contraindications"
              name="contraindications"
              value={formData.contraindications}
              onChange={handleInputChange}
              rows="3"
              placeholder="When should this protocol not be used?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="expected_outcomes">Expected Outcomes</label>
            <textarea
              id="expected_outcomes"
              name="expected_outcomes"
              value={formData.expected_outcomes}
              onChange={handleInputChange}
              rows="3"
              placeholder="What are the expected outcomes?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="potential_side_effects">Potential Side Effects</label>
            <textarea
              id="potential_side_effects"
              name="potential_side_effects"
              value={formData.potential_side_effects}
              onChange={handleInputChange}
              rows="3"
              placeholder="What side effects should be monitored?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitoring_requirements">Monitoring Requirements</label>
            <textarea
              id="monitoring_requirements"
              name="monitoring_requirements"
              value={formData.monitoring_requirements}
              onChange={handleInputChange}
              rows="3"
              placeholder="What monitoring is required?"
            />
          </div>
        </div>

        {/* Timing & Duration */}
        <div className="form-section">
          <h2>Timing & Duration</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_duration_weeks">Total Duration (weeks)</label>
              <input
                type="number"
                id="total_duration_weeks"
                name="total_duration_weeks"
                value={formData.total_duration_weeks}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 12"
              />
              <small>Leave empty if protocol has no fixed duration</small>
            </div>

            <div className="form-group">
              <label htmlFor="repeat_interval_weeks">Repeat Interval (weeks)</label>
              <input
                type="number"
                id="repeat_interval_weeks"
                name="repeat_interval_weeks"
                value={formData.repeat_interval_weeks}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 4"
              />
              <small>For recurring protocols</small>
            </div>
          </div>
        </div>

        {/* Consent Requirements */}
        <div className="form-section">
          <h2>Consent Requirements</h2>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="requires_consent"
                checked={formData.requires_consent}
                onChange={handleInputChange}
              />
              <span>This protocol requires patient consent</span>
            </label>
          </div>

          {formData.requires_consent && (
            <div className="form-group">
              <label htmlFor="consent_type">Consent Type</label>
              <select
                id="consent_type"
                name="consent_type"
                value={formData.consent_type}
                onChange={handleInputChange}
              >
                <option value="">Select consent type</option>
                <option value="verbal">Verbal Consent</option>
                <option value="written">Written Consent</option>
                <option value="both">Both Verbal and Written</option>
              </select>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="form-section">
          <h2>Status</h2>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span>Protocol is active and available for use</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger"
            disabled={saving || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Protocol'}
          </button>
          <div style={{ flex: 1 }}></div>
          <button
            type="button"
            onClick={() => navigate(`/protocols/${id}`)}
            className="btn-secondary"
            disabled={saving || deleting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || deleting}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProtocolPage;
