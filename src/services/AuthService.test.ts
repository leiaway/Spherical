import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            refreshSession: vi.fn(),
            getUser: vi.fn(),
            onAuthStateChange: vi.fn(),
        }
    }
}));

describe('AuthService module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('authenticates a user with valid credentials and yields a clean AppUser', async () => {
        const mockSession = { user: { id: 'user-1', email: 'test@example.com' } };
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: mockSession, error: null } as any);

        const result = await AuthService.login('test@example.com', 'password');
        expect(result.error).toBeNull();
        expect(result.user).toEqual({ id: 'user-1', email: 'test@example.com' });
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    });

    it('yields an error state when authentication fails', async () => {
        const mockError = new Error('Invalid credentials');
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: { user: null }, error: mockError } as any);

        const result = await AuthService.login('test@example.com', 'wrong');
        expect(result.user).toBeNull();
        expect(result.error).toEqual(mockError);
    });

    it('clears the active session safely when the user logs out', async () => {
        vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

        const result = await AuthService.logout();
        expect(result.error).toBeNull();
        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('refreshes the active session token and yields the updated user data', async () => {
        const mockSession = { user: { id: 'user-1', email: 'test@example.com' } };
        vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({ data: mockSession, error: null } as any);

        const result = await AuthService.refreshSession();
        expect(result.error).toBeNull();
        expect(result.user).toEqual({ id: 'user-1', email: 'test@example.com' });
        expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });
});
