import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddMedicationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand_names: '',
    medication_type: '',
    therapeutic_class: '',
    strength: '',
    active_ingredients: '',
    description: '',
    indications: '',
    contraindications: '',
    side_effects: '',
    standard_dosage: '',
    maximum_daily_dose: '',
    storage_temperature: '',
    shelf_life_months: '',
    special_handling: '',
    manufacturer: '',
    batch_number: '',
    expiry_date: '',
    approval_status: true,
    current_stock: 0,
    minimum_stock_level: 10,
    unit_price: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const medicationTypes = [
    { value: 'eye_drop', label: 'Eye Drop' },
    { value: 'ointment', label: 'Eye Ointment' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'injection', label: 'Injection' },
    { value: 'gel', label: 'Eye Gel' },
    { value: 'insert', label: 'Eye Insert' },
    { value: 'solution', label: 'Solution' }
  ];

  const therapeuticClasses = [
    { value: 'antibiotic', label: 'Antibiotic' },
    { value: 'anti_inflammatory', label: 'Anti-inflammatory' },
    { value: 'steroid', label: 'Steroid' },
    { value: 'antiglaucoma', label: 'Anti-glaucoma' },
    { value: 'mydriatic', label: 'Mydriatic' },
    { value: 'anesthetic', label: 'Anesthetic' },
    { value: 'antiviral', label: 'Antiviral' },
    { value: 'antifungal', label: 'Antifungal' },
    { value: 'lubricant', label: 'Lubricant' },
    { value: 'vasodilator', label: 'Vasodilator' },
    { value: 'anti_vegf', label: 'Anti-VEGF' },
    { value: 'immunosuppressive', label: 'Immunosuppressive' }
  ];

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
    setError('');
    
    try {
      const response = await api.createMedication(formData);
      
      if (response.status === 201) {
        alert('Medication added successfully!');
        navigate('/medications');
      }
    } catch (err) {
      console.error('Error creating medication:', err);
      setError(err.response?.data?.message || 'Failed to create medication');
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
        {/* Basic Information */}
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
                placeholder="Commercial name of the medication"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="generic_name" className="form-label">
                Generic Name *
              </label>
              <input
                type="text"
                id="generic_name"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Generic/scientific name"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="medication_type" className="form-label">
                Medication Type *
              </label>
              <select
                id="medication_type"
                name="medication_type"
                value={formData.medication_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Type</option>
                {medicationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="therapeutic_class" className="form-label">
                Therapeutic Class *
              </label>
              <select
                id="therapeutic_class"
                name="therapeutic_class"
                value={formData.therapeutic_class}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Class</option>
                {therapeuticClasses.map(tclass => (
                  <option key={tclass.value} value={tclass.value}>
                    {tclass.label}
                  </option>
                ))}
              </select>
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
                required
                placeholder="e.g., 0.5%, 10mg/ml"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="brand_names" className="form-label">
              Brand Names
            </label>
            <input
              type="text"
              id="brand_names"
              name="brand_names"
              value={formData.brand_names}
              onChange={handleChange}
              className="form-input"
              placeholder="Comma-separated brand names"
            />
          </div>
        </div>

        {/* Drug Information */}
        <div className="form-section">
          <h3>Drug Information</h3>
          
          <div className="form-group">
            <label htmlFor="active_ingredients" className="form-label">
              Active Ingredients *
            </label>
            <textarea
              id="active_ingredients"
              name="active_ingredients"
              value={formData.active_ingredients}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              required
              placeholder="List all active ingredients..."
            />
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
              placeholder="Detailed description of the medication..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="indications" className="form-label">
              Indications *
            </label>
            <textarea
              id="indications"
              name="indications"
              value={formData.indications}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              required
              placeholder="Medical conditions this drug treats..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contraindications" className="form-label">
              Contraindications *
            </label>
            <textarea
              id="contraindications"
              name="contraindications"
              value={formData.contraindications}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              required
              placeholder="When not to use this drug..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="side_effects" className="form-label">
              Side Effects *
            </label>
            <textarea
              id="side_effects"
              name="side_effects"
              value={formData.side_effects}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              required
              placeholder="Known side effects and adverse reactions..."
            />
          </div>
        </div>

        {/* Dosage Information */}
        <div className="form-section">
          <h3>Dosage Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="standard_dosage" className="form-label">
                Standard Dosage *
              </label>
              <input
                type="text"
                id="standard_dosage"
                name="standard_dosage"
                value={formData.standard_dosage}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="e.g., 1-2 drops twice daily"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maximum_daily_dose" className="form-label">
                Maximum Daily Dose
              </label>
              <input
                type="text"
                id="maximum_daily_dose"
                name="maximum_daily_dose"
                value={formData.maximum_daily_dose}
                onChange={handleChange}
                className="form-input"
                placeholder="Maximum safe daily dose"
              />
            </div>
          </div>
        </div>

        {/* Storage and Handling */}
        <div className="form-section">
          <h3>Storage & Handling</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="storage_temperature" className="form-label">
                Storage Temperature *
              </label>
              <input
                type="text"
                id="storage_temperature"
                name="storage_temperature"
                value={formData.storage_temperature}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="e.g., Room temperature, 2-8°C"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shelf_life_months" className="form-label">
                Shelf Life (Months) *
              </label>
              <input
                type="number"
                id="shelf_life_months"
                name="shelf_life_months"
                value={formData.shelf_life_months}
                onChange={handleChange}
                className="form-input"
                required
                min="1"
                max="120"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="special_handling" className="form-label">
              Special Handling Instructions
            </label>
            <textarea
              id="special_handling"
              name="special_handling"
              value={formData.special_handling}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Special storage or handling requirements..."
            />
          </div>
        </div>

        {/* Regulatory & Manufacturing */}
        <div className="form-section">
          <h3>Manufacturing & Regulatory</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturer" className="form-label">
                Manufacturer *
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Manufacturing company"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="batch_number" className="form-label">
                Batch Number
              </label>
              <input
                type="text"
                id="batch_number"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                className="form-input"
                placeholder="Current batch number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="expiry_date" className="form-label">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="approval_status"
                  checked={formData.approval_status}
                  onChange={handleChange}
                />
                Approved for Use
              </label>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="form-section">
          <h3>Inventory Management</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current_stock" className="form-label">
                Current Stock
              </label>
              <input
                type="number"
                id="current_stock"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="minimum_stock_level" className="form-label">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                id="minimum_stock_level"
                name="minimum_stock_level"
                value={formData.minimum_stock_level}
                onChange={handleChange}
                className="form-input"
                required
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="unit_price" className="form-label">
                Unit Price (£) *
              </label>
              <input
                type="number"
                step="0.01"
                id="unit_price"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/medications')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding...' : 'Add Medication'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicationPage;