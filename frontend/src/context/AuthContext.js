// Authentication Context for managing login state
//
// Security note (CRIT-12):
// The auth token is stored in sessionStorage instead of localStorage.
// sessionStorage is cleared when the browser tab/window is closed, so a token
// cannot persist across browser sessions.  It is still accessible to JavaScript
// on the same origin but has a much smaller exposure window than localStorage.
// A full httpOnly-cookie migration is the next step (tracked as HIGH-04 in TODO).
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Internal helpers — centralise all storage access so it is easy to swap to
// httpOnly cookies in a future sprint without touching every call site.
const TOKEN_KEY = 'authToken';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes
const IDLE_WARNING_MS = 14 * 60 * 1000;  // warn at 14 minutes (1 minute before logout)
const saveToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
const loadToken = () => sessionStorage.getItem(TOKEN_KEY);
const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  // Remove any legacy localStorage entries from previous versions
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('userData');
  localStorage.removeItem('staffProfile');
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(loadToken);
  const [idleWarning, setIdleWarning] = useState(false);
  const idleTimerRef = useRef(null);
  const idleWarningTimerRef = useRef(null);

  // Keep axios Authorization header in sync with token state
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // On app start, verify any persisted token is still valid on the backend
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = loadToken();
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Token ${savedToken}`;
          await apiService.getPatients({ limit: 1 });
          setIsAuthenticated(true);
          setToken(savedToken);
          setUser({ token: savedToken });
        } catch {
          // Token invalid or expired — clear everything
          clearToken();
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Called after a successful login (both direct login and 2FA completion)
  const _applyToken = (token, username) => {
    saveToken(token);
    setToken(token);
    setIsAuthenticated(true);
    setUser({ username, token });
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  };

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);

      // 2FA required — do NOT issue a token yet
      if (response.data.requires_2fa) {
        return {
          success: false,
          requires_2fa: true,
          user_id: response.data.user_id,
          username,
          password,
        };
      }

      _applyToken(response.data.token, username);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  // Called by Verify2FAPage after a successful 2FA verification
  const completeLogin = (token, username) => {
    _applyToken(token, username);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setIdleWarning(false);
    clearTimeout(idleTimerRef.current);
    clearTimeout(idleWarningTimerRef.current);
    delete axios.defaults.headers.common['Authorization'];
  };

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) return;
    setIdleWarning(false);
    clearTimeout(idleTimerRef.current);
    clearTimeout(idleWarningTimerRef.current);
    idleWarningTimerRef.current = setTimeout(() => setIdleWarning(true), IDLE_WARNING_MS);
    idleTimerRef.current = setTimeout(() => logout(), IDLE_TIMEOUT_MS); // eslint-disable-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start idle timer when authenticated; attach activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
      clearTimeout(idleWarningTimerRef.current);
    };
  }, [isAuthenticated, resetIdleTimer]);

  const value = {
    isAuthenticated,
    user,
    login,
    completeLogin,
    logout,
    loading,
    idleWarning,
    resetIdleTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
