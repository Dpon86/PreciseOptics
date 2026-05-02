import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

// Security (CRIT-13): store only the patient ID in sessionStorage, never the
// full patient object (PHI).  The full record is fetched from the API on demand.
const PATIENT_ID_KEY = 'selectedPatientId';

export const PatientProvider = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getPatients();
      const patientsData = response.data?.results || response.data || [];
      const list = Array.isArray(patientsData) ? patientsData : [];
      setPatients(list);
      return list;
    } catch (err) {
      setError('Failed to load patients');
      setPatients([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    // Persist only the ID (not PHI) so we can restore the selection after a
    // page refresh within the same browser session (sessionStorage is cleared
    // when the tab/window closes).
    if (patient?.id) {
      sessionStorage.setItem(PATIENT_ID_KEY, patient.id);
    } else {
      sessionStorage.removeItem(PATIENT_ID_KEY);
    }
    // Remove any legacy full-object entries written by previous versions
    localStorage.removeItem('selectedPatient');
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    sessionStorage.removeItem(PATIENT_ID_KEY);
    localStorage.removeItem('selectedPatient');
  };

  // On mount: if a patient ID was persisted from a previous page in the same
  // session, reload the full object from the API so we have up-to-date data.
  useEffect(() => {
    const storedId = sessionStorage.getItem(PATIENT_ID_KEY);
    // Also handle legacy localStorage entries from previous versions
    const legacyStored = localStorage.getItem('selectedPatient');

    if (storedId) {
      api.getPatient(storedId)
        .then((res) => setSelectedPatient(res.data))
        .catch(() => {
          sessionStorage.removeItem(PATIENT_ID_KEY);
        });
    } else if (legacyStored) {
      // Migrate: pull the ID from the old stored object, fetch fresh data, clear legacy key
      try {
        const legacyPatient = JSON.parse(legacyStored);
        if (legacyPatient?.id) {
          api.getPatient(legacyPatient.id)
            .then((res) => {
              setSelectedPatient(res.data);
              sessionStorage.setItem(PATIENT_ID_KEY, legacyPatient.id);
            })
            .catch(() => {});
        }
      } catch {
        // Corrupt data — ignore
      }
      localStorage.removeItem('selectedPatient');
    }
  }, []);

  const value = {
    selectedPatient,
    patients,
    loading,
    error,
    selectPatient,
    clearSelectedPatient,
    loadPatients,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;