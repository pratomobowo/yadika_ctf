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
                        'welcome.txt': {
                            type: 'file',
                            content: 'Selamat datang di Yadika CTF!\nGunakan perintah Linux untuk menjelajahi sistem.\nCoba cari file tersembunyi...'
                        },
                        'catatan.txt': {
                            type: 'file',
                            content: 'Catatan Harian:\n- Belajar Linux\n- Jangan lupa cek folder lain\n- Ada sesuatu yang tersembunyi...'
                        },
                        '.secret': {
                            type: 'directory',
                            children: {
                                'flag.txt': {
                                    type: 'file',
                                    content: 'Selamat! Kamu menemukan flag pertama!\n\nFLAG: yadika{shell_king}'
                                },
                                'readme.md': {
                                    type: 'file',
                                    content: '# Rahasia\nFolder ini tersembunyi.\nHanya yang jeli yang bisa menemukannya!'
                                }
                            }
                        }
                    }
                },
                'admin': {
                    type: 'directory',
                    children: {
                        'config.txt': {
                            type: 'file',
                            content: '[Access Denied]\nAnda tidak memiliki akses ke file ini.'
                        }
                    }
                }
            }
        },
        'var': {
            type: 'directory',
            children: {
                'log': {
                    type: 'directory',
                    children: {
                        'system.log': {
                            type: 'file',
                            content: '[2026-02-09] System started\n[2026-02-09] User guest logged in\n[2026-02-09] Hint: coba ls -a untuk melihat file tersembunyi'
                        }
                    }
                }
            }
        },
        'tmp': {
            type: 'directory',
            children: {
                'notes.txt': {
                    type: 'file',
                    content: 'Temporary notes:\n- Flag ada di suatu tempat\n- Cek folder home dengan teliti'
                }
            }
        }
    }
};

interface VirtualTerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const VirtualTerminal: React.FC<VirtualTerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 1',
        onFlagFound
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 1"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="terminal"
            themeBorder="border-terminal/30"
            themeShadow="shadow-[0_0_30px_rgba(0,255,65,0.15)]"
        />
    );
};
