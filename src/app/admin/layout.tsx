"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Menu, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/');
            } else if (user.role !== 'ADMIN') {
                // Redirect non-admin users to dashboard
                router.push('/dashboard');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="text-[#E95420] animate-pulse font-mono tracking-widest uppercase text-xs">Accessing Admin Console...</div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6">
                <div className="max-w-md w-full text-center space-y-4 bg-red-500/5 border border-red-500/20 p-8 rounded-xl">
                    <ShieldAlert size={48} className="text-red-500 mx-auto" />
                    <h1 className="text-xl font-bold text-white font-mono uppercase">Access Denied</h1>
                    <p className="text-foreground/60 font-mono text-xs leading-relaxed">
                        This area requires ROOT privileges. Your current session does not have the necessary permissions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-foreground overflow-hidden font-mono">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-white/5 bg-[#0d0d0f]/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-foreground/60 md:hidden hover:text-[#E95420] transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#E95420] animate-pulse" />
                            <h1 className="text-sm font-black text-white tracking-widest uppercase">System Control Page</h1>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
