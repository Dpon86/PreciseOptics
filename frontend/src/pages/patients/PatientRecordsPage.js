import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './PatientRecordsPage.css';

const PatientRecordsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [eyeTests, setEyeTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    fetchAllPatientRecords();
  }, [patientId]);

  const fetchAllPatientRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient details
      console.log('Fetching patient details for ID:', patientId);
      const patientResponse = await api.getPatient(patientId);
      setPatient(patientResponse.data);
      console.log('Patient data loaded:', patientResponse.data);

      // Fetch consultations
      console.log('Fetching consultations...');
      const consultationsResponse = await api.getConsultations();
      const consultationsData = consultationsResponse.data.results || consultationsResponse.data;
      const patientConsultations = consultationsData.filter(
        c => c.patient === patientId || c.patient === parseInt(patientId)
      );
      setConsultations(patientConsultations);
      console.log('Consultations loaded:', patientConsultations.length);

      // Fetch all eye test types
      console.log('Fetching eye tests...');
      const eyeTestPromises = [
        api.getVisualAcuityTests(),
        api.getGlaucomaAssessments(),
        api.getRefractionTests(),
        api.getCataractAssessments(),
        api.getVisualFieldTests(),
        api.getOCTScans(),
        api.getDiabeticRetinopathyScreenings()
      ];

      const eyeTestResponses = await Promise.all(eyeTestPromises);
      const allEyeTests = [];

      eyeTestResponses.forEach((response, index) => {
        const testTypes = [
          'Visual Acuity',
          'Glaucoma Assessment',
          'Refraction',
          'Cataract Assessment',
          'Visual Field',
          'OCT Scan',
          'Diabetic Retinopathy'
        ];
        
        const testsData = response.data.results || response.data;
        const tests = testsData.filter(t => t.patient === patientId || t.patient === parseInt(patientId));
        tests.forEach(test => {
          allEyeTests.push({
            ...test,
            test_type: testTypes[index]
          });
        });
      });

      setEyeTests(allEyeTests);
      console.log('Eye tests loaded:', allEyeTests.length);

      // Fetch prescriptions
      console.log('Fetching prescriptions...');
      const prescriptionsResponse = await api.getPrescriptions();
      const prescriptionsData = prescriptionsResponse.data.results || prescriptionsResponse.data;
      const patientPrescriptions = prescriptionsData.filter(
        p => p.patient === patientId || p.patient === parseInt(patientId)
      );
      setPrescriptions(patientPrescriptions);
      console.log('Prescriptions loaded:', patientPrescriptions.length);

      // Fetch treatments
      console.log('Fetching treatments...');
      const treatmentsResponse = await api.getTreatments();
      const treatmentsData = treatmentsResponse.data.results || treatmentsResponse.data;
      const patientTreatments = treatmentsData.filter(
        t => t.patient === patientId || t.patient === parseInt(patientId)
      );
      setTreatments(patientTreatments);
      console.log('Treatments loaded:', patientTreatments.length);

    } catch (err) {
      console.error('Error fetching patient records:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(`Failed to load patient records: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = () => {
    const activities = [];

    consultations.forEach(c => {
      activities.push({
        type: 'consultation',
        date: c.date,
        title: `Consultation with Dr. ${c.doctor_name}`,
        icon: '📋'
      });
    });

    eyeTests.forEach(t => {
      activities.push({
        type: 'test',
        date: t.date || t.test_date,
        title: `${t.test_type} Test`,
        icon: '👁️'
      });
    });

    prescriptions.forEach(p => {
      activities.push({
        type: 'prescription',
        date: p.prescribed_date,
        title: `Prescription by Dr. ${p.prescribed_by_name}`,
        icon: '💊'
      });
    });

    treatments.forEach(t => {
      activities.push({
        type: 'treatment',
        date: t.date,
        title: `${t.treatment_type} Treatment`,
        icon: '🏥'
      });
    });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading patient records...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!patient) {
    return <div className="error-message">Patient not found.</div>;
  }

  const recentActivity = getRecentActivity();

  return (
    <div className="patient-records">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <button onClick={() => navigate(`/patients/${patientId}`)} className="btn btn-secondary btn-sm">
            ← Back to Patient
          </button>
          <h1>Complete Medical Records</h1>
          <p className="subtitle">
            {patient.first_name} {patient.last_name} - DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            🖨️ Print Records
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="summary-card">
          <div className="summary-icon consultations">📋</div>
          <div className="summary-content">
            <div className="summary-number">{consultations.length}</div>
            <div className="summary-label">Consultations</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon tests">👁️</div>
          <div className="summary-content">
            <div className="summary-number">{eyeTests.length}</div>
            <div className="summary-label">Eye Tests</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon prescriptions">💊</div>
          <div className="summary-content">
            <div className="summary-number">{prescriptions.length}</div>
            <div className="summary-label">Prescriptions</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon treatments">🏥</div>
          <div className="summary-content">
            <div className="summary-number">{treatments.length}</div>
            <div className="summary-label">Treatments</div>
          </div>
        </div>
      </div>

      {/* Consultations Section */}
      <div className="records-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">📋</span>
            Consultations
          </h2>
          <Link to="/consultations/add" className="btn btn-primary btn-sm">
            + Add New Consultation
          </Link>
        </div>
        {consultations.length === 0 ? (
          <div className="empty-state">
            <p>No consultations recorded for this patient.</p>
            <Link to="/consultations/add" className="btn btn-primary">
              Add First Consultation
            </Link>
          </div>
        ) : (
          <div className="records-grid">
            {consultations.map(consultation => (
              <div key={consultation.id} className="record-card">
                <div className="record-header">
                  <span className="record-date">
                    {new Date(consultation.date).toLocaleDateString()}
                  </span>
                  <span className={`status-badge badge-${consultation.status?.toLowerCase() || 'info'}`}>
                    {consultation.status || 'Completed'}
                  </span>
                </div>
                <div className="record-body">
                  <h4>Dr. {consultation.doctor_name}</h4>
                  {consultation.specialty && (
                    <div className="record-detail">
                      <strong>Specialty:</strong> {consultation.specialty}
                    </div>
                  )}
                  {consultation.reason && (
                    <div className="record-detail">
                      <strong>Reason:</strong> {consultation.reason}
                    </div>
                  )}
                  {consultation.diagnosis && (
                    <div className="record-detail">
                      <strong>Diagnosis:</strong> {consultation.diagnosis}
                    </div>
                  )}
                </div>
                <div className="record-footer">
                  <div className="record-meta">ID: {consultation.id}</div>
                  <Link to={`/consultations/${consultation.id}`} className="btn btn-link btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eye Tests Section */}
      <div className="records-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">👁️</span>
            Eye Tests & Examinations
          </h2>
          <Link to="/eye-tests/add" className="btn btn-primary btn-sm">
            + Add New Eye Test
          </Link>
        </div>
        {eyeTests.length === 0 ? (
          <div className="empty-state">
            <p>No eye tests recorded for this patient.</p>
            <Link to="/eye-tests/add" className="btn btn-primary">
              Add First Eye Test
            </Link>
          </div>
        ) : (
          <div className="records-grid">
            {eyeTests.map((test, index) => (
              <div key={`${test.test_type}-${test.id}-${index}`} className="record-card">
                <div className="record-header">
                  <span className="record-date">
                    {new Date(test.date || test.test_date).toLocaleDateString()}
                  </span>
                  <span className="status-badge badge-info">{test.test_type}</span>
                </div>
                <div className="record-body">
                  <h4>{test.test_type} Test</h4>
                  {test.performed_by && (
                    <div className="record-detail">
                      <strong>Performed By:</strong> {test.performed_by}
                    </div>
                  )}
                  {test.results && (
                    <div className="record-detail">
                      <strong>Results:</strong> {test.results}
                    </div>
                  )}
                  {test.findings && (
                    <div className="record-findings">
                      {test.findings}
                    </div>
                  )}
                </div>
                <div className="record-footer">
                  <div className="record-meta">ID: {test.id}</div>
                  <Link to={`/eye-tests/${test.id}`} className="btn btn-link btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions Section */}
      <div className="records-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">💊</span>
            Prescriptions & Medications
          </h2>
          <Link to={`/patient/${patientId}/prescriptions/add`} className="btn btn-primary btn-sm">
            + Add New Prescription
          </Link>
        </div>
        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <p>No prescriptions recorded for this patient.</p>
            <Link to={`/patient/${patientId}/prescriptions/add`} className="btn btn-primary">
              Add First Prescription
            </Link>
          </div>
        ) : (
          <div className="records-grid">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="record-card">
                <div className="record-header">
                  <span className="record-date">
                    {new Date(prescription.prescribed_date).toLocaleDateString()}
                  </span>
                  <span className={`status-badge badge-${prescription.status?.toLowerCase() || 'success'}`}>
                    {prescription.status || 'Active'}
                  </span>
                </div>
                <div className="record-body">
                  <h4>Prescription #{prescription.id}</h4>
                  {prescription.prescribed_by_name && (
                    <div className="record-detail">
                      <strong>Prescribed By:</strong> Dr. {prescription.prescribed_by_name}
                    </div>
                  )}
                  {prescription.valid_until && (
                    <div className="record-detail">
                      <strong>Valid Until:</strong> {new Date(prescription.valid_until).toLocaleDateString()}
                    </div>
                  )}
                  {prescription.items && prescription.items.length > 0 && (
                    <div className="medication-list">
                      <strong>Medications:</strong>
                      {prescription.items.map((item, idx) => (
                        <div key={idx} className="record-detail">
                          • {item.medication_name} - {item.dosage} ({item.frequency})
                        </div>
                      ))}
                    </div>
                  )}
                  {prescription.instructions && (
                    <div className="record-detail">
                      <strong>Instructions:</strong> {prescription.instructions}
                    </div>
                  )}
                </div>
                <div className="record-footer">
                  <div className="record-meta">ID: {prescription.id}</div>
                  <Link to={`/prescriptions/${prescription.id}`} className="btn btn-link btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Treatments Section */}
      <div className="records-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">🏥</span>
            Treatments & Procedures
          </h2>
          <Link to={`/patients/${patientId}/add-treatment`} className="btn btn-primary btn-sm">
            + Add New Treatment
          </Link>
        </div>
        {treatments.length === 0 ? (
          <div className="empty-state">
            <p>No treatments recorded for this patient.</p>
            <Link to={`/patients/${patientId}/add-treatment`} className="btn btn-primary">
              Add First Treatment
            </Link>
          </div>
        ) : (
          <div className="records-grid">
            {treatments.map(treatment => (
              <div key={treatment.id} className="record-card">
                <div className="record-header">
                  <span className="record-date">
                    {new Date(treatment.date).toLocaleDateString()}
                  </span>
                  <span className={`status-badge badge-${treatment.outcome?.toLowerCase() === 'successful' ? 'success' : 'warning'}`}>
                    {treatment.outcome || 'Completed'}
                  </span>
                </div>
                <div className="record-body">
                  <h4>{treatment.treatment_type}</h4>
                  {treatment.performed_by && (
                    <div className="record-detail">
                      <strong>Performed By:</strong> {treatment.performed_by}
                    </div>
                  )}
                  {treatment.eye && (
                    <div className="record-detail">
                      <strong>Eye:</strong> {treatment.eye}
                    </div>
                  )}
                  {treatment.notes && (
                    <div className="record-detail">
                      <strong>Notes:</strong> {treatment.notes}
                    </div>
                  )}
                  {treatment.complications && (
                    <div className="record-detail">
                      <strong>Complications:</strong> {treatment.complications}
                    </div>
                  )}
                </div>
                <div className="record-footer">
                  <div className="record-meta">ID: {treatment.id}</div>
                  <Link to={`/treatments/${treatment.id}`} className="btn btn-link btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <div className="records-section">
          <div className="section-header">
            <h2>
              <span className="section-icon">📅</span>
              Recent Activity Timeline
            </h2>
          </div>
          <div className="timeline">
            {recentActivity.map((activity, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">{activity.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                  <div className="timeline-title">{activity.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordsPage;
