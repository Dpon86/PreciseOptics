import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import '../../App_new.css';

const AddMedicationCategoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_category: '',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getMedicationCategories({ parent_only: 'true' });
      setCategories(response.data.results || response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

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
      const submitData = {
        ...formData,
        parent_category: formData.parent_category || null
      };
      await apiService.createMedicationCategory(submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/medication-categories');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create medication category');
      console.error('Error creating category:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add New Medication Category</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Category created successfully!</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3 className="section-title">Category Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Antibiotics, Anti-inflammatory"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parent_category">Parent Category</label>
              <select
                id="parent_category"
                name="parent_category"
                className="form-control"
                value={formData.parent_category}
                onChange={handleChange}
              >
                <option value="">None (Top Level Category)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
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
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter category description"
            />
          </div>

          <div className="form-group">
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
            {loading ? 'Saving...' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicationCategoryPage;
