import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddPrescriptionPage = () => {
  const [formData, setFormData] = useState({
    patient: '',
    prescribing_doctor: '',
    consultation: '',
    prescription_date: '',
    status: 'active',
    
    // Prescription items (we'll handle multiple medications)
    medications: [{
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity_prescribed: '',
      refills_allowed: 0
    }],
    
    // General prescription info
    special_instructions: '',
    pharmacy_notes: '',
    emergency_prescription: false,
    prescription_notes: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' }
  ];

  const frequencyOptions = [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, doctorsRes, consultationsRes, medicationsRes] = await Promise.all([
        api.getPatients(),
        api.getDoctors(),
        api.getConsultations(),
        api.getMedications()
      ]);
      
      setPatients(patientsRes.data.results || patientsRes.data || []);
      setDoctors(doctorsRes.data.results || doctorsRes.data || []);
      setConsultations(consultationsRes.data.results || consultationsRes.data || []);
      setMedications(medicationsRes.data.results || medicationsRes.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load form data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity_prescribed: '',
        refills_allowed: 0
      }]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.createPrescription(formData);
      
      if (response.status === 201) {
        alert('Prescription created successfully!');
        navigate('/prescriptions');
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Prescription</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="prescription-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Prescription Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patient" className="form-label">
                Patient *
              </label>
              <select
                id="patient"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.patient_id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="prescribing_doctor" className="form-label">
                Prescribing Doctor *
              </label>
              <select
                id="prescribing_doctor"
                name="prescribing_doctor"
                value={formData.prescribing_doctor}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consultation" className="form-label">
                Related Consultation
              </label>
              <select
                id="consultation"
                name="consultation"
                value={formData.consultation}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Consultation (Optional)</option>
                {consultations.map(consultation => (
                  <option key={consultation.id} value={consultation.id}>
                    {consultation.patient_name} - {consultation.consultation_type} ({new Date(consultation.scheduled_time).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="prescription_date" className="form-label">
                Prescription Date *
              </label>
              <input
                type="datetime-local"
                id="prescription_date"
                name="prescription_date"
                value={formData.prescription_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emergency_prescription"
                  checked={formData.emergency_prescription}
                  onChange={handleChange}
                />
                Emergency Prescription
              </label>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="form-section">
          <div className="section-header">
            <h3>Medications</h3>
            <button
              type="button"
              onClick={addMedication}
              className="btn btn-secondary btn-small"
            >
              + Add Medication
            </button>
          </div>
          
          {formData.medications.map((medication, index) => (
            <div key={index} className="medication-item">
              <div className="medication-header">
                <h4>Medication {index + 1}</h4>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="btn btn-danger btn-small"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Medication *
                  </label>
                  <select
                    value={medication.medication}
                    onChange={(e) => handleMedicationChange(index, 'medication', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.strength}) - {med.medication_type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 1 drop, 1 tablet"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Frequency *
                  </label>
                  <select
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Frequency</option>
                    {frequencyOptions.map(freq => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 7 days, 2 weeks, 1 month"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Quantity Prescribed
                  </label>
                  <input
                    type="text"
                    value={medication.quantity_prescribed}
                    onChange={(e) => handleMedicationChange(index, 'quantity_prescribed', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 30 tablets, 1 bottle"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Refills Allowed
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={medication.refills_allowed}
                    onChange={(e) => handleMedicationChange(index, 'refills_allowed', parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Special Instructions
                </label>
                <textarea
                  value={medication.instructions}
                  onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g., Apply to affected eye, Take with food, Avoid driving after use"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="form-section">
          <h3>Additional Instructions</h3>
          
          <div className="form-group">
            <label htmlFor="special_instructions" className="form-label">
              Special Instructions for Patient
            </label>
            <textarea
              id="special_instructions"
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="General instructions for the patient regarding this prescription..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pharmacy_notes" className="form-label">
              Pharmacy Notes
            </label>
            <textarea
              id="pharmacy_notes"
              name="pharmacy_notes"
              value={formData.pharmacy_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
              placeholder="Notes for the pharmacist..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="prescription_notes" className="form-label">
              Prescription Notes
            </label>
            <textarea
              id="prescription_notes"
              name="prescription_notes"
              value={formData.prescription_notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Additional notes about this prescription..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/prescriptions')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrescriptionPage;