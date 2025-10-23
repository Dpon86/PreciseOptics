import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import '../../App_new.css';

const AddManufacturerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    country: '',
    is_certified: true,
    certification_number: '',
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiService.createManufacturer(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/manufacturers');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create manufacturer');
      console.error('Error creating manufacturer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add New Manufacturer</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Manufacturer created successfully!</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Manufacturer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter manufacturer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_person">Contact Person</label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                className="form-control"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                className="form-control"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter full address"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Certification Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="certification_number">Certification Number</label>
              <input
                type="text"
                id="certification_number"
                name="certification_number"
                className="form-control"
                value={formData.certification_number}
                onChange={handleChange}
                placeholder="Enter certification number"
              />
            </div>

            <div className="form-group">
              <label>&nbsp;</label>
              <div className="checkbox-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_certified"
                    checked={formData.is_certified}
                    onChange={handleChange}
                  />
                  <span>FDA/WHO Certified</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Active Status</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Manufacturer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddManufacturerPage;
