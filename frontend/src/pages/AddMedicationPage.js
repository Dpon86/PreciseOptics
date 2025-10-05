import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddMedicationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand_name: '',
    strength: '',
    dosage_form: '',
    manufacturer: '',
    category: '',
    description: '',
    side_effects: '',
    contraindications: '',
    storage_instructions: '',
    price_per_unit: '',
    requires_prescription: true,
    is_controlled_substance: false,
    active_ingredients: '',
    inactive_ingredients: '',
    ndc_number: '',
    lot_number: '',
    expiration_date: ''
  });
  
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchManufacturers();
    fetchCategories();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await api.get('/medications/manufacturers/');
      setManufacturers(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/medications/categories/');
      setCategories(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/medications/medications/', formData);
      
      if (response.status === 201) {
        alert('Medication added successfully!');
        navigate('/medications');
      }
    } catch (err) {
      console.error('Error adding medication:', err);
      setError(err.response?.data?.message || 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Medication</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="medication-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Medication Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="generic_name" className="form-label">
                Generic Name
              </label>
              <input
                type="text"
                id="generic_name"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand_name" className="form-label">
                Brand Name
              </label>
              <input
                type="text"
                id="brand_name"
                name="brand_name"
                value={formData.brand_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="strength" className="form-label">
                Strength *
              </label>
              <input
                type="text"
                id="strength"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 500mg, 10ml"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dosage_form" className="form-label">
                Dosage Form *
              </label>
              <select
                id="dosage_form"
                name="dosage_form"
                value={formData.dosage_form}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Dosage Form</option>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream</option>
                <option value="ointment">Ointment</option>
                <option value="drops">Eye Drops</option>
                <option value="gel">Gel</option>
                <option value="patch">Patch</option>
                <option value="inhaler">Inhaler</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="price_per_unit" className="form-label">
                Price per Unit ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="price_per_unit"
                name="price_per_unit"
                value={formData.price_per_unit}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Classification</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturer" className="form-label">
                Manufacturer
              </label>
              <select
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="requires_prescription"
                  checked={formData.requires_prescription}
                  onChange={handleChange}
                />
                <span>Requires Prescription</span>
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_controlled_substance"
                  checked={formData.is_controlled_substance}
                  onChange={handleChange}
                />
                <span>Controlled Substance</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Detailed Information</h3>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="active_ingredients" className="form-label">
                Active Ingredients
              </label>
              <textarea
                id="active_ingredients"
                name="active_ingredients"
                value={formData.active_ingredients}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="inactive_ingredients" className="form-label">
                Inactive Ingredients
              </label>
              <textarea
                id="inactive_ingredients"
                name="inactive_ingredients"
                value={formData.inactive_ingredients}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="side_effects" className="form-label">
              Side Effects
            </label>
            <textarea
              id="side_effects"
              name="side_effects"
              value={formData.side_effects}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contraindications" className="form-label">
              Contraindications
            </label>
            <textarea
              id="contraindications"
              name="contraindications"
              value={formData.contraindications}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="storage_instructions" className="form-label">
              Storage Instructions
            </label>
            <textarea
              id="storage_instructions"
              name="storage_instructions"
              value={formData.storage_instructions}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="e.g., Store at room temperature, Keep refrigerated"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Product Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ndc_number" className="form-label">
                NDC Number
              </label>
              <input
                type="text"
                id="ndc_number"
                name="ndc_number"
                value={formData.ndc_number}
                onChange={handleChange}
                className="form-input"
                placeholder="National Drug Code"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lot_number" className="form-label">
                Lot Number
              </label>
              <input
                type="text"
                id="lot_number"
                name="lot_number"
                value={formData.lot_number}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="expiration_date" className="form-label">
              Expiration Date
            </label>
            <input
              type="date"
              id="expiration_date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/medications')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Medication...' : 'Add Medication'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicationPage;