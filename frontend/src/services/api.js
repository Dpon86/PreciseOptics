// API service for communicating with Django backend
import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to handle CSRF token if needed
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: (username, password) =>
    axios.post('/api-token-auth/', { username, password }),

  // Patients
  getPatients: (params = {}) =>
    axios.get('/api/patients/', { params }),
  
  createPatient: (data) =>
    axios.post('/api/patients/', data),
  
  updatePatient: (id, data) =>
    axios.put(`/api/patients/${id}/`, data),
  
  getPatient: (id) =>
    axios.get(`/api/patients/${id}/`),

  // Consultations
  getConsultations: (params = {}) =>
    axios.get('/api/consultations/', { params }),
  
  createConsultation: (data) =>
    axios.post('/api/consultations/', data),
  
  updateConsultation: (id, data) =>
    axios.put(`/api/consultations/${id}/`, data),
  
  getConsultation: (id) =>
    axios.get(`/api/consultations/${id}/`),

  // Consultation related data
  getVitalSigns: (consultationId) =>
    axios.get(`/api/vital-signs/?consultation=${consultationId}`),

  getConsultationDocuments: (consultationId) =>
    axios.get(`/api/consultation-documents/?consultation=${consultationId}`),

  getConsultationImages: (consultationId) =>
    axios.get(`/api/consultation-images/?consultation=${consultationId}`),

  // Eye Tests
  getVisualAcuityTests: (params = {}) =>
    axios.get('/api/visual-acuity-tests/', { params }),
  
  getRefractionTests: (params = {}) =>
    axios.get('/api/refraction-tests/', { params }),
  
  getCataractAssessments: (params = {}) =>
    axios.get('/api/cataract-assessments/', { params }),
  
  getGlaucomaAssessments: (params = {}) =>
    axios.get('/api/glaucoma-assessments/', { params }),
  
  getVisualFieldTests: (params = {}) =>
    axios.get('/api/visual-field-tests/', { params }),
  
  getRetinalAssessments: (params = {}) =>
    axios.get('/api/retinal-assessments/', { params }),
  
  getDiabeticRetinopathyScreenings: (params = {}) =>
    axios.get('/api/diabetic-retinopathy-screenings/', { params }),
  
  getOCTScans: (params = {}) =>
    axios.get('/api/oct-scans/', { params }),
  
  createVisualAcuityTest: (data) =>
    axios.post('/api/visual-acuity-tests/', data),
  
  updateEyeTest: (id, data) =>
    axios.put(`/api/visual-acuity-tests/${id}/`, data),
  
  getEyeTest: (id) =>
    axios.get(`/api/visual-acuity-tests/${id}/`),

  // Medications
  getMedications: (params = {}) =>
    axios.get('/api/medications/', { params }),
  
  createMedication: (data) =>
    axios.post('/api/medications/', data),
  
  updateMedication: (id, data) =>
    axios.put(`/api/medications/${id}/`, data),
  
  getMedication: (id) =>
    axios.get(`/api/medications/${id}/`),

  // Manufacturers
  getManufacturers: (params = {}) =>
    axios.get('/api/manufacturers/', { params }),
  
  createManufacturer: (data) =>
    axios.post('/api/manufacturers/', data),
  
  updateManufacturer: (id, data) =>
    axios.put(`/api/manufacturers/${id}/`, data),
  
  getManufacturer: (id) =>
    axios.get(`/api/manufacturers/${id}/`),
  
  deleteManufacturer: (id) =>
    axios.delete(`/api/manufacturers/${id}/`),

  // Medication Categories
  getMedicationCategories: (params = {}) =>
    axios.get('/api/medication-categories/', { params }),
  
  createMedicationCategory: (data) =>
    axios.post('/api/medication-categories/', data),
  
  updateMedicationCategory: (id, data) =>
    axios.put(`/api/medication-categories/${id}/`, data),
  
  getMedicationCategory: (id) =>
    axios.get(`/api/medication-categories/${id}/`),
  
  deleteMedicationCategory: (id) =>
    axios.delete(`/api/medication-categories/${id}/`),

  // Prescriptions
  getPrescriptions: (params = {}) =>
    axios.get('/api/prescriptions/', { params }),
  
  createPrescription: (data) =>
    axios.post('/api/prescriptions/', data),
  
  updatePrescription: (id, data) =>
    axios.put(`/api/prescriptions/${id}/`, data),
  
  getPrescription: (id) =>
    axios.get(`/api/prescriptions/${id}/`),

  // Staff Management
  getStaff: (params = {}) =>
    axios.get('/staff/', { params }),
  
  createStaff: (data) =>
    axios.post('/staff/', data),
  
  updateStaff: (id, data) =>
    axios.put(`/staff/${id}/`, data),
  
  getStaffMember: (id) =>
    axios.get(`/staff/${id}/`),
  
  deleteStaff: (id) =>
    axios.delete(`/staff/${id}/`),
  
  getStaffStatistics: () =>
    axios.get('/staff/statistics/'),

  // Get doctors (staff filtered by user_type=doctor)
  getDoctors: () =>
    axios.get('/staff/', { params: { user_type: 'doctor' } }),

  // Get nurses (staff filtered by user_type=nurse)
  getNurses: () =>
    axios.get('/staff/', { params: { user_type: 'nurse' } }),

  // User Management
  getUsers: (params = {}) =>
    axios.get('/users/', { params }),
  
  getUser: (id) =>
    axios.get(`/users/${id}/`),
  
  updateUser: (id, data) =>
    axios.put(`/users/${id}/`, data),

  // Lookups
  getDepartments: () =>
    axios.get('/departments/'),
  
  getSpecializations: () =>
    axios.get('/specializations/'),
  
  getUserTypes: () =>
    axios.get('/user-types/'),

  // Audit Logs
  getAuditLogs: (params = {}) =>
    axios.get('/api/audit-logs/', { params }),
  
  createAuditLog: (data) =>
    axios.post('/api/audit-logs/', data),
  
  getAuditLog: (id) =>
    axios.get(`/api/audit-logs/${id}/`),

  // Patient Access Logs
  getPatientAccessLogs: (params = {}) =>
    axios.get('/api/patient-access-logs/', { params }),
  
  createPatientAccessLog: (data) =>
    axios.post('/api/patient-access-logs/', data),

  // Generic CRUD operations for other models
  create: (endpoint, data) =>
    axios.post(`/api/${endpoint}/`, data),
  
  update: (endpoint, id, data) =>
    axios.put(`/api/${endpoint}/${id}/`, data),
  
  delete: (endpoint, id) =>
    axios.delete(`/api/${endpoint}/${id}/`),
  
  get: (endpoint, id = null, params = {}) =>
    id ? axios.get(`/api/${endpoint}/${id}/`, { params }) 
        : axios.get(`/api/${endpoint}/`, { params }),

  // File upload
  uploadFile: (endpoint, formData) =>
    axios.post(`/api/${endpoint}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Diagnoses
  getDiagnoses: (params = {}) =>
    axios.get('/api/diagnoses/', { params }),
  
  createDiagnosis: (data) =>
    axios.post('/api/diagnoses/', data),
  
  updateDiagnosis: (id, data) =>
    axios.put(`/api/diagnoses/${id}/`, data),
  
  getDiagnosis: (id) =>
    axios.get(`/api/diagnoses/${id}/`),

  // Treatments
  getTreatments: (params = {}) =>
    axios.get('/api/treatments/', { params }),
  
  createTreatment: (data) =>
    axios.post('/api/treatments/', data),
  
  updateTreatment: (id, data) =>
    axios.put(`/api/treatments/${id}/`, data),
  
  getTreatment: (id) =>
    axios.get(`/api/treatments/${id}/`),

  // Specializations
  createSpecialization: (data) =>
    axios.post('/api/accounts/specializations/', data),
  
  deleteSpecialization: (id) =>
    axios.delete(`/api/accounts/specializations/${id}/`),

  // Reports
  getDrugAuditReport: (params = {}) =>
    axios.get('/api/reports/drug-audit/', { params }),
  
  getPatientVisitsReport: (params = {}) =>
    axios.get('/api/reports/patient-visits/', { params }),
  
  getEyeTestsSummaryReport: (params = {}) =>
    axios.get('/api/reports/eye-tests-summary/', { params }),
  
  getPatientProgressDashboard: (patientId, params = {}) =>
    axios.get(`/api/reports/patient-progress/${patientId}/`, { params }),

  getMedicationEffectivenessReport: (params = {}) =>
    axios.get('/api/reports/medication-effectiveness/', { params }),

  // Password Reset
  requestPasswordReset: (email) =>
    axios.post('/password-reset/', { email }),
  
  resetPassword: (token, password) =>
    axios.post('/password-reset/confirm/', { token, password }),

  // Two-Factor Authentication
  setup2FA: () =>
    axios.post('/2fa/setup/'),
  
  verify2FASetup: (code) =>
    axios.post('/2fa/verify-setup/', { code }),
  
  verify2FALogin: (user_id, username, password, code) =>
    axios.post('/2fa/verify-login/', { user_id, username, password, code }),
  
  disable2FA: (password) =>
    axios.post('/2fa/disable/', { password }),
  
  get2FAStatus: () =>
    axios.get('/2fa/status/'),

  // Appointment Alerts
  getAlerts: (params = {}) =>
    axios.get('/api/alerts/', { params }),
  
  getAlert: (id) =>
    axios.get(`/api/alerts/${id}/`),
  
  createAlert: (data) =>
    axios.post('/api/alerts/', data),
  
  acknowledgeAlert: (id) =>
    axios.post(`/api/alerts/${id}/acknowledge/`),
  
  resolveAlert: (id, data) =>
    axios.post(`/api/alerts/${id}/resolve/`, data),
  
  dismissAlert: (id, data) =>
    axios.post(`/api/alerts/${id}/dismiss/`, data),
  
  getAlertStatistics: () =>
    axios.get('/api/alerts/statistics/'),
  
  scanAppointments: () =>
    axios.post('/api/alerts/scan_appointments/'),
  
  generateReminders: () =>
    axios.post('/api/alerts/generate_reminders/'),
  
  checkFollowups: () =>
    axios.post('/api/alerts/check_followups/'),
  
  // Alert Configuration
  getAlertConfigs: () =>
    axios.get('/api/alert-config/'),
  
  getActiveAlertConfig: () =>
    axios.get('/api/alert-config/active/'),
  
  createAlertConfig: (data) =>
    axios.post('/api/alert-config/', data),
  
  updateAlertConfig: (id, data) =>
    axios.put(`/api/alert-config/${id}/`, data),
  
  activateAlertConfig: (id) =>
    axios.post(`/api/alert-config/${id}/activate/`),

  // Disease-Specific Reports
  getDiseaseReport: (params = {}) =>
    axios.get('/api/reports/disease-specific/', { params }),

  // Revenue Analysis
  getRevenueReport: (params = {}) =>
    axios.get('/api/reports/revenue-analysis/', { params }),

  // Batch Tracking
  getBatchTrackingReport: (params = {}) =>
    axios.get('/api/reports/batch-tracking/', { params }),

  // Medication Recalls
  getMedicationRecalls: (params = {}) =>
    axios.get('/api/medication-recalls/', { params }),
  getMedicationRecall: (id) =>
    axios.get(`/api/medication-recalls/${id}/`),
  createMedicationRecall: (data) =>
    axios.post('/api/medication-recalls/', data),
  acknowledgeRecall: (id) =>
    axios.post(`/api/medication-recalls/${id}/acknowledge/`),
  resolveRecall: (id, resolution_notes = '') =>
    axios.post(`/api/medication-recalls/${id}/resolve/`, { resolution_notes }),
  closeRecall: (id, resolution_notes = '') =>
    axios.post(`/api/medication-recalls/${id}/close/`, { resolution_notes }),
  getRecallAffectedPatients: (id) =>
    axios.get(`/api/medication-recalls/${id}/affected_patients/`),

  // Follow-up Alerts
  getFollowUpAlerts: (params = {}) =>
    axios.get('/api/reports/followup-alerts/', { params }),

  // Medication Patients Report (who received a medication / batch lookup)
  getMedicationPatientsReport: (params = {}) =>
    axios.get('/api/reports/medication-patients/', { params }),

  // Referrals
  getReferrals: (params = {}) =>
    axios.get('/api/referrals/', { params }),

  // Conditions
  getMedicalConditions: (params = {}) =>
    axios.get('/api/conditions/', { params }),
  getPatientConditions: (params = {}) =>
    axios.get('/api/conditions/patient-conditions/', { params }),
  getPatientConditionsByPatient: (patientId) =>
    axios.get(`/api/conditions/patient/${patientId}/conditions/`),
  getConditionStatistics: () =>
    axios.get('/api/conditions/statistics/'),
  getConditionPrevalence: () =>
    axios.get('/api/conditions/prevalence/'),

  // Protocols
  getProtocols: (params = {}) =>
    axios.get('/api/protocols/protocols/', { params }),
  getProtocol: (id) =>
    axios.get(`/api/protocols/protocols/${id}/`),
  createProtocol: (data) =>
    axios.post('/api/protocols/protocols/', data),
  updateProtocol: (id, data) =>
    axios.put(`/api/protocols/protocols/${id}/`, data),
  deleteProtocol: (id) =>
    axios.delete(`/api/protocols/protocols/${id}/`),
  assignProtocolToPatient: (data) =>
    axios.post('/api/protocols/patient-protocols/', data),
  getProtocolSteps: (protocolId) =>
    axios.get('/api/protocols/steps/', { params: { protocol: protocolId } }),
  getPatientProtocol: (id) =>
    axios.get(`/api/protocols/patient-protocols/${id}/`),
  getPatientProtocols: (params = {}) =>
    axios.get('/api/protocols/patient-protocols/', { params }),
  getPatientProtocolsByPatient: (patientId) =>
    axios.get(`/api/protocols/patient/${patientId}/protocols/`),
  getPatientProtocolSchedule: (id) =>
    axios.get(`/api/protocols/patient-protocols/${id}/schedule/`),
  getProtocolStatistics: () =>
    axios.get('/api/protocols/statistics/'),
  getProtocolAdherenceReport: () =>
    axios.get('/api/protocols/adherence-report/'),

  // Medication conditions (used in protocol forms)
  getMedicationConditions: () =>
    axios.get('/api/medications/conditions/'),

  // Treatment Effectiveness Reports
  getTreatmentEffectivenessTimeline: (params = {}) =>
    axios.get('/api/reports/treatment-effectiveness-timeline/', { params }),
  getMedicationEffectivenessTimeline: (params = {}) =>
    axios.get('/api/reports/medication-effectiveness-timeline/', { params }),
  compareTreatments: (params = {}) =>
    axios.get('/api/reports/compare-treatments/', { params }),
  compareMedications: (params = {}) =>
    axios.get('/api/reports/compare-medications/', { params }),

  // Admin data overview
  getAllModelsData: () =>
    axios.get('/api/data/all-models/'),

  // Treatments
  getTreatmentStatistics: () =>
    axios.get('/api/treatments/api/treatments/statistics/'),

  // Referral Statistics
  getReferralStatistics: () =>
    axios.get('/api/referrals/statistics/'),

  // Patient Visits / Appointments
  getVisits: (params = {}) =>
    axios.get('/api/visits/', { params }),
  getVisit: (id) =>
    axios.get(`/api/visits/${id}/`),
  createVisit: (data) =>
    axios.post('/api/visits/', data),
  updateVisit: (id, data) =>
    axios.patch(`/api/visits/${id}/`, data),
  checkInVisit: (id) =>
    axios.post(`/api/visits/${id}/check_in/`),
  getTodaySchedule: () =>
    axios.get('/api/visits/today_schedule/'),
  getPatientUpcomingAppointments: (patientId) =>
    axios.get(`/api/patients/${patientId}/upcoming_appointments/`),

  // Patient Reported Outcome Measures (PROMs)
  getPatientOutcomes: (params = {}) =>
    axios.get('/api/patient-outcomes/', { params }),
  getPatientOutcomesForPatient: (patientId) =>
    axios.get(`/api/patient-outcomes/for-patient/${patientId}/`),
  createPatientOutcome: (data) =>
    axios.post('/api/patient-outcomes/', data),
  updatePatientOutcome: (id, data) =>
    axios.put(`/api/patient-outcomes/${id}/`, data),
  getPatientOutcome: (id) =>
    axios.get(`/api/patient-outcomes/${id}/`),

  // Condition → Medication → Outcomes report (clinical + PROs)
  getConditionMedicationOutcomes: (params = {}) =>
    axios.get('/api/reports/condition-medication-outcomes/', { params }),
};

export default apiService;