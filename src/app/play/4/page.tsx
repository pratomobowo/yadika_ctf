"use client";

import { Sidebar } from '@/components/Sidebar';
import { Level4Terminal } from '@/components/Level4Terminal';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Send, CheckCircle2, Lightbulb, Shield, FileCode, Lock } from 'lucide-react';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Level4() {
    const [flag, setFlag] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [flagFound, setFlagFound] = useState(false);
    const { submitFlag, status, alreadyCompleted, setStatus } = useSubmitFlag(4, 'yadika{p1p3_dr34m3r}');
    const { user, loading, isLevelUnlocked } = useAuth();
    const router = useRouter();

    // Redirect to home if not logged in
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/');
            } else if (!isLevelUnlocked(4)) {
                router.push('/play/3');
            }
        }
    }, [user, loading, router, isLevelUnlocked]);

    // If already completed, show correct status
    useEffect(() => {
        if (alreadyCompleted) {
            setStatus('correct');
        }
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
        <div className="min-h-screen flex bg-[#0a0a0c]">
            <Sidebar currentLevel={4} />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                            <GitBranch size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-purple-400">Level 4: Pipelining</h1>
                            <p className="text-foreground/60 font-mono text-sm">Target: Menggabungkan perintah dengan pipe</p>
                        </div>
                        {alreadyCompleted && (
                            <div className="ml-auto flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm">
                                <CheckCircle2 size={16} />
                                Completed
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-[#111113] p-5 border border-purple-500/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    MISSION BRIEFING
                                </h2>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    Cadet, di dunia nyata data bisa sangat besar!
                                    <span className="text-purple-400 font-bold"> Pipe (|)</span> memungkinkan kamu menggabungkan beberapa perintah.
                                </p>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    Temukan FLAG yang tersembunyi di file dengan <span className="text-purple-400">100 baris data</span>!
                                </p>
                            </div>

                            <div className="bg-[#111113] p-5 border border-purple-500/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold uppercase text-sm">⚡ Cara Kerja Pipe</h2>
                                <div className="bg-black/30 p-3 rounded-lg font-mono text-xs space-y-2">
                                    <p className="text-foreground/50"># Output cmd1 → input cmd2:</p>
                                    <p className="text-purple-400">cat file.txt | grep "keyword"</p>
                                    <p className="text-foreground/50 mt-2"># Chain 3 perintah:</p>
                                    <p className="text-purple-400">cat file.txt | grep "data" | head -n 5</p>
                                </div>
                            </div>

                            <div className="bg-[#111113] p-5 border border-purple-500/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold uppercase text-sm flex items-center gap-2">
                                    <FileCode size={16} />
                                    Perintah Baru
                                </h2>
                                <ul className="space-y-1 text-sm text-foreground/70 font-mono">
                                    <li><code className="text-purple-400">head -n N</code> — N baris pertama</li>
                                    <li><code className="text-purple-400">tail -n N</code> — N baris terakhir</li>
                                    <li><code className="text-purple-400">sort</code> — urutkan baris</li>
                                    <li><code className="text-purple-400">wc -l</code> — hitung baris</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm hover:bg-yellow-500/20 transition-colors"
                            >
                                <Lightbulb size={16} />
                                {showHint ? 'Sembunyikan Hint' : 'Butuh Petunjuk?'}
                            </button>

                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200/80 space-y-2"
                                >
                                    <p className="flex items-start gap-2">
                                        <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                        <span> Cek folder <code className="text-yellow-400">data</code></span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                        <span> <code className="text-yellow-400">cat users.txt | grep "FLAG"</code></span>
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Level4Terminal onFlagFound={handleFlagFound} />
                            {flagFound && !alreadyCompleted && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                                >
                                    <CheckCircle2 size={18} />
                                    Flag terdeteksi! Submit di bawah.
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 bg-[#1a1a1c] p-6 border-2 border-purple-500/20 rounded-2xl">
                        <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
                            <Shield size={20} className="text-purple-400" />
                            SUBMIT YOUR FLAG
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="yadika{...}"
                                value={flag}
                                onChange={(e) => setFlag(e.target.value)}
                                disabled={status === 'correct'}
                                className="flex-1 bg-black border border-purple-500/30 rounded-lg px-4 py-3 font-mono text-purple-400 focus:border-purple-500 outline-none disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'correct' || status === 'submitting'}
                                className={`px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'correct' ? 'bg-green-500 text-black' : 'bg-purple-500 text-white hover:bg-purple-400'
                                    }`}
                            >
                                {status === 'correct' ? (
                                    <>SOLVED <CheckCircle2 size={18} /></>
                                ) : status === 'submitting' ? (
                                    'CHECKING...'
                                ) : (
                                    'SUBMIT'
                                )}
                                {status !== 'correct' && status !== 'submitting' && <Send size={18} />}
                            </button>
                        </form>
                        {status === 'wrong' && (
                            <p className="text-accent mt-4 text-center text-sm flex items-center justify-center gap-2">
                                <Lock size={16} />
                                Flag salah!
                            </p>
                        )}
                        {status === 'correct' && !alreadyCompleted && (
                            <p className="text-purple-400 mt-4 text-center font-bold flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} />
                                Excellent! Kamu menguasai pipelining!
                            </p>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

