"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FileSystemNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileSystemNode[];
    content?: string;
    permissions: string; // e.g. "drwxr-xr-x"
    owner: string;
    group: string;
    size: number;
    updatedAt: string;
}

const INITIAL_USERS = ['root', 'cadet', 'daemon', 'nobody'];

const INITIAL_FS: FileSystemNode[] = [
    {
        name: 'home',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        updatedAt: 'Feb 10 10:00',
        children: [
            {
                name: 'cadet',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'cadet',
                group: 'cadet',
                size: 4096,
                updatedAt: 'Feb 10 10:05',
                children: [
                    {
                        name: 'secret_code.py',
                        type: 'file',
                        permissions: '-rw-r--r--',
                        owner: 'cadet',
                        group: 'cadet',
                        size: 1024,
                        updatedAt: 'Feb 10 10:10',
                        content: "print('Top Secret Algorithm')"
                    },
                    {
                        name: 'project_v1',
                        type: 'directory',
                        permissions: 'drwxr-xr-x',
                        owner: 'cadet',
                        group: 'cadet',
                        size: 4096,
                        updatedAt: 'Feb 10 10:12',
                        children: [
                            { name: 'main.c', type: 'file', permissions: '-rw-r--r--', owner: 'cadet', group: 'cadet', size: 500, updatedAt: 'Feb 10 10:12' }
                        ]
                    },
                    {
                        name: 'notes.txt',
                        type: 'file',
                        permissions: '-rw-r--r--',
                        owner: 'cadet',
                        group: 'cadet',
                        size: 256,
                        updatedAt: 'Feb 10 10:15',
                        content: "Meeting notes..."
                    }
                ]
            }
        ]
    }
];

export default function UserManagementTerminal({ onComplete }: { onComplete?: () => void }) {
    const { user, updateProgress } = useAuth();
    const username = user?.discord || 'cadet';
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [fs, setFs] = useState<FileSystemNode[]>(INITIAL_FS);
    const [users, setUsers] = useState<string[]>(INITIAL_USERS);
    const [currentUser, setCurrentUser] = useState('cadet');
    const [isMaximized, setIsMaximized] = useState(false);


    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tutorials = [
        {
            title: "Siapa Saya?",
            instruction: "Di sistem operasi multi-user seperti Linux, penting untuk tahu siapa user yang sedang aktif.",
            task: "Ketik `whoami` untuk melihat user aktif.",
            check: (cmd: string) => cmd.trim() === 'whoami'
        },
        {
            title: "Menambah User Baru",
            instruction: "Kita kedatangan developer baru. Buat user bernama `dev_team`. Perintah `useradd` butuh akses superuser (`sudo`).",
            task: "Ketik `sudo useradd dev_team`.",
            check: (cmd: string, _: any, currentUsers: string[]) => {
                return currentUsers.includes('dev_team');
            }
        },
        {
            title: "Verifikasi User",
            instruction: "Pastikan user `dev_team` sudah terdaftar di sistem. Semua user tersimpan di file `/etc/passwd`.",
            task: "Ketik `cat /etc/passwd` atau `grep dev_team /etc/passwd`.",
            check: (cmd: string) => cmd.includes('/etc/passwd')
        },
        {
            title: "Cek Permission File",
            instruction: "Lihat detail file di direktori ini. Perhatikan kolom permission (seperti `drwxr-xr-x`) dan owner.",
            task: "Ketik `ls -l`.",
            check: (cmd: string) => cmd.trim() === 'ls -l'
        },
        {
            title: "Amankan File Rahasia",
            instruction: "File `secret_code.py` saat ini bisa dibaca semua orang (`r--`). Kita harus ubah agar hanya owner yang bisa baca, tulis, dan eksekusi.",
            task: "Ubah permission menjadi 700. Ketik `chmod 700 secret_code.py`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const home = getDir(currentFs, ['home', 'cadet']);
                const file = home?.children?.find(c => c.name === 'secret_code.py');
                return file?.permissions === '-rwx------';
            }
        },
        {
            title: "Ubah Pemilik Project",
            instruction: "Folder `project_v1` akan dikelola oleh `dev_team`. Kita perlu ubah kepemilikannya.",
            task: "Ketik `sudo chown dev_team project_v1`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const home = getDir(currentFs, ['home', 'cadet']);
                const dir = home?.children?.find(c => c.name === 'project_v1');
                return dir?.owner === 'dev_team';
            }
        },
        {
            title: "Selesai",
            instruction: "Sistem sudah lebih aman dan terorganisir.",
            task: "Ketik `exit` untuk menyelesaikan modul.",
            check: (cmd: string) => cmd.trim() === 'exit'
        }
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [output, step]);

    useEffect(() => {
        // Initial greeting
        if (output.length === 0) {
            setOutput([
                { type: "response", content: "Ubuntu 24.04 LTS (GNU/Linux 6.8.0-101 generic x86_64)" },
                { type: "response", content: <span className="text-white/60">Modul 5: User & Permission Management loaded...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    const getDir = (currentFs: FileSystemNode[], path: string[]): FileSystemNode | null => {
        let current = currentFs.find(n => n.name === 'home');
        if (!current || path[0] !== 'home') return null;

        for (let i = 1; i < path.length; i++) {
            if (!current?.children) return null;
            current = current.children.find(n => n.name === path[i]);
            if (!current) return null;
        }
        return current;
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        setOutput([...output, { type: 'command', content: cmd }]);
        setHistory([...history, cmd]);
        setInput('');

        const args = cmd.split(' ');
        let mainCmd = args[0];
        let cmdArgs = args.slice(1);

        // Handle sudo
        let isSudo = false;
        if (mainCmd === 'sudo') {
            isSudo = true;
            mainCmd = cmdArgs[0];
            cmdArgs = cmdArgs.slice(1);
        }

        let response: React.ReactNode = '';
        let newFs = JSON.parse(JSON.stringify(fs));
        let newUsers = [...users];

        switch (mainCmd) {
            case 'help':
                response = "Perintah: whoami, useradd, cat, ls, chmod, chown, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'whoami':
                response = isSudo ? 'root' : currentUser;
                break;
            case 'useradd':
                if (!isSudo) {
                    response = "useradd: Permission denied. Try 'sudo useradd'.";
                } else if (cmdArgs.length < 1) {
                    response = "useradd: missing operand";
                } else {
                    const newUser = cmdArgs[0];
                    if (newUsers.includes(newUser)) {
                        response = `useradd: user '${newUser}' already exists`;
                    } else {
                        newUsers.push(newUser);
                        setUsers(newUsers);
                        // response = ""; // Silent success usually
                    }
                }
                break;
            case 'grep':
                if (cmdArgs.length >= 2 && cmdArgs[1] === '/etc/passwd') {
                    const searchTerm = cmdArgs[0];
                    const matches = newUsers.filter(u => u.includes(searchTerm));
                    response = matches.map(u => <div key={u}>{u}:x:100{newUsers.indexOf(u)}:100{newUsers.indexOf(u)}::/home/{u}:/bin/bash</div>);
                } else {
                    response = "grep: Usage: grep <term> /etc/passwd";
                }
                break;
            case 'cat':
                if (cmdArgs[0] === '/etc/passwd') {
                    response = newUsers.map(u => <div key={u}>{u}:x:100{newUsers.indexOf(u)}:100{newUsers.indexOf(u)}::/home/{u}:/bin/bash</div>);
                } else {
                    // Basic cat for files support
                    const targetDir = getDir(newFs, cwd);
                    const file = targetDir?.children?.find(c => c.name === cmdArgs[0]);
                    if (file && file.type === 'file') {
                        response = file.content || '';
                    } else {
                        response = `cat: ${cmdArgs[0]}: No such file or directory`;
                    }
                }
                break;
            case 'ls':
                const targetDir = getDir(newFs, cwd);
                if (targetDir && targetDir.children) {
                    if (cmdArgs.includes('-l')) {
                        // Detailed list
                        response = (
                            <div className="flex flex-col gap-1">
                                {targetDir.children.map(c => (
                                    <div key={c.name} className="grid grid-cols-[100px_80px_80px_60px_100px_1fr] gap-4 text-white/90">
                                        <span className="font-mono text-yellow-300">{c.permissions}</span>
                                        <span>{c.owner}</span>
                                        <span>{c.group}</span>
                                        <span className="text-right">{c.size}</span>
                                        <span className="text-white/60">{c.updatedAt}</span>
                                        <span className={c.type === 'directory' ? "text-blue-400 font-bold" : ""}>{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    } else {
                        // Simple list
                        const items = targetDir.children.map(c =>
                            <span key={c.name} className={c.type === 'directory' ? "text-blue-400 font-bold mr-4" : "text-white mr-4"}>{c.name}</span>
                        );
                        response = <div className="flex flex-wrap">{items}</div>;
                    }
                }
                break;
            case 'chmod':
                if (cmdArgs.length < 2) {
                    response = "chmod: missing operand";
                } else {
                    const mode = cmdArgs[0];
                    const filename = cmdArgs[1];
                    const currentDir = getDir(newFs, cwd);
                    const file = currentDir?.children?.find(c => c.name === filename);

                    if (file) {
                        // Simple simulation for 700, 777, 644
                        // In reality, converting octal to string is complex. Hardcoding for tutorial purposes.
                        let permString = file.permissions;
                        const typeChar = file.type === 'directory' ? 'd' : '-';
                        if (mode === '700') permString = `${typeChar}rwx------`;
                        else if (mode === '777') permString = `${typeChar}rwxrwxrwx`;
                        else if (mode === '755') permString = `${typeChar}rwxr-xr-x`;
                        else if (mode === '644') permString = `${typeChar}rw-r--r--`;
                        else if (mode === '+x') permString = permString.replace(/-/g, (_, i) => [3, 6, 9].includes(i) ? 'x' : '-'); // primitive

                        file.permissions = permString;
                        setFs(newFs);
                    } else {
                        response = `chmod: cannot access '${filename}': No such file or directory`;
                    }
                }
                break;
            case 'chown':
                if (!isSudo) {
                    response = "chown: Permission denied. Try 'sudo chown'.";
                } else if (cmdArgs.length < 2) {
                    response = "chown: missing operand";
                } else {
                    const ownerGroup = cmdArgs[0].split(':');
                    const newOwner = ownerGroup[0];
                    const newGroup = ownerGroup[1] || newOwner; // Default group checks
                    const filename = cmdArgs[1];

                    if (!newUsers.includes(newOwner)) {
                        response = `chown: invalid user: '${newOwner}'`;
                    } else {
                        const currentDir = getDir(newFs, cwd);
                        const file = currentDir?.children?.find(c => c.name === filename);
                        if (file) {
                            file.owner = newOwner;
                            // file.group = newGroup; // Simplify: Tutorial only asks for owner change often
                            setFs(newFs);
                        } else {
                            response = `chown: cannot access '${filename}': No such file or directory`;
                        }
                    }
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1005);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/completed";
                } else {
                    response = "Selesaikan tutorial terlebih dahulu.";
                }
                break;
            default:
                response = `${mainCmd}: command not found`;
        }

        if (response) {
            setOutput(prev => [...prev, { type: 'response', content: response }]);
        }

        // Check completion
        // We pass 'newUsers' explicitly for checks involving user list
        if (tutorials[step].check(cmd, newFs, newUsers)) {
            completeStep();
        }
    };

    const completeStep = () => {
        setIsStepCompleted(true);
        setTimeout(() => {
            if (step < tutorials.length - 1) {
                setStep(step + 1);
                setIsStepCompleted(false);
            }
        }, 1000);
    };

    return (
        <div className={`flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden font-mono shadow-2xl transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50 rounded-none border-0" : "w-full h-[600px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-bold">{username}@ctf:{cwd[cwd.length - 1] === 'cadet' ? '~' : `~/${cwd.slice(2).join('/')}`}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors">
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button className="p-1 hover:bg-red-500/20 rounded text-white/60 hover:text-red-400 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Tutorial Pane */}
            <div className={`p-4 bg-[#222] border-b border-white/10 flex flex-col gap-2 shrink-0`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-[#E95420] font-bold text-[10px] md:text-sm uppercase flex items-center gap-2">
                        <Play size={14} fill="currentColor" className="shrink-0" />
                        Step {step + 1}/{tutorials.length}: {tutorials[step].title}
                    </h3>
                    {isStepCompleted && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> COMPLETED</span>}
                </div>
                <p className="text-[11px] md:text-sm text-white/80">{tutorials[step].instruction}</p>
                <div className="bg-black/30 p-2 rounded border-l-2 border-[#E95420] text-[10px] md:text-xs text-secondary font-mono">
                    <span className="opacity-50">Task: </span>
                    {tutorials[step].task}
                </div>
            </div>

            {/* Terminal Output */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1 bg-[#0c0c0c]"
                onClick={() => inputRef.current?.focus()}
            >
                {output.map((line, i) => (
                    <div key={i} className="text-[10px] md:text-sm break-all font-mono">
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                                <span className="text-blue-400 font-bold shrink-0">{cwd[cwd.length - 1] === 'cadet' ? '~' : `~/${cwd.slice(2).join('/')}`} $</span>
                                <span>{line.content}</span>
                            </div>
                        ) : (
                            <div className="text-white/80 whitespace-pre-wrap pl-0">
                                {line.content}
                            </div>
                        )}
                    </div>
                ))}

                {/* Active Input */}
                <div className="flex gap-2 text-[10px] md:text-sm text-white font-mono items-center">
                    <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                    <span className="text-blue-400 font-bold shrink-0">{cwd[cwd.length - 1] === 'cadet' ? '~' : `~/${cwd.slice(2).join('/')}`} $</span>
                    <form onSubmit={handleCommand} className="flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-transparent outline-none border-none p-0 text-white placeholder-white/20"
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </form>
                </div>
            </div>

        </div>
    );
}
