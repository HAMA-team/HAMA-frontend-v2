import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const IS_NGROK = /ngrok/.test(String(API_BASE_URL));

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(IS_NGROK ? { 'ngrok-skip-browser-warning': 'true' } : {}),
  },
});

// Add request interceptor for auth token if needed
apiClient.interceptors.request.use((config) => {
  // Add auth token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure the bypass header stays on every request to ngrok
  if (IS_NGROK) {
    (config.headers as any)['ngrok-skip-browser-warning'] = 'true';
  }
  return config;
});

export default apiClient;
