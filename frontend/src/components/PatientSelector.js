import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';

const PatientSelector = () => {
  const { patients, loading, error, selectPatient, loadPatients } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load patients when component mounts
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(patient => 
    `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const handlePatientSelect = (patient) => {
    selectPatient(patient);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  if (loading) {
    return (
      <div className="patient-selector">
        <div className="patient-selector-header">
          <h2>Select a Patient</h2>
          <p>Loading patients...</p>
        </div>
        <div className="patient-selector-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error && (!Array.isArray(patients) || patients.length === 0)) {
    return (
      <div className="patient-selector">
        <div className="patient-selector-header">
          <h2>Select a Patient</h2>
          <p>Unable to load patients</p>
        </div>
        <div className="patient-selector-error">
          Error: {error}
          <button 
            onClick={() => loadPatients()} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-selector">
      <div className="patient-selector-header">
        <h2>Select a Patient</h2>
        <p>Choose a patient to access their consultations, eye tests, and medications</p>
      </div>
      
      <div className="patient-search-container">
        <input
          type="text"
          placeholder="Search by name, ID, or phone number..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="patient-search-input"
          onFocus={() => setShowDropdown(searchTerm.length > 0)}
        />
        
        {showDropdown && filteredPatients.length > 0 && (
          <div className="patient-dropdown">
            {filteredPatients.slice(0, 10).map((patient) => (
              <div
                key={patient.id}
                className="patient-dropdown-item"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="patient-info">
                  <div className="patient-name">
                    {patient.first_name} {patient.last_name}
                  </div>
                  <div className="patient-details">
                    ID: {patient.patient_id} | Phone: {patient.phone} | DOB: {patient.date_of_birth}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showDropdown && filteredPatients.length === 0 && searchTerm.length > 0 && (
          <div className="patient-dropdown">
            <div className="no-patients-found">No patients found matching "{searchTerm}"</div>
          </div>
        )}
      </div>
      
      {/* Recent patients list */}
      <div className="recent-patients">
        <h3>Recent Patients</h3>
        {Array.isArray(patients) && patients.length > 0 ? (
          <div className="patients-grid">
            {patients.slice(0, 8).map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => handlePatientSelect(patient)}
            >
              <div className="patient-card-header">
                <div className="patient-avatar">
                  {(patient.first_name?.[0] || '?')}{(patient.last_name?.[0] || '?')}
                </div>
                <div className="patient-card-info">
                  <div className="patient-card-name">
                    {patient.first_name || 'Unknown'} {patient.last_name || 'Patient'}
                  </div>
                  <div className="patient-card-id">ID: {patient.patient_id || 'N/A'}</div>
                </div>
              </div>
              <div className="patient-card-details">
                <div>Age: {patient.age || 'N/A'}</div>
                <div>Phone: {patient.phone || 'N/A'}</div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="no-patients-message">
            <p>No patients found. Please contact your administrator or try refreshing the page.</p>
            <button 
              onClick={() => loadPatients()} 
              className="btn btn-primary"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSelector;