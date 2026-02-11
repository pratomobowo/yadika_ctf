"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Trophy, Star, Target, ArrowRight,
    CheckCircle2, Circle, Lock, Zap, Medal, BookOpen, Terminal, Shield
} from 'lucide-react';

const sessionModules = [
    { level: 1001, title: 'Instalasi Ubuntu Server', href: '/play/session/1' },
    { level: 1002, title: 'Basic Commands', href: '/play/session/2' },
    { level: 1003, title: 'File Management', href: '/play/session/3' },
    { level: 1004, title: 'Text Editing (Nano)', href: '/play/session/4' },
    { level: 1005, title: 'User & Permission', href: '/play/session/5' },
];

const ctfLevels = [
    { level: 1, title: 'Welcome to the Shell', href: '/play/1' },
    { level: 2, title: 'The Hidden Message', href: '/play/2' },
    { level: 3, title: 'Needle in a Haystack', href: '/play/3' },
    { level: 4, title: 'Pipelining', href: '/play/4' },
    { level: 5, title: 'Strict Rules', href: '/play/5' },
    { level: 6, title: 'Process Hunting', href: '/play/6' },
    { level: 7, title: 'Output Master', href: '/play/7' },
    { level: 8, title: 'Environment Secrets', href: '/play/8' },
    { level: 9, title: 'Web Recon', href: '/play/9' },
    { level: 10, title: 'Bash Script Runner', href: '/play/10' },
];

interface LeaderboardEntry {
    rank: number;
    discord: string;
    points: number;
    completedCount: number;
}

