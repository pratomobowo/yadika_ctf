import Link from 'next/link';
import { CheckCircle2, Circle, LogOut, User, Lock, BookOpen, ChevronRight, ChevronDown, Shield, Terminal, FolderOpen, LucideIcon, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active: boolean;
    locked: boolean;
    completed: boolean;
}

interface SidebarProps {
    currentLevel: number;
    isOpen?: boolean;
    onClose?: () => void;
}

const SidebarItem = ({ href, icon: Icon, label, active, locked, completed }: SidebarItemProps) => {
    return (
        <Link
            href={locked ? '#' : href}
            className={`flex items-center gap-2 p-2 rounded-md transition-colors ${active
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,183,255,0.1)]'
                : completed
                    ? 'text-green-400/70 hover:bg-white/5'
                    : locked
                        ? 'text-foreground/20 cursor-not-allowed grayscale'
                        : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                }`}
        >
            {completed ? (
                <CheckCircle2 size={12} className="text-green-500 shrink-0" />
            ) : locked ? (
                <Lock size={12} className="text-foreground/20 shrink-0" />
            ) : (
                <Icon size={12} className="shrink-0" />
            )}
            <span className="text-[11px] font-mono truncate">
                {label}
            </span>
        </Link>
    );
};

const ctfLevels = [
    // Stage 1: Linux Fundamentals (1-10)
    { id: 1, title: 'Welcome to the Shell' },
    { id: 2, title: 'The Hidden Message' },
    { id: 3, title: 'Needle in a Haystack' },
    { id: 4, title: 'Pipelining' },
    { id: 5, title: 'Strict Rules' },
    { id: 6, title: 'Process Hunting' },
    { id: 7, title: 'Output Master' },
    { id: 8, title: 'Environment Secrets' },
    { id: 9, title: 'Web Recon' },
    { id: 10, title: 'Bash Script Runner' },
    // Stage 2: Intermediate Linux (11-20)
    { id: 11, title: 'Find the Needle' },
    { id: 12, title: 'Cron Job Spy' },
    { id: 13, title: 'Symlink Trail' },
    { id: 14, title: 'Archive Digger' },
    { id: 15, title: 'Disk Detective' },
    { id: 16, title: 'Log Analyzer' },
    { id: 17, title: 'User Hunter' },
    { id: 18, title: 'Network Peek' },
    { id: 19, title: 'Sed Surgeon' },
    { id: 20, title: 'Awk Wizard' },
    // Stage 3: Networking & Protocols (21-30)
    { id: 21, title: 'Ping Sweep' },
    { id: 22, title: 'Port Scanner' },
    { id: 23, title: 'DNS Lookup' },
    { id: 24, title: 'HTTP Inspector' },
    { id: 25, title: 'Wget Warrior' },
    { id: 26, title: 'Firewall Rules' },
    { id: 27, title: 'SSH Key Master' },
    { id: 28, title: 'SCP Transfer' },
    { id: 29, title: 'Network Sniffer' },
    { id: 30, title: 'Reverse Shell 101' },
    // Stage 4: DevOps Tools (31-40)
    { id: 31, title: 'Git Basics' },
    { id: 32, title: 'Git Secrets' },
    { id: 33, title: 'Docker Hello' },
    { id: 34, title: 'Docker Inspect' },
    { id: 35, title: 'Dockerfile Builder' },
    { id: 36, title: 'Docker Compose' },
    { id: 37, title: 'Systemd Service' },
    { id: 38, title: 'Nginx Config' },
    { id: 39, title: 'Environment Deploy' },
    { id: 40, title: 'CI/CD Pipeline' },
    // Stage 5: Security & Advanced (41-50)
    { id: 41, title: 'Password Crack' },
    { id: 42, title: 'SSL Inspector' },
    { id: 43, title: 'Sudo Escalation' },
    { id: 44, title: 'SUID Exploit' },
    { id: 45, title: 'Backup Recovery' },
    { id: 46, title: 'Steganography' },
    { id: 47, title: 'Log Forensics' },
    { id: 48, title: 'Docker Escape' },
    { id: 49, title: 'Incident Response' },
    { id: 50, title: 'Final Boss' },
];



