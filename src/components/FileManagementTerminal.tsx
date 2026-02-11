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
                        name: 'documents',
                        type: 'directory',
                        children: [
                            { name: '.secret_instruction', type: 'file', isHidden: true, content: "TUGAS ADMIN:\n1. Buat folder: reports, images, data\n2. Rapikan file sesuai ekstensinya (.txt -> reports, .jpg -> images, .dat -> data)\n3. Hapus semua file .tmp\n4. Backup folder data ke data_backup\n\nSemangat!" },
                            { name: 'laporan_januari.txt', type: 'file', content: "Laporan Bulan Januari 2024..." },
                            { name: 'laporan_februari.txt', type: 'file', content: "Laporan Bulan Februari 2024..." },
                            { name: 'catatan.txt', type: 'file', content: "Catatan harian..." },
                            { name: 'liburan.jpg', type: 'file', content: "[BINARY IMAGE DATA]" },
                            { name: 'logo.jpg', type: 'file', content: "[BINARY IMAGE DATA]" },
                            { name: 'sensor.dat', type: 'file', content: "0101010101" },
                            { name: 'cache_01.tmp', type: 'file', content: "Temporary data" },
                            { name: 'cache_02.tmp', type: 'file', content: "Temporary data" },
                        ]
                    }
                ]
            }
        ]
    }
];

