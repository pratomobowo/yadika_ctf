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
                            content: 'Level 2: The Hidden Message\n\nAda pesan rahasia yang tersembunyi di sistem ini.\nPesan tersebut di-encode menggunakan Base64.\n\nGunakan perintah "decode <teks>" untuk mendecode pesan.\nCoba cari file yang mencurigakan...'
                        },
                        'messages': {
                            type: 'directory',
                            children: {
                                'from_admin.txt': {
                                    type: 'file',
                                    content: 'Pesan dari Admin:\n\nHei, aku menyembunyikan sesuatu penting.\nCek folder backup, ada file yang menarik di sana.\n\n- Admin'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Catatan:\n- Base64 adalah encoding, bukan enkripsi\n- Mudah di-decode jika tahu caranya\n- Sering digunakan untuk menyembunyikan data'
                                }
                            }
                        },
                        'backup': {
                            type: 'directory',
                            children: {
                                'secret_message.b64': {
                                    type: 'file',
                                    content: 'RmxhZyBMZXZlbCAyIGFkYWxhaDogCgp5YWRpa2F7YjRzZTY0X2QzYzBkM3J9CgpTZWxhbWF0ISBLYW11IGJlcmhhc2lsIG1lbmRlY29kZSBwZXNhbiBpbmku'
                                },
                                'info.txt': {
                                    type: 'file',
                                    content: 'File .b64 berisi data yang di-encode dengan Base64.\nGunakan: decode <isi_file> untuk membacanya.'
                                }
                            }
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
                        'auth.log': {
                            type: 'file',
                            content: '[LOG] User guest login\n[LOG] Accessed /home/guest\n[LOG] Hint: coba baca file dengan ekstensi .b64'
                        }
                    }
                }
            }
        }
    }
};

interface Level2TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level2Terminal: React.FC<Level2TerminalProps> = ({ onFlagFound }) => {
    const customCommands = (command: string, args: string[], currentPath: string, addLines: any) => {
        if (command === 'decode') {
            if (args.length === 0) {
                addLines([{ text: 'Usage: decode <base64_string>', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            try {
                const decoded = atob(args.join(' ').trim());
                const output = decoded.split('\n').map(text => ({ text, type: 'output' as const }));
                addLines([...output, { text: '', type: 'output' }]);

                if (decoded.includes('yadika{')) {
                    const match = decoded.match(/yadika\{[^}]+\}/);
                    if (match && onFlagFound) onFlagFound(match[0]);
                }
            } catch {
                addLines([{ text: '[Error] Invalid Base64 string', type: 'error' }, { text: '', type: 'output' }]);
            }
            return true;
        }
        if (command === 'encode') {
            if (args.length === 0) {
                addLines([{ text: 'Usage: encode <text>', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            try {
                addLines([{ text: btoa(args.join(' ')), type: 'output' }, { text: '', type: 'output' }]);
            } catch {
                addLines([{ text: '[Error] Cannot encode string', type: 'error' }, { text: '', type: 'output' }]);
            }
            return true;
        }
        if (command === 'help') {
            addLines([
                { text: 'Perintah yang tersedia:', type: 'output' },
                { text: '  ls [-a]       - Lihat isi direktori', type: 'output' },
                { text: '  cd <path>     - Pindah direktori', type: 'output' },
                { text: '  cat <file>    - Baca isi file', type: 'output' },
                { text: '  pwd           - Tampilkan direktori saat ini', type: 'output' },
                { text: '  decode <teks> - Decode Base64', type: 'output' },
                { text: '  encode <teks> - Encode ke Base64', type: 'output' },
                { text: '  clear         - Bersihkan layar', type: 'output' },
                { text: '', type: 'output' }
            ]);
            return true;
        }
        return false;
    };

    const shell = useVFSShell({
        initialFilesystem,
        levelTitle: 'Level 2',
        onFlagFound,
        customCommands
    });

    return (
        <UnifiedTerminal
            title="Virtual Shell — Level 2"
            lines={shell.lines}
            input={shell.input}
            setInput={shell.setInput}
            onSubmit={shell.handleSubmit}
            onKeyDown={(e) => shell.handleHistory(e.key)}
            scrollRef={shell.scrollRef}
            inputRef={shell.inputRef}
            prompt={shell.prompt}
            themeColor="secondary"
            themeBorder="border-secondary/30"
            themeShadow="shadow-[0_0_30px_rgba(0,184,255,0.15)]"
        />
    );
};
