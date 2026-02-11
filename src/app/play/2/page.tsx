"use client";

import { Level2Terminal } from '@/components/Level2Terminal';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Lock } from 'lucide-react';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Level2() {
    const [flag, setFlag] = useState('');
    const [flagFound, setFlagFound] = useState(false);
    const { submitFlag, status, alreadyCompleted, setStatus } = useSubmitFlag(2, 'yadika{b4se64_d3c0d3r}');
    const { user, loading, isLevelUnlocked } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/');
            else if (!isLevelUnlocked(2)) router.push('/play/1');
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
        <SessionLayout title="Level 2: The Hidden Message" currentLevel={2} showObjectives={false}>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 md:px-4 py-2 md:py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-[10px] md:text-xs text-foreground/50 font-mono flex-1 mr-4">
                        Temukan dan decode pesan Base64 yang tersembunyi. Format: <code className="text-secondary">yadika{'{...}'}</code>
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {alreadyCompleted && (
                            <span className="flex items-center gap-0.5 md:gap-1 text-green-400 bg-green-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs">
                                <CheckCircle2 size={10} className="md:w-3 md:h-3" /> Solved
                            </span>
                        )}
                        <span className="text-[10px] md:text-xs text-amber-400/60 font-mono">+20 pts</span>
                    </div>
                </div>

                <div className="flex-1 p-3 md:p-4 overflow-hidden">
                    <Level2Terminal onFlagFound={handleFlagFound} />
                </div>

                <div className="px-3 md:px-4 py-2 md:py-3 border-t border-white/5">
                    {flagFound && !alreadyCompleted && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-green-400 text-[10px] md:text-xs font-mono mb-1.5 md:mb-2 flex items-center gap-1">
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
                            className="flex-1 bg-black/50 border border-white/10 rounded px-2 md:px-3 py-1.5 md:py-2 font-mono text-xs md:text-sm text-secondary focus:border-secondary outline-none disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === 'correct' || status === 'submitting'}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded font-bold text-xs md:text-sm flex items-center gap-1 md:gap-1.5 transition-all ${status === 'correct' ? 'bg-green-500 text-black' : 'bg-secondary text-black hover:bg-secondary/80'
                                }`}
                        >
                            {status === 'correct' ? (
                                <>SOLVED <CheckCircle2 size={12} className="md:w-3.5 md:h-3.5" /></>
                            ) : status === 'submitting' ? '...' : (
                                <>SUBMIT <Send size={12} className="md:w-3.5 md:h-3.5" /></>
                            )}
                        </button>
                    </form>
                    {status === 'wrong' && (
                        <p className="text-accent text-[10px] md:text-xs mt-1 md:mt-1.5 flex items-center gap-1 font-mono">
                            <Lock size={10} /> Flag salah.
                        </p>
                    )}
                </div>
            </div>
        </SessionLayout>
    );
}
