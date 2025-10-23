import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const EditPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    alternate_phone: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'UK',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    insurance_provider: '',
    insurance_number: '',
    nhs_number: '',
    allergies: '',
    medical_history: '',
    current_medications: '',
    blood_group: '',
    is_active: true
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setFetchLoading(true);
      const response = await api.getPatient(id);
      
      // Format date for input field
      const patientData = response.data;
      if (patientData.date_of_birth) {
        patientData.date_of_birth = patientData.date_of_birth.split('T')[0];
      }
      
      setFormData({
        first_name: patientData.first_name || '',
        last_name: patientData.last_name || '',
        middle_name: patientData.middle_name || '',
        date_of_birth: patientData.date_of_birth || '',
        gender: patientData.gender || '',
        phone_number: patientData.phone_number || '',
        alternate_phone: patientData.alternate_phone || '',
        email: patientData.email || '',
        address_line_1: patientData.address_line_1 || '',
        address_line_2: patientData.address_line_2 || '',
        city: patientData.city || '',
        state: patientData.state || '',
        postal_code: patientData.postal_code || '',
        country: patientData.country || 'UK',
        emergency_contact_name: patientData.emergency_contact_name || '',
        emergency_contact_relationship: patientData.emergency_contact_relationship || '',
        emergency_contact_phone: patientData.emergency_contact_phone || '',
        insurance_provider: patientData.insurance_provider || '',
        insurance_number: patientData.insurance_number || '',
        nhs_number: patientData.nhs_number || '',
        allergies: patientData.allergies || '',
        medical_history: patientData.medical_history || '',
        current_medications: patientData.current_medications || '',
        blood_group: patientData.blood_group || '',
        is_active: patientData.is_active !== undefined ? patientData.is_active : true
      });
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.updatePatient(id, formData);
      
      if (response.status === 200) {
        alert('Patient updated successfully!');
        navigate(`/patients/${id}`);
      }
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="loading">Loading patient data...</div>;
  }

  return (
    <div className="form-container">
      <h1>Edit Patient</h1>
      
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
              <label htmlFor="middle_name" className="form-label">
                Middle Name
              </label>
              <input
                type="text"
                id="middle_name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="form-input"
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
            
            <div className="form-group">
              <label htmlFor="is_active" className="form-label">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={{ width: 'auto', marginRight: '8px' }}
                />
                Active Patient
              </label>
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
            <label htmlFor="address_line_1" className="form-label">
              Address Line 1 *
            </label>
            <input
              type="text"
              id="address_line_1"
              name="address_line_1"
              value={formData.address_line_1}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address_line_2" className="form-label">
              Address Line 2
            </label>
            <input
              type="text"
              id="address_line_2"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
              className="form-input"
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
              <label htmlFor="postal_code" className="form-label">
                Postal Code *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Emergency Contact</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergency_contact_name" className="form-label">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emergency_contact_relationship" className="form-label">
                Relationship *
              </label>
              <input
                type="text"
                id="emergency_contact_relationship"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Spouse, Parent, Sibling"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emergency_contact_phone" className="form-label">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Medical Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blood_group" className="form-label">
                Blood Group
              </label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="alternate_phone" className="form-label">
                Alternate Phone
              </label>
              <input
                type="tel"
                id="alternate_phone"
                name="alternate_phone"
                value={formData.alternate_phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="allergies" className="form-label">
              Known Allergies
            </label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="List any known allergies..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="current_medications" className="form-label">
              Current Medications
            </label>
            <textarea
              id="current_medications"
              name="current_medications"
              value={formData.current_medications}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="List current medications..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="medical_history" className="form-label">
              Medical History
            </label>
            <textarea
              id="medical_history"
              name="medical_history"
              value={formData.medical_history}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Previous medical conditions, surgeries, etc..."
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Insurance Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insurance_provider" className="form-label">
                Insurance Provider
              </label>
              <input
                type="text"
                id="insurance_provider"
                name="insurance_provider"
                value={formData.insurance_provider}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., NHS, Bupa, Vitality"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="insurance_number" className="form-label">
                Policy Number
              </label>
              <input
                type="text"
                id="insurance_number"
                name="insurance_number"
                value={formData.insurance_number}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nhs_number" className="form-label">
                NHS Number
              </label>
              <input
                type="text"
                id="nhs_number"
                name="nhs_number"
                value={formData.nhs_number}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 123 456 7890"
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(`/patients/${id}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating Patient...' : 'Update Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPatientPage;
