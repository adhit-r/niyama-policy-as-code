import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '../ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="xs" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('h-3', 'w-3');

    rerender(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('h-8', 'w-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('h-12', 'w-12');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('border-niyama-black', 'border-t-niyama-accent');

    rerender(<LoadingSpinner color="secondary" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('border-niyama-gray-300', 'border-t-niyama-black');

    rerender(<LoadingSpinner color="accent" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('border-niyama-white', 'border-t-niyama-accent');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('border-niyama-gray-300', 'border-t-niyama-white');
  });

  it('renders with text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByRole('status', { hidden: true }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
