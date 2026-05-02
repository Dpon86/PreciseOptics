import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertBadge from './AlertBadge';

describe('AlertBadge', () => {
  test('renders nothing when count is 0', () => {
    const { container } = render(<AlertBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders the count when count > 0', () => {
    render(<AlertBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('caps display at 99+ when count > 99', () => {
    render(<AlertBadge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  test('shows exactly 99 when count is 99', () => {
    render(<AlertBadge count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  test('applies critical severity class', () => {
    render(<AlertBadge count={3} severity="critical" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('alert-badge-critical');
  });

  test('applies high severity class', () => {
    render(<AlertBadge count={3} severity="high" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('alert-badge-high');
  });

  test('applies medium severity class by default', () => {
    render(<AlertBadge count={3} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('alert-badge-medium');
  });

  test('applies low severity class', () => {
    render(<AlertBadge count={1} severity="low" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('alert-badge-low');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<AlertBadge count={2} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows correct tooltip title for single alert', () => {
    render(<AlertBadge count={1} />);
    expect(screen.getByRole('button')).toHaveAttribute('title', '1 active alert');
  });

  test('shows correct tooltip title for multiple alerts', () => {
    render(<AlertBadge count={3} />);
    expect(screen.getByRole('button')).toHaveAttribute('title', '3 active alerts');
  });

  test('renders bell icon', () => {
    render(<AlertBadge count={1} />);
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });
});
