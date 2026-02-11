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
                        'notes.txt': {
                            type: 'file',
                            content: 'Web server ada di /var/www/html\nCoba cari file backup yang tersembunyi.'
                        }
                    }
                }
            }
        },
        'var': {
            type: 'directory',
            children: {
                'www': {
                    type: 'directory',
                    children: {
                        'html': {
                            type: 'directory',
                            children: {
                                'index.html': {
                                    type: 'file',
                                    content: '<html><body>Yadika SMK CTF</body></html>'
                                },
                                '.hidden_backup': {
                                    type: 'directory',
                                    children: {
                                        'flag_backup.txt': {
                                            type: 'file',
                                            content: 'Flag berhasil ditemukan!\n\nFLAG: yadika{web_root_explorer}'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

interface Level9TerminalProps {
    onFlagFound: (flag: string) => void;
}

export const Level9Terminal: React.FC<Level9TerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 9: Web Reconnaissance',
        onFlagFound,
        user: 'user'
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 9"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="red-400"
            themeBorder="border-red-500/30"
            themeShadow="shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        />
    );
};
