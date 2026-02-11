"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Progress {
    level: number;
    completedAt: string;
}

interface User {
    id: string;
    fullName: string;
    discord: string;
    role: string;
    points: number;
    progress: Progress[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (discord: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (fullName: string, discord: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isLevelCompleted: (level: number) => boolean;
    isLevelUnlocked: (level: number) => boolean;
    updateProgress: (level: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            console.log('DEBUG: AuthContext - refreshUser starting fetch...');
            const res = await fetch('/api/auth/me');
            console.log('DEBUG: AuthContext - refreshUser status:', res.status);
            const data = await res.json();
            console.log('DEBUG: AuthContext - refreshUser data:', data);
            setUser(data.user || null);
        } catch (err) {
            console.error('DEBUG: AuthContext - refreshUser failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (discord: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discord, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            await refreshUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Terjadi kesalahan' };
        }
    };

    const register = async (fullName: string, discord: string, password: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, discord, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            await refreshUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Terjadi kesalahan' };
        }
    };

    const logout = async () => {
        await fetch('/api/auth/me', { method: 'DELETE' });
        setUser(null);
    };

    const updateProgress = async (level: number) => {
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, flag: 'MODULE_COMPLETED' }),
            });
            await refreshUser();
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const isLevelCompleted = useCallback((level: number) => {
        return user?.progress.some(p => p.level === level) || false;
    }, [user]);

    const isLevelUnlocked = useCallback((level: number) => {
        // Admins have everything unlocked
        if (user?.role === 'ADMIN') return true;

        // Special CTF Levels (1-5)
        if (level === 1) return isLevelCompleted(1005);
        if (level < 1000) return isLevelCompleted(level - 1);

        // Session Levels (1000+)
        if (level === 1001) return true; // Sesi 1 unlocked
        return isLevelCompleted(level - 1);
    }, [user, isLevelCompleted]);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isLevelCompleted, isLevelUnlocked, updateProgress }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