export default function DashboardPage() {
    const { user, loading, isLevelCompleted, isLevelUnlocked } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingBoard, setLoadingBoard] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => setLeaderboard(data.leaderboard || []))
            .catch(() => { })
            .finally(() => setLoadingBoard(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="text-terminal animate-pulse font-mono">Loading dashboard...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="text-center space-y-4">
                    <p className="text-foreground/60 font-mono text-sm">Kamu belum login</p>
                    <Link href="/" className="inline-block bg-primary/10 border border-primary/20 text-primary font-mono text-sm px-6 py-2.5 rounded-lg hover:bg-primary/20 transition-colors">
                        Login →
                    </Link>
                </div>
            </div>
        );
    }

    const totalModules = sessionModules.length;
    const completedModules = sessionModules.filter(m => isLevelCompleted(m.level)).length;
    const totalCTF = ctfLevels.length;
    const completedCTF = ctfLevels.filter(c => isLevelCompleted(c.level)).length;
    const totalProgress = completedModules + completedCTF;
    const totalAll = totalModules + totalCTF;
    const progressPercent = Math.round((totalProgress / totalAll) * 100);

    const nextModule = sessionModules.find(m => isLevelUnlocked(m.level) && !isLevelCompleted(m.level));
    const nextCTF = ctfLevels.find(c => isLevelUnlocked(c.level) && !isLevelCompleted(c.level));
    const nextAction = nextModule || nextCTF;

    const userRank = leaderboard.findIndex(e => e.discord === user.discord) + 1;

    return (
        <SessionLayout title="Dashboard" currentLevel={0} showObjectives={false}>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Points Badge */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Halo, {user.discord}! 👋</h2>
                        <p className="text-xs text-foreground/40 font-mono">Platform Pembelajaraan DevOps</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                        <Star size={14} className="text-amber-400" />
                        <span className="text-amber-400 font-mono font-bold text-sm">{user.points}</span>
                        <span className="text-amber-400/50 text-xs font-mono">pts</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3 text-center">
                        <Zap size={16} className="text-amber-400 mx-auto mb-1 md:mb-1.5" />
                        <div className="text-lg md:text-xl font-bold text-foreground font-mono leading-none">{user.points}</div>
                        <div className="text-[9px] md:text-[10px] text-foreground/40 font-mono mt-1">Total Poin</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3 text-center">
                        <Target size={16} className="text-primary mx-auto mb-1 md:mb-1.5" />
                        <div className="text-lg md:text-xl font-bold text-foreground font-mono leading-none">{totalProgress}/{totalAll}</div>
                        <div className="text-[9px] md:text-[10px] text-foreground/40 font-mono mt-1">Level Selesai</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3 text-center">
                        <BookOpen size={16} className="text-blue-400 mx-auto mb-1 md:mb-1.5" />
                        <div className="text-lg md:text-xl font-bold text-foreground font-mono leading-none">{completedModules}/{totalModules}</div>
                        <div className="text-[9px] md:text-[10px] text-foreground/40 font-mono mt-1">Materi</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-3 text-center">
                        <Shield size={16} className="text-red-400 mx-auto mb-1 md:mb-1.5" />
                        <div className="text-lg md:text-xl font-bold text-foreground font-mono leading-none">{completedCTF}/{totalCTF}</div>
                        <div className="text-[9px] md:text-[10px] text-foreground/40 font-mono mt-1">CTF</div>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-foreground/60">Progress Keseluruhan</span>
                        <span className="font-mono text-xs text-primary font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary/80 to-secondary rounded-full"
                        />
                    </div>
                    {nextAction && (
                        <Link href={nextAction.href} className="mt-3 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5 hover:bg-primary/20 transition-all group">
                            <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                            <span className="text-xs font-mono text-primary">Lanjut: {nextAction.title}</span>
                        </Link>
                    )}
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Module Progress */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={16} className="text-blue-400" />
                            <h3 className="font-bold font-mono text-xs">Materi Industri</h3>
                            <span className="ml-auto text-[10px] text-foreground/30 font-mono">{completedModules}/{totalModules}</span>
                        </div>
                        <div className="space-y-1.5">
                            {sessionModules.map((mod) => {
                                const completed = isLevelCompleted(mod.level);
                                const unlocked = isLevelUnlocked(mod.level);
                                return (
                                    <Link key={mod.level} href={unlocked ? mod.href : '#'}
                                        className={`flex items-center gap-3 p-2.5 rounded-md border transition-all text-xs ${completed ? 'border-green-500/20 bg-green-500/5'
                                            : unlocked ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                                : 'border-white/5 bg-white/[0.02] opacity-40 pointer-events-none'
                                            }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${completed ? 'bg-green-500' : unlocked ? 'bg-primary/40' : 'bg-white/10'}`} />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-foreground/80 truncate block">{mod.title}</span>
                                            <span className="text-[10px] text-foreground/30 font-mono">+10 pts</span>
                                        </div>
                                        {completed ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                            : unlocked ? <Circle size={14} className="text-white/20 shrink-0" />
                                                : <Lock size={12} className="text-foreground/20 shrink-0" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Leaderboard */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={16} className="text-amber-400" />
                            <h3 className="font-bold font-mono text-xs">Leaderboard</h3>
                            {userRank > 0 && (
                                <span className="ml-auto text-[10px] text-amber-400/60 font-mono">Rank #{userRank}</span>
                            )}
                        </div>

                        {loadingBoard ? (
                            <div className="text-center py-6 text-foreground/30 font-mono text-xs animate-pulse">Loading...</div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-6 text-foreground/30 font-mono text-xs">Belum ada data</div>
                        ) : (
                            <div className="space-y-0.5">
                                <div className="grid grid-cols-12 gap-2 px-2.5 py-1.5 text-[10px] text-foreground/30 font-mono uppercase tracking-wider">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-7">Discord Tag</div>
                                    <div className="col-span-4 text-right">Poin</div>
                                </div>
                                {leaderboard.map((entry) => {
                                    const isMe = entry.discord === user.discord;
                                    return (
                                        <div key={entry.discord}
                                            className={`grid grid-cols-12 gap-2 px-2.5 py-2 rounded-md items-center transition-colors ${isMe ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/[0.03]'
                                                }`}>
                                            <div className="col-span-1">
                                                {entry.rank <= 3 ? (
                                                    <Medal size={14} className={
                                                        entry.rank === 1 ? 'text-amber-400'
                                                            : entry.rank === 2 ? 'text-gray-300'
                                                                : 'text-amber-700'
                                                    } />
                                                ) : (
                                                    <span className="text-[10px] text-foreground/40 font-mono">{entry.rank}</span>
                                                )}
                                            </div>
                                            <div className="col-span-7 truncate">
                                                <span className={`text-xs font-mono translate-y-[-1px] ${isMe ? 'text-primary font-bold' : 'text-foreground/80'}`}>
                                                    @{entry.discord}
                                                </span>
                                            </div>
                                            <div className="col-span-4 text-right">
                                                <span className="text-xs font-mono font-bold text-amber-400">{entry.points}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </SessionLayout>
    );
}
