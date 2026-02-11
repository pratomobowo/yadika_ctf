"use client";

import { Level3Terminal } from '@/components/Level3Terminal';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Lock } from 'lucide-react';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Level3() {
    const [flag, setFlag] = useState('');
    const [flagFound, setFlagFound] = useState(false);
    const { submitFlag, status, alreadyCompleted, setStatus } = useSubmitFlag(3, 'yadika{gr3p_m4st3r}');
    const { user, loading, isLevelUnlocked } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/');
            else if (!isLevelUnlocked(3)) router.push('/play/2');
        }
    }, [user, loading, router, isLevelUnlocked]);

    useEffect(() => {
        if (alreadyCompleted) setStatus('correct');
    }, [alreadyCompleted, setStatus]);

    const handleFlagFound = (foundFlag: string) => {
        setFlagFound(true);
        setFlag(foundFlag);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitFlag(flag);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-terminal">Loading...</div>;
    }

    return (
        <SessionLayout title="Level 3: Needle in a Haystack" currentLevel={3} showObjectives={false}>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-xs text-foreground/50 font-mono">
                        Cari FLAG di antara banyak file log. Format: <code className="text-accent">yadika{'{...}'}</code>
                    </p>
                    <div className="flex items-center gap-2">
                        {alreadyCompleted && (
                            <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs">
                                <CheckCircle2 size={12} /> Solved
                            </span>
                        )}
                        <span className="text-xs text-amber-400/60 font-mono">+20 pts</span>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-hidden">
                    <Level3Terminal onFlagFound={handleFlagFound} />
                </div>

                <div className="px-4 py-3 border-t border-white/5">
                    {flagFound && !alreadyCompleted && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-green-400 text-xs font-mono mb-2 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Flag terdeteksi!
                        </motion.p>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="yadika{...}"
                            value={flag}
                            onChange={(e) => setFlag(e.target.value)}
                            disabled={status === 'correct'}
                            className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 font-mono text-sm text-accent focus:border-accent outline-none disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === 'correct' || status === 'submitting'}
                            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-1.5 transition-all ${status === 'correct' ? 'bg-green-500 text-black' : 'bg-accent text-white hover:bg-accent/80'
                                }`}
                        >
                            {status === 'correct' ? (
                                <>SOLVED <CheckCircle2 size={14} /></>
                            ) : status === 'submitting' ? 'CHECKING...' : (
                                <>SUBMIT <Send size={14} /></>
                            )}
                        </button>
                    </form>
                    {status === 'wrong' && (
                        <p className="text-accent text-xs mt-1.5 flex items-center gap-1 font-mono">
                            <Lock size={12} /> Flag salah, coba lagi.
                        </p>
                    )}
                </div>
            </div>
        </SessionLayout>
    );
}
