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
                        'nothing_here.txt': {
                            type: 'file',
                            content: 'Flag tidak ada di sini. Coba cari di tempat lain (seperti daftar proses?).'
                        }
                    }
                }
            }
        }
    }
};

interface Level6TerminalProps {
    onFlagFound: (flag: string) => void;
}

export const Level6Terminal: React.FC<Level6TerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 6: Process Hunting',
        onFlagFound,
        user: 'user'
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 6"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="blue-400"
            themeBorder="border-blue-500/30"
            themeShadow="shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        />
    );
};
