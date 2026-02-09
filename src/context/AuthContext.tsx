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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            setUser(data.user || null);
        } catch {
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

    const isLevelCompleted = useCallback((level: number) => {
        return user?.progress.some(p => p.level === level) || false;
    }, [user]);

    const isLevelUnlocked = useCallback((level: number) => {
        if (level === 1) return true;
        return isLevelCompleted(level - 1);
    }, [isLevelCompleted]);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isLevelCompleted, isLevelUnlocked }}>
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
