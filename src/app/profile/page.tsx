"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle2, Circle, Lock, KeyRound, ArrowLeft, Eye, EyeOff, Terminal, ShieldCheck, Globe, Package, Cpu, Zap, Wand, Award } from 'lucide-react';
import Link from 'next/link';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import SkillRadar from '@/components/SkillRadar';

const levels = [
    { id: 1, title: 'Welcome to the Shell', skill: 'Navigasi Filesystem' },
    { id: 2, title: 'The Hidden Message', skill: 'Base64 Decoding' },
    { id: 3, title: 'Needle in a Haystack', skill: 'Grep & Search' },
    { id: 4, title: 'Pipelining', skill: 'Pipe Commands' },
    { id: 5, title: 'Strict Rules', skill: 'File Permissions' },
];

export default function ProfilePage() {
    const { user, loading, skillStats, isLevelCompleted, isLevelUnlocked, refreshUser } = useAuth();
    const router = useRouter();

    const [editFullName, setEditFullName] = useState('');
    const [editDiscord, setEditDiscord] = useState('');
    const [profileStatus, setProfileStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [profileMessage, setProfileMessage] = useState('');

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
        if (user) {
            setEditFullName(user.fullName);
            setEditDiscord(user.discord);
        }
    }, [user, loading, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus('submitting');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName: editFullName, discord: editDiscord }),
            });

            const data = await res.json();

            if (!res.ok) {
                setProfileStatus('error');
                setProfileMessage(data.error || 'Gagal memperbarui profil');
                return;
            }

            await refreshUser();
            setProfileStatus('success');
            setProfileMessage('Profil berhasil diperbarui!');

            setTimeout(() => {
                setProfileStatus('idle');
                setProfileMessage('');
            }, 3000);
        } catch {
            setProfileStatus('error');
            setProfileMessage('Terjadi kesalahan network');
        }
    };

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
        <SessionLayout title="User Profile" currentLevel={0} showObjectives={false}>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                    {/* User Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/30 shrink-0">
                                <User size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{user.fullName}</h1>
                                <p className="text-primary/60 font-mono text-[10px] md:text-sm truncate">@{user.discord}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2 flex items-center justify-between text-[10px] md:text-sm">
                            <span className="text-foreground/60 font-mono uppercase tracking-wider">Progress Keseluruhan</span>
                            <span className="text-primary font-mono font-bold">{completedCount}/{totalLevels} ({progressPercent}%)</span>
                        </div>
                        <div className="w-full h-2.5 md:h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary/80 to-secondary rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Skill Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]"
                    >
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-2">Visualisasi Kompetensi</h3>
                        <SkillRadar data={skillStats} />
                    </motion.div>
                </div>

                {/* Badge Case */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Award size={18} className="text-secondary" />
                        <h2 className="text-sm md:text-lg font-bold font-mono uppercase tracking-tight">Badge Case</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {(user.badges || []).map((ub, idx) => {
                            const IconComponent = {
                                'Terminal': Terminal,
                                'ShieldCheck': ShieldCheck,
                                'Globe': Globe,
                                'Package': Package,
                                'Cpu': Cpu,
                                'Zap': Zap,
                                'Wand': Wand
                            }[ub.badge.icon] || Award;

                            return (
                                <motion.div
                                    key={ub.badge.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative flex flex-col items-center p-3 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-all cursor-default"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition-transform">
                                        <IconComponent size={24} />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold font-mono text-center text-foreground line-clamp-1">{ub.badge.name}</span>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-[10px] md:text-xs text-center">
                                        <p className="font-bold text-secondary mb-1">{ub.badge.name}</p>
                                        <p className="text-foreground/60">{ub.badge.description}</p>
                                        <p className="text-[8px] mt-1 text-foreground/30 italic">Awarded: {new Date(ub.awardedAt).toLocaleDateString()}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {(!user.badges || user.badges.length === 0) && (
                            <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                                <p className="text-xs md:text-sm text-foreground/20 font-mono">Belum ada badge yang dikumpulkan. Selesaikan level untuk mendapatkan badge!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Level Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={18} className="text-primary" />
                            <h2 className="text-sm md:text-lg font-bold font-mono uppercase tracking-tight">Level Progress</h2>
                        </div>

                        <div className="space-y-2">
                            {levels.map((lvl) => {
                                const completed = isLevelCompleted(lvl.id);
                                const unlocked = isLevelUnlocked(lvl.id);
                                const completionData = user.progress.find(p => p.level === lvl.id);

                                return (
                                    <div
                                        key={lvl.id}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${completed
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : unlocked
                                                ? 'border-white/10 bg-white/5'
                                                : 'border-white/5 bg-white/[0.02] opacity-50'
                                            }`}
                                    >
                                        <div className="shrink-0">
                                            {completed ? (
                                                <CheckCircle2 size={18} className="text-green-500" />
                                            ) : unlocked ? (
                                                <Circle size={18} className="text-white/20" />
                                            ) : (
                                                <Lock size={16} className="text-foreground/20" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[11px] md:text-xs font-bold text-foreground/80">Lvl {lvl.id}</span>
                                                <span className="text-xs text-foreground/60 truncate">{lvl.title}</span>
                                            </div>
                                            <div className="text-[10px] text-foreground/30 font-mono mt-0.5">{lvl.skill}</div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {completed && completionData ? (
                                                <span className="text-[10px] text-green-400/60 font-mono">
                                                    {new Date(completionData.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                            ) : unlocked ? (
                                                <Link href={`/play/${lvl.id}`} className="text-[10px] text-primary hover:underline font-mono">
                                                    Mulai →
                                                </Link>
                                            ) : (
                                                <span className="text-[10px] text-foreground/20 font-mono font-bold italic">LOCKED</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="space-y-4 md:space-y-6">
                        {/* Edit Profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-fit"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <User size={18} className="text-primary" />
                                <h2 className="text-sm md:text-lg font-bold font-mono uppercase tracking-tight">Edit Profil</h2>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editFullName}
                                        onChange={(e) => setEditFullName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                                        placeholder="Nama Lengkap"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">
                                        Discord Username
                                        {user.role !== 'ADMIN' && <span className="ml-2 text-[8px] text-amber-500/50 normal-case">(Admin only)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={editDiscord}
                                        onChange={(e) => setEditDiscord(e.target.value)}
                                        disabled={user.role !== 'ADMIN'}
                                        className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors ${user.role !== 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="discord_username"
                                        required
                                    />
                                </div>

                                {profileMessage && (
                                    <div className={`text-[10px] md:text-xs font-mono p-3 rounded-lg border ${profileStatus === 'success'
                                        ? 'text-green-400 bg-green-500/5 border-green-500/20'
                                        : 'text-red-400 bg-red-500/5 border-red-500/20'
                                        }`}>
                                        {profileStatus === 'success' ? '✓' : '✗'} {profileMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={profileStatus === 'submitting'}
                                    className="w-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs md:text-sm py-2.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-widest"
                                >
                                    {profileStatus === 'submitting' ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </form>
                        </motion.div>

                        {/* Change Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-fit"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <KeyRound size={18} className="text-primary" />
                                <h2 className="text-sm md:text-lg font-bold font-mono uppercase tracking-tight">Ganti Password</h2>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Password Lama</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors pr-10"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
                                        >
                                            {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors pr-10"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
                                        >
                                            {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-foreground/40 font-mono mb-1.5 uppercase tracking-wider">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs md:text-sm font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {passwordMessage && (
                                    <div className={`text-[10px] md:text-xs font-mono p-3 rounded-lg border ${passwordStatus === 'success'
                                        ? 'text-green-400 bg-green-500/5 border-green-500/20'
                                        : 'text-red-400 bg-red-500/5 border-red-500/20'
                                        }`}>
                                        {passwordStatus === 'success' ? '✓' : '✗'} {passwordMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passwordStatus === 'submitting'}
                                    className="w-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs md:text-sm py-2.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-widest"
                                >
                                    {passwordStatus === 'submitting' ? 'Mengubah...' : 'Simpan Password'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </SessionLayout>
    );
}
