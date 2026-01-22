import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true, // Enable cookies to be sent with requests
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Adding JWT token to request:', config.url, token.substring(0, 20) + '...');
        } else {
            console.log('[API] No JWT token found in localStorage for:', config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[API] Response error:', error.response?.status, error.config?.url);
    // If we get a 401, the session has expired
    if (error.response?.status === 401) {
      console.log('[API] 401 Unauthorized - checking localStorage');
      // Check if user has stored info
      const userInfo = localStorage.getItem('userInfo');
      const token = localStorage.getItem('jwtToken');
      console.log('[API] User info exists:', !!userInfo);
      console.log('[API] Token exists:', !!token);
      console.log('[API] Token value:', token ? token.substring(0, 50) + '...' : 'none');
      
      // Only redirect if we're not on the login/signup page
      if (userInfo && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        // User was logged in but session expired - redirect to login to refresh
        console.log('[API] Redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
