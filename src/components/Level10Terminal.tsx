"use client";

import React from 'react';
import { UnifiedTerminal } from './Terminal/UnifiedTerminal';
import { useVFSShell } from '@/hooks/useVFSShell';
import { useTerminalShell, TerminalLine } from '@/hooks/useTerminalShell';
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
                        'collect_flag.sh': {
                            type: 'file',
                            content: '#!/bin/bash\nif [ "$1" == "YADIKA_SIAP" ]; then\n  echo $FLAG\nelse\n  echo "Wrong Password"\nfi',
                            permissions: 'rwxr-xr-x'
                        },
                        'README.txt': {
                            type: 'file',
                            content: 'Jalankan script collect_flag.sh dengan password yang benar untuk mengambil flag.\n\nUsage: ./collect_flag.sh <PASSWORD>'
                        }
                    }
                }
            }
        }
    }
};

interface Level10TerminalProps {
    onFlagFound: (flag: string) => void;
}

export const Level10Terminal: React.FC<Level10TerminalProps> = ({ onFlagFound }) => {
    const customCommands = (command: string, args: string[], currentPath: string, addLines: (lines: TerminalLine[]) => void) => {
        if (command === './collect_flag.sh' || (command === 'sh' && args[0] === 'collect_flag.sh') || (command === 'bash' && args[0] === 'collect_flag.sh')) {
            const password = command === './collect_flag.sh' ? args[0] : args[1];

            if (password === 'YADIKA_SIAP') {
                addLines([
                    { text: 'Authenticating...', type: 'output' },
                    { text: 'Verification success!', type: 'output' },
                    { text: 'yadika{bash_script_hero}', type: 'output' } // Flag detector will pick this up
                ]);
            } else {
                addLines([
                    { text: 'Error: WRONG PASSWORD', type: 'error' },
                    { text: 'Usage: ./collect_flag.sh <PASSWORD>', type: 'output' }
                ]);
            }
            return true;
        }
        return false;
    };

    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 10: The Bash Runner',
        onFlagFound,
        user: 'user',
        customCommands
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 10"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="yellow-400"
            themeBorder="border-yellow-500/30"
            themeShadow="shadow-[0_0_30px_rgba(250,204,21,0.15)]"
        />
    );
};
