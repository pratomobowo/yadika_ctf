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
                        'readme.txt': {
                            type: 'file',
                            content: 'Coba gunakan redirection untuk mendapatkan flag.\n\nContoh: command > output.txt'
                        }
                    }
                }
            }
        }
    }
};

interface Level7TerminalProps {
    onFlagFound: (flag: string) => void;
}

export const Level7Terminal: React.FC<Level7TerminalProps> = ({ onFlagFound }) => {
    const customCommands = (command: string, args: string[], currentPath: string, addLines: (lines: any[]) => void) => {
        if (command === 'get_flag') {
            addLines([{ text: 'yadika{redir_master_ok}', type: 'output' }]);
            return true;
        }
        return false;
    };

    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 7: Output Master',
        onFlagFound,
        user: 'guest',
        customCommands
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 7"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="green-400"
            themeBorder="border-green-500/30"
            themeShadow="shadow-[0_0_30px_rgba(34,197,94,0.15)]"
        />
    );
};
