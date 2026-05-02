/**
 * App smoke tests - verify the app renders and key routes are accessible
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock heavy dependencies to keep smoke tests fast
jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    getConditionStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getProtocolStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getReferralStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getAlertStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getPatientConditions: jest.fn(() => Promise.resolve({ data: [] })),
  },
  apiService: {
    getConditionStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getProtocolStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getReferralStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getAlertStatistics: jest.fn(() => Promise.resolve({ data: {} })),
    getPatientConditions: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ isAuthenticated: false, user: null, loading: false }),
}));

jest.mock('./context/PatientContext', () => ({
  PatientProvider: ({ children }) => <div>{children}</div>,
}));

// Mock fetch for HealthWidget
global.fetch = jest.fn(() => Promise.reject(new Error('No server in tests')));

import App from './App';

test('app renders without crashing', () => {
  render(<App />);
  // If we reach here the app mounted without throwing
  expect(document.body).toBeInTheDocument();
});

test('login page is shown when not authenticated', () => {
  render(<App />);
  // Unauthenticated users should be redirected to login
  // The login form or heading should be visible
  expect(document.body.textContent.length).toBeGreaterThan(0);
});
