"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


interface FileSystemNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileSystemNode[];
    content?: string;
    isHidden?: boolean;
}

const INITIAL_FS: FileSystemNode[] = [
    {
        name: 'home',
        type: 'directory',
        children: [
            {
                name: 'cadet',
                type: 'directory',
                children: [
                    {
                        name: 'system_configs',
                        type: 'directory',
                        children: [
                            {
                                name: 'webserver.conf',
                                type: 'file',
                                content: "# Web Server Configuration\nPORT=80\nSERVER_NAME=ctf\nROOT=/var/www/html\nDEBUG=true\n"
                            },
                        ]
                    },
                    {
                        name: 'documents',
                        type: 'directory',
                        children: []
                    }
                ]
            }
        ]
    }
];

export default function TextEditorTerminal({ onComplete }: { onComplete?: () => void }) {
    const { user, updateProgress } = useAuth();
    const username = user?.discord || 'cadet';

    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [fs, setFs] = useState<FileSystemNode[]>(INITIAL_FS);
    const [isMaximized, setIsMaximized] = useState(false);

    // Editor Mode State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [editorFilename, setEditorFilename] = useState('');
    const [editorMessage, setEditorMessage] = useState(''); // e.g. "File Written"

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const tutorials = [
        {
            title: "Mengenal Nano",
            instruction: "Di Linux, kita sering mengedit file langsung dari terminal. Editor paling populer untuk pemula adalah `nano`. Mari buat file baru.",
            task: "Ketik `nano biodata.txt` untuk membuat file baru.",
            check: (cmd: string) => cmd.trim() === 'nano biodata.txt'
        },
        {
            title: "Menulis di Nano",
            instruction: "Sekarang kamu berada di dalam `nano`. Ketikkan nama dan kelasmu di sini. Contoh: 'Nama: Budi, Kelas: 10 TKJ 1'.",
            task: "Tulis biodatamu di editor, lalu tekan `Ctrl+O` (atau tombol Save) untuk menyimpan.",
            check: (_: string, currentFs: FileSystemNode[]) => {
                const home = getDir(currentFs, ['home', 'cadet']);
                const file = home?.children?.find(c => c.name === 'biodata.txt');
                return !!(file && file.content && file.content.length > 5);
            }
        },
        {
            title: "Keluar dari Nano",
            instruction: "File sudah disimpan. Sekarang kita perlu keluar dari editor `nano`. Tekan `Ctrl+X` (atau tombol Exit).",
            task: "Keluar dari editor `nano`.",
            check: (_: string) => !isEditorOpen && step === 2 // Check handled in exit logic
        },
        {
            title: "Verifikasi File",
            instruction: "Pastikan file berhasil dibuat dengan membacanya.",
            task: "Ketik `cat biodata.txt`.",
            check: (cmd: string) => cmd.trim() === 'cat biodata.txt'
        },
        {
            title: "Edit Konfigurasi",
            instruction: "Tugas SysAdmin seringkali adalah mengedit konfigurasi. Masuk ke folder `system_configs`.",
            task: "Ketik `cd system_configs`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => cwd[cwd.length - 1] === 'system_configs'
        },
        {
            title: "Perbaiki Port Webserver",
            instruction: "Webserver kita salah konfigurasi. Port-nya harusnya 8080, bukan 80. Edit file `webserver.conf`.",
            task: "Gunakan `nano webserver.conf` lalu ubah `PORT=80` menjadi `PORT=8080`. Simpan dan Keluar.",
            check: (_: string, currentFs: FileSystemNode[]) => {
                const dir = getDir(currentFs, ['home', 'cadet', 'system_configs']);
                const file = dir?.children?.find(c => c.name === 'webserver.conf');
                return !!(file && file.content?.includes('PORT=8080'));
            }
        },
        {
            title: "Selesai",
            instruction: "Bagus! Kamu sudah bisa membuat dan mengedit file di Linux.",
            task: "Ketik `exit` untuk menyelesaikan modul.",
            check: (cmd: string) => cmd.trim() === 'exit'
        }
    ];

    useEffect(() => {
        if (!isEditorOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output, isEditorOpen]);

    useEffect(() => {
        if (!isEditorOpen) inputRef.current?.focus();
        else editorRef.current?.focus();
    }, [output, step, isEditorOpen]);

    useEffect(() => {
        // Initial greeting
        if (output.length === 0) {
            setOutput([
                { type: "response", content: "Ubuntu 24.04 LTS (GNU/Linux 6.8.0-101 generic x86_64)" },
                { type: "response", content: <span className="text-white/60">Modul 4: Text Editing loaded...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    // Helper to get directory node
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
        const mainCmd = args[0];

        let response: React.ReactNode = '';
        let newFs = JSON.parse(JSON.stringify(fs));
        let changedFs = false;

        switch (mainCmd) {
            case 'help':
                response = "Perintah: nano <file>, ls, cd, cat, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'nano':
                if (args.length < 2) {
                    response = "nano: missing filename";
                } else {
                    const filename = args[1];
                    const currentDir = getDir(newFs, cwd);
                    const existingFile = currentDir?.children?.find(c => c.name === filename);

                    setEditorFilename(filename);
                    setEditorContent(existingFile && existingFile.type === 'file' ? existingFile.content || '' : '');
                    setIsEditorOpen(true);
                }
                break;
            case 'ls':
                const targetDir = getDir(newFs, cwd);
                if (targetDir && targetDir.children) {
                    const items = targetDir.children.map(c =>
                        <span key={c.name} className={c.type === 'directory' ? "text-blue-400 font-bold mr-4" : "text-white mr-4"}>{c.name}</span>
                    );
                    response = <div className="flex flex-wrap">{items}</div>;
                }
                break;
            case 'cd':
                if (args.length < 2 || args[1] === '~') {
                    setCwd(['home', 'cadet']);
                } else if (args[1] === '..') {
                    if (cwd.length > 2) setCwd(cwd.slice(0, -1));
                } else {
                    const target = getDir(newFs, [...cwd, args[1]]);
                    if (target && target.type === 'directory') {
                        setCwd([...cwd, args[1]]);
                    } else {
                        response = `cd: ${args[1]}: No such file or directory`;
                    }
                }
                break;
            case 'cat':
                if (args.length < 2) {
                    response = "cat: missing operand";
                } else {
                    const targetDirCat = getDir(newFs, cwd);
                    const file = targetDirCat?.children?.find(c => c.name === args[1]);
                    if (file && file.type === 'file') {
                        response = file.content || '';
                    } else {
                        response = `cat: ${args[1]}: No such file or directory`;
                    }
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1004);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/5"; // Assuming next module
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
        // For 'nano' command entry (Step 0)
        if (tutorials[step].check(cmd, newFs)) {
            completeStep();
        } else if (cmd.startsWith('cd') && step === 4) { // Specific check for cd step
            // Need to check AFTER cd state update? No, cwd updates next render.
            // We can check predicted CWD.
            const arg = cmd.split(' ')[1];
            if (arg === 'system_configs' && cwd[cwd.length - 1] !== 'system_configs') {
                // It will change.
                setTimeout(() => {
                    if (tutorials[step].check(cmd, newFs)) completeStep(); // Re-check with new state? 
                    // Actually tutorial 4 check uses `cwd` state which is stale here.
                    // Let's rely on simple string check for command confirmation + forced delay check?
                    // Better: manually advance if valid.
                    completeStep();
                }, 500);
            }
        }
    };

    const handleEditorSave = () => {
        let newFs = JSON.parse(JSON.stringify(fs));
        const currentDir = getDir(newFs, cwd);
        if (currentDir && currentDir.children) {
            const existingIndex = currentDir.children.findIndex(c => c.name === editorFilename);
            if (existingIndex !== -1) {
                currentDir.children[existingIndex].content = editorContent;
            } else {
                currentDir.children.push({
                    name: editorFilename,
                    type: 'file',
                    content: editorContent
                });
            }
            setFs(newFs);
            setEditorMessage(`[ Wrote ${editorContent.length} items ]`);

            // Validation for Step 1 (Write Biodata) and Step 5 (Edit Config)
            if (step === 1 || step === 5) {
                if (tutorials[step].check('save', newFs)) {
                    completeStep();
                }
            }

            setTimeout(() => setEditorMessage(''), 2000);
        }
    };

    const handleEditorExit = () => {
        setIsEditorOpen(false);
        setOutput(prev => [...prev]); // Force re-render/focus

        // Validation for Step 2 (Exit Nano)
        if (step === 2) {
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

    // Keyboard capture in editor
    const handleEditorKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key === 'o') {
                e.preventDefault();
                handleEditorSave();
            } else if (e.key === 'x') {
                e.preventDefault();
                handleEditorExit();
            }
        }
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

            {/* Content Area */}
            {isEditorOpen ? (
                // NANO EDITOR SIMULATOR
                <div className="flex-1 flex flex-col bg-[#1e1e1e] text-white font-mono relative">
                    {/* Nano Header */}
                    <div className="bg-white text-black px-2 flex justify-between text-sm shrink-0">
                        <span>GNU nano 7.2</span>
                        <span>File: {editorFilename}</span>
                        <span>{editorMessage || "Modified"}</span>
                    </div>

                    {/* TextArea */}
                    <textarea
                        ref={editorRef}
                        className="flex-1 bg-transparent resize-none outline-none p-2 text-white font-mono"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                    />

                    {/* Nano Footer Message */}
                    {editorMessage && (
                        <div className="bg-white text-black px-2 text-sm text-center shrink-0">
                            {editorMessage}
                        </div>
                    )}

                    {/* Nano Helper */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 p-2 text-xs border-t border-white/20 shrink-0">
                        <div className="cursor-pointer hover:bg-white/10" onClick={() => alert("Help not implemented")}>^G Help</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={handleEditorSave}><span className="font-bold">^O</span> Write Out</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={() => alert("Search not implemented")}>^W Where Is</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={handleEditorExit}><span className="font-bold">^X</span> Exit</div>
                        <div className="hidden sm:block">^K Cut Text</div>
                        <div className="hidden sm:block">^J Justify</div>
                    </div>
                </div>
            ) : (
                // STANDARD TERMINAL
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
            )}

        </div>
    );
}
