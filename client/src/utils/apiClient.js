// Simple API client for making HTTP requests
class ApiClient {
  constructor() {
    // Handle different environments
    let baseURL = 'http://localhost:5000'; // Default fallback
    
    // Try to get from Vite environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      baseURL = import.meta.env.VITE_API_URL || baseURL;
    }
    
    // For development, construct from current location
    if (typeof window !== 'undefined' && window.location) {
      const { protocol, hostname } = window.location;
      // Use same host but port 5000 for development
      baseURL = `${protocol}//${hostname}:5000`;
    }
    
    this.baseURL = baseURL;
    console.log('API Client initialized with baseURL:', this.baseURL);
  }

  async getAuthToken() {
    try {
      return localStorage.getItem('token') || localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return null;
    }
  }

  async makeRequest(url, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    console.log('Making API request to:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      console.log('API response received:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', {
        url: fullUrl,
        error: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  }

  async get(url, options = {}) {
    return this.makeRequest(url, { method: 'GET', ...options });
  }

  async post(url, data, options = {}) {
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(url, data, options = {}) {
    return this.makeRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(url, data, options = {}) {
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(url, options = {}) {
    return this.makeRequest(url, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
export default apiClient;