import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const auth = {
  register: (email, password) => {
    return api.post('/auth/register', { email, password });
  },
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  getProfile: () => {
    return api.get('/auth/profile');
  },
};

// Process API calls
export const processApi = {
  createProcessSet: (name, processes) => {
    return api.post('/process', { name, processes });
  },
  getProcessSets: () => {
    return api.get('/process');
  },
  getProcessSet: (processSetId) => {
    return api.get(`/process/${processSetId}`);
  },
  updateProcessSet: (processSetId, name, processes) => {
    return api.put(`/process/${processSetId}`, { name, processes });
  },
  deleteProcessSet: (processSetId) => {
    return api.delete(`/process/${processSetId}`);
  },
};

// Simulation API calls
export const simulate = {
  runSimulation: (algorithm, processes, processSetId = null, additionalParams = {}) => {
    return api.post('/simulate/run', { 
      algorithm, 
      processes, 
      processSetId,
      ...additionalParams
    });
  },
  getSimulations: () => {
    return api.get('/simulate');
  },
  getSimulation: (simulationId) => {
    return api.get(`/simulate/${simulationId}`);
  },
};

export default api; 