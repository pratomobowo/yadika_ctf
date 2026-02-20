"use client";

import React from 'react';
import { UnifiedTerminal } from './Terminal/UnifiedTerminal';
import { useVFSShell } from '@/hooks/useVFSShell';
import { CTFLevel } from '@/lib/ctfLevels';

interface DynamicCTFTerminalProps {
    level: CTFLevel;
    onFlagFound: (flag: string) => void;
    username?: string;
}

export const DynamicCTFTerminal: React.FC<DynamicCTFTerminalProps> = ({ level, onFlagFound, username }) => {
    const {
        lines, input, setInput, handleSubmit, handleHistory,
        scrollRef, inputRef, prompt
    } = useVFSShell({
        initialFilesystem: level.filesystem,
        initialPath: level.initialPath || `/home/${username || 'guest'}`,
        onFlagFound,
        user: level.user || username || 'guest',
        hostname: level.hostname || 'ctf',
        levelTitle: `Level ${level.id}: ${level.title}`,
        levelId: level.id,
    });

    return (
        <UnifiedTerminal
            title={`Level ${level.id}: ${level.title}`}
            lines={lines}
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            onKeyDown={(e) => handleHistory(e.key)}
            scrollRef={scrollRef}
            inputRef={inputRef}
            prompt={prompt}
            themeColor={level.themeColor}
            themeBorder={level.themeBorder}
            themeShadow={level.themeShadow}
        />
    );
};
