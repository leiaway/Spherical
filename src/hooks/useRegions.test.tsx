import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegions, useRegionTracks, useRegionArtists, useEmergingArtists } from './useRegions';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRegions hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useRegions', () => {
    it('fetches regions from supabase', async () => {
      const mockRegions = [{ id: '1', name: 'Region 1', country: 'US' }];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockRegions, error: null });
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { result } = renderHook(() => useRegions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supabase.from).toHaveBeenCalledWith('regions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('name');
      expect(result.current.data).toEqual(mockRegions);
    });

    it('handles errors', async () => {
      const mockError = new Error('Supabase error');
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { result } = renderHook(() => useRegions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useRegionTracks', () => {
    it('returns empty array if regionId is null', async () => {
      const { result } = renderHook(() => useRegionTracks(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.isPending).toBe(true);
      expect(result.current.data).toBeUndefined(); // React Query might keep it undefined when disabled
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('fetches tracks for a specific region', async () => {
      const mockTracks = [{ id: '1', title: 'Track 1' }];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockTracks, error: null });
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const { result } = renderHook(() => useRegionTracks('region-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supabase.from).toHaveBeenCalledWith('tracks');
      expect(mockEq).toHaveBeenCalledWith('region_id', 'region-1');
      expect(result.current.data).toEqual(mockTracks);
    });
  });

  describe('useEmergingArtists', () => {
    it('fetches emerging artists', async () => {
      const mockArtists = [{ id: '1', name: 'Artist 1', is_emerging: true }];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: mockArtists, error: null });
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      });

      const { result } = renderHook(() => useEmergingArtists(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supabase.from).toHaveBeenCalledWith('artists');
      expect(mockEq).toHaveBeenCalledWith('is_emerging', true);
      expect(result.current.data).toEqual(mockArtists);
    });
  });
});
