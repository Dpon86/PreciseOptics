import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddPatientPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    occupation: '',
    employer: '',
    marital_status: '',
    referral_source: '',
    notes: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/patients/patients/', formData);
      
      if (response.status === 201) {
        alert('Patient added successfully!');
        navigate('/patients');
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Patient</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth" className="form-label">
                Date of Birth *
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zip_code" className="form-label">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Additional Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="occupation" className="form-label">
                Occupation
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="employer" className="form-label">
                Employer
              </label>
              <input
                type="text"
                id="employer"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marital_status" className="form-label">
                Marital Status
              </label>
              <select
                id="marital_status"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="referral_source" className="form-label">
                Referral Source
              </label>
              <input
                type="text"
                id="referral_source"
                name="referral_source"
                value={formData.referral_source}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Dr. Smith, Online, Family"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Additional notes about the patient"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/patients')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Patient...' : 'Add Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientPage;