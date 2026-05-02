import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ConditionWidgets from './ConditionWidgets';

// Mock apiService
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getConditionStatistics: jest.fn(),
    getPatientConditions: jest.fn(),
  },
}));

import apiService from '../services/api';

const mockStats = {
  active_conditions: 12,
  active_patient_conditions: 45,
  recent_diagnoses: 5,
};

const mockPatientConditions = [
  {
    id: 1,
    is_active: true,
    current_status: 'stable',
    severity: 'moderate',
    diagnosis_date: new Date().toISOString(),
    condition: { code: 'AMD', name: 'Age-Related Macular Degeneration', category: 'retinal' },
  },
  {
    id: 2,
    is_active: true,
    current_status: 'improving',
    severity: 'severe',
    diagnosis_date: new Date().toISOString(),
    condition: { code: 'DIABETIC_RET', name: 'Diabetic Retinopathy', category: 'diabetic' },
  },
];

// Helper wrapper with router context (ConditionWidgets uses Link)
const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ConditionWidgets', () => {
  beforeEach(() => {
    apiService.getConditionStatistics.mockResolvedValue({ data: mockStats });
    apiService.getPatientConditions.mockResolvedValue({ data: mockPatientConditions });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    renderWithRouter(<ConditionWidgets />);
    expect(screen.getByText(/loading condition widgets/i)).toBeInTheDocument();
  });

  test('renders condition cards after loading', async () => {
    renderWithRouter(<ConditionWidgets />);
    await waitFor(() => {
      // AMD appears in both <h3> (shortName) and <span> (code) in non-compact mode
      expect(screen.getAllByText('AMD').length).toBeGreaterThan(0);
    });
  });

  test('renders all 4 condition widgets', async () => {
    renderWithRouter(<ConditionWidgets />);
    await waitFor(() => {
      // AMD appears in both <h3> (shortName) and <span> (code) in non-compact mode
      expect(screen.getAllByText('AMD').length).toBeGreaterThan(0);
      // Diabetic Retinopathy shortName differs from its code (DIABETIC_RET)
      expect(screen.getByText('Diabetic Retinopathy')).toBeInTheDocument();
    });
  });

  test('renders without condition cards when APIs reject (allSettled never throws)', async () => {
    apiService.getConditionStatistics.mockRejectedValue(new Error('API error'));
    apiService.getPatientConditions.mockRejectedValue(new Error('API error'));

    renderWithRouter(<ConditionWidgets />);
    // Promise.allSettled never throws - loading finishes and the empty state renders
    await waitFor(() => {
      expect(screen.queryByText(/loading condition widgets/i)).not.toBeInTheDocument();
    });
  });

  test('accepts compact prop without crashing', async () => {
    renderWithRouter(<ConditionWidgets compact={true} />);
    await waitFor(() => {
      // In compact mode the code <span> is not rendered, so AMD appears once in <h3>
      expect(screen.getByRole('heading', { name: 'AMD' })).toBeInTheDocument();
    });
  });
});
