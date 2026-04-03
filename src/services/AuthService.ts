import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
    id: string;
    email?: string;
}

export class AuthService {
    /**
     * Retrieves the currently logged-in user, abstracting away the Supabase client.
     */
    static async getCurrentUser(): Promise<AppUser | null> {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
        return {
            id: user.id,
            email: user.email,
        };
    }

    /**
     * Subscribes to authentication state changes.
     */
    static onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                callback({ id: session.user.id, email: session.user.email });
            } else {
                callback(null);
            }
        });

        return () => subscription.unsubscribe();
    }

    /**
     * Authenticates a user with email and password.
     */
    static async login(email: string, password: string): Promise<{ user: AppUser | null, error: Error | null }> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            return { user: null, error: error || new Error('Login failed') };
        }
        return { user: { id: data.user.id, email: data.user.email }, error: null };
    }

    /**
     * Clears the current user session.
     */
    static async logout(): Promise<{ error: Error | null }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    }

    /**
     * Force refreshes the session token.
     */
    static async refreshSession(): Promise<{ user: AppUser | null, error: Error | null }> {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.user) {
            return { user: null, error: error || new Error('Session refresh failed') };
        }
        return { user: { id: data.user.id, email: data.user.email }, error: null };
    }
}
