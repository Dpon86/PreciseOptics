import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardStats from './DashboardStats';

// Mock the apiService module
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getConditionStatistics: jest.fn(),
    getProtocolStatistics: jest.fn(),
    getReferralStatistics: jest.fn(),
    getAlertStatistics: jest.fn(),
  },
}));

import apiService from '../services/api';

const mockConditionsStats = {
  active_patient_conditions: 45,
  active_conditions: 12,
  overdue_assessments: 3,
  upcoming_assessments: 7,
  recent_diagnoses: 5,
};

const mockProtocolsStats = {
  active_patient_protocols: 28,
  available_protocols: 8,
  completed_patient_protocols: 150,
  overdue_protocols: 2,
};

const mockReferralsStats = {
  total_referrals: 89,
  pending_referrals: 12,
  completed_referrals: 65,
  urgent_referrals: 4,
};

describe('DashboardStats', () => {
  beforeEach(() => {
    apiService.getConditionStatistics.mockResolvedValue({ data: mockConditionsStats });
    apiService.getProtocolStatistics.mockResolvedValue({ data: mockProtocolsStats });
    apiService.getReferralStatistics.mockResolvedValue({ data: mockReferralsStats });
    apiService.getAlertStatistics.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  test('renders System Overview heading after load', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('System Overview')).toBeInTheDocument();
    });
  });

  test('displays conditions active patient count', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  test('displays overdue assessments when > 0', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  test('displays protocols stats', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('28')).toBeInTheDocument(); // active_patient_protocols
    });
  });

  test('displays referrals stats', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('89')).toBeInTheDocument(); // total_referrals
    });
  });

  test('renders System Overview heading when all APIs reject (allSettled never throws)', async () => {
    apiService.getConditionStatistics.mockRejectedValue(new Error('Network error'));
    apiService.getProtocolStatistics.mockRejectedValue(new Error('Network error'));
    apiService.getReferralStatistics.mockRejectedValue(new Error('Network error'));
    apiService.getAlertStatistics.mockRejectedValue(new Error('Network error'));

    render(<DashboardStats />);
    // Promise.allSettled never throws, so the component renders the container
    // with no stat cards (all stats remain null)
    await waitFor(() => {
      expect(screen.getByText('System Overview')).toBeInTheDocument();
    });
  });

  test('renders View All Conditions link', async () => {
    render(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('View All Conditions →')).toBeInTheDocument();
    });
  });
});
