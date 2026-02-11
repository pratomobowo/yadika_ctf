"use client";

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SessionLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    currentLevel: number;
    objectives?: string[];
    showObjectives?: boolean;
}

export function SessionLayout({
    children,
    title,
    subtitle = "Yadika Industry Class",
    currentLevel,
    objectives = [],
    showObjectives = true
}: SessionLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-mono">
            <Sidebar
                currentLevel={currentLevel}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-10 relative">
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-foreground/60 md:hidden hover:text-primary transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <h1 className="text-sm md:text-lg font-bold text-[#E95420] tracking-tight flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#E95420] animate-pulse" />
                            {title}
                        </h1>
                    </div>
                    <div className="text-[10px] md:text-xs text-white/40 font-mono uppercase tracking-widest hidden sm:block">
                        {subtitle}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-3 md:p-6 relative flex flex-col">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E95420]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

                    <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-6 relative z-10">
                        {/* Interactive Area (Terminal/Simulator) */}
                        <div className="flex-1 min-h-0 bg-black/20 rounded-lg shadow-2xl border border-white/5 overflow-hidden flex flex-col">
                            {children}
                        </div>

                        {/* Info Footer (Objectives) */}
                        {showObjectives && objectives.length > 0 && (
                            <div className="shrink-0 bg-[#0a0a0a] border border-white/10 rounded-lg p-3 md:p-4 flex items-start gap-3 md:gap-4 text-[10px] md:text-xs text-white/60 shadow-lg">
                                <div className="bg-[#E95420]/10 p-1.5 md:p-2 rounded text-[#E95420] shrink-0">
                                    <Info size={14} className="md:w-[16px] md:h-[16px]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-[11px] md:text-xs uppercase tracking-wider">Tujuan Pembelajaran</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-1 list-disc list-inside opacity-70">
                                        {objectives.map((obj, idx) => (
                                            <li key={idx} className="leading-tight">{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
