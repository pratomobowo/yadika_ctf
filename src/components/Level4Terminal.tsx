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
                        'README.txt': {
                            type: 'file',
                            content: 'Level 4: Pipelining\n\nDi Linux, kamu bisa menggabungkan perintah dengan pipe (|).\nOutput dari satu perintah menjadi input perintah berikutnya.\n\nContoh: cat file.txt | grep "kata"\n\nTugasmu: Temukan FLAG yang tersembunyi di antara ribuan baris data.\nGunakan kombinasi perintah untuk menyaringnya!'
                        },
                        'data': {
                            type: 'directory',
                            children: {
                                'users.txt': {
                                    type: 'file',
                                    content: Array.from({ length: 100 }, (_, i) => {
                                        if (i === 42) return 'user_admin:FLAG=yadika{p1p3_dr34m3r}:active';
                                        const status = Math.random() > 0.5 ? 'active' : 'inactive';
                                        return `user_${String(i).padStart(3, '0')}:password${i}:${status}`;
                                    }).join('\n')
                                },
                                'access.log': {
                                    type: 'file',
                                    content: Array.from({ length: 200 }, (_, i) => {
                                        const ips = ['192.168.1.1', '10.0.0.5', '172.16.0.1', '8.8.8.8'];
                                        const actions = ['LOGIN', 'LOGOUT', 'ACCESS', 'DENIED', 'ERROR'];
                                        return `[${String(i).padStart(4, '0')}] ${ips[i % 4]} ${actions[i % 5]}`;
                                    }).join('\n')
                                },
                                'numbers.txt': {
                                    type: 'file',
                                    content: Array.from({ length: 50 }, (_, i) => `Line ${i + 1}: ${Math.floor(Math.random() * 1000)}`).join('\n')
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

interface Level4TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level4Terminal: React.FC<Level4TerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 4',
        onFlagFound
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 4"
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
