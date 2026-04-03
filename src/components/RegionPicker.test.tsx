import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegionPicker } from './RegionPicker';
import React from 'react';

const mockRegions = [
  { id: '1', name: 'Tokyo', country: 'Japan', description: null, latitude: 35, longitude: 139 },
  { id: '2', name: 'London', country: 'UK', description: null, latitude: 51, longitude: -0.1 },
  { id: '3', name: 'NYC', country: 'USA', description: null, latitude: 40, longitude: -74 },
];

describe('RegionPicker', () => {
  it('renders with placeholder when no region is selected', () => {
    render(
      <RegionPicker
        regions={mockRegions}
        currentRegionId={null}
        onRegionChange={vi.fn()}
        onRandomRegion={vi.fn()}
      />
    );
    
    expect(screen.getByText('Select Region')).toBeInTheDocument();
  });

  it('displays current region name', () => {
    render(
      <RegionPicker
        regions={mockRegions}
        currentRegionId="2"
        onRegionChange={vi.fn()}
        onRandomRegion={vi.fn()}
      />
    );
    
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('calls onRandomRegion when Random button is clicked', () => {
    const mockRandom = vi.fn();
    render(
      <RegionPicker
        regions={mockRegions}
        currentRegionId="1"
        onRegionChange={vi.fn()}
        onRandomRegion={mockRandom}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /random/i }));
    expect(mockRandom).toHaveBeenCalledTimes(1);
  });

  it('shows Back to Local button if nearestRegionId is provided and different from currentRegionId', () => {
    const mockRegionChange = vi.fn();
    render(
      <RegionPicker
        regions={mockRegions}
        currentRegionId="2"
        nearestRegionId="1"
        onRegionChange={mockRegionChange}
        onRandomRegion={vi.fn()}
      />
    );
    
    const localBtn = screen.getByRole('button', { name: /back to local/i });
    expect(localBtn).toBeInTheDocument();
    
    fireEvent.click(localBtn);
    expect(mockRegionChange).toHaveBeenCalledWith('1');
  });

  it('does not show Back to Local if nearestRegionId equals currentRegionId', () => {
    render(
      <RegionPicker
        regions={mockRegions}
        currentRegionId="1"
        nearestRegionId="1"
        onRegionChange={vi.fn()}
        onRandomRegion={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('button', { name: /back to local/i })).not.toBeInTheDocument();
  });
});
