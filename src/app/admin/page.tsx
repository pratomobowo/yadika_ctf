"use client";

import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, MoreVertical, Edit2,
    Trash2, RotateCcw, Shield, CheckCircle2,
    Clock, Medal, X, Save, AlertTriangle, Download, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface User {
    id: string;
    fullName: string;
    discord: string;
    role: string;
    points: number;
    createdAt: string;
    completedCount: number;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 20;

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
            const data = await res.json();
            setUsers(data.users || []);
            setTotalPages(data.pagination?.pages || 1);
            setTotalUsers(data.pagination?.total || 0);
            setCurrentPage(data.pagination?.currentPage || 1);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setActionLoading('updating');
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });
            if (res.ok) {
                setEditingUser(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setActionLoading('deleting');
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setConfirmDelete(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetProgress = async (id: string) => {
        if (!confirm('Are you absolute sure? This will delete ALL progress and reset points to 0.')) return;

        setActionLoading('resetting');
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_progress' })
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Reset failed:', error);
        } finally {
            setActionLoading(null);
        }
    };
    const handleExport = async () => {
        setActionLoading('exporting');
        try {
            const res = await fetch('/api/admin/users/export');
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.discord.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Users size={20} />
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">Total Students</span>
                    </div>
                    <div className="text-3xl font-black font-mono">{totalUsers}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 text-green-500 mb-2">
                        <CheckCircle2 size={20} />
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">Avg Progress</span>
                    </div>
                    <div className="text-3xl font-black font-mono">
                        {users.length ? (users.reduce((acc, u) => acc + u.completedCount, 0) / users.length).toFixed(1) : 0}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Medal size={20} />
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">Highest Score</span>
                    </div>
                    <div className="text-3xl font-black font-mono">
                        {users.length ? Math.max(...users.map(u => u.points)) : 0}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH DISCORD OR NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
                <button
                    onClick={() => fetchUsers(currentPage)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-foreground/60"
                >
                    <RotateCcw size={16} />
                </button>
                <button
                    onClick={handleExport}
                    disabled={actionLoading === 'exporting'}
                    className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors text-green-500 flex items-center gap-2 disabled:opacity-50"
                    title="Export to Excel"
                >
                    <Download size={16} />
                    <span className="hidden md:inline text-xs font-mono font-bold uppercase">{actionLoading === 'exporting' ? 'EXPORTING...' : 'EXPORT EXCEL'}</span>
                </button>
                <Link
                    href="/admin/quiz"
                    className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-amber-500 flex items-center gap-2"
                    title="Manage Quizzes"
                >
                    <Brain size={16} />
                    <span className="hidden md:inline text-xs font-mono font-bold uppercase">QUIZ MANAGER</span>
                </Link>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-mono text-foreground/40 text-left uppercase tracking-widest">
                                <th className="px-6 py-4 font-black">Student</th>
                                <th className="px-6 py-4 font-black">Role</th>
                                <th className="px-6 py-4 font-black">Points</th>
                                <th className="px-6 py-4 font-black">Progress</th>
                                <th className="px-6 py-4 font-black">Joined</th>
                                <th className="px-6 py-4 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group text-xs font-mono">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{u.fullName}</span>
                                            <span className="text-primary/60 text-[10px]">@{u.discord}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${u.role === 'ADMIN' ? 'bg-[#E95420]/20 text-[#E95420] border border-[#E95420]/20' : 'bg-white/5 text-foreground/40'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-amber-500 font-bold">{u.points} PTS</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(u.completedCount / 15) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] opacity-40">{u.completedCount}/15</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-foreground/40">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingUser(u)}
                                                className="p-1.5 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleResetProgress(u.id)}
                                                className="p-1.5 hover:text-amber-500 transition-colors"
                                                title="Reset Progress"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(u.id)}
                                                className="p-1.5 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
                        <div className="text-[10px] font-mono text-foreground/40 uppercase">
                            Showing <span className="text-white">{(currentPage - 1) * limit + 1}</span> to <span className="text-white">{Math.min(currentPage * limit, totalUsers)}</span> of <span className="text-white">{totalUsers}</span> students
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchUsers(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono uppercase hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => fetchUsers(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-mono transition-all ${p === currentPage
                                            ? 'bg-primary text-black font-bold'
                                            : 'hover:bg-white/10 text-foreground/40'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => fetchUsers(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono uppercase hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setEditingUser(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black font-mono uppercase tracking-widest text-[#E95420]">Update Entity</h2>
                                <button onClick={() => setEditingUser(null)} className="text-foreground/40 hover:text-white"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-mono text-foreground/40 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.fullName}
                                        onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono text-foreground/40 uppercase mb-1">Discord Tag</label>
                                    <input
                                        type="text"
                                        value={editingUser.discord}
                                        onChange={e => setEditingUser({ ...editingUser, discord: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-mono text-foreground/40 uppercase mb-1">Points</label>
                                        <input
                                            type="number"
                                            value={editingUser.points}
                                            onChange={e => setEditingUser({ ...editingUser, points: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-primary/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-mono text-foreground/40 uppercase mb-1">Role</label>
                                        <select
                                            value={editingUser.role}
                                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-primary/40 appearance-none"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    disabled={actionLoading !== null}
                                    className="w-full py-3 bg-[#E95420]/10 border border-[#E95420]/20 text-[#E95420] font-mono text-[11px] font-black uppercase rounded-lg hover:bg-[#E95420]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={14} />
                                    {actionLoading === 'updating' ? 'SAVING...' : 'COMMIT CHANGES'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setConfirmDelete(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-[#0d0d0f] border border-red-500/20 rounded-xl p-8 shadow-2xl text-center"
                        >
                            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-sm font-black font-mono uppercase tracking-widest text-white mb-2">Danger Zone</h2>
                            <p className="text-[10px] font-mono text-foreground/40 leading-relaxed mb-6">
                                You are about to permanently delete this user account. All data, progress, and historical points will be wiped from the encrypted sectors.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(confirmDelete)}
                                    className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase"
                                >
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
