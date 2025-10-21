import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './EyeTestDetailPage.css';

const EyeTestDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testType, setTestType] = useState('');

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from all possible eye test endpoints
      const apiCalls = [
        { method: api.getVisualAcuityTests, type: 'Visual Acuity Test', displayName: 'Visual Acuity Test' },
        { method: api.getRefractionTests, type: 'Refraction Test', displayName: 'Refraction Test' },
        { method: api.getCataractAssessments, type: 'Cataract Assessment', displayName: 'Cataract Assessment' },
        { method: api.getGlaucomaAssessments, type: 'Glaucoma Assessment', displayName: 'Glaucoma Assessment' },
        { method: api.getVisualFieldTests, type: 'Visual Field Test', displayName: 'Visual Field Test' },
        { method: api.getRetinalAssessments, type: 'Retinal Assessment', displayName: 'Retinal Assessment' },
        { method: api.getDiabeticRetinopathyScreenings, type: 'Diabetic Retinopathy', displayName: 'Diabetic Retinopathy Screening' },
        { method: api.getOCTScans, type: 'OCT Scan', displayName: 'OCT Scan' }
      ];

      for (const apiCall of apiCalls) {
        try {
          const response = await apiCall.method();
          const tests = response.data.results || response.data;
          
          // Find the test with matching ID
          const foundTest = tests.find(t => t.id === testId);
          
          if (foundTest) {
            setTest(foundTest);
            setTestType(apiCall.displayName);
            setLoading(false);
            return;
          }
        } catch (endpointError) {
          console.log(`Error checking ${apiCall.type}:`, endpointError.message);
        }
      }
      
      // If we get here, test not found
      setError('Eye test not found');
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching eye test details:', err);
      setError('Failed to load eye test details');
      setLoading(false);
    }
  };

  const renderVisualAcuityDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>Test Method</h3>
        <p>{test.test_method_display || test.test_method || 'N/A'}</p>
      </div>

      <div className="detail-section full-width">
        <h3>Right Eye Results</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Unaided:</label>
            <span>{test.right_eye_unaided || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Aided:</label>
            <span>{test.right_eye_aided || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Pinhole:</label>
            <span>{test.right_eye_pinhole || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section full-width">
        <h3>Left Eye Results</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Unaided:</label>
            <span>{test.left_eye_unaided || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Aided:</label>
            <span>{test.left_eye_aided || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Pinhole:</label>
            <span>{test.left_eye_pinhole || 'N/A'}</span>
          </div>
        </div>
      </div>

      {test.binocular_vision && (
        <div className="detail-section">
          <h3>Binocular Vision</h3>
          <p>{test.binocular_vision}</p>
        </div>
      )}
    </div>
  );

  const renderGlaucomaDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>IOP (Intraocular Pressure)</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Right Eye:</label>
            <span>{test.right_eye_iop ? `${test.right_eye_iop} mmHg` : 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Left Eye:</label>
            <span>{test.left_eye_iop ? `${test.left_eye_iop} mmHg` : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Cup-Disc Ratio</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Right Eye:</label>
            <span>{test.right_eye_cup_disc_ratio || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Left Eye:</label>
            <span>{test.left_eye_cup_disc_ratio || 'N/A'}</span>
          </div>
        </div>
      </div>

      {test.gonioscopy_results && (
        <div className="detail-section full-width">
          <h3>Gonioscopy Results</h3>
          <p>{test.gonioscopy_results}</p>
        </div>
      )}

      {test.pachymetry_results && (
        <div className="detail-section full-width">
          <h3>Pachymetry Results</h3>
          <p>{test.pachymetry_results}</p>
        </div>
      )}
    </div>
  );

  const renderRefractionDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section full-width">
        <h3>Right Eye Refraction</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Sphere:</label>
            <span>{test.right_eye_sphere || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Cylinder:</label>
            <span>{test.right_eye_cylinder || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Axis:</label>
            <span>{test.right_eye_axis || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Add:</label>
            <span>{test.right_eye_add || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Visual Acuity:</label>
            <span>{test.right_eye_visual_acuity || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section full-width">
        <h3>Left Eye Refraction</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Sphere:</label>
            <span>{test.left_eye_sphere || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Cylinder:</label>
            <span>{test.left_eye_cylinder || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Axis:</label>
            <span>{test.left_eye_axis || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Add:</label>
            <span>{test.left_eye_add || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Visual Acuity:</label>
            <span>{test.left_eye_visual_acuity || 'N/A'}</span>
          </div>
        </div>
      </div>

      {test.prescription_issued && (
        <div className="detail-section">
          <h3>Prescription</h3>
          <p className="badge badge-success">Prescription Issued</p>
        </div>
      )}
    </div>
  );

  const renderCataractDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>Right Eye Grading</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Nuclear Sclerosis:</label>
            <span>{test.right_eye_nuclear_sclerosis || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Cortical:</label>
            <span>{test.right_eye_cortical || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>PSC:</label>
            <span>{test.right_eye_psc || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Left Eye Grading</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Nuclear Sclerosis:</label>
            <span>{test.left_eye_nuclear_sclerosis || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Cortical:</label>
            <span>{test.left_eye_cortical || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>PSC:</label>
            <span>{test.left_eye_psc || 'N/A'}</span>
          </div>
        </div>
      </div>

      {test.surgery_recommended !== undefined && (
        <div className="detail-section">
          <h3>Treatment Recommendation</h3>
          <p className={`badge ${test.surgery_recommended ? 'badge-warning' : 'badge-info'}`}>
            {test.surgery_recommended ? 'Surgery Recommended' : 'Conservative Management'}
          </p>
        </div>
      )}
    </div>
  );

  const renderVisualFieldDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>Test Parameters</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>Test Type:</label>
            <span>{test.test_type_display || test.test_type || 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>Strategy:</label>
            <span>{test.test_strategy_display || test.test_strategy || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Right Eye Results</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>MD (Mean Deviation):</label>
            <span>{test.right_eye_md ? `${test.right_eye_md} dB` : 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>PSD:</label>
            <span>{test.right_eye_psd ? `${test.right_eye_psd} dB` : 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>VFI:</label>
            <span>{test.right_eye_vfi ? `${test.right_eye_vfi}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Left Eye Results</h3>
        <div className="results-grid">
          <div className="result-item">
            <label>MD (Mean Deviation):</label>
            <span>{test.left_eye_md ? `${test.left_eye_md} dB` : 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>PSD:</label>
            <span>{test.left_eye_psd ? `${test.left_eye_psd} dB` : 'N/A'}</span>
          </div>
          <div className="result-item">
            <label>VFI:</label>
            <span>{test.left_eye_vfi ? `${test.left_eye_vfi}%` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOCTDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>Scan Type</h3>
        <p>{test.scan_type_display || test.scan_type || 'N/A'}</p>
      </div>

      {test.right_eye_crt && (
        <div className="detail-section">
          <h3>Right Eye CRT</h3>
          <p>{test.right_eye_crt} μm</p>
        </div>
      )}

      {test.left_eye_crt && (
        <div className="detail-section">
          <h3>Left Eye CRT</h3>
          <p>{test.left_eye_crt} μm</p>
        </div>
      )}

      {test.right_eye_rnfl_thickness && (
        <div className="detail-section">
          <h3>Right Eye RNFL Thickness</h3>
          <p>{test.right_eye_rnfl_thickness} μm</p>
        </div>
      )}

      {test.left_eye_rnfl_thickness && (
        <div className="detail-section">
          <h3>Left Eye RNFL Thickness</h3>
          <p>{test.left_eye_rnfl_thickness} μm</p>
        </div>
      )}
    </div>
  );

  const renderDiabeticRetinopathyDetails = () => (
    <div className="test-details-grid">
      <div className="detail-section">
        <h3>Right Eye Grading</h3>
        <p className={`badge ${test.right_eye_retinopathy_grade === 'none' ? 'badge-success' : 'badge-warning'}`}>
          {test.right_eye_retinopathy_grade_display || test.right_eye_retinopathy_grade || 'N/A'}
        </p>
      </div>

      <div className="detail-section">
        <h3>Left Eye Grading</h3>
        <p className={`badge ${test.left_eye_retinopathy_grade === 'none' ? 'badge-success' : 'badge-warning'}`}>
          {test.left_eye_retinopathy_grade_display || test.left_eye_retinopathy_grade || 'N/A'}
        </p>
      </div>

      {test.right_eye_maculopathy !== undefined && (
        <div className="detail-section">
          <h3>Right Eye Maculopathy</h3>
          <p className={`badge ${test.right_eye_maculopathy ? 'badge-danger' : 'badge-success'}`}>
            {test.right_eye_maculopathy ? 'Present' : 'Absent'}
          </p>
        </div>
      )}

      {test.left_eye_maculopathy !== undefined && (
        <div className="detail-section">
          <h3>Left Eye Maculopathy</h3>
          <p className={`badge ${test.left_eye_maculopathy ? 'badge-danger' : 'badge-success'}`}>
            {test.left_eye_maculopathy ? 'Present' : 'Absent'}
          </p>
        </div>
      )}

      {test.referral_required !== undefined && (
        <div className="detail-section">
          <h3>Referral Status</h3>
          <p className={`badge ${test.referral_required ? 'badge-warning' : 'badge-success'}`}>
            {test.referral_required ? 'Referral Required' : 'No Referral Needed'}
          </p>
        </div>
      )}
    </div>
  );

  const renderTestSpecificDetails = () => {
    const type = testType.toLowerCase();
    
    if (type.includes('visual acuity')) {
      return renderVisualAcuityDetails();
    } else if (type.includes('glaucoma')) {
      return renderGlaucomaDetails();
    } else if (type.includes('refraction')) {
      return renderRefractionDetails();
    } else if (type.includes('cataract')) {
      return renderCataractDetails();
    } else if (type.includes('visual field')) {
      return renderVisualFieldDetails();
    } else if (type.includes('oct')) {
      return renderOCTDetails();
    } else if (type.includes('diabetic')) {
      return renderDiabeticRetinopathyDetails();
    } else {
      // Generic display for other test types
      return (
        <div className="test-details-grid">
          <div className="detail-section full-width">
            <h3>Test Results</h3>
            <pre className="json-display">{JSON.stringify(test, null, 2)}</pre>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading eye test details...</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="page-container">
        <div className="error-message">{error || 'Eye test not found'}</div>
        <button onClick={() => navigate('/eye-tests')} className="btn btn-primary">
          Back to Eye Tests
        </button>
      </div>
    );
  }

  return (
    <div className="page-container eye-test-detail">
      <div className="page-header">
        <div>
          <h1>{testType}</h1>
          <p className="subtitle">Test ID: {test.id}</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Back
        </button>
      </div>

      {/* Patient and Test Information */}
      <div className="info-cards">
        <div className="info-card">
          <h3>Patient Information</h3>
          <div className="info-content">
            <div className="info-row">
              <label>Patient:</label>
              <span>
                {test.patient_details?.name || 
                 `${test.patient_details?.first_name} ${test.patient_details?.last_name}` ||
                 `Patient ID: ${test.patient}`}
              </span>
            </div>
            {test.patient_details?.date_of_birth && (
              <div className="info-row">
                <label>Date of Birth:</label>
                <span>{new Date(test.patient_details.date_of_birth).toLocaleDateString()}</span>
              </div>
            )}
            {test.patient_details?.patient_number && (
              <div className="info-row">
                <label>Patient Number:</label>
                <span>{test.patient_details.patient_number}</span>
              </div>
            )}
            {test.patient && (
              <div className="info-row">
                <Link to={`/patients/${test.patient}`} className="btn btn-link">
                  View Patient Profile →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="info-card">
          <h3>Test Information</h3>
          <div className="info-content">
            <div className="info-row">
              <label>Test Date:</label>
              <span>{new Date(test.test_date || test.date_performed).toLocaleString()}</span>
            </div>
            <div className="info-row">
              <label>Performed By:</label>
              <span>
                {test.performed_by_details?.name || 
                 `${test.performed_by_details?.first_name} ${test.performed_by_details?.last_name}` ||
                 `Doctor ID: ${test.performed_by}`}
              </span>
            </div>
            {test.eye_side && (
              <div className="info-row">
                <label>Eye Side:</label>
                <span className="badge">{test.eye_side_display || test.eye_side}</span>
              </div>
            )}
            {test.status && (
              <div className="info-row">
                <label>Status:</label>
                <span className={`badge badge-${test.status === 'completed' ? 'success' : 'info'}`}>
                  {test.status_display || test.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test-Specific Results */}
      <div className="detail-card">
        <h2>Test Results</h2>
        {renderTestSpecificDetails()}
      </div>

      {/* Clinical Findings */}
      {test.findings && (
        <div className="detail-card">
          <h2>Clinical Findings</h2>
          <p className="findings-text">{test.findings}</p>
        </div>
      )}

      {/* Recommendations */}
      {test.recommendations && (
        <div className="detail-card">
          <h2>Recommendations</h2>
          <p className="recommendations-text">{test.recommendations}</p>
        </div>
      )}

      {/* Notes */}
      {test.notes && (
        <div className="detail-card">
          <h2>Additional Notes</h2>
          <p className="notes-text">{test.notes}</p>
        </div>
      )}

      {/* Follow-up Information */}
      {test.follow_up_required && (
        <div className="detail-card follow-up-card">
          <h2>Follow-up Required</h2>
          <div className="info-content">
            {test.follow_up_date && (
              <div className="info-row">
                <label>Follow-up Date:</label>
                <span className="badge badge-warning">
                  {new Date(test.follow_up_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consultation Link */}
      {test.consultation && (
        <div className="detail-card">
          <h2>Related Consultation</h2>
          <Link to={`/consultations/${test.consultation}`} className="btn btn-primary">
            View Consultation Details →
          </Link>
        </div>
      )}

      {/* Metadata */}
      <div className="metadata-card">
        <h3>Record Information</h3>
        <div className="metadata-content">
          <div className="metadata-row">
            <label>Created:</label>
            <span>{new Date(test.created_at).toLocaleString()}</span>
          </div>
          <div className="metadata-row">
            <label>Last Updated:</label>
            <span>{new Date(test.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EyeTestDetailPage;
