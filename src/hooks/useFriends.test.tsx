import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFriends } from './useFriends';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('useFriends', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } } });
    
    // Default realtime channel mock
    (supabase.channel as any).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });
  });

  it('initializes and fetches friends', async () => {
    const mockFriendships = [
      { id: 'f-1', user_id: 'user-1', friend_id: 'user-2', status: 'accepted' },
      { id: 'f-2', user_id: 'user-3', friend_id: 'user-1', status: 'pending' },
    ];
    
    const mockProfiles = [
      { id: 'user-2', display_name: 'Bob' },
      { id: 'user-3', display_name: 'Alice' },
    ];

    const mockSelectFriendships = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockResolvedValue({ data: mockFriendships, error: null });

    const mockSelectProfiles = vi.fn().mockReturnThis();
    const mockIn = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'friendships') {
        return { select: mockSelectFriendships, or: mockOr };
      }
      if (table === 'profiles') {
        return { select: mockSelectProfiles, in: mockIn };
      }
      return {};
    });

    const { result } = renderHook(() => useFriends());

    // Wait for the state to settle after auth and fetching
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.friends).toHaveLength(1);
      expect(result.current.friends[0].id).toBe('f-1');
      expect(result.current.friends[0].friend_profile?.display_name).toBe('Bob');
      
      expect(result.current.pendingRequests).toHaveLength(1);
      expect(result.current.pendingRequests[0].id).toBe('f-2');
      expect(result.current.pendingRequests[0].user_profile?.display_name).toBe('Alice');
    });
  });

  it('sends friend request successfully', async () => {
    // Setup fetch mock to be empty to avoid console errors
    const mockSelectFriendships = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockResolvedValue({ data: [], error: null });
    
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'friendships') {
        return { select: mockSelectFriendships, or: mockOr, insert: mockInsert };
      }
      if (table === 'profiles') {
        return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }
      return {};
    });

    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let success;
    await act(async () => {
      success = await result.current.sendFriendRequest('user-5');
    });

    expect(success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({ user_id: 'user-1', friend_id: 'user-5' });
    expect(mockToast).toHaveBeenCalledWith({ title: 'Friend request sent!' });
  });

  it('accepts friend request successfully', async () => {
    // Setup fetch mock to be empty
    const mockSelectFriendships = vi.fn().mockReturnThis();
    const mockOr = vi.fn().mockResolvedValue({ data: [], error: null });
    
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'friendships') {
        return { select: mockSelectFriendships, or: mockOr, update: mockUpdate, eq: mockEq };
      }
      if (table === 'profiles') {
        return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: [], error: null }) };
      }
      return {};
    });

    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let success;
    await act(async () => {
      success = await result.current.acceptFriendRequest('f-test');
    });

    expect(success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'accepted' });
    expect(mockEq).toHaveBeenCalledWith('id', 'f-test');
    expect(mockToast).toHaveBeenCalledWith({ title: 'Friend request accepted!' });
  });
});
