"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Virtual Filesystem for Level 3: Grep Challenge
interface FileNode {
    type: 'file' | 'directory';
    content?: string;
    children?: { [key: string]: FileNode };
}

// Generate many log files with random data and one hidden flag
const generateLogFiles = (): { [key: string]: FileNode } => {
    const logs: { [key: string]: FileNode } = {};
    const randomWords = ['system', 'process', 'started', 'stopped', 'running', 'error', 'warning', 'info', 'debug', 'connection', 'timeout', 'success', 'failed', 'user', 'admin', 'guest', 'login', 'logout', 'access', 'denied'];

    // Generate 20 log files
    for (let i = 1; i <= 20; i++) {
        const lines: string[] = [];
        const numLines = 10 + Math.floor(i * 1.5);

        for (let j = 0; j < numLines; j++) {
            const word1 = randomWords[Math.floor(Math.random() * randomWords.length)];
            const word2 = randomWords[Math.floor(Math.random() * randomWords.length)];
            const word3 = randomWords[Math.floor(Math.random() * randomWords.length)];
            lines.push(`[2026-02-${String(i).padStart(2, '0')}] ${word1} ${word2} ${word3}`);
        }

        // Hide the flag in log file 13
        if (i === 13) {
            lines.splice(7, 0, '[2026-02-13] SECRET FLAG FOUND: yadika{gr3p_m4st3r}');
        }

        logs[`server_${String(i).padStart(2, '0')}.log`] = {
            type: 'file',
            content: lines.join('\n')
        };
    }

    return logs;
};

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
                            content: 'Level 3: Needle in a Haystack\n\nAda 20 file log di folder /var/log.\nSalah satu dari file tersebut mengandung FLAG.\n\nMembaca satu-satu? Terlalu lama!\nGunakan perintah "grep" untuk mencari dengan cepat.\n\nContoh: grep "kata" file.txt\nAtau: grep "kata" *.log (semua file .log)'
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
                    children: generateLogFiles()
                }
            }
        }
    }
});

interface Level3TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level3Terminal: React.FC<Level3TerminalProps> = ({ onFlagFound }) => {
    const [lines, setLines] = useState<string[]>([
        'Yadika Virtual Shell v1.0 — Level 3',
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

    // Get all files matching a glob pattern
    const getFilesMatching = (pattern: string): { name: string; node: FileNode }[] => {
        const resolvedDir = resolvePath('.');
        const dirNode = getNode(resolvedDir);

        if (!dirNode || dirNode.type !== 'directory' || !dirNode.children) {
            return [];
        }

        // Simple glob: *.log matches all .log files
        if (pattern.startsWith('*.')) {
            const ext = pattern.slice(1);
            return Object.entries(dirNode.children)
                .filter(([name, node]) => name.endsWith(ext) && node.type === 'file')
                .map(([name, node]) => ({ name, node }));
        }

        // Single file
        const node = dirNode.children[pattern];
        if (node && node.type === 'file') {
            return [{ name: pattern, node }];
        }

        return [];
    };

    const executeCommand = (cmd: string): string[] => {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                return [
                    'Perintah yang tersedia:',
                    '  ls           - Lihat isi direktori',
                    '  cd <path>    - Pindah direktori',
                    '  cat <file>   - Baca isi file',
                    '  pwd          - Tampilkan direktori saat ini',
                    '  clear        - Bersihkan layar',
                    '  grep <pola> <file>  - Cari teks dalam file',
                    '  wc -l <file> - Hitung jumlah baris',
                    '  head <file>  - Tampilkan 5 baris pertama',
                    ''
                ];

            case 'pwd':
                return [currentPath, ''];

            case 'whoami':
                return ['guest', ''];

            case 'clear':
                setLines([]);
                return [];

            case 'grep': {
                if (args.length < 2) {
                    return ['Usage: grep <pattern> <file>', 'Contoh: grep "FLAG" *.log', ''];
                }

                let pattern = args[0];
                // Remove quotes if present
                if ((pattern.startsWith('"') && pattern.endsWith('"')) ||
                    (pattern.startsWith("'") && pattern.endsWith("'"))) {
                    pattern = pattern.slice(1, -1);
                }

                const filePattern = args[1];
                const files = getFilesMatching(filePattern);

                if (files.length === 0) {
                    return [`grep: ${filePattern}: Tidak ada file yang cocok`, ''];
                }

                const results: string[] = [];
                for (const { name, node } of files) {
                    const content = node.content || '';
                    const matchingLines = content.split('\n')
                        .filter(line => line.toLowerCase().includes(pattern.toLowerCase()));

                    for (const line of matchingLines) {
                        results.push(`${name}: ${line}`);

                        // Check for flag
                        if (line.includes('yadika{')) {
                            const match = line.match(/yadika\{[^}]+\}/);
                            if (match && onFlagFound) {
                                setTimeout(() => onFlagFound(match[0]), 500);
                            }
                        }
                    }
                }

                if (results.length === 0) {
                    return [`Tidak ada hasil untuk "${pattern}"`, ''];
                }

                return [...results, '', `${results.length} baris ditemukan`, ''];
            }

            case 'wc': {
                if (args[0] !== '-l' || !args[1]) {
                    return ['Usage: wc -l <file>', ''];
                }

                const resolvedPath = resolvePath(args[1]);
                const node = getNode(resolvedPath);

                if (!node || node.type !== 'file') {
                    return [`wc: ${args[1]}: Tidak ada file`, ''];
                }

                const lineCount = (node.content || '').split('\n').length;
                return [`${lineCount} ${args[1]}`, ''];
            }

            case 'head': {
                if (!args[0]) {
                    return ['Usage: head <file>', ''];
                }

                const resolvedPath = resolvePath(args[0]);
                const node = getNode(resolvedPath);

                if (!node || node.type !== 'file') {
                    return [`head: ${args[0]}: Tidak ada file`, ''];
                }

                const headLines = (node.content || '').split('\n').slice(0, 5);
                return [...headLines, ''];
            }

            case 'ls': {
                const targetPath = args[0] || '.';
                const resolvedPath = resolvePath(targetPath);
                const node = getNode(resolvedPath);

                if (!node) {
                    return [`ls: tidak dapat mengakses '${targetPath}': Tidak ada file atau direktori`, ''];
                }

                if (node.type !== 'directory') {
                    return [targetPath, ''];
                }

                const entries = Object.keys(node.children || {}).sort();

                if (entries.length === 0) {
                    return ['(direktori kosong)', ''];
                }

                // Format in columns for many files
                if (entries.length > 10) {
                    const formatted = entries.map(name => {
                        const child = node.children![name];
                        return child.type === 'directory' ? `${name}/` : name;
                    });

                    // Display in 3 columns
                    const cols = 3;
                    const rows: string[] = [];
                    for (let i = 0; i < formatted.length; i += cols) {
                        rows.push(formatted.slice(i, i + cols).map(s => s.padEnd(20)).join(''));
                    }
                    return [...rows, '', `Total: ${entries.length} items`, ''];
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
            className="w-full bg-[#0d0d0f] border border-accent/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,0,85,0.15)] cursor-text"
            onClick={handleContainerClick}
        >
            <div className="bg-[#1a1a1c] px-4 py-2 border-b border-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent/70">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-mono">Virtual Shell — Level 3</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="p-4 h-[400px] overflow-y-auto font-mono text-sm terminal-scrollbar bg-[#0a0a0c]"
            >
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className="text-accent/90 whitespace-pre-wrap"
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
                        className="flex-1 bg-transparent border-none outline-none text-accent caret-accent focus:ring-0 p-0"
                    />
                </form>
            </div>
        </div>
    );
};
