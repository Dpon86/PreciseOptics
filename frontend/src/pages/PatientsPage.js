import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/patients/');
      setPatients(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone_number.includes(searchTerm)
  );

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patients</h1>
        <Link to="/patients/add" className="btn btn-primary">
          Add New Patient
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? 'No patients found matching your search' : 'No patients found'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <strong>{patient.first_name} {patient.last_name}</strong>
                  </td>
                  <td>{calculateAge(patient.date_of_birth)}</td>
                  <td>
                    {patient.gender === 'M' ? 'Male' : 
                     patient.gender === 'F' ? 'Female' : 'Other'}
                  </td>
                  <td>{patient.phone_number}</td>
                  <td>{patient.email || '-'}</td>
                  <td>{patient.city}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/patients/${patient.id}`} 
                        className="btn btn-sm btn-secondary"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/patients/${patient.id}/edit`} 
                        className="btn btn-sm btn-primary"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="page-footer">
        <p>Total patients: {filteredPatients.length}</p>
      </div>
    </div>
  );
};

export default PatientsPage;