"use client";

import Link from 'next/link';
import { CheckCircle2, Circle, LogOut, User, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const levels = [
    { id: 1, title: 'Welcome to the Shell' },
    { id: 2, title: 'The Hidden Message' },
    { id: 3, title: 'Needle in a Haystack' },
    { id: 4, title: 'Pipelining' },
    { id: 5, title: 'Strict Rules' },
];

export function Sidebar({ currentLevel }: { currentLevel: number }) {
    const { user, isLevelCompleted, isLevelUnlocked, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="w-64 bg-[#111113] border-r border-terminal/10 p-4 hidden md:flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 py-4 border-b border-terminal/10 mb-2">
                <div className="w-10 h-10 rounded-full bg-terminal/10 flex items-center justify-center text-terminal border border-terminal/20">
                    <User size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground truncate max-w-[140px]">{user?.fullName || 'Cadet'}</span>
                    <span className="text-[10px] text-terminal font-mono uppercase tracking-wider">{user?.progress.length || 0} Levels Solved</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                {levels.map((lvl) => {
                    const completed = isLevelCompleted(lvl.id);
                    const unlocked = isLevelUnlocked(lvl.id);

                    const isCurrent = lvl.id === currentLevel;

                    const itemContent = (
                        <>
                            {completed ? (
                                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            ) : unlocked ? (
                                <Circle size={16} className="shrink-0" />
                            ) : (
                                <Lock size={16} className="text-foreground/20 shrink-0" />
                            )}
                            <span className="text-sm font-mono truncate">
                                Lvl {lvl.id}: {lvl.title}
                            </span>
                        </>
                    );

                    if (!unlocked && !isCurrent) {
                        return (
                            <div
                                key={lvl.id}
                                className="flex items-center gap-3 p-2 rounded-md text-foreground/20 cursor-not-allowed grayscale"
                                title="Selesaikan level sebelumnya untuk membuka"
                            >
                                {itemContent}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={lvl.id}
                            href={`/play/${lvl.id}`}
                            className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isCurrent
                                ? 'bg-terminal/10 text-terminal border border-terminal/20 shadow-[0_0_15px_rgba(0,255,159,0.1)]'
                                : completed
                                    ? 'text-green-400/70 hover:bg-white/5'
                                    : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            {itemContent}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-terminal/10 space-y-1">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 w-full p-2 text-foreground/40 hover:text-secondary hover:bg-secondary/5 rounded-md transition-all group"
                >
                    <User size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-mono">Profile</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-2 text-foreground/40 hover:text-accent hover:bg-accent/5 rounded-md transition-all group"
                >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm font-mono">Logout Session</span>
                </button>
            </div>
        </div>
    );
}
