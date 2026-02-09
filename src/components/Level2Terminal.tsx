"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Virtual Filesystem for Level 2: Encoding Challenge
interface FileNode {
    type: 'file' | 'directory';
    content?: string;
    children?: { [key: string]: FileNode };
}

const createFilesystem = (): FileNode => ({
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
});

// Base64 decode function
const decodeBase64 = (str: string): string => {
    try {
        return atob(str.trim());
    } catch {
        return '[Error] Invalid Base64 string';
    }
};

// Base64 encode function
const encodeBase64 = (str: string): string => {
    try {
        return btoa(str);
    } catch {
        return '[Error] Cannot encode string';
    }
};

interface Level2TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level2Terminal: React.FC<Level2TerminalProps> = ({ onFlagFound }) => {
    const [lines, setLines] = useState<string[]>([
        'Yadika Virtual Shell v1.0 — Level 2',
        'Ketik "help" untuk melihat daftar perintah.',
        ''
    ]);
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState('/home/guest');
    const [filesystem] = useState<FileNode>(createFilesystem);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const resolvePath = (path: string): string => {
        if (path.startsWith('/')) {
            return path;
        }

        const parts = currentPath.split('/').filter(Boolean);
        const newParts = path.split('/');

        for (const part of newParts) {
            if (part === '..') {
                parts.pop();
            } else if (part !== '.' && part !== '') {
                parts.push(part);
            }
        }

        return '/' + parts.join('/');
    };

    const getNode = (path: string): FileNode | null => {
        const parts = path.split('/').filter(Boolean);
        let node: FileNode = filesystem;

        for (const part of parts) {
            if (node.type !== 'directory' || !node.children || !node.children[part]) {
                return null;
            }
            node = node.children[part];
        }

        return node;
    };

    const executeCommand = (cmd: string): string[] => {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                return [
                    'Perintah yang tersedia:',
                    '  ls [-a]       - Lihat isi direktori',
                    '  cd <path>     - Pindah direktori',
                    '  cat <file>    - Baca isi file',
                    '  pwd           - Tampilkan direktori saat ini',
                    '  clear         - Bersihkan layar',
                    '  decode <teks> - Decode Base64',
                    '  encode <teks> - Encode ke Base64',
                    '  whoami        - Tampilkan user',
                    ''
                ];

            case 'pwd':
                return [currentPath, ''];

            case 'whoami':
                return ['guest', ''];

            case 'clear':
                setLines([]);
                return [];

            case 'decode': {
                if (args.length === 0) {
                    return ['Usage: decode <base64_string>', ''];
                }
                const encoded = args.join(' ');
                const decoded = decodeBase64(encoded);

                // Check if flag is found
                if (decoded.includes('yadika{')) {
                    const match = decoded.match(/yadika\{[^}]+\}/);
                    if (match && onFlagFound) {
                        setTimeout(() => onFlagFound(match[0]), 500);
                    }
                }

                return [...decoded.split('\n'), ''];
            }

            case 'encode': {
                if (args.length === 0) {
                    return ['Usage: encode <text>', ''];
                }
                const text = args.join(' ');
                return [encodeBase64(text), ''];
            }

            case 'ls': {
                const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
                const targetPath = args.find(a => !a.startsWith('-')) || '.';
                const resolvedPath = resolvePath(targetPath);
                const node = getNode(resolvedPath);

                if (!node) {
                    return [`ls: tidak dapat mengakses '${targetPath}': Tidak ada file atau direktori`, ''];
                }

                if (node.type !== 'directory') {
                    return [targetPath, ''];
                }

                const entries = Object.keys(node.children || {})
                    .filter(name => showHidden || !name.startsWith('.'))
                    .sort();

                if (entries.length === 0) {
                    return ['(direktori kosong)', ''];
                }

                const formatted = entries.map(name => {
                    const child = node.children![name];
                    if (child.type === 'directory') {
                        return `\x1b[34m${name}/\x1b[0m`;
                    }
                    return name;
                });

                return [formatted.join('  '), ''];
            }

            case 'cd': {
                const target = args[0] || '/home/guest';
                const resolvedPath = resolvePath(target);
                const node = getNode(resolvedPath);

                if (!node) {
                    return [`cd: ${target}: Tidak ada file atau direktori`, ''];
                }

                if (node.type !== 'directory') {
                    return [`cd: ${target}: Bukan direktori`, ''];
                }

                setCurrentPath(resolvedPath || '/');
                return [''];
            }

            case 'cat': {
                if (!args[0]) {
                    return ['cat: file tidak ditentukan', ''];
                }

                const resolvedPath = resolvePath(args[0]);
                const node = getNode(resolvedPath);

                if (!node) {
                    return [`cat: ${args[0]}: Tidak ada file atau direktori`, ''];
                }

                if (node.type === 'directory') {
                    return [`cat: ${args[0]}: Adalah direktori`, ''];
                }

                const content = node.content || '';

                // Check if flag is found in raw content
                if (content.includes('yadika{')) {
                    const match = content.match(/yadika\{[^}]+\}/);
                    if (match && onFlagFound) {
                        setTimeout(() => onFlagFound(match[0]), 500);
                    }
                }

                return [...content.split('\n'), ''];
            }

            case '':
                return [''];

            default:
                return [`${command}: perintah tidak ditemukan. Ketik 'help' untuk bantuan.`, ''];
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && input !== '') return;

        const prompt = `guest@yadika:${currentPath}$ ${input}`;
        const output = executeCommand(input);

        if (input.toLowerCase() !== 'clear') {
            setLines(prev => [...prev, prompt, ...output]);
        }

        if (input.trim()) {
            setCommandHistory(prev => [...prev, input]);
            setHistoryIndex(-1);
        }

        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            className="w-full bg-[#0d0d0f] border border-secondary/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,184,255,0.15)] cursor-text"
            onClick={handleContainerClick}
        >
            <div className="bg-[#1a1a1c] px-4 py-2 border-b border-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary/70">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-mono">Virtual Shell — Level 2</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="p-4 h-[350px] overflow-y-auto font-mono text-sm terminal-scrollbar bg-[#0a0a0c]"
            >
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className="text-secondary whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                            __html: line
                                .replace(/\x1b\[34m/g, '<span class="text-blue-400">')
                                .replace(/\x1b\[0m/g, '</span>')
                        }}
                    />
                ))}

                <form onSubmit={handleSubmit} className="flex items-center gap-0 mt-1">
                    <span className="text-primary whitespace-nowrap">guest@yadika:{currentPath}$&nbsp;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        autoComplete="off"
                        spellCheck={false}
                        className="flex-1 bg-transparent border-none outline-none text-secondary caret-secondary focus:ring-0 p-0"
                    />
                </form>
            </div>
        </div>
    );
};
