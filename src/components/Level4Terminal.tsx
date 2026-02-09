"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Virtual Filesystem for Level 4: Pipelining Challenge
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
});

interface Level4TerminalProps {
    onFlagFound?: (flag: string) => void;
}

export const Level4Terminal: React.FC<Level4TerminalProps> = ({ onFlagFound }) => {
    const [lines, setLines] = useState<string[]>([
        'Yadika Virtual Shell v1.0 — Level 4',
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

    // Execute a single command and return output as string array
    const executeSingleCommand = (cmd: string, pipeInput?: string[]): string[] => {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'cat': {
                if (pipeInput) return pipeInput;
                if (!args[0]) return ['cat: file tidak ditentukan'];
                const node = getNode(resolvePath(args[0]));
                if (!node) return [`cat: ${args[0]}: File tidak ditemukan`];
                if (node.type === 'directory') return [`cat: ${args[0]}: Adalah direktori`];
                return (node.content || '').split('\n');
            }
            case 'grep': {
                let pattern = args[0] || '';
                if ((pattern.startsWith('"') && pattern.endsWith('"')) ||
                    (pattern.startsWith("'") && pattern.endsWith("'"))) {
                    pattern = pattern.slice(1, -1);
                }
                const inputLines = pipeInput || [];
                if (!pipeInput && args[1]) {
                    const node = getNode(resolvePath(args[1]));
                    if (node?.type === 'file') {
                        inputLines.push(...(node.content || '').split('\n'));
                    }
                }
                return inputLines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
            }
            case 'head': {
                const n = args[0] === '-n' ? parseInt(args[1]) || 10 : 10;
                const inputLines = pipeInput || [];
                if (!pipeInput && args[args.length - 1]) {
                    const node = getNode(resolvePath(args[args.length - 1]));
                    if (node?.type === 'file') {
                        inputLines.push(...(node.content || '').split('\n'));
                    }
                }
                return inputLines.slice(0, n);
            }
            case 'tail': {
                const n = args[0] === '-n' ? parseInt(args[1]) || 10 : 10;
                const inputLines = pipeInput || [];
                if (!pipeInput && args[args.length - 1]) {
                    const node = getNode(resolvePath(args[args.length - 1]));
                    if (node?.type === 'file') {
                        inputLines.push(...(node.content || '').split('\n'));
                    }
                }
                return inputLines.slice(-n);
            }
            case 'sort': {
                const inputLines = pipeInput || [];
                return [...inputLines].sort();
            }
            case 'uniq': {
                const inputLines = pipeInput || [];
                return inputLines.filter((line, i, arr) => i === 0 || line !== arr[i - 1]);
            }
            case 'wc': {
                const inputLines = pipeInput || [];
                if (args[0] === '-l') {
                    return [`${inputLines.length}`];
                }
                return [`${inputLines.length} lines`];
            }
            case 'tr': {
                // Simple tr for uppercase/lowercase
                const inputLines = pipeInput || [];
                if (args[0] === 'a-z' && args[1] === 'A-Z') {
                    return inputLines.map(l => l.toUpperCase());
                }
                if (args[0] === 'A-Z' && args[1] === 'a-z') {
                    return inputLines.map(l => l.toLowerCase());
                }
                return inputLines;
            }
            default:
                return [`${command}: perintah tidak ditemukan`];
        }
    };

    const executeCommand = (cmd: string): string[] => {
        const trimmed = cmd.trim();

        // Handle built-in commands first
        const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase();

        if (firstWord === 'help') {
            return [
                'Perintah yang tersedia:',
                '  ls           - Lihat isi direktori',
                '  cd <path>    - Pindah direktori',
                '  cat <file>   - Baca isi file',
                '  grep <pola>  - Filter baris yang cocok',
                '  head [-n N]  - Tampilkan N baris pertama',
                '  tail [-n N]  - Tampilkan N baris terakhir',
                '  sort         - Urutkan baris',
                '  wc -l        - Hitung jumlah baris',
                '',
                'Pipelining: cmd1 | cmd2 | cmd3',
                ''
            ];
        }

        if (firstWord === 'pwd') return [currentPath, ''];
        if (firstWord === 'clear') { setLines([]); return []; }

        if (firstWord === 'ls') {
            const args = trimmed.split(/\s+/).slice(1);
            const targetPath = args[0] || '.';
            const node = getNode(resolvePath(targetPath));
            if (!node) return [`ls: ${targetPath}: Tidak ada`, ''];
            if (node.type !== 'directory') return [targetPath, ''];
            const entries = Object.keys(node.children || {}).sort();
            return [entries.map(n => node.children![n].type === 'directory' ? `${n}/` : n).join('  '), ''];
        }

        if (firstWord === 'cd') {
            const target = trimmed.split(/\s+/)[1] || '/home/guest';
            const resolvedPath = resolvePath(target);
            const node = getNode(resolvedPath);
            if (!node) return [`cd: ${target}: Tidak ada`, ''];
            if (node.type !== 'directory') return [`cd: ${target}: Bukan direktori`, ''];
            setCurrentPath(resolvedPath);
            return [''];
        }

        // Handle piped commands
        if (trimmed.includes('|')) {
            const commands = trimmed.split('|').map(c => c.trim());
            let output: string[] = [];

            for (let i = 0; i < commands.length; i++) {
                output = executeSingleCommand(commands[i], i === 0 ? undefined : output);
            }

            // Check for flag in output
            const outputStr = output.join('\n');
            if (outputStr.includes('yadika{')) {
                const match = outputStr.match(/yadika\{[^}]+\}/);
                if (match && onFlagFound) {
                    setTimeout(() => onFlagFound(match[0]), 500);
                }
            }

            return [...output, ''];
        }

        // Single command
        const output = executeSingleCommand(trimmed);
        const outputStr = output.join('\n');
        if (outputStr.includes('yadika{')) {
            const match = outputStr.match(/yadika\{[^}]+\}/);
            if (match && onFlagFound) {
                setTimeout(() => onFlagFound(match[0]), 500);
            }
        }
        return [...output, ''];
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
            className="w-full bg-[#0d0d0f] border border-purple-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)] cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="bg-[#1a1a1c] px-4 py-2 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400/70">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-mono">Virtual Shell — Level 4</span>
                </div>
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
                        className="text-purple-300 whitespace-pre-wrap"
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
                        className="flex-1 bg-transparent border-none outline-none text-purple-300 caret-purple-400 focus:ring-0 p-0"
                    />
                </form>
            </div>
        </div>
    );
};