export default function FileManagementTerminal({ onComplete }: { onComplete?: () => void }) {
    const { updateProgress } = useAuth();
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet', 'documents']);

    const [fs, setFs] = useState<FileSystemNode[]>(INITIAL_FS);
    const [isMaximized, setIsMaximized] = useState(false);

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tutorials = [
        {
            title: "Melihat Semua File",
            instruction: "Di direktori ini ada banyak file, termasuk yang tersembunyi. File tersembunyi di Linux diawali dengan titik (.).",
            task: "Ketik `ls -a` untuk melihat semua file.",
            check: (cmd: string) => cmd.trim() === 'ls -a'
        },
        {
            title: "Membaca Instruksi",
            instruction: "Kamu melihat file `.secret_instruction` kan? Mari kita baca isinya untuk mengetahui tugas kita.",
            task: "Ketik `cat .secret_instruction`.",
            check: (cmd: string) => cmd.includes('cat') && cmd.includes('.secret_instruction')
        },
        {
            title: "Membuat Folder",
            instruction: "Tugas pertama adalah membuat folder pengelompokan. Kita butuh folder `reports`, `images`, dan `data`.",
            task: "Ketik `mkdir reports images data`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                if (!docs || !docs.children) return false;
                const hasReports = docs.children.some(c => c.name === 'reports' && c.type === 'directory');
                const hasImages = docs.children.some(c => c.name === 'images' && c.type === 'directory');
                const hasData = docs.children.some(c => c.name === 'data' && c.type === 'directory');
                return hasReports && hasImages && hasData;
            }
        },
        {
            title: "Memindahkan Laporan",
            instruction: "Sekarang rapikan file teks (.txt) ke dalam folder `reports`. Kita bisa gunakan wildcard `*` untuk memilih semua file berakhiran .txt.",
            task: "Ketik `mv *.txt reports/`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                const reports = getDir(currentFs, ['home', 'cadet', 'documents', 'reports']);
                if (!docs?.children || !reports?.children) return false;

                const txtInDocs = docs.children.some(c => c.name.endsWith('.txt'));
                const txtInReports = reports.children.filter(c => c.name.endsWith('.txt')).length >= 3;

                return !txtInDocs && txtInReports;
            }
        },
        {
            title: "Memindahkan Gambar",
            instruction: "Lakukan hal yang sama untuk file gambar (.jpg). Pindahkan ke folder `images`.",
            task: "Ketik `mv *.jpg images/`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                const images = getDir(currentFs, ['home', 'cadet', 'documents', 'images']);
                if (!docs?.children || !images?.children) return false;

                const jpgInDocs = docs.children.some(c => c.name.endsWith('.jpg'));
                const jpgInImages = images.children.filter(c => c.name.endsWith('.jpg')).length >= 2;

                return !jpgInDocs && jpgInImages;
            }
        },
        {
            title: "Memindahkan Data",
            instruction: "Pindahkan file data (.dat) ke folder `data`.",
            task: "Ketik `mv *.dat data/`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                const data = getDir(currentFs, ['home', 'cadet', 'documents', 'data']);
                if (!docs?.children || !data?.children) return false;

                const datInDocs = docs.children.some(c => c.name.endsWith('.dat'));
                const datInData = data.children.some(c => c.name.endsWith('.dat'));

                return !datInDocs && datInData;
            }
        },
        {
            title: "Menghapus Sampah",
            instruction: "Ada file sementara (.tmp) yang tidak berguna. Hapus semuanya sekaligus.",
            task: "Ketik `rm *.tmp`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                if (!docs?.children) return false;
                return !docs.children.some(c => c.name.endsWith('.tmp'));
            }
        },
        {
            title: "Backup Data",
            instruction: "Penting! Buat salinan cadangan folder data. Gunakan `cp -r` (recursive) untuk menyalin folder.",
            task: "Ketik `cp -r data data_backup`.",
            check: (cmd: string, currentFs: FileSystemNode[]) => {
                const docs = getDir(currentFs, ['home', 'cadet', 'documents']);
                const backup = getDir(currentFs, ['home', 'cadet', 'documents', 'data_backup']);
                if (!docs?.children || !backup?.children) return false;
                return backup.children.some(c => c.name.endsWith('.dat'));
            }
        },
        {
            title: "Selesai",
            instruction: "Luar biasa! Direktori sudah rapi dan aman.",
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
                { type: "response", content: <span className="text-white/60">Modul 3: File Management dimuat...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    // Helper to get directory node from path
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

        // Process Command
        let response: React.ReactNode = '';
        let newFs = JSON.parse(JSON.stringify(fs)); // Deep copy for mutation

        // Tutorial Check Logic
        let stepPassed = false;
        if (tutorials[step] && tutorials[step].check(cmd, newFs)) { // Pass PRE-mutation FS first? No, usually post-mutation check is better for state changes, but careful with sequencing.
            // Actually, for check logic that inspects FS state (like mkdir), we need to ensure the action happens first OR simulate it.
            // Our check functions in tutorial definition inspect 'currentFs'.
            // Let's execute the command logic FIRST (mutating newFs), then check.
        }

        switch (mainCmd) {
            case 'help':
                response = "Perintah tersedia: ls, cd, pwd, cat, mkdir, mv, cp, rm, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'pwd':
                response = '/' + cwd.join('/');
                break;
            case 'ls':
                const targetDir = getDir(newFs, cwd);
                if (targetDir && targetDir.children) {
                    const showHidden = args.includes('-a');
                    const items = targetDir.children
                        .filter(c => showHidden || !c.name.startsWith('.'))
                        .map(c => <span key={c.name} className={c.type === 'directory' ? "text-blue-400 font-bold mr-4" : "text-white mr-4"}>{c.name}</span>);
                    response = <div className="flex flex-wrap">{items}</div>;
                } else {
                    response = 'Error: Cannot read directory';
                }
                break;
            case 'mkdir':
                if (args.length < 2) {
                    response = "mkdir: missing operand";
                } else {
                    const currentDir = getDir(newFs, cwd);
                    if (currentDir && currentDir.children) {
                        const dirsToCreate = args.slice(1);
                        dirsToCreate.forEach(dirName => {
                            if (!currentDir!.children!.some(c => c.name === dirName)) {
                                currentDir!.children!.push({ name: dirName, type: 'directory', children: [] });
                            }
                        });
                        setFs(newFs); // Commit changes
                    }
                }
                break;
            case 'cat':
                if (args.length < 2) {
                    response = "cat: missing operand";
                } else {
                    const targetDir = getDir(newFs, cwd);
                    const file = targetDir?.children?.find(c => c.name === args[1]);
                    if (file && file.type === 'file') {
                        response = file.content || '';
                    } else {
                        response = `cat: ${args[1]}: No such file or directory`;
                    }
                }
                break;
            case 'rm':
                if (args.length < 2) {
                    response = "rm: missing operand";
                } else {
                    const currentDir = getDir(newFs, cwd);
                    if (currentDir && currentDir.children) {
                        const pattern = args[1];
                        if (pattern.startsWith('*.')) {
                            const ext = pattern.substring(1);
                            const initialCount = currentDir.children.length;
                            currentDir.children = currentDir.children.filter(c => !c.name.endsWith(ext));
                            if (currentDir.children.length < initialCount) response = `Removed files ending with ${ext}`;
                        } else {
                            const initialLen = currentDir.children.length;
                            currentDir.children = currentDir.children.filter(c => c.name !== args[1]);
                            if (currentDir.children.length === initialLen) {
                                response = `rm: cannot remove '${args[1]}': No such file`;
                            }
                        }
                        setFs(newFs);
                    }
                }
                break;
            case 'mv':
                if (args.length < 3) {
                    response = "mv: missing destination";
                } else {
                    const currentDir = getDir(newFs, cwd);
                    if (currentDir && currentDir.children) {
                        const source = args[1];
                        const dest = args[2].replace(/\/$/, "");

                        const destNode = currentDir.children.find(c => c.name === dest && c.type === 'directory');

                        if (!destNode || !destNode.children) {
                            response = `mv: target '${dest}' is not a directory`;
                        } else {
                            if (source.startsWith('*.')) {
                                const ext = source.substring(1);
                                const filesToMove = currentDir.children.filter(c => c.name.endsWith(ext) && c.type === 'file');
                                currentDir.children = currentDir.children.filter(c => !c.name.endsWith(ext) || c.type !== 'file');
                                destNode.children.push(...filesToMove);
                                response = `Moved ${filesToMove.length} files to ${dest}/`;
                            } else {
                                const fileIndex = currentDir.children.findIndex(c => c.name === source);
                                if (fileIndex !== -1) {
                                    const file = currentDir.children[fileIndex];
                                    currentDir.children.splice(fileIndex, 1);
                                    destNode.children.push(file);
                                } else {
                                    response = `mv: cannot stat '${source}': No such file`;
                                }
                            }
                        }
                        setFs(newFs);
                    }
                }
                break;
            case 'cp':
                if (args.length < 3) {
                    response = "cp: missing destination";
                } else {
                    const isRecursive = args[1] === '-r';
                    const source = isRecursive ? args[2] : args[1];
                    const dest = isRecursive ? args[3] : args[2];

                    const currentDir = getDir(newFs, cwd);
                    if (currentDir && currentDir.children) {
                        const sourceNode = currentDir.children.find(c => c.name === source);
                        if (!sourceNode) {
                            response = `cp: cannot stat '${source}': No such file`;
                        } else {
                            if (isRecursive && sourceNode.type === 'directory') {
                                const cloneNode = JSON.parse(JSON.stringify(sourceNode));
                                cloneNode.name = dest;
                                currentDir.children.push(cloneNode);
                            } else if (!isRecursive && sourceNode.type === 'file') {
                                const cloneNode = { ...sourceNode, name: dest };
                                currentDir.children.push(cloneNode);
                            } else {
                                response = "cp: omitting directory (use -r)";
                            }
                        }
                        setFs(newFs);
                    }
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1003);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/4";
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

        // Check completion AFTER command execution logic
        if (tutorials[step].check(cmd, newFs)) {
            setIsStepCompleted(true);
            setTimeout(() => {
                if (step < tutorials.length - 1) {
                    setStep(step + 1);
                    setIsStepCompleted(false);
                }
            }, 1000);
        }
    };

    return (
        <div className={`flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden font-mono shadow-2xl transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50 rounded-none border-0" : "w-full h-[600px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-bold">cadet@yadika-server:~/documents</span>
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
                    <h3 className="text-[#E95420] font-bold text-sm uppercase flex items-center gap-2">
                        <Play size={14} fill="currentColor" />
                        Step {step + 1}/{tutorials.length}: {tutorials[step].title}
                    </h3>
                    {isStepCompleted && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> COMPLETED</span>}
                </div>
                <p className="text-sm text-white/80">{tutorials[step].instruction}</p>
                <div className="bg-black/30 p-2 rounded border-l-2 border-[#E95420] text-xs text-secondary font-mono">
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
                    <div key={i} className="text-sm break-all font-mono">
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                <span className="text-green-500 font-bold shrink-0">cadet@yadika-server:</span>
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
                <div className="flex gap-2 text-sm text-white font-mono items-center">
                    <span className="text-green-500 font-bold shrink-0">cadet@yadika-server:</span>
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
