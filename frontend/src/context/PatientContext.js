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

export const PatientProvider = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load patients only when explicitly requested
  // (removed automatic loading on mount)

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getPatients();
      // Ensure we always set an array, handle different response structures
      const patientsData = response.data?.results || response.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients');
      setPatients([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    // Store in localStorage for persistence
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    localStorage.removeItem('selectedPatient');
  };

  // Restore selected patient from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedPatient');
    if (stored) {
      try {
        const patient = JSON.parse(stored);
        setSelectedPatient(patient);
      } catch (err) {
        console.error('Error parsing stored patient:', err);
        localStorage.removeItem('selectedPatient');
      }
    }
  }, []);

  const value = {
    selectedPatient,
    patients,
    loading,
    error,
    selectPatient,
    clearSelectedPatient,
    loadPatients
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;