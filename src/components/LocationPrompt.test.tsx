import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocationPrompt } from './LocationPrompt';
import React from 'react';

describe('LocationPrompt', () => {
  it('renders correctly with default props', () => {
    render(<LocationPrompt onEnableLocation={vi.fn()} onSkip={vi.fn()} />);
    
    expect(screen.getByText('Discover Local Music')).toBeInTheDocument();
    expect(screen.getByText(/Enable location to find music/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable location services/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore globally instead/i })).toBeInTheDocument();
  });

  it('calls onEnableLocation when enable button is clicked', () => {
    const mockOnEnable = vi.fn();
    render(<LocationPrompt onEnableLocation={mockOnEnable} onSkip={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /enable location services/i }));
    expect(mockOnEnable).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when skip button is clicked', () => {
    const mockOnSkip = vi.fn();
    render(<LocationPrompt onEnableLocation={vi.fn()} onSkip={mockOnSkip} />);
    
    fireEvent.click(screen.getByRole('button', { name: /explore globally instead/i }));
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('shows loading state and disables the enable button', () => {
    render(<LocationPrompt onEnableLocation={vi.fn()} onSkip={vi.fn()} loading={true} />);
    
    const enableBtn = screen.getByRole('button', { name: /detecting location.../i });
    expect(enableBtn).toBeInTheDocument();
    expect(enableBtn).toBeDisabled();
  });

  it('displays error message if provided', () => {
    const errorMessage = 'Permission denied by user';
    render(<LocationPrompt onEnableLocation={vi.fn()} onSkip={vi.fn()} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
