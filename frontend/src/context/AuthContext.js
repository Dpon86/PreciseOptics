// Authentication Context for managing login state
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        try {
          // Verify token is still valid by making a test request
          axios.defaults.headers.common['Authorization'] = `Token ${savedToken}`;
          const response = await axios.get('http://localhost:8000/api/patients/?limit=1');
          setIsAuthenticated(true);
          setToken(savedToken);
          setUser({ token: savedToken }); // You can expand this with user details
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api-token-auth/', {
        username,
        password,
      });
      
      // Check if 2FA is required
      if (response.data.requires_2fa) {
        return { 
          success: false,
          requires_2fa: true,
          user_id: response.data.user_id,
          username: username,
          password: password
        };
      }
      
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      setToken(token);
      setIsAuthenticated(true);
      setUser({ username, token });
      
      // Set default header for future requests
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};