"use client";

import { Sidebar } from '@/components/Sidebar';
import { VirtualTerminal } from '@/components/VirtualTerminal';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Send, CheckCircle2, Lightbulb, FileCode, Shield, Lock } from 'lucide-react';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Level1() {
    const [flag, setFlag] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [flagFound, setFlagFound] = useState(false);
    const { submitFlag, status, alreadyCompleted, setStatus } = useSubmitFlag(1, 'yadika{shell_king}');
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to home if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

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
            <Sidebar currentLevel={1} />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <TerminalIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold glow-text text-primary">Level 1: Welcome to the Shell</h1>
                            <p className="text-foreground/60 font-mono text-sm">Target: Linux Filesystem Navigation</p>
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
                            <div className="bg-[#111113] p-5 border border-terminal/10 rounded-xl space-y-3">
                                <h2 className="text-secondary font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                                    MISSION BRIEFING
                                </h2>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    Selamat datang, Cadet! Di dunia Linux, terminal adalah senjata utamamu.
                                    Tugas pertamamu: <span className="text-primary font-bold">temukan file flag yang tersembunyi</span> di dalam sistem.
                                </p>
                                <p className="text-xs text-foreground/60">
                                    Format flag: <code className="text-accent bg-accent/10 px-2 py-0.5 rounded">yadika{'{}'}...{'}'}</code>
                                </p>
                            </div>

                            <div className="bg-[#111113] p-5 border border-terminal/10 rounded-xl space-y-3">
                                <h2 className="text-secondary font-bold uppercase text-sm flex items-center gap-2">
                                    <FileCode size={16} />
                                    Perintah Dasar
                                </h2>
                                <ul className="space-y-2 text-sm text-foreground/70 font-mono">
                                    <li><code className="text-primary">ls</code> — lihat isi folder</li>
                                    <li><code className="text-primary">ls -a</code> — lihat <span className="text-accent">semua</span> file (termasuk tersembunyi)</li>
                                    <li><code className="text-primary">cd &lt;folder&gt;</code> — pindah ke folder</li>
                                    <li><code className="text-primary">cat &lt;file&gt;</code> — baca isi file</li>
                                    <li><code className="text-primary">pwd</code> — tampilkan lokasi saat ini</li>
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
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200/80"
                                >
                                    <p className="flex items-start gap-2">
                                        <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                        <span>Di Linux, file dan folder yang diawali dengan titik (.) adalah <em>tersembunyi</em>.
                                            Gunakan <code className="text-yellow-400">ls -a</code> untuk melihatnya!</span>
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <VirtualTerminal onFlagFound={handleFlagFound} />

                            {flagFound && !alreadyCompleted && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                                >
                                    <CheckCircle2 size={18} />
                                    Flag terdeteksi! Submit di bawah untuk menyelesaikan level.
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 bg-[#1a1a1c] p-6 border-2 border-terminal/20 rounded-2xl shadow-[0_0_50px_rgba(0,255,159,0.05)]">
                        <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
                            <Shield size={20} className="text-primary" />
                            SUBMIT YOUR FLAG
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="yadika{...}"
                                value={flag}
                                onChange={(e) => setFlag(e.target.value)}
                                disabled={status === 'correct'}
                                className="flex-1 bg-black border border-terminal/30 rounded-lg px-4 py-3 font-mono text-terminal focus:border-primary outline-none disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'correct' || status === 'submitting'}
                                className={`px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'correct' ? 'bg-green-500 text-black' : 'bg-primary text-black hover:bg-primary/80'
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
                                Flag salah! Coba lagi.
                            </p>
                        )}
                        {status === 'correct' && !alreadyCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-center"
                            >
                                <p className="text-terminal text-lg font-bold mb-2 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={24} />
                                    EXCELLENT WORK!
                                </p>
                                <p className="text-foreground/60 text-sm">
                                    Kamu sudah paham dasar navigasi Linux filesystem!
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
