"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useSubmitFlag(level: number, correctFlag: string) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'wrong' | 'correct'>('idle');
    const [error, setError] = useState<string | null>(null);
    const { refreshUser, isLevelCompleted } = useAuth();

    const alreadyCompleted = isLevelCompleted(level);

    const submitFlag = async (flag: string): Promise<boolean> => {
        // Quick client-side check first
        if (flag.toLowerCase() !== correctFlag.toLowerCase()) {
            setStatus('wrong');
            setError('Flag salah!');
            setTimeout(() => {
                setStatus('idle');
                setError(null);
            }, 2000);
            return false;
        }

        setStatus('submitting');
        setError(null);

        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, flag }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mengirim flag');
                setStatus('wrong');
                setTimeout(() => setStatus('idle'), 2000);
                return false;
            }

            setStatus('correct');
            await refreshUser();
            return true;
        } catch {
            setError('Terjadi kesalahan');
            setStatus('wrong');
            setTimeout(() => setStatus('idle'), 2000);
            return false;
        }
    };

    return { submitFlag, status, error, alreadyCompleted, setStatus };
}
