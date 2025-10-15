import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ConsultationDetailPage.css';

const ConsultationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [vitalSigns, setVitalSigns] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsultationDetails();
  }, [id]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch consultation details
      const consultationResponse = await api.getConsultation(id);
      setConsultation(consultationResponse.data);
      
      // Fetch related data
      try {
        const vitalResponse = await api.getVitalSigns(id);
        setVitalSigns(vitalResponse.data);
      } catch (vitalError) {
        console.log('No vital signs found for this consultation');
      }
      
      try {
        const documentsResponse = await api.getConsultationDocuments(id);
        setDocuments(documentsResponse.data.results || documentsResponse.data || []);
      } catch (docError) {
        console.log('No documents found for this consultation');
      }
      
      try {
        const imagesResponse = await api.getConsultationImages(id);
        setImages(imagesResponse.data.results || imagesResponse.data || []);
      } catch (imgError) {
        console.log('No images found for this consultation');
      }
      
    } catch (err) {
      console.error('Error fetching consultation details:', err);
      setError('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/consultations')} className="btn btn-primary">
            Back to Consultations
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="page-container">
        <div className="not-found">
          <h3>Consultation Not Found</h3>
          <p>The requested consultation could not be found.</p>
          <button onClick={() => navigate('/consultations')} className="btn btn-primary">
            Back to Consultations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container consultation-detail-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/consultations')} className="btn btn-secondary">
            ← Back to Consultations
          </button>
          <h1>Consultation Details</h1>
        </div>
        <div className="header-actions">
          <Link to={`/consultations/${id}/edit`} className="btn btn-primary">
            Edit Consultation
          </Link>
        </div>
      </div>

      <div className="consultation-detail-content">
        {/* Basic Information */}
        <div className="detail-section">
          <div className="section-header">
            <h2>Basic Information</h2>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Patient</label>
              <span>{consultation.patient_name || consultation.patient || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Doctor</label>
              <span>{consultation.doctor_name || consultation.doctor || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Consultation Date</label>
              <span>{formatDate(consultation.consultation_date)}</span>
            </div>
            <div className="detail-item">
              <label>Duration</label>
              <span>{consultation.duration_minutes ? `${consultation.duration_minutes} minutes` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Consultation Type</label>
              <span className="consultation-type">
                {consultation.consultation_type || 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span className={`status-badge status-${consultation.status || 'unknown'}`}>
                {consultation.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="detail-section">
          <div className="section-header">
            <h2>Clinical Information</h2>
          </div>
          <div className="clinical-info">
            <div className="clinical-item">
              <h4>Chief Complaint</h4>
              <p>{consultation.chief_complaint || 'No chief complaint recorded'}</p>
            </div>
            
            {consultation.history_of_present_illness && (
              <div className="clinical-item">
                <h4>History of Present Illness</h4>
                <p>{consultation.history_of_present_illness}</p>
              </div>
            )}
            
            {consultation.examination_findings && (
              <div className="clinical-item">
                <h4>Examination Findings</h4>
                <p>{consultation.examination_findings}</p>
              </div>
            )}
            
            {consultation.diagnosis && (
              <div className="clinical-item">
                <h4>Diagnosis</h4>
                <p>{consultation.diagnosis}</p>
              </div>
            )}
            
            {consultation.differential_diagnosis && (
              <div className="clinical-item">
                <h4>Differential Diagnosis</h4>
                <p>{consultation.differential_diagnosis}</p>
              </div>
            )}
            
            {consultation.treatment_plan && (
              <div className="clinical-item">
                <h4>Treatment Plan</h4>
                <p>{consultation.treatment_plan}</p>
              </div>
            )}
            
            {consultation.follow_up_instructions && (
              <div className="clinical-item">
                <h4>Follow-up Instructions</h4>
                <p>{consultation.follow_up_instructions}</p>
              </div>
            )}
            
            {consultation.follow_up_date && (
              <div className="clinical-item">
                <h4>Next Follow-up</h4>
                <p>{new Date(consultation.follow_up_date).toLocaleDateString()}</p>
              </div>
            )}
            
            {consultation.referrals && (
              <div className="clinical-item">
                <h4>Referrals</h4>
                <p>{consultation.referrals}</p>
              </div>
            )}
            
            {consultation.notes && (
              <div className="clinical-item">
                <h4>Additional Notes</h4>
                <p>{consultation.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        {vitalSigns && (
          <div className="detail-section">
            <div className="section-header">
              <h2>Vital Signs</h2>
            </div>
            <div className="vital-signs-grid">
              {vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_diastolic && (
                <div className="vital-item">
                  <label>Blood Pressure</label>
                  <span>{vitalSigns.blood_pressure_systolic}/{vitalSigns.blood_pressure_diastolic} mmHg</span>
                </div>
              )}
              {vitalSigns.heart_rate && (
                <div className="vital-item">
                  <label>Heart Rate</label>
                  <span>{vitalSigns.heart_rate} bpm</span>
                </div>
              )}
              {vitalSigns.temperature && (
                <div className="vital-item">
                  <label>Temperature</label>
                  <span>{vitalSigns.temperature}°C</span>
                </div>
              )}
              {vitalSigns.respiratory_rate && (
                <div className="vital-item">
                  <label>Respiratory Rate</label>
                  <span>{vitalSigns.respiratory_rate} per minute</span>
                </div>
              )}
              {vitalSigns.oxygen_saturation && (
                <div className="vital-item">
                  <label>Oxygen Saturation</label>
                  <span>{vitalSigns.oxygen_saturation}%</span>
                </div>
              )}
              {vitalSigns.weight && (
                <div className="vital-item">
                  <label>Weight</label>
                  <span>{vitalSigns.weight} kg</span>
                </div>
              )}
              {vitalSigns.height && (
                <div className="vital-item">
                  <label>Height</label>
                  <span>{vitalSigns.height} cm</span>
                </div>
              )}
              {vitalSigns.bmi && (
                <div className="vital-item">
                  <label>BMI</label>
                  <span>{vitalSigns.bmi}</span>
                </div>
              )}
              {vitalSigns.intraocular_pressure_od && (
                <div className="vital-item">
                  <label>IOP (Right Eye)</label>
                  <span>{vitalSigns.intraocular_pressure_od} mmHg</span>
                </div>
              )}
              {vitalSigns.intraocular_pressure_os && (
                <div className="vital-item">
                  <label>IOP (Left Eye)</label>
                  <span>{vitalSigns.intraocular_pressure_os} mmHg</span>
                </div>
              )}
              {vitalSigns.pupil_response_od && (
                <div className="vital-item">
                  <label>Pupil Response (Right)</label>
                  <span>{vitalSigns.pupil_response_od}</span>
                </div>
              )}
              {vitalSigns.pupil_response_os && (
                <div className="vital-item">
                  <label>Pupil Response (Left)</label>
                  <span>{vitalSigns.pupil_response_os}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medications Prescribed */}
        {consultation.medications_prescribed && consultation.medications_prescribed.length > 0 && (
          <div className="detail-section">
            <div className="section-header">
              <h2>Medications Prescribed</h2>
            </div>
            <div className="medications-list">
              {consultation.medications_prescribed.map((medication, index) => (
                <div key={index} className="medication-item">
                  <h4>{medication.name || medication.medication || `Medication ${index + 1}`}</h4>
                  {medication.dosage && <p><strong>Dosage:</strong> {medication.dosage}</p>}
                  {medication.frequency && <p><strong>Frequency:</strong> {medication.frequency}</p>}
                  {medication.duration && <p><strong>Duration:</strong> {medication.duration}</p>}
                  {medication.instructions && <p><strong>Instructions:</strong> {medication.instructions}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="detail-section">
            <div className="section-header">
              <h2>Documents</h2>
            </div>
            <div className="documents-list">
              {documents.map((document) => (
                <div key={document.id} className="document-item">
                  <div className="document-info">
                    <h4>{document.title || 'Untitled Document'}</h4>
                    <p>{document.description}</p>
                    <span className="document-type">{document.document_type}</span>
                  </div>
                  <div className="document-actions">
                    <button className="btn btn-small btn-secondary">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="detail-section">
            <div className="section-header">
              <h2>Images</h2>
            </div>
            <div className="images-grid">
              {images.map((image) => (
                <div key={image.id} className="image-item">
                  <div className="image-preview">
                    <img src={image.image_url || image.image} alt={image.title || 'Medical image'} />
                  </div>
                  <div className="image-info">
                    <h4>{image.title || 'Untitled Image'}</h4>
                    <p>{image.description}</p>
                    <span className="image-type">{image.image_type}</span>
                    {image.eye_side && <span className="eye-side">{image.eye_side} eye</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Information */}
        {consultation.consultation_fee && (
          <div className="detail-section">
            <div className="section-header">
              <h2>Financial Information</h2>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Consultation Fee</label>
                <span>${consultation.consultation_fee}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationDetailPage;