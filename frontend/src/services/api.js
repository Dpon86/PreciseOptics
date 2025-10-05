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

  // Patient Visits
  getVisits: (params = {}) =>
    axios.get('/api/visits/', { params }),
  
  createVisit: (data) =>
    axios.post('/api/visits/', data),
  
  updateVisit: (id, data) =>
    axios.put(`/api/visits/${id}/`, data),
  
  checkInVisit: (id) =>
    axios.post(`/api/visits/${id}/check_in/`),

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
};

export default apiService;