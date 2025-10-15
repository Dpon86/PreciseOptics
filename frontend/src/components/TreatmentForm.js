import React, { useState, useEffect } from 'react';
import './TreatmentForm.css';

const TreatmentForm = ({ patient, onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    patient: patient?.id || '',
    consultation: '',
    treatment_type: '',
    eye_treated: '',
    priority: 'routine',
    primary_surgeon: '',
    assisting_staff: [],
    scheduled_date: '',
    indication: '',
    technique_notes: '',
    anesthesia_used: '',
    consent_obtained: false,
    consent_date: '',
    consent_obtained_by: '',
    requires_follow_up: true,
    follow_up_weeks: 2,
    follow_up_instructions: ''
  });

  const [treatmentCategories, setTreatmentCategories] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [filteredTreatmentTypes, setFilteredTreatmentTypes] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedTreatmentType, setSelectedTreatmentType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduled_date: initialData.scheduled_date 
          ? new Date(initialData.scheduled_date).toISOString().slice(0, 16)
          : '',
        consent_date: initialData.consent_date
          ? new Date(initialData.consent_date).toISOString().slice(0, 16)
          : ''
      });
    }
  }, [initialData]);

  // Filter treatment types when category selection changes
  useEffect(() => {
    if (formData.treatment_category) {
      const filtered = treatmentTypes.filter(
        type => type.category === formData.treatment_category
      );
      setFilteredTreatmentTypes(filtered);
    } else {
      setFilteredTreatmentTypes(treatmentTypes);
    }
  }, [formData.treatment_category, treatmentTypes]);

  // Update form when treatment type is selected
  useEffect(() => {
    if (formData.treatment_type && treatmentTypes.length > 0) {
      const selected = treatmentTypes.find(type => type.id === formData.treatment_type);
      setSelectedTreatmentType(selected);
      
      if (selected) {
        setFormData(prev => ({
          ...prev,
          priority: selected.urgency_level || 'routine',
          anesthesia_used: selected.requires_anesthesia || '',
          follow_up_weeks: selected.typical_duration_minutes ? 
            Math.ceil(selected.typical_duration_minutes / 60) : 2
        }));
      }
    }
  }, [formData.treatment_type, treatmentTypes]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, typesRes, consultationsRes, staffRes] = await Promise.all([
        fetch('/api/treatments/categories/'),
        fetch('/api/treatments/types/'),
        fetch(`/api/consultations/?patient=${patient?.id}`),
        fetch('/api/accounts/users/?user_type=doctor,nurse,technician')
      ]);

      const [categories, types, consultationsData, staffData] = await Promise.all([
        categoriesRes.json(),
        typesRes.json(),
        consultationsRes.json(),
        staffRes.json()
      ]);

      setTreatmentCategories(categories.results || categories);
      setTreatmentTypes(types.results || types);
      setConsultations(consultationsData.results || consultationsData);
      setStaff(staffData.results || staffData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrors({ general: 'Failed to load form data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'assisting_staff') {
      const staffId = value;
      const currentStaff = formData.assisting_staff || [];
      
      if (checked) {
        setFormData(prev => ({
          ...prev,
          assisting_staff: [...currentStaff, staffId]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          assisting_staff: currentStaff.filter(id => id !== staffId)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.consultation) newErrors.consultation = 'Consultation is required';
    if (!formData.treatment_type) newErrors.treatment_type = 'Treatment type is required';
    if (!formData.eye_treated) newErrors.eye_treated = 'Eye treated is required';
    if (!formData.primary_surgeon) newErrors.primary_surgeon = 'Primary surgeon is required';
    if (!formData.indication) newErrors.indication = 'Clinical indication is required';

    if (selectedTreatmentType?.requires_consent && !formData.consent_obtained) {
      newErrors.consent_obtained = 'Consent is required for this treatment';
    }

    if (formData.consent_obtained && !formData.consent_date) {
      newErrors.consent_date = 'Consent date is required when consent is obtained';
    }

    if (formData.scheduled_date) {
      const scheduledDate = new Date(formData.scheduled_date);
      const now = new Date();
      
      if (formData.priority !== 'emergency' && scheduledDate < now) {
        newErrors.scheduled_date = 'Scheduled date cannot be in the past for non-emergency treatments';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ general: error.message || 'Failed to save treatment' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="treatment-form-loading">
        <div className="spinner"></div>
        <p>Loading treatment form...</p>
      </div>
    );
  }

  return (
    <div className="treatment-form-container">
      <div className="treatment-form-header">
        <h2>{initialData ? 'Edit Treatment' : 'Schedule New Treatment'}</h2>
        <p>Patient: {patient?.first_name} {patient?.last_name}</p>
      </div>

      {errors.general && (
        <div className="alert alert-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="treatment-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="consultation">
                Consultation *
                {errors.consultation && <span className="error">{errors.consultation}</span>}
              </label>
              <select
                id="consultation"
                name="consultation"
                value={formData.consultation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select consultation</option>
                {consultations.map(consultation => (
                  <option key={consultation.id} value={consultation.id}>
                    {new Date(consultation.scheduled_time).toLocaleDateString()} - 
                    {consultation.consultation_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="treatment_category">Treatment Category</label>
              <select
                id="treatment_category"
                name="treatment_category"
                value={formData.treatment_category || ''}
                onChange={handleInputChange}
              >
                <option value="">All categories</option>
                {treatmentCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="treatment_type">
                Treatment Type *
                {errors.treatment_type && <span className="error">{errors.treatment_type}</span>}
              </label>
              <select
                id="treatment_type"
                name="treatment_type"
                value={formData.treatment_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select treatment type</option>
                {filteredTreatmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {selectedTreatmentType && (
                <div className="treatment-info">
                  <p><strong>Description:</strong> {selectedTreatmentType.description}</p>
                  <p><strong>Duration:</strong> ~{selectedTreatmentType.typical_duration_minutes} minutes</p>
                  {selectedTreatmentType.requires_consent && (
                    <p className="consent-required">⚠️ This treatment requires patient consent</p>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="eye_treated">
                Eye Treated *
                {errors.eye_treated && <span className="error">{errors.eye_treated}</span>}
              </label>
              <select
                id="eye_treated"
                name="eye_treated"
                value={formData.eye_treated}
                onChange={handleInputChange}
                required
              >
                <option value="">Select eye</option>
                <option value="right">Right Eye (OD)</option>
                <option value="left">Left Eye (OS)</option>
                <option value="both">Both Eyes (OU)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="form-section">
          <h3>Clinical Information</h3>
          <div className="form-group">
            <label htmlFor="indication">
              Clinical Indication *
              {errors.indication && <span className="error">{errors.indication}</span>}
            </label>
            <textarea
              id="indication"
              name="indication"
              value={formData.indication}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe the clinical indication for this treatment..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="technique_notes">Surgical Technique Notes</label>
            <textarea
              id="technique_notes"
              name="technique_notes"
              value={formData.technique_notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Specific surgical approach or technique notes..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="anesthesia_used">Anesthesia Type</label>
            <select
              id="anesthesia_used"
              name="anesthesia_used"
              value={formData.anesthesia_used}
              onChange={handleInputChange}
            >
              <option value="">Select anesthesia type</option>
              <option value="none">No Anesthesia</option>
              <option value="topical">Topical Anesthesia</option>
              <option value="local">Local Anesthesia</option>
              <option value="regional">Regional Anesthesia</option>
              <option value="general">General Anesthesia</option>
            </select>
          </div>
        </div>

        {/* Staff Assignment */}
        <div className="form-section">
          <h3>Staff Assignment</h3>
          <div className="form-group">
            <label htmlFor="primary_surgeon">
              Primary Surgeon *
              {errors.primary_surgeon && <span className="error">{errors.primary_surgeon}</span>}
            </label>
            <select
              id="primary_surgeon"
              name="primary_surgeon"
              value={formData.primary_surgeon}
              onChange={handleInputChange}
              required
            >
              <option value="">Select primary surgeon</option>
              {staff.filter(s => s.user_type === 'doctor').map(surgeon => (
                <option key={surgeon.id} value={surgeon.id}>
                  Dr. {surgeon.first_name} {surgeon.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assisting Staff</label>
            <div className="staff-checkboxes">
              {staff.filter(s => s.user_type !== 'admin').map(member => (
                <label key={member.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="assisting_staff"
                    value={member.id}
                    checked={formData.assisting_staff?.includes(member.id)}
                    onChange={handleInputChange}
                  />
                  {member.first_name} {member.last_name} ({member.user_type})
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="form-section">
          <h3>Scheduling</h3>
          <div className="form-group">
            <label htmlFor="scheduled_date">
              Scheduled Date & Time
              {errors.scheduled_date && <span className="error">{errors.scheduled_date}</span>}
            </label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Consent */}
        <div className="form-section">
          <h3>Consent Management</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="consent_obtained"
                checked={formData.consent_obtained}
                onChange={handleInputChange}
              />
              Patient consent obtained
              {errors.consent_obtained && <span className="error">{errors.consent_obtained}</span>}
            </label>
          </div>

          {formData.consent_obtained && (
            <>
              <div className="form-group">
                <label htmlFor="consent_date">
                  Consent Date & Time *
                  {errors.consent_date && <span className="error">{errors.consent_date}</span>}
                </label>
                <input
                  type="datetime-local"
                  id="consent_date"
                  name="consent_date"
                  value={formData.consent_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="consent_obtained_by">Consent Obtained By</label>
                <select
                  id="consent_obtained_by"
                  name="consent_obtained_by"
                  value={formData.consent_obtained_by}
                  onChange={handleInputChange}
                >
                  <option value="">Select staff member</option>
                  {staff.filter(s => ['doctor', 'nurse'].includes(s.user_type)).map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.user_type})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Follow-up */}
        <div className="form-section">
          <h3>Follow-up Planning</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requires_follow_up"
                checked={formData.requires_follow_up}
                onChange={handleInputChange}
              />
              Requires follow-up appointment
            </label>
          </div>

          {formData.requires_follow_up && (
            <>
              <div className="form-group">
                <label htmlFor="follow_up_weeks">Follow-up in (weeks)</label>
                <input
                  type="number"
                  id="follow_up_weeks"
                  name="follow_up_weeks"
                  value={formData.follow_up_weeks}
                  onChange={handleInputChange}
                  min="1"
                  max="52"
                />
              </div>

              <div className="form-group">
                <label htmlFor="follow_up_instructions">Follow-up Instructions</label>
                <textarea
                  id="follow_up_instructions"
                  name="follow_up_instructions"
                  value={formData.follow_up_instructions}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Post-treatment follow-up instructions..."
                />
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (initialData ? 'Update Treatment' : 'Schedule Treatment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm;