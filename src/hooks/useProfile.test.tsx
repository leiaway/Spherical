import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfile } from './useProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
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

describe('useProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when no user is authenticated', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('fetches user profile when authenticated', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = {
      id: 'user-123',
      display_name: 'Amir',
      home_country: 'Canada',
      avatar_url: null,
      location_enabled: true,
      current_latitude: 45.0,
      current_longitude: -75.0,
    };

    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

    const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.home_country).toBe('Canada');
    expect(result.current.data?.display_name).toBe('Amir');
  });
});
