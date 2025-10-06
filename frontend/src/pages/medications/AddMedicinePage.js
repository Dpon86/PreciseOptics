import React, { useState } from 'react';
import api from '../../services/api';

const AddMedicinePage = () => {
  const [medicineData, setMedicineData] = useState({
    name: '',
    generic_name: '',
    brand_name: '',
    strength: '',
    dosage_form: '',
    manufacturer: '',
    price: '',
    stock_quantity: '',
    minimum_stock_level: '',
    expiry_date: '',
    batch_number: '',
    description: '',
    side_effects: '',
    contraindications: '',
    approval_status: 'pending'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicineData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Prepare data for submission
      const formData = {
        ...medicineData,
        price: parseFloat(medicineData.price) || 0,
        stock_quantity: parseInt(medicineData.stock_quantity) || 0,
        minimum_stock_level: parseInt(medicineData.minimum_stock_level) || 0
      };

      await api.createMedication(formData);
      setMessage('Medicine added successfully!');
      
      // Reset form
      setMedicineData({
        name: '',
        generic_name: '',
        brand_name: '',
        strength: '',
        dosage_form: '',
        manufacturer: '',
        price: '',
        stock_quantity: '',
        minimum_stock_level: '',
        expiry_date: '',
        batch_number: '',
        description: '',
        side_effects: '',
        contraindications: '',
        approval_status: 'pending'
      });

    } catch (err) {
      console.error('Error adding medicine:', err);
      setError(err.response?.data?.message || 'Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dosageForms = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Ointment', 
    'Gel', 'Cream', 'Suspension', 'Powder', 'Inhaler'
  ];

  return (
    <div className="add-medicine-container">
      <div className="page-header">
        <h1>Add New Medicine</h1>
        <p>Add a new medicine to the inventory system</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="medicine-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Medicine Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={medicineData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter medicine name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="generic_name" className="form-label">Generic Name</label>
                <input
                  type="text"
                  id="generic_name"
                  name="generic_name"
                  value={medicineData.generic_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter generic name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand_name" className="form-label">Brand Name</label>
                <input
                  type="text"
                  id="brand_name"
                  name="brand_name"
                  value={medicineData.brand_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter brand name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="manufacturer" className="form-label">Manufacturer</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={medicineData.manufacturer}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter manufacturer name"
                />
              </div>
            </div>
          </div>

          {/* Dosage Information */}
          <div className="form-section">
            <h3>Dosage Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="strength" className="form-label">Strength</label>
                <input
                  type="text"
                  id="strength"
                  name="strength"
                  value={medicineData.strength}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosage_form" className="form-label">Dosage Form</label>
                <select
                  id="dosage_form"
                  name="dosage_form"
                  value={medicineData.dosage_form}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select dosage form</option>
                  {dosageForms.map(form => (
                    <option key={form} value={form.toLowerCase()}>{form}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div className="form-section">
            <h3>Inventory Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price per Unit ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={medicineData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_quantity" className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={medicineData.stock_quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  placeholder="Enter stock quantity"
                />
              </div>

              <div className="form-group">
                <label htmlFor="minimum_stock_level" className="form-label">Minimum Stock Level</label>
                <input
                  type="number"
                  id="minimum_stock_level"
                  name="minimum_stock_level"
                  value={medicineData.minimum_stock_level}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  placeholder="Enter minimum stock level"
                />
              </div>

              <div className="form-group">
                <label htmlFor="batch_number" className="form-label">Batch Number</label>
                <input
                  type="text"
                  id="batch_number"
                  name="batch_number"
                  value={medicineData.batch_number}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter batch number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiry_date" className="form-label">Expiry Date</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={medicineData.expiry_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="approval_status" className="form-label">Approval Status</label>
                <select
                  id="approval_status"
                  name="approval_status"
                  value={medicineData.approval_status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={medicineData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Enter medicine description, usage, and indications"
              />
            </div>

            <div className="form-group">
              <label htmlFor="side_effects" className="form-label">Side Effects</label>
              <textarea
                id="side_effects"
                name="side_effects"
                value={medicineData.side_effects}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="List possible side effects"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contraindications" className="form-label">Contraindications</label>
              <textarea
                id="contraindications"
                name="contraindications"
                value={medicineData.contraindications}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="List contraindications and warnings"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Adding Medicine...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Add Medicine
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.history.back()}
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

export default AddMedicinePage;