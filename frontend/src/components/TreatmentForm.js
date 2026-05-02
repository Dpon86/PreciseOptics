import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TreatmentForm.css';

// Action types
const ACTIONS = {
  SET_FORM_DATA: 'SET_FORM_DATA',
  UPDATE_FIELD: 'UPDATE_FIELD',
  SET_LOOKUP_DATA: 'SET_LOOKUP_DATA',
  SET_FILTERED_TYPES: 'SET_FILTERED_TYPES',
  SET_SELECTED_TYPE: 'SET_SELECTED_TYPE',
  SET_LOADING: 'SET_LOADING',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FORM_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };
    case ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value }
      };
    case ACTIONS.SET_LOOKUP_DATA:
      return {
        ...state,
        ...action.payload
      };
    case ACTIONS.SET_FILTERED_TYPES:
      return {
        ...state,
        filteredTreatmentTypes: action.payload
      };
    case ACTIONS.SET_SELECTED_TYPE:
      return {
        ...state,
        selectedTreatmentType: action.payload
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      };
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.field]: '' }
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  formData: {
    patient: '',
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
  },
  treatmentCategories: [],
  treatmentTypes: [],
  filteredTreatmentTypes: [],
  consultations: [],
  staff: [],
  selectedTreatmentType: null,
  loading: false,
  errors: {}
};

const TreatmentForm = ({ patient, onSubmit, onCancel, initialData = null }) => {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    formData: { ...initialState.formData, patient: patient?.id || '' }
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      dispatch({
        type: ACTIONS.SET_FORM_DATA,
        payload: {
          ...initialData,
          scheduled_date: initialData.scheduled_date 
            ? new Date(initialData.scheduled_date).toISOString().slice(0, 16)
            : '',
          consent_date: initialData.consent_date
            ? new Date(initialData.consent_date).toISOString().slice(0, 16)
            : ''
        }
      });
    }
  }, [initialData]);

  // Filter treatment types when category selection changes
  useEffect(() => {
    if (state.formData.treatment_category) {
      const filtered = state.treatmentTypes.filter(
        type => type.category === state.formData.treatment_category
      );
      dispatch({ type: ACTIONS.SET_FILTERED_TYPES, payload: filtered });
    } else {
      dispatch({ type: ACTIONS.SET_FILTERED_TYPES, payload: state.treatmentTypes });
    }
  }, [state.formData.treatment_category, state.treatmentTypes]);

  // Update form when treatment type is selected
  useEffect(() => {
    if (state.formData.treatment_type && state.treatmentTypes.length > 0) {
      const selected = state.treatmentTypes.find(type => type.id === state.formData.treatment_type);
      dispatch({ type: ACTIONS.SET_SELECTED_TYPE, payload: selected });
      
      if (selected) {
        dispatch({
          type: ACTIONS.SET_FORM_DATA,
          payload: {
            priority: selected.urgency_level || 'routine',
            anesthesia_used: selected.requires_anesthesia || '',
            follow_up_weeks: selected.typical_duration_minutes ? 
              Math.ceil(selected.typical_duration_minutes / 60) : 2
          }
        });
      }
    }
  }, [state.formData.treatment_type, state.treatmentTypes]);

  const fetchInitialData = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
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

      dispatch({
        type: ACTIONS.SET_LOOKUP_DATA,
        payload: {
          treatmentCategories: categories.results || categories,
          treatmentTypes: types.results || types,
          consultations: consultationsData.results || consultationsData,
          staff: staffData.results || staffData
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({
        type: ACTIONS.SET_ERRORS,
        payload: { general: 'Failed to load form data' }
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'assisting_staff') {
      const staffId = value;
      const currentStaff = state.formData.assisting_staff || [];
      
      if (checked) {
        dispatch({
          type: ACTIONS.UPDATE_FIELD,
          field: 'assisting_staff',
          value: [...currentStaff, staffId]
        });
      } else {
        dispatch({
          type: ACTIONS.UPDATE_FIELD,
          field: 'assisting_staff',
          value: currentStaff.filter(id => id !== staffId)
        });
      }
    } else {
      dispatch({
        type: ACTIONS.UPDATE_FIELD,
        field: name,
        value: type === 'checkbox' ? checked : value
      });
    }

    // Clear errors for this field
    if (state.errors[name]) {
      dispatch({ type: ACTIONS.CLEAR_ERROR, field: name });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { formData, selectedTreatmentType } = state;

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

    dispatch({ type: ACTIONS.SET_ERRORS, payload: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await onSubmit(state.formData);
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERRORS,
        payload: { general: error.message || 'Failed to save treatment' }
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  if (state.loading) {
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

      {state.errors.general && (
        <div className="alert alert-error">
          {state.errors.general}
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
                {state.errors.consultation && <span className="error">{state.errors.consultation}</span>}
              </label>
              <select
                id="consultation"
                name="consultation"
                value={state.formData.consultation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select consultation</option>
                {state.consultations.map(consultation => (
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
                value={state.formData.treatment_category || ''}
                onChange={handleInputChange}
              >
                <option value="">All categories</option>
                {state.treatmentCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="treatment_type">
                Treatment Type *
                {state.errors.treatment_type && <span className="error">{state.errors.treatment_type}</span>}
              </label>
              <select
                id="treatment_type"
                name="treatment_type"
                value={state.formData.treatment_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select treatment type</option>
                {state.filteredTreatmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {state.selectedTreatmentType && (
                <div className="treatment-info">
                  <p><strong>Description:</strong> {state.selectedTreatmentType.description}</p>
                  <p><strong>Duration:</strong> ~{state.selectedTreatmentType.typical_duration_minutes} minutes</p>
                  {state.selectedTreatmentType.requires_consent && (
                    <p className="consent-required">⚠️ This treatment requires patient consent</p>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="eye_treated">
                Eye Treated *
                {state.errors.eye_treated && <span className="error">{state.errors.eye_treated}</span>}
              </label>
              <select
                id="eye_treated"
                name="eye_treated"
                value={state.formData.eye_treated}
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
                value={state.formData.priority}
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
              {state.errors.indication && <span className="error">{state.errors.indication}</span>}
            </label>
            <textarea
              id="indication"
              name="indication"
              value={state.formData.indication}
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
              value={state.formData.technique_notes}
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
              value={state.formData.anesthesia_used}
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
              {state.errors.primary_surgeon && <span className="error">{state.errors.primary_surgeon}</span>}
            </label>
            <select
              id="primary_surgeon"
              name="primary_surgeon"
              value={state.formData.primary_surgeon}
              onChange={handleInputChange}
              required
            >
              <option value="">Select primary surgeon</option>
              {state.staff.filter(s => s.user_type === 'doctor').map(surgeon => (
                <option key={surgeon.id} value={surgeon.id}>
                  Dr. {surgeon.first_name} {surgeon.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assisting Staff</label>
            <div className="staff-checkboxes">
              {state.staff.filter(s => s.user_type !== 'admin').map(member => (
                <label key={member.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="assisting_staff"
                    value={member.id}
                    checked={state.formData.assisting_staff?.includes(member.id)}
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
              {state.errors.scheduled_date && <span className="error">{state.errors.scheduled_date}</span>}
            </label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={state.formData.scheduled_date}
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
                checked={state.formData.consent_obtained}
                onChange={handleInputChange}
              />
              Patient consent obtained
              {state.errors.consent_obtained && <span className="error">{state.errors.consent_obtained}</span>}
            </label>
          </div>

          {state.formData.consent_obtained && (
            <>
              <div className="form-group">
                <label htmlFor="consent_date">
                  Consent Date & Time *
                  {state.errors.consent_date && <span className="error">{state.errors.consent_date}</span>}
                </label>
                <input
                  type="datetime-local"
                  id="consent_date"
                  name="consent_date"
                  value={state.formData.consent_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="consent_obtained_by">Consent Obtained By</label>
                <select
                  id="consent_obtained_by"
                  name="consent_obtained_by"
                  value={state.formData.consent_obtained_by}
                  onChange={handleInputChange}
                >
                  <option value="">Select staff member</option>
                  {state.staff.filter(s => ['doctor', 'nurse'].includes(s.user_type)).map(member => (
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
                checked={state.formData.requires_follow_up}
                onChange={handleInputChange}
              />
              Requires follow-up appointment
            </label>
          </div>

          {state.formData.requires_follow_up && (
            <>
              <div className="form-group">
                <label htmlFor="follow_up_weeks">Follow-up in (weeks)</label>
                <input
                  type="number"
                  id="follow_up_weeks"
                  name="follow_up_weeks"
                  value={state.formData.follow_up_weeks}
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
                  value={state.formData.follow_up_instructions}
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
            disabled={state.loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={state.loading}
          >
            {state.loading ? 'Saving...' : (initialData ? 'Update Treatment' : 'Schedule Treatment')}
          </button>
        </div>
      </form>
    </div>
  );
};

TreatmentForm.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default TreatmentForm;