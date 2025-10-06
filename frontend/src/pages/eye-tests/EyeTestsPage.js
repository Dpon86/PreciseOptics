import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

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
      const response = await api.getEyeTests();
      setEyeTests(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching eye tests:', err);
      setError('Failed to load eye tests');
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
                <h3>Patient: {test.patient_name || test.patient}</h3>
                <span className="test-date">
                  {new Date(test.test_date).toLocaleDateString()}
                </span>
              </div>
              <div className="card-content">
                <p><strong>Test Type:</strong> {test.test_type}</p>
                <p><strong>Doctor:</strong> {test.doctor_name || test.doctor}</p>
                {test.right_eye_result && (
                  <p><strong>Right Eye:</strong> {test.right_eye_result}</p>
                )}
                {test.left_eye_result && (
                  <p><strong>Left Eye:</strong> {test.left_eye_result}</p>
                )}
              </div>
              <div className="card-actions">
                <Link to={`/eye-tests/${test.id}`} className="btn btn-secondary">
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