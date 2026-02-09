"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Virtual Filesystem for Level 5: Permissions Challenge
interface FileNode {
    type: 'file' | 'directory';
    content?: string;
    permissions?: string; // e.g., 'rwxr-xr-x' or octal '755'
    owner?: string;
    children?: { [key: string]: FileNode };
}

const createFilesystem = (): FileNode => ({
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
});

interface Level5TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level5Terminal: React.FC<Level5TerminalProps> = ({ onFlagFound }) => {
    const [lines, setLines] = useState<string[]>([
        'Yadika Virtual Shell v1.0 — Level 5',
        'Ketik "help" untuk melihat daftar perintah.',
        ''
    ]);
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState('/home/guest');
    const [filesystem, setFilesystem] = useState<FileNode>(createFilesystem);
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
        if (path.startsWith('/')) return path;
        const parts = currentPath.split('/').filter(Boolean);
        for (const part of path.split('/')) {
            if (part === '..') parts.pop();
            else if (part !== '.' && part !== '') parts.push(part);
        }
        return '/' + parts.join('/');
    };

    const getNode = (path: string): FileNode | null => {
        const parts = path.split('/').filter(Boolean);
        let node: FileNode = filesystem;
        for (const part of parts) {
            if (node.type !== 'directory' || !node.children?.[part]) return null;
            node = node.children[part];
        }
        return node;
    };

    // Update permissions on a file
    const updatePermissions = (path: string, newPerms: string): boolean => {
        const parts = path.split('/').filter(Boolean);

        const updateNode = (node: FileNode, pathParts: string[]): FileNode => {
            if (pathParts.length === 0) {
                return { ...node, permissions: newPerms };
            }

            const [current, ...rest] = pathParts;
            if (node.type !== 'directory' || !node.children?.[current]) {
                return node;
            }

            return {
                ...node,
                children: {
                    ...node.children,
                    [current]: updateNode(node.children[current], rest)
                }
            };
        };

        setFilesystem(prev => updateNode(prev, parts));
        return true;
    };

    // Parse chmod argument to permission string
    const parseChmod = (arg: string, currentPerms: string): string => {
        // Handle symbolic mode like +r, +w, +x, -r, etc.
        if (arg.startsWith('+') || arg.startsWith('-')) {
            const add = arg.startsWith('+');
            const perm = arg.slice(1);
            const permsArray = currentPerms.split('');

            if (perm === 'r') {
                permsArray[0] = add ? 'r' : '-';
                permsArray[3] = add ? 'r' : '-';
                permsArray[6] = add ? 'r' : '-';
            } else if (perm === 'w') {
                permsArray[1] = add ? 'w' : '-';
            } else if (perm === 'x') {
                permsArray[2] = add ? 'x' : '-';
                permsArray[5] = add ? 'x' : '-';
                permsArray[8] = add ? 'x' : '-';
            }

            return permsArray.join('');
        }

        // Handle octal mode like 644, 755
        if (/^[0-7]{3}$/.test(arg)) {
            const octalToPerms = (n: number): string => {
                return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
            };
            const owner = parseInt(arg[0]);
            const group = parseInt(arg[1]);
            const others = parseInt(arg[2]);
            return octalToPerms(owner) + octalToPerms(group) + octalToPerms(others);
        }

        return currentPerms;
    };

    const executeCommand = (cmd: string): string[] => {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                return [
                    'Perintah yang tersedia:',
                    '  ls [-l]      - Lihat isi direktori (dengan -l untuk detail)',
                    '  cd <path>    - Pindah direktori',
                    '  cat <file>   - Baca isi file',
                    '  chmod <mode> <file> - Ubah permission',
                    '                   mode: +r, +w, +x, -r, atau 644, 755, dll',
                    '  pwd          - Tampilkan direktori saat ini',
                    '  clear        - Bersihkan layar',
                    ''
                ];

            case 'pwd':
                return [currentPath, ''];

            case 'clear':
                setLines([]);
                return [];

            case 'ls': {
                const showLong = args.includes('-l') || args.includes('-la');
                const targetArg = args.find(a => !a.startsWith('-')) || '.';
                const resolvedPath = resolvePath(targetArg);
                const node = getNode(resolvedPath);

                if (!node) return [`ls: ${targetArg}: Tidak ada`, ''];
                if (node.type !== 'directory') return [targetArg, ''];

                const entries = Object.entries(node.children || {}).sort((a, b) => a[0].localeCompare(b[0]));

                if (showLong) {
                    const formatted = entries.map(([name, child]) => {
                        const typeChar = child.type === 'directory' ? 'd' : '-';
                        const perms = child.permissions || 'rw-r--r--';
                        const owner = child.owner || 'guest';
                        const displayName = child.type === 'directory' ? `${name}/` : name;
                        return `${typeChar}${perms}  ${owner.padEnd(8)}  ${displayName}`;
                    });
                    return [...formatted, ''];
                }

                const names = entries.map(([name, child]) =>
                    child.type === 'directory' ? `${name}/` : name
                );
                return [names.join('  '), ''];
            }

            case 'cd': {
                const target = args[0] || '/home/guest';
                const resolvedPath = resolvePath(target);
                const node = getNode(resolvedPath);
                if (!node) return [`cd: ${target}: Tidak ada`, ''];
                if (node.type !== 'directory') return [`cd: ${target}: Bukan direktori`, ''];
                setCurrentPath(resolvedPath);
                return [''];
            }

            case 'cat': {
                if (!args[0]) return ['cat: file tidak ditentukan', ''];
                const resolvedPath = resolvePath(args[0]);
                const node = getNode(resolvedPath);

                if (!node) return [`cat: ${args[0]}: File tidak ditemukan`, ''];
                if (node.type === 'directory') return [`cat: ${args[0]}: Adalah direktori`, ''];

                // Check read permission
                const perms = node.permissions || 'rw-r--r--';
                const canRead = perms[0] === 'r' || perms[3] === 'r' || perms[6] === 'r';

                if (!canRead) {
                    return [`cat: ${args[0]}: Permission denied (tidak ada izin baca)`, ''];
                }

                const content = node.content || '';

                // Check for flag
                if (content.includes('yadika{')) {
                    const match = content.match(/yadika\{[^}]+\}/);
                    if (match && onFlagFound) {
                        setTimeout(() => onFlagFound(match[0]), 500);
                    }
                }

                return [...content.split('\n'), ''];
            }

            case 'chmod': {
                if (args.length < 2) {
                    return ['Usage: chmod <mode> <file>', 'Contoh: chmod +r file.txt atau chmod 644 file.txt', ''];
                }

                const mode = args[0];
                const targetFile = args[1];
                const resolvedPath = resolvePath(targetFile);
                const node = getNode(resolvedPath);

                if (!node) return [`chmod: ${targetFile}: File tidak ditemukan`, ''];

                const currentPerms = node.permissions || '---------';
                const newPerms = parseChmod(mode, currentPerms);

                updatePermissions(resolvedPath, newPerms);

                return [`Permission changed: ${currentPerms} → ${newPerms}`, ''];
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
                setHistoryIndex(historyIndex - 1);
                setInput(commandHistory[commandHistory.length - historyIndex] || '');
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    return (
        <div
            className="w-full bg-[#0d0d0f] border border-orange-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.15)] cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="bg-[#1a1a1c] px-4 py-2 border-b border-orange-500/20 flex items-center justify-between">
                <span className="text-xs font-mono text-orange-400/70 flex items-center gap-1">
                    <TerminalIcon size={14} />
                    <span>Virtual Shell — Level 5</span>
                </span>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div ref={scrollRef} className="p-4 h-[400px] overflow-y-auto font-mono text-sm terminal-scrollbar bg-[#0a0a0c]">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-orange-300 whitespace-pre-wrap"
                    >
                        {line}
                    </motion.div>
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
                        className="flex-1 bg-transparent border-none outline-none text-orange-300 caret-orange-400 focus:ring-0 p-0"
                    />
                </form>
            </div>
        </div>
    );
};
