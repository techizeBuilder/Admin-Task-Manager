// Authentication utilities for the frontend
export const setAuthToken = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getAuthUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
};

// Login function to authenticate with real user credentials
export const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      setAuthToken(token, user);
      return { success: true, user };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

// Refresh token to maintain authentication
export const refreshToken = async () => {
  const currentToken = getAuthToken();
  if (!currentToken) return null;
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      setAuthToken(token, user);
      return token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuth();
  }
  return null;
};