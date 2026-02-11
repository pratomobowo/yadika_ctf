"use client";

import React from 'react';
import { UnifiedTerminal } from './Terminal/UnifiedTerminal';
import { useVFSShell } from '@/hooks/useVFSShell';
import { CTFLevel } from '@/lib/ctfLevels';

interface DynamicCTFTerminalProps {
    level: CTFLevel;
    onFlagFound: (flag: string) => void;
}

export const DynamicCTFTerminal: React.FC<DynamicCTFTerminalProps> = ({ level, onFlagFound }) => {
    const {
        lines, input, setInput, handleSubmit, handleHistory,
        scrollRef, inputRef, prompt
    } = useVFSShell({
        initialFilesystem: level.filesystem,
        initialPath: level.initialPath || '/home/guest',
        onFlagFound,
        user: level.user || 'guest',
        hostname: level.hostname || 'ctf',
        levelTitle: `Level ${level.id}: ${level.title}`,
        customCommands: level.customCommands,
        initialEnv: level.initialEnv,
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
