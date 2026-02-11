import Link from 'next/link';
import { User, Shield, LayoutDashboard, LogOut, Users, Settings, Database, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin', icon: Users, label: 'MANAGE USERS' },
        { href: '/admin/challenges', icon: Database, label: 'CHALLENGES (Coming Soon)', disabled: true },
        { href: '/admin/settings', icon: Settings, label: 'PLATFORM SETTINGS', disabled: true },
    ];

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
                fixed inset-y-0 left-0 z-[101] w-72 bg-[#0d0d0f] border-r border-[#E95420]/20 p-4 
                flex flex-col gap-6 overflow-y-auto transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex
            `}>
                <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="w-8 h-8 rounded bg-[#E95420]/10 flex items-center justify-center text-[#E95420]">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black font-mono tracking-tighter text-white">ADMIN CONSOLE</h2>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-foreground/40 uppercase">Root Access</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md font-mono text-[11px] text-[#E95420] hover:bg-[#E95420]/5 transition-colors mb-4 border border-[#E95420]/10">
                        <ArrowLeft size={14} />
                        KEMBALI KE PANEL SISWA
                    </Link>

                    <div className="text-[10px] font-mono text-foreground/20 px-2 mb-2 tracking-widest uppercase">Management</div>
                    {menuItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.disabled ? '#' : item.href}
                                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                                className={`flex items-center gap-3 p-2.5 rounded-md transition-all font-mono text-[11px] ${active
                                    ? 'bg-[#E95420]/10 text-[#E95420] border border-[#E95420]/20'
                                    : item.disabled
                                        ? 'text-foreground/20 cursor-not-allowed'
                                        : 'text-foreground/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto space-y-4">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={14} />
                            </div>
                            <span className="text-[10px] font-mono text-white truncate">{user?.fullName || 'Admin'}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-mono transition-colors"
                        >
                            <LogOut size={12} />
                            TERMINATE SESSION
                        </button>
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-mono text-foreground/20 uppercase tracking-tighter">Yadika CTF Admin v1.0</span>
                    </div>
                </div>
            </div>
        </>
    );
}
