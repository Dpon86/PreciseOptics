import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './EyeTestsPage.css';

const EyeTestsPage = () => {
  const [eyeTests, setEyeTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEyeTests();
  }, []);

  const fetchEyeTests = async () => {
    try {
      setLoading(true);
      
      // Fetch from all available eye test endpoints using authenticated API service
      const apiCalls = [
        { method: api.getVisualAcuityTests, type: 'Visual Acuity Test' },
        { method: api.getRefractionTests, type: 'Refraction Test' },
        { method: api.getCataractAssessments, type: 'Cataract Assessment' },
        { method: api.getGlaucomaAssessments, type: 'Glaucoma Assessment' },
        { method: api.getVisualFieldTests, type: 'Visual Field Test' },
        { method: api.getRetinalAssessments, type: 'Retinal Assessment' },
        { method: api.getDiabeticRetinopathyScreenings, type: 'Diabetic Retinopathy Screening' },
        { method: api.getOCTScans, type: 'OCT Scan' }
      ];

      const allTests = [];
      
      // Fetch from each endpoint
      for (const apiCall of apiCalls) {
        try {
          const response = await apiCall.method();
          const tests = response.data.results || response.data;
          
          // Transform each test to include test type and standardize format
          const transformedTests = tests.map(test => ({
            id: `${apiCall.type.toLowerCase().replace(/\s+/g, '-')}-${test.id}`,
            original_id: test.id,
            patient_name: test.patient_details?.name || test.patient_name || `Patient ID: ${test.patient}`,
            test_date: test.test_date || test.date_performed,
            test_type: apiCall.type,
            doctor_name: test.performed_by_details?.name || test.doctor_name || `Doctor ID: ${test.performed_by}`,
            right_eye_result: test.right_eye_result || test.od_result || test.right_eye || 'N/A',
            left_eye_result: test.left_eye_result || test.os_result || test.left_eye || 'N/A',
            notes: test.notes || test.comments || '',
            original_data: test
          }));
          
          allTests.push(...transformedTests);
        } catch (endpointError) {
          console.log(`${apiCall.type} endpoint error:`, endpointError.message);
        }
      }
      
      // Sort by test date (newest first)
      allTests.sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
      
      setEyeTests(allTests);
      
      if (allTests.length === 0) {
        setError('No eye tests found in database');
      }
      
    } catch (err) {
      console.error('Error fetching eye tests:', err);
      setError('Failed to load eye tests from database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading eye tests...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Eye Tests</h1>
        <Link to="/eye-tests/visual-acuity/add" className="btn btn-primary">
          Add New Eye Test
        </Link>
      </div>

      <div className="tests-grid">
        {eyeTests.length === 0 ? (
          <div className="empty-state">
            <p>No eye tests found.</p>
            <Link to="/eye-tests/visual-acuity/add" className="btn btn-primary">
              Add First Eye Test
            </Link>
          </div>
        ) : (
          eyeTests.map((test) => (
            <div key={test.id} className="test-card">
              <div className="card-header">
                <h3>{test.patient_name}</h3>
                <span className="test-date">
                  {new Date(test.test_date).toLocaleDateString()}
                </span>
              </div>
              <div className="card-content">
                <p><strong>Test Type:</strong> {test.test_type}</p>
                <p><strong>Doctor:</strong> {test.doctor_name}</p>
                {test.right_eye_result && test.right_eye_result !== 'N/A' && (
                  <p><strong>Right Eye:</strong> {test.right_eye_result}</p>
                )}
                {test.left_eye_result && test.left_eye_result !== 'N/A' && (
                  <p><strong>Left Eye:</strong> {test.left_eye_result}</p>
                )}
                {test.notes && (
                  <p><strong>Notes:</strong> {test.notes}</p>
                )}
              </div>
              <div className="card-actions">
                <Link to={`/eye-tests/${test.original_id}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EyeTestsPage;