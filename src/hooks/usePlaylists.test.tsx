import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlaylists, usePlaylistTracks } from './usePlaylists';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({ toast: vi.fn() }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePlaylists hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  describe('usePlaylists', () => {
    it('fetches user playlists', async () => {
      const mockPlaylists = [{ id: 'p-1', name: 'My List', user_id: 'user-1' }];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockPlaylists, error: null });
      
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockTrackCountsSelect = vi.fn().mockReturnValue({ in: mockIn });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'playlists') {
          return { select: mockSelect, eq: mockEq, order: mockOrder, in: mockIn };
        }
        if (table === 'playlist_tracks') {
          return { select: mockTrackCountsSelect, in: mockIn };
        }
        if (table === 'playlist_shares') {
          return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
        }
        return {};
      });

      const { result } = renderHook(() => usePlaylists(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to actually fetch data
      await waitFor(() => {
        expect(result.current.playlists).toHaveLength(1);
      });

      expect(supabase.from).toHaveBeenCalledWith('playlists');
      expect(result.current.playlists[0].name).toBe('My List');
    });
  });

  describe('usePlaylistTracks', () => {
    it('fetches tracks for a specific playlist', async () => {
      const mockTracks = [{ id: 't-1', playlist_id: 'p-1', track_id: 'track-1', position: 0 }];
      
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockTracks, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const { result } = renderHook(() => usePlaylistTracks('p-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supabase.from).toHaveBeenCalledWith('playlist_tracks');
      expect(mockEq).toHaveBeenCalledWith('playlist_id', 'p-1');
      expect(result.current.data).toEqual(mockTracks);
    });

    it('returns empty array if playlistId is null', async () => {
      const { result } = renderHook(() => usePlaylistTracks(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.isPending).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
