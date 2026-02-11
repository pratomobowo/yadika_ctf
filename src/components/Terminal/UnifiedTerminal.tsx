"use client";

import React, { FormEvent } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { TerminalLine } from '@/hooks/useTerminalShell';

interface UnifiedTerminalProps {
    title: string;
    lines: TerminalLine[];
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    prompt: string;
    themeColor?: string; // e.g. 'secondary', 'accent', 'primary', 'orange-400', 'purple-400'
    themeBorder?: string;
    themeShadow?: string;
}

export const UnifiedTerminal: React.FC<UnifiedTerminalProps> = ({
    title,
    lines,
    input,
    setInput,
    onSubmit,
    onKeyDown,
    scrollRef,
    inputRef,
    prompt,
    themeColor = 'secondary',
    themeBorder = 'border-secondary/30',
    themeShadow = 'shadow-[0_0_30px_rgba(0,184,255,0.15)]',
}) => {
    // Dynamic styles based on themeColor
    const getColorClass = (type: TerminalLine['type']) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'success': return 'text-green-400';
            case 'input': return 'text-primary';
            case 'system': return 'text-foreground/40 italic';
            default: {
                if (themeColor.startsWith('text-')) return themeColor;
                return `text-${themeColor}`;
            }
        }
    };

    const getCaretClass = () => {
        if (themeColor.startsWith('text-')) return `caret-${themeColor.replace('text-', '')}`;
        return `caret-${themeColor}`;
    };

    return (
        <div
            className={`w-full bg-[#0d0d0f] border ${themeBorder} rounded-lg overflow-hidden ${themeShadow} cursor-text`}
            onClick={() => inputRef.current?.focus()}
        >
            <div className={`bg-[#1a1a1c] px-3 md:px-4 py-1.5 md:py-2 border-b ${themeBorder.replace('/30', '/20')} flex items-center justify-between`}>
                <div className={`flex items-center gap-2 ${themeColor.startsWith('text-') ? themeColor : `text-${themeColor}`}/70`}>
                    <TerminalIcon size={12} className="md:w-3.5 md:h-3.5" />
                    <span className="text-[10px] md:text-xs font-mono">{title}</span>
                </div>
                <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="p-3 md:p-4 h-[320px] md:h-[350px] overflow-y-auto font-mono text-[10px] md:text-sm terminal-scrollbar bg-[#0a0a0c]"
            >
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className={`${getColorClass(line.type)} whitespace-pre-wrap mb-0.5 md:mb-1`}
                        dangerouslySetInnerHTML={line.text.includes('\x1b') ? {
                            __html: line.text
                                .replace(/\x1b\[34m/g, '<span class="text-blue-400">')
                                .replace(/\x1b\[0m/g, '</span>')
                        } : undefined}
                    >
                        {!line.text.includes('\x1b') ? line.text : undefined}
                    </motion.div>
                ))}

                <form onSubmit={onSubmit} className="flex items-center gap-0 mt-1">
                    <span className="text-primary whitespace-nowrap text-[10px] md:text-sm mr-1">{prompt}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        autoFocus
                        autoComplete="off"
                        spellCheck={false}
                        className={`flex-1 bg-transparent border-none outline-none ${getColorClass('output')} ${getCaretClass()} focus:ring-0 p-0 text-[10px] md:text-sm`}
                    />
                </form>
            </div>
        </div>
    );
};
