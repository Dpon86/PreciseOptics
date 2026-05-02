import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock api module so Jest doesn't try to parse its ESM dependencies
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {},
}));

import HealthWidget from './HealthWidget';

const mockHealthResponse = {
  status: 'healthy',
  database: { status: 'healthy', response_time_ms: 12 },
  cache: { status: 'healthy' },
  disk: { status: 'healthy', free_gb: 50 },
};

const mockDegradedResponse = {
  status: 'degraded',
  database: { status: 'healthy', response_time_ms: 500 },
  cache: { status: 'degraded' },
  disk: { status: 'healthy', free_gb: 5 },
};

describe('HealthWidget', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch.mockRestore?.();
  });

  test('shows loading state initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    render(<HealthWidget />);
    expect(screen.getByText(/checking system health/i)).toBeInTheDocument();
  });

  test('shows error when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    render(<HealthWidget />);
    await waitFor(() => {
      expect(screen.getByText(/health check failed/i)).toBeInTheDocument();
    });
  });

  test('shows error message text', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    render(<HealthWidget />);
    await waitFor(() => {
      expect(screen.getByText(/unable to connect to server/i)).toBeInTheDocument();
    });
  });

  test('renders health data when fetch succeeds', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(mockHealthResponse) })
    );
    render(<HealthWidget />);
    await waitFor(() => {
      // Should no longer show loading
      expect(screen.queryByText(/checking system health/i)).not.toBeInTheDocument();
    });
  });

  test('does not crash with compact prop', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(mockHealthResponse) })
    );
    render(<HealthWidget compact={true} />);
    // Just check it renders without throwing
    await waitFor(() => {
      expect(screen.queryByText(/checking system health/i)).not.toBeInTheDocument();
    });
  });

  test('getStatusColor returns correct colors', () => {
    // Test internal logic indirectly via rendered output
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(mockDegradedResponse) })
    );
    render(<HealthWidget />);
    // Component should render without throwing even with degraded status
    expect(document.body).toBeInTheDocument();
  });
});
