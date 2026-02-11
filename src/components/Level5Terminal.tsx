"use client";

import React from 'react';
import { UnifiedTerminal } from './Terminal/UnifiedTerminal';
import { useVFSShell } from '@/hooks/useVFSShell';
import { FileNode } from '@/lib/vfsUtils';

const initialFilesystem: FileNode = {
    type: 'directory',
    permissions: 'rwxr-xr-x',
    owner: 'root',
    children: {
        'home': {
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            children: {
                'guest': {
                    type: 'directory',
                    permissions: 'rwxr-xr-x',
                    owner: 'guest',
                    children: {
                        'README.txt': {
                            type: 'file',
                            permissions: 'rw-r--r--',
                            owner: 'guest',
                            content: 'Level 5: Strict Rules\n\nDi Linux, setiap file punya permission (izin akses).\nAda 3 jenis: Read (r), Write (w), Execute (x)\nUntuk 3 kelompok: Owner, Group, Others\n\nContoh: chmod 755 file.sh\n7 = rwx (read+write+execute)\n5 = r-x (read+execute)\n5 = r-x (read+execute)\n\nTugasmu: Ada file yang terkunci!\nGunakan chmod untuk membukanya.'
                        },
                        'secret': {
                            type: 'directory',
                            permissions: 'rwxr-xr-x',
                            owner: 'guest',
                            children: {
                                'locked_flag.txt': {
                                    type: 'file',
                                    permissions: '---------', // No permissions
                                    owner: 'guest',
                                    content: 'Congratulations! Kamu berhasil!\n\nFLAG: yadika{ch0wn_th3_w0rld}'
                                },
                                'hint.txt': {
                                    type: 'file',
                                    permissions: 'rw-r--r--',
                                    owner: 'guest',
                                    content: 'File locked_flag.txt tidak bisa dibaca!\nCek permission-nya dengan: ls -l\n\nUntuk memberi izin baca: chmod +r namafile\nAtau dengan angka: chmod 644 namafile\n\n644 = rw-r--r-- (owner bisa read+write, others read)'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

interface Level5TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level5Terminal: React.FC<Level5TerminalProps> = ({ onFlagFound }) => {
    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 5',
        onFlagFound
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 5"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="orange-400"
            themeBorder="border-orange-500/30"
            themeShadow="shadow-[0_0_30px_rgba(249,115,22,0.15)]"
        />
    );
};
