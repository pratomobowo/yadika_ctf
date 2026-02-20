"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { motion } from 'framer-motion';
import { Shield, Users, Crown, Copy, LogOut, Plus, KeyRound, Star, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

interface ClanMember {
    id: string;
    discord: string;
    points: number;
    isLeader: boolean;
}

interface ClanData {
    id: string;
    name: string;
    tag: string;
    inviteCode?: string;
    isLeader: boolean;
    leaderId: string;
    leaderName: string;
    totalPoints: number;
    maxMembers: number;
    members: ClanMember[];
}

export default function ClanPage() {
    const { user, loading, refreshUser } = useAuth();
    const [clan, setClan] = useState<ClanData | null>(null);
    const [loadingClan, setLoadingClan] = useState(true);
    const [tab, setTab] = useState<'create' | 'join'>('join');

    // Form state
    const [clanName, setClanName] = useState('');
    const [clanTag, setClanTag] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchClan = useCallback(async () => {
        try {
            const res = await fetch('/api/clan');
            const data = await res.json();
            setClan(data.clan || null);
        } catch {
            setClan(null);
        } finally {
            setLoadingClan(false);
        }
    }, []);

    useEffect(() => {
        fetchClan();
    }, [fetchClan]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/clan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clanName, tag: clanTag }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
            } else {
                setMessage({ type: 'success', text: data.message });
                await fetchClan();
                await refreshUser();
            }
        } catch {
            setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/clan/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
            } else {
                setMessage({ type: 'success', text: data.message });
                await fetchClan();
                await refreshUser();
            }
        } catch {
            setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm(clan?.isLeader ? 'Kamu adalah ketua. Jika kamu satu-satunya anggota, klan akan dibubarkan. Lanjutkan?' : 'Yakin ingin keluar dari klan?')) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/clan/leave', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
            } else {
                setMessage({ type: 'success', text: data.message });
                setClan(null);
                await refreshUser();
            }
        } catch {
            setMessage({ type: 'error', text: 'Terjadi kesalahan' });
        } finally {
            setSubmitting(false);
        }
    };

    const copyCode = () => {
        if (clan?.inviteCode) {
            navigator.clipboard.writeText(clan.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading || loadingClan) {
        return (
            <SessionLayout title="Squad" currentLevel={0} showObjectives={false}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-terminal animate-pulse font-mono text-sm">Memuat data squad...</div>
                </div>
            </SessionLayout>
        );
    }

    if (!user) {
        return (
            <SessionLayout title="Squad" currentLevel={0} showObjectives={false}>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-foreground/60 font-mono text-sm">Kamu belum login</p>
                </div>
            </SessionLayout>
        );
    }

    return (
        <SessionLayout title="Squad" currentLevel={0} showObjectives={false}>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-primary" />
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Squad</h2>
                        <p className="text-xs text-foreground/40 font-mono">Bentuk tim, kumpulkan poin bersama!</p>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-mono ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {message.text}
                    </motion.div>
                )}

                {clan ? (
                    /* =================== HAS CLAN VIEW =================== */
                    <div className="space-y-4">
                        {/* Clan Header Card */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary/20 text-primary font-mono font-bold text-xs px-2 py-0.5 rounded">[{clan.tag}]</span>
                                        <h3 className="text-lg font-bold text-foreground">{clan.name}</h3>
                                    </div>
                                    <p className="text-xs text-foreground/40 font-mono">
                                        Ketua: {clan.leaderName} · {clan.members.length}/{clan.maxMembers} anggota
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                                        <Star size={14} className="text-amber-400" />
                                        <span className="text-amber-400 font-mono font-bold text-sm">{clan.totalPoints}</span>
                                        <span className="text-amber-400/50 text-[10px] font-mono">pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Invite Code (Leader only) */}
                            {clan.inviteCode && (
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] text-foreground/40 font-mono uppercase">Kode Invite:</span>
                                    <code className="bg-black/30 px-3 py-1.5 rounded font-mono text-sm text-secondary font-bold tracking-wider">{clan.inviteCode}</code>
                                    <button onClick={copyCode}
                                        className="p-1.5 hover:bg-white/10 rounded text-foreground/40 hover:text-primary transition-colors">
                                        {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                    <span className="text-[10px] text-foreground/20 font-mono">Bagikan ke teman!</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Members List */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={16} className="text-blue-400" />
                                <h4 className="font-bold font-mono text-xs">Anggota Squad</h4>
                            </div>
                            <div className="space-y-1.5">
                                {clan.members.map((member, idx) => (
                                    <div key={member.id}
                                        className={`flex items-center gap-3 p-2.5 rounded-md border text-xs ${member.id === user.id ? 'border-primary/20 bg-primary/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                        <span className="text-foreground/30 font-mono w-4 text-right">{idx + 1}</span>
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-foreground/80 truncate">{member.discord}</span>
                                            {member.isLeader && (
                                                <Crown size={12} className="text-amber-400 shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-amber-400 font-mono font-bold">{member.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Leave Button */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            <button onClick={handleLeave} disabled={submitting}
                                className="flex items-center gap-2 text-xs font-mono text-red-400/60 hover:text-red-400 transition-colors px-3 py-2 hover:bg-red-500/10 rounded-lg">
                                <LogOut size={14} />
                                {clan.isLeader ? 'Bubarkan Squad' : 'Keluar dari Squad'}
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    /* =================== NO CLAN VIEW =================== */
                    <div className="space-y-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                            <button onClick={() => { setTab('join'); setMessage(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-mono transition-all ${tab === 'join' ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/40 hover:text-foreground/60'}`}>
                                <KeyRound size={14} />
                                Gabung Squad
                            </button>
                            <button onClick={() => { setTab('create'); setMessage(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-mono transition-all ${tab === 'create' ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/40 hover:text-foreground/60'}`}>
                                <Plus size={14} />
                                Buat Squad Baru
                            </button>
                        </div>

                        {tab === 'join' ? (
                            /* Join Form */
                            <motion.div key="join" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 border border-white/10 rounded-lg p-5">
                                <h3 className="font-bold font-mono text-sm mb-1">Gabung Squad</h3>
                                <p className="text-[11px] text-foreground/40 font-mono mb-4">
                                    Minta kode invite dari ketua squad temanmu dan masukkan di bawah ini.
                                </p>
                                <form onSubmit={handleJoin} className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-mono text-foreground/40 mb-1 uppercase">Kode Invite</label>
                                        <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                            placeholder="XYZ-A1B2"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 font-mono text-sm text-foreground placeholder-foreground/20 focus:border-primary/40 focus:outline-none tracking-widest text-center"
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting || !inviteCode}
                                        className="w-full bg-primary/20 border border-primary/30 text-primary font-mono text-sm font-bold py-2.5 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-40">
                                        {submitting ? 'Joining...' : 'Gabung Squad'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            /* Create Form — LOCKED / Coming Soon */
                            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 border border-white/10 rounded-lg p-5">
                                <div className="flex flex-col items-center text-center py-6 space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <ShoppingCart size={24} className="text-amber-400" />
                                    </div>
                                    <h3 className="font-bold font-mono text-sm text-foreground">Butuh Tiket Squad</h3>
                                    <p className="text-[11px] text-foreground/40 font-mono max-w-xs">
                                        Untuk membuat squad baru, kamu harus membeli <span className="text-amber-400 font-bold">Tiket Squad</span> di Shop terlebih dahulu.
                                    </p>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mt-2">
                                        <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1.5"><ShoppingCart size={12} /> Shop — Coming Soon</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </SessionLayout>
    );
}
