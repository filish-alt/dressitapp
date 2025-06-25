import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, refreshToken, removeToken } from './auth';
import { useRouter } from 'expo-router';

// Base URL for the API
const API_BASE_URL = 'https://dev.dressitnow.com/api';

// Create a new Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Keep track of if we're refreshing the token to avoid multiple refresh requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: any[] = [];

// Process the failed queue when token refresh completes
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor for API calls
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      // Set the Authorization header if we have a token
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If we get a 401 Unauthorized response
    if (error.response?.status === 401 && originalRequest) {
      // If we're not already refreshing the token
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          
          if (newToken) {
            // Update the Authorization header with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            // Process all requests in the queue with the new token
            processQueue(null, newToken);
            // Retry the original request with the new token
            return axios(originalRequest);
          } else {
            // If token refresh fails, reject all queued requests
            processQueue(new Error('Failed to refresh token'));
            // Clear authentication data and redirect to login
            await removeToken();
            // Alert the user that they need to log in again
            alert('Your session has expired. Please log in again.');
            // Use router navigation in components that import this service
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(new Error('Failed to refresh token'));
          // Clear authentication data and redirect to login
          await removeToken();
          // Alert the user that they need to log in again
          alert('Your session has expired. Please log in again.');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Helper method for easier API error handling
export const handleApiError = (error: any): string => {
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const { data, status } = error.response;
    
    if (status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    
    if (data && data.message) {
      return data.message;
    }
    
    if (data && typeof data === 'string') {
      return data;
    }
    
    return `Error ${status}: ${JSON.stringify(data)}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request
    return error.message || 'An unexpected error occurred.';
  }
};

export default api;

