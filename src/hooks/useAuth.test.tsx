import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { AuthService } from '@/services/AuthService';

vi.mock('@/services/AuthService', () => {
    let mockCallback: any;
    return {
        AuthService: {
            getCurrentUser: vi.fn(),
            onAuthStateChange: vi.fn((cb) => {
                mockCallback = cb;
                return vi.fn();
            }),
            login: vi.fn(),
            logout: vi.fn(),
            refreshSession: vi.fn(),
            __triggerAuthStateChange: (user: any) => mockCallback?.(user),
        }
    };
});

describe('useAuth hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    it('initializes with the current user session on mount', async () => {
        const mockUser = { id: 'user-1', email: 'test@example.com' };
        vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it('updates the user state dynamically when authentication status changes', async () => {
        vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(null);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();

        act(() => {
            (AuthService as any).__triggerAuthStateChange({ id: 'user-2', email: 'new@example.com' });
        });

        expect(result.current.user).toEqual({ id: 'user-2', email: 'new@example.com' });
    });

    it('clears the user state dynamically when logout is triggered', async () => {
        const mockUser = { id: 'user-1', email: 'test@example.com' };
        vi.mocked(AuthService.getCurrentUser).mockResolvedValueOnce(mockUser);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.user).toEqual(mockUser);
        });

        act(() => {
            (AuthService as any).__triggerAuthStateChange(null);
        });

        expect(result.current.user).toBeNull();
    });
});
