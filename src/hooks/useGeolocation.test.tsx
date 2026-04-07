import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGeolocation } from './useGeolocation';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  const mockPermissions = {
    query: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.geolocation
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });

    // Mock navigator.permissions
    Object.defineProperty(globalThis.navigator, 'permissions', {
      value: mockPermissions,
      configurable: true,
    });
  });

  it('initializes with default state', () => {
    mockPermissions.query.mockResolvedValue({ state: 'prompt', onchange: null });
    
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.nearestRegion).toBeNull();
  });

  it('handles geolocation not supported', async () => {
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });
    mockPermissions.query.mockResolvedValue({ state: 'prompt', onchange: null });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toBe('Geolocation is not supported by your browser');
  });

  it('successfully retrieves location and finds nearest region', async () => {
    mockPermissions.query.mockResolvedValue({ state: 'granted', onchange: null });
    
    const mockRegions = [
      { id: '1', name: 'Region 1', country: 'US', latitude: 40.7128, longitude: -74.0060 }, // NYC
      { id: '2', name: 'Region 2', country: 'UK', latitude: 51.5074, longitude: -0.1278 }, // London
    ];
    
    const mockSelect = vi.fn().mockResolvedValue({ data: mockRegions, error: null });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.730610, // Close to NYC
          longitude: -73.935242,
        },
      });
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    // Wait for async state updates
    await vi.waitFor(() => {
      expect(result.current.latitude).toBe(40.730610);
      expect(result.current.longitude).toBe(-73.935242);
      expect(result.current.permission).toBe('granted');
      expect(result.current.nearestRegion).toBeDefined();
      expect(result.current.nearestRegion?.name).toBe('Region 1');
    });

    expect(supabase.from).toHaveBeenCalledWith('regions');
  });

  it('handles permission denied error', () => {
    mockPermissions.query.mockResolvedValue({ state: 'prompt', onchange: null });
    
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
      });
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toBe('Location access was denied');
    expect(result.current.permission).toBe('denied');
  });
});