export function Sidebar({ currentLevel, isOpen, onClose }: SidebarProps) {
    const { user, isLevelCompleted, isLevelUnlocked, logout } = useAuth();
    const [isSessionsOpen, setIsSessionsOpen] = useState(true);
    const [isCTFOpen, setIsCTFOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    if (!mounted) {
        return <div className="w-72 bg-[#111113] border-r border-terminal/10 p-4 hidden md:flex flex-col gap-4 overflow-y-auto" />;
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-[101] w-72 bg-[#111113] border-r border-terminal/10 p-4 
                flex flex-col gap-4 overflow-y-auto transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex
            `}>
                <div className="flex items-center justify-between md:hidden mb-2">
                    <span className="text-xs font-mono text-terminal/40">MENU</span>
                    <button onClick={onClose} className="p-2 text-foreground/40 hover:text-white">
                        <LogOut size={18} className="rotate-180" />
                    </button>
                </div>
                <div className="flex items-center gap-3 px-2 py-4 border-b border-terminal/10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-terminal/10 flex items-center justify-center text-terminal border border-terminal/20">
                        <User size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate max-w-[140px]">@{user?.discord || 'Cadet'}</span>
                        <span className="text-[10px] text-terminal font-mono uppercase tracking-wider">{user?.progress.length || 0} Levels Solved</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-4">
                    {/* Dashboard Link */}
                    <div className="flex flex-col gap-2">
                        <Link href="/dashboard"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all group"
                        >
                            <Target size={16} />
                            <span className="text-xs font-bold font-mono tracking-wider uppercase">Dashboard</span>
                        </Link>

                        {user?.role === 'ADMIN' && (
                            <Link href="/admin"
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#E95420]/10 border border-[#E95420]/20 text-[#E95420] hover:bg-[#E95420]/20 transition-all group"
                            >
                                <Shield size={16} />
                                <span className="text-xs font-bold font-mono tracking-wider uppercase">Admin Console</span>
                            </Link>
                        )}
                    </div>

                    {/* Materi Industri Section */}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setIsSessionsOpen(!isSessionsOpen)}
                            className="flex items-center justify-between gap-2 px-2 py-2 text-foreground/40 hover:text-primary transition-colors hover:bg-white/5 rounded-md group"
                        >
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} />
                                <span className="text-xs font-bold font-mono tracking-widest uppercase">Materi Industri</span>
                            </div>
                            {isSessionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        <AnimatePresence>
                            {isSessionsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-col gap-1 pl-4 overflow-hidden"
                                >
                                    {/* Explicitly listing implemented modules */}
                                    <SidebarItem
                                        href="/play/session/1"
                                        icon={Terminal}
                                        label="1. Install Ubuntu"
                                        active={typeof window !== 'undefined' && window.location.pathname === '/play/session/1'}
                                        locked={!isLevelUnlocked(1001)}
                                        completed={isLevelCompleted(1001)}
                                    />
                                    <SidebarItem
                                        href="/play/session/2"
                                        icon={Terminal}
                                        label="2. Basic Commands"
                                        active={typeof window !== 'undefined' && window.location.pathname === '/play/session/2'}
                                        locked={!isLevelUnlocked(1002)}
                                        completed={isLevelCompleted(1002)}
                                    />
                                    <SidebarItem
                                        href="/play/session/3"
                                        icon={FolderOpen}
                                        label="3. File Management"
                                        active={typeof window !== 'undefined' && window.location.pathname === '/play/session/3'}
                                        locked={!isLevelUnlocked(1003)}
                                        completed={isLevelCompleted(1003)}
                                    />

                                    {/* Future modules mapped from data */}
                                    {[
                                        { id: 1004, title: '4. Text Editing & Manipulation', path: '/play/session/4' },
                                        { id: 1005, title: '5. User & Permission Mgmt', path: '/play/session/5' },
                                    ].map((item) => {
                                        const completed = isLevelCompleted(item.id);
                                        const unlocked = isLevelUnlocked(item.id); // Simple unlock check
                                        const isCurrent = typeof window !== 'undefined' && window.location.pathname === item.path;

                                        return (
                                            <SidebarItem
                                                key={item.id}
                                                href={unlocked ? item.path : '#'}
                                                icon={Terminal} // Default icon
                                                label={item.title}
                                                active={isCurrent}
                                                locked={!unlocked}
                                                completed={completed}
                                            />
                                        );
                                    })}
                                    {/* Placeholder for future materials */}
                                    <div className="text-[11px] font-mono text-foreground/10 p-2 flex items-center gap-2 ml-2">
                                        <Circle size={12} className="opacity-20" />
                                        <span>More coming soon...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Special CTF Section */}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setIsCTFOpen(!isCTFOpen)}
                            className="flex items-center justify-between gap-2 px-2 py-2 text-foreground/40 hover:text-secondary transition-colors hover:bg-white/5 rounded-md group"
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                <span className="text-xs font-bold font-mono tracking-widest uppercase">Special CTF</span>
                            </div>
                            {isCTFOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        <AnimatePresence>
                            {isCTFOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-col gap-1 pl-4 overflow-hidden"
                                >
                                    {ctfLevels.map((lvl) => {
                                        const completed = isLevelCompleted(lvl.id);
                                        const unlocked = isLevelUnlocked(lvl.id);
                                        const isCurrent = lvl.id === currentLevel;

                                        const itemContent = (
                                            <>
                                                {completed ? (
                                                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                                ) : unlocked ? (
                                                    <Circle size={14} className="shrink-0" />
                                                ) : (
                                                    <Lock size={14} className="text-foreground/20 shrink-0" />
                                                )}
                                                <span className="text-[12px] font-mono truncate">
                                                    Lvl {lvl.id}: {lvl.title}
                                                </span>
                                            </>
                                        );

                                        if (!unlocked && !isCurrent) {
                                            return (
                                                <div
                                                    key={lvl.id}
                                                    className="flex items-center gap-2 p-2 rounded-md text-foreground/20 cursor-not-allowed grayscale"
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
                                                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isCurrent
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
        </>
    );
}
