"use client";

import { Sidebar } from '@/components/Sidebar';
import { Level2Terminal } from '@/components/Level2Terminal';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Send, CheckCircle2, Lightbulb, FileCode, Shield } from 'lucide-react';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Level2() {
    const [flag, setFlag] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [flagFound, setFlagFound] = useState(false);
    const { submitFlag, status, alreadyCompleted, setStatus } = useSubmitFlag(2, 'yadika{b4se64_d3c0d3r}');
    const { user, loading, isLevelUnlocked } = useAuth();
    const router = useRouter();

    // Redirect to home if not logged in
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/');
            } else if (!isLevelUnlocked(2)) {
                router.push('/play/1');
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
            <Sidebar currentLevel={2} />

            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-secondary">Level 2: The Hidden Message</h1>
                            <p className="text-foreground/60 font-mono text-sm">Target: Base64 Encoding & Decoding</p>
                        </div>
                        {alreadyCompleted && (
                            <div className="ml-auto flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm">
                                <CheckCircle2 size={16} />
                                Completed
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Mission & Instructions */}
                        <div className="space-y-4">
                            <div className="bg-[#111113] p-5 border border-secondary/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    MISSION BRIEFING
                                </h2>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    Cadet, ada pesan rahasia yang tersembunyi di sistem!
                                    Pesan tersebut di-<span className="text-secondary font-bold">encode</span> menggunakan <span className="text-secondary">Base64</span>.
                                </p>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    Tugasmu: <span className="text-primary font-bold">temukan dan decode pesan tersebut</span> untuk mendapatkan flag.
                                </p>
                            </div>

                            <div className="bg-[#111113] p-5 border border-secondary/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold uppercase text-sm flex items-center gap-2">
                                    <FileCode size={16} />
                                    Tentang Base64
                                </h2>
                                <p className="text-foreground/70 text-sm leading-relaxed">
                                    Base64 adalah metode encoding yang mengubah data biner menjadi teks ASCII.
                                    Sering digunakan untuk menyembunyikan data, tapi bukan enkripsi yang aman!
                                </p>
                                <div className="bg-black/30 p-3 rounded-lg font-mono text-xs">
                                    <p className="text-foreground/50">Contoh:</p>
                                    <p className="text-secondary">SGVsbG8gV29ybGQ=</p>
                                    <p className="text-foreground/50">→ decode →</p>
                                    <p className="text-primary">Hello World</p>
                                </div>
                            </div>

                            <div className="bg-[#111113] p-5 border border-secondary/10 rounded-xl space-y-3">
                                <h2 className="text-primary font-bold uppercase text-sm flex items-center gap-2">
                                    <FileCode size={16} />
                                    Perintah Baru
                                </h2>
                                <ul className="space-y-2 text-sm text-foreground/70 font-mono">
                                    <li><code className="text-secondary">decode &lt;text&gt;</code> — decode Base64</li>
                                    <li><code className="text-secondary">encode &lt;text&gt;</code> — encode ke Base64</li>
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
                                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200/80 space-y-2"
                                >
                                    <p className="flex items-start gap-2">
                                        <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                        <span> Cari file dengan ekstensi <code className="text-yellow-400">.b64</code></span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <Lightbulb size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                        <span> Gunakan <code className="text-yellow-400">cat</code> untuk melihat isi file, lalu <code className="text-yellow-400">decode</code> isinya</span>
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column: Terminal */}
                        <div className="space-y-4">
                            <Level2Terminal onFlagFound={handleFlagFound} />

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

                    {/* Flag Submission */}
                    <div className="mt-8 bg-[#1a1a1c] p-6 border-2 border-secondary/20 rounded-2xl shadow-[0_0_50px_rgba(0,184,255,0.05)]">
                        <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
                            <Shield size={20} className="text-secondary" />
                            SUBMIT YOUR FLAG
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="yadika{...}"
                                value={flag}
                                onChange={(e) => setFlag(e.target.value)}
                                disabled={status === 'correct'}
                                className="flex-1 bg-black border border-secondary/30 rounded-lg px-4 py-3 font-mono text-secondary focus:border-secondary focus:ring-1 focus:ring-secondary outline-none disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'correct' || status === 'submitting'}
                                className={`px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'correct'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-secondary text-black hover:bg-secondary/80 hover:scale-105 active:scale-95'
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

                        <p className="text-accent mt-4 text-center text-sm animate-pulse flex items-center justify-center gap-2">
                            <Lock size={16} />
                            Flag salah! Coba lagi, Cadet.
                        </p>
                        {status === 'correct' && !alreadyCompleted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-center"
                            >
                                <p className="text-secondary text-lg font-bold mb-2 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={24} />
                                    Excellent! Kamu sudah memahami Base64!
                                </p>
                                <p className="text-foreground/60 text-sm">
                                    Encoding bukan enkripsi — siapapun bisa decode! Ready for Level 3?
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

