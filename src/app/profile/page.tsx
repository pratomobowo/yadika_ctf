"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle2, Circle, Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const levels = [
    { id: 1, title: 'Welcome to the Shell', skill: 'Navigasi Filesystem' },
    { id: 2, title: 'The Hidden Message', skill: 'Base64 Decoding' },
    { id: 3, title: 'Needle in a Haystack', skill: 'Grep & Search' },
    { id: 4, title: 'Pipelining', skill: 'Pipe Commands' },
    { id: 5, title: 'Strict Rules', skill: 'File Permissions' },
];

export default function ProfilePage() {
    const { user, loading, isLevelCompleted, isLevelUnlocked } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [passwordMessage, setPasswordMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordStatus('error');
            setPasswordMessage('Password baru tidak cocok');
            return;
        }

        if (newPassword.length < 4) {
            setPasswordStatus('error');
            setPasswordMessage('Password baru minimal 4 karakter');
            return;
        }

        setPasswordStatus('submitting');

        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPasswordStatus('error');
                setPasswordMessage(data.error);
                return;
            }

            setPasswordStatus('success');
            setPasswordMessage('Password berhasil diubah!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setPasswordStatus('idle');
                setPasswordMessage('');
            }, 3000);
        } catch {
            setPasswordStatus('error');
            setPasswordMessage('Terjadi kesalahan');
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="text-terminal animate-pulse font-mono">Loading profile...</div>
            </div>
        );
    }

    const completedCount = user.progress.length;
    const totalLevels = levels.length;
    const progressPercent = Math.round((completedCount / totalLevels) * 100);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-foreground">
            {/* Header */}
            <div className="border-b border-terminal/10 bg-[#111113]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/play/1" className="flex items-center gap-2 text-terminal/60 hover:text-terminal transition-colors">
                        <ArrowLeft size={18} />
                        <span className="font-mono text-sm">Kembali ke Challenge</span>
                    </Link>
                    <span className="text-primary font-bold tracking-wider text-sm font-mono">PROFILE</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111113] border border-terminal/10 rounded-xl p-6"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-terminal/10 flex items-center justify-center text-terminal border-2 border-terminal/30">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{user.fullName}</h1>
                            <p className="text-terminal/60 font-mono text-sm">@{user.discord}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-foreground/60 font-mono">Progress Keseluruhan</span>
                        <span className="text-terminal font-mono font-bold">{completedCount}/{totalLevels} ({progressPercent}%)</span>
                    </div>
                    <div className="w-full h-3 bg-[#0a0a0c] rounded-full overflow-hidden border border-terminal/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-terminal/80 to-primary rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Level Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111113] border border-terminal/10 rounded-xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-primary" />
                        <h2 className="text-lg font-bold font-mono">Level Progress</h2>
                    </div>

                    <div className="space-y-3">
                        {levels.map((lvl) => {
                            const completed = isLevelCompleted(lvl.id);
                            const unlocked = isLevelUnlocked(lvl.id);
                            const completionData = user.progress.find(p => p.level === lvl.id);

                            return (
                                <div
                                    key={lvl.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${completed
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : unlocked
                                                ? 'border-terminal/10 bg-terminal/5'
                                                : 'border-white/5 bg-white/[0.02] opacity-50'
                                        }`}
                                >
                                    <div className="shrink-0">
                                        {completed ? (
                                            <CheckCircle2 size={22} className="text-green-500" />
                                        ) : unlocked ? (
                                            <Circle size={22} className="text-terminal/40" />
                                        ) : (
                                            <Lock size={22} className="text-foreground/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-bold text-foreground/80">Level {lvl.id}</span>
                                            <span className="text-foreground/40">•</span>
                                            <span className="text-sm text-foreground/60 truncate">{lvl.title}</span>
                                        </div>
                                        <div className="text-xs text-foreground/30 font-mono mt-0.5">{lvl.skill}</div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        {completed && completionData ? (
                                            <span className="text-xs text-green-400/60 font-mono">
                                                {new Date(completionData.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        ) : unlocked ? (
                                            <Link href={`/play/${lvl.id}`} className="text-xs text-terminal hover:underline font-mono">
                                                Mulai →
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-foreground/20 font-mono">Terkunci</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#111113] border border-terminal/10 rounded-xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <KeyRound size={20} className="text-primary" />
                        <h2 className="text-lg font-bold font-mono">Ganti Password</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Password Lama</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0c] border border-terminal/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-terminal/40 transition-colors pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
                                >
                                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0c] border border-terminal/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-terminal/40 transition-colors pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
                                >
                                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#0a0a0c] border border-terminal/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-terminal/40 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {passwordMessage && (
                            <div className={`text-sm font-mono p-3 rounded-lg border ${passwordStatus === 'success'
                                    ? 'text-green-400 bg-green-500/5 border-green-500/20'
                                    : 'text-red-400 bg-red-500/5 border-red-500/20'
                                }`}>
                                {passwordStatus === 'success' ? '✓' : '✗'} {passwordMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={passwordStatus === 'submitting'}
                            className="w-full bg-terminal/10 border border-terminal/20 text-terminal font-mono text-sm py-2.5 rounded-lg hover:bg-terminal/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {passwordStatus === 'submitting' ? 'Mengubah...' : 'Ubah Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
