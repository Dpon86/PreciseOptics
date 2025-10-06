// API service for communicating with Django backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

  // Eye Tests
  getEyeTests: (params = {}) =>
    axios.get('/api/eye-tests/', { params }),
  
  createVisualAcuityTest: (data) =>
    axios.post('/api/eye-tests/', data),
  
  updateEyeTest: (id, data) =>
    axios.put(`/api/eye-tests/${id}/`, data),
  
  getEyeTest: (id) =>
    axios.get(`/api/eye-tests/${id}/`),

  // Medications
  getMedications: (params = {}) =>
    axios.get('/api/medications/', { params }),
  
  createMedication: (data) =>
    axios.post('/api/medications/', data),
  
  updateMedication: (id, data) =>
    axios.put(`/api/medications/${id}/`, data),
  
  getMedication: (id) =>
    axios.get(`/api/medications/${id}/`),

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

  // Specializations
  createSpecialization: (data) =>
    axios.post('/api/accounts/specializations/', data),
  
  deleteSpecialization: (id) =>
    axios.delete(`/api/accounts/specializations/${id}/`),
};

export default apiService;