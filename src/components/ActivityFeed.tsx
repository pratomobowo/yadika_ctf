"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, ShieldCheck, Globe, Package, Cpu, Zap, Wand,
    Award, Flag, HelpCircle, UserPlus, Activity
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    'Terminal': Terminal,
    'ShieldCheck': ShieldCheck,
    'Globe': Globe,
    'Package': Package,
    'Cpu': Cpu,
    'Zap': Zap,
    'Wand': Wand,
    'Award': Award,
    'Flag': Flag,
    'HelpCircle': HelpCircle,
    'UserPlus': UserPlus,
};

interface ActivityItem {
    id: string;
    type: string;
    message: string;
    icon: string;
    createdAt: string;
    user: { discord: string };
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}d lalu`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h lalu`;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        try {
            const res = await fetch('/api/activity');
            const data = await res.json();
            setActivities(data.activities || []);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, [fetchActivities]);

    const typeColor: Record<string, string> = {
        'LEVEL_COMPLETE': 'text-green-400',
        'BADGE_EARNED': 'text-amber-400',
        'QUIZ_CORRECT': 'text-blue-400',
        'REGISTER': 'text-purple-400',
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-green-400" />
                <h3 className="font-bold font-mono text-xs">Live Activity</h3>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[9px] text-green-400/60 font-mono">LIVE</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6 text-foreground/30 font-mono text-xs animate-pulse">
                    Memuat aktivitas...
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-6 text-foreground/30 font-mono text-xs">
                    Belum ada aktivitas
                </div>
            ) : (
                <div className="max-h-[250px] overflow-y-auto terminal-scrollbar pr-1 space-y-0.5">
                    <AnimatePresence mode="popLayout">
                        {activities.map((item, idx) => {
                            const IconComp = ICON_MAP[item.icon] || Terminal;
                            const color = typeColor[item.type] || 'text-foreground/60';

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.03] transition-colors group"
                                >
                                    <div className={`shrink-0 mt-0.5 ${color}`}>
                                        <IconComp size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-mono leading-relaxed">
                                            <span className="text-primary font-bold">@{item.user.discord}</span>
                                            {' '}
                                            <span className="text-foreground/60">{item.message}</span>
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[9px] text-foreground/20 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {timeAgo(item.createdAt)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
