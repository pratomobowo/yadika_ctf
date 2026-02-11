"use client";

import React from 'react';
import { UnifiedTerminal } from './Terminal/UnifiedTerminal';
import { useVFSShell } from '@/hooks/useVFSShell';
import { FileNode } from '@/lib/vfsUtils';

const initialFilesystem: FileNode = {
    type: 'directory',
    children: {
        'home': {
            type: 'directory',
            children: {
                'guest': {
                    type: 'directory',
                    children: {
                        'configs': { type: 'directory', children: {} },
                        'logs': { type: 'directory', children: {} }
                    }
                }
            }
        }
    }
};

interface Level8TerminalProps {
    onFlagFound: (flag: string) => void;
}

export const Level8Terminal: React.FC<Level8TerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 8: Hidden Environments',
        onFlagFound,
        user: 'user',
        initialEnv: {
            'SECRET_FLAG': 'yadika{env_var_found}'
        }
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 8"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="purple-400"
            themeBorder="border-purple-500/30"
            themeShadow="shadow-[0_0_30px_rgba(168,85,247,0.15)]"
        />
    );
};
