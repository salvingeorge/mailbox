// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://postbox-backend.onrender.com/api';

const apiService = {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  },

  // Get stored user from localStorage
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Logout - clear storage
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  // Auth functions
  async register(userData) {
    const data = await this.apiCall('/auth/register', {
      method: 'POST',
      body: userData,
    });
    
    if (data.success) {
      this.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async login(credentials) {
    const data = await this.apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (data.success) {
      this.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Mail functions
  async getMail() {
    return this.apiCall('/mail');
  },

  async sendMail(mailData) {
    return this.apiCall('/mail/send', {
      method: 'POST',
      body: mailData,
    });
  },

  async markAsRead(mailId) {
    return this.apiCall(`/mail/${mailId}/read`, {
      method: 'PATCH',
    });
  },
};

// Export both default and named exports for compatibility
export default apiService;
export const mailAPI = apiService;