import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AddReferralSourcePage.css';

const AddReferralSourcePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    source_type: 'ophthalmologist',
    contact_person: '',
    email: '',
    phone: '',
    fax: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Australia',
    specialties: '',
    notes: '',
    is_active: true,
    is_preferred: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Please provide a valid source name (minimum 2 characters)');
      return;
    }
    
    if (!formData.phone && !formData.email) {
      setError('Please provide at least a phone number or email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('referrals/sources', formData);
      
      alert('Referral source added successfully!');
      navigate('/referral-sources');
      
    } catch (err) {
      console.error('Error creating source:', err);
      setError(err.response?.data?.error || 'Failed to create referral source');
      setLoading(false);
    }
  };

  return (
    <div className="add-referral-source-page">
      <div className="page-header">
        <h1>Add New Referral Source</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/referral-sources')}
        >
          ← Back to Sources
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form className="source-form" onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Source Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Eye Specialist Centre"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Source Type *</label>
              <select
                name="source_type"
                value={formData.source_type}
                onChange={handleInputChange}
                required
              >
                <option value="ophthalmologist">Ophthalmologist</option>
                <option value="optometrist">Optometrist</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="gp">GP (General Practitioner)</option>
                <option value="specialist">Specialist</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="e.g., Dr. John Smith"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Specialties</label>
            <textarea
              name="specialties"
              value={formData.specialties}
              onChange={handleInputChange}
              rows="3"
              placeholder="e.g., Retinal surgery, Glaucoma treatment, Cataract surgery"
            ></textarea>
            <small className="help-text">
              List the specialties or services this source provides
            </small>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 02 1234 5678"
              />
            </div>
            
            <div className="form-group">
              <label>Fax</label>
              <input
                type="tel"
                name="fax"
                value={formData.fax}
                onChange={handleInputChange}
                placeholder="e.g., 02 1234 5679"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., contact@eyecentre.com.au"
            />
          </div>
        </div>

        {/* Section 3: Address Information */}
        <div className="form-section">
          <h2>Address Information</h2>
          
          <div className="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main Street"
            />
          </div>
          
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="e.g., Suite 5, Level 2"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Sydney"
              />
            </div>
            
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g., NSW"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="e.g., 2000"
              />
            </div>
            
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., Australia"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Additional Information */}
        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Any additional notes about this referral source..."
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_preferred"
                  checked={formData.is_preferred}
                  onChange={handleInputChange}
                />
                <span>⭐ Mark as Preferred Source</span>
              </label>
              <small className="help-text">
                Preferred sources appear at the top of selection lists
              </small>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span>Active</span>
              </label>
              <small className="help-text">
                Inactive sources won't appear in referral creation
              </small>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/referral-sources')}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Referral Source'}
          </button>
        </div>
      </form>

      <div className="help-section">
        <h3>Tips for Adding Referral Sources</h3>
        <ul>
          <li><strong>Name:</strong> Use the official name of the practice or healthcare provider</li>
          <li><strong>Type:</strong> Select the most appropriate category for easy filtering</li>
          <li><strong>Contact Person:</strong> Include the doctor's name for direct referrals</li>
          <li><strong>Specialties:</strong> List specific areas of expertise for easier matching</li>
          <li><strong>Preferred:</strong> Mark frequently used or trusted sources as preferred for quick access</li>
        </ul>
      </div>
    </div>
  );
};

export default AddReferralSourcePage;
