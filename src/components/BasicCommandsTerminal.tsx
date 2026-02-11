"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, ChevronRight, CheckCircle2, HelpCircle, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type FileSystem = {
    [key: string]: { type: "file" | "dir"; content?: string; children?: FileSystem };
};

const initialFileSystem: FileSystem = {
    "home": {
        type: "dir",
        children: {
            "cadet": {
                type: "dir",
                children: {
                    "Documents": {
                        type: "dir",
                        children: {
                            "project_notes.txt": { type: "file", content: "Project Alpha is a go." },
                            "todo.list": { type: "file", content: "- Learn Linux\n- Hack the planet" }
                        }
                    },
                    "Downloads": { type: "dir", children: {} },
                    "welcome.txt": { type: "file", content: "Welcome to Ubuntu Server!" },
                },
            },
        },
    },
};

export default function BasicCommandsTerminal({ onComplete }: { onComplete?: () => void }) {
    const { user, updateProgress } = useAuth();
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<{ type: "command" | "response"; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(["home", "cadet"]);
    const [fs, setFs] = useState<FileSystem>(initialFileSystem);
    const [isMaximized, setIsMaximized] = useState(false);

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const steps = [
        {
            title: "Pengenalan",
            instruction: "Selamat datang di Linux Shell! Antarmuka ini memungkinkanmu berinteraksi dengan sistem menggunakan perintah teks. Mari kita mulai dengan melihat di mana kita berada.",
            task: "Ketik `pwd` (Print Working Directory) dan tekan Enter.",
            check: (cmd: string) => cmd.trim() === "pwd"
        },
        {
            title: "Melihat Isi Direktori",
            instruction: "Bagus! Kamu sekarang berada di `/home/cadet`. Sekarang, mari kita lihat file apa saja yang ada di direktori ini.",
            task: "Ketik `ls` (List) dan tekan Enter untuk melihat isi direktori.",
            check: (cmd: string) => cmd.trim() === "ls"
        },
        {
            title: "Berpindah Direktori",
            instruction: "Kamu bisa melihat folder `Documents` dan `Downloads`. Mari kita masuk ke dalam folder `Documents`.",
            task: "Ketik `cd Documents` (Change Directory) dan tekan Enter.",
            check: (cmd: string) => cmd.trim() === "cd Documents"
        },
        {
            title: "Kembali ke Folder Sebelumnya",
            instruction: "Sekarang kamu di `/home/cadet/Documents`. Untuk kembali ke direktori sebelumnya (parent directory), kita gunakan `..`.",
            task: "Ketik `cd ..` dan tekan Enter.",
            check: (cmd: string) => cmd.trim() === "cd .."
        },
        {
            title: "Manual Pages",
            instruction: "Jika kamu tidak tahu cara menggunakan sebuah command, kamu bisa membaca manualnya (di Linux asli, `man` membuka halaman manual).",
            task: "Ketik `man ls` untuk melihat manual dari perintah ls.",
            check: (cmd: string) => cmd.trim() === "man ls"
        },
        {
            title: "Membersihkan Layar",
            instruction: "Layar terminal bisa menjadi penuh. Kamu bisa membersihkannya agar terlihat lebih rapi.",
            task: "Ketik `clear` dan tekan Enter.",
            check: (cmd: string) => cmd.trim() === "clear"
        },
        {
            title: "Riwayat Perintah",
            instruction: "Linux mengingat apa yang kamu ketik. Kamu bisa melihat riwayat perintah yang pernah kamu jalankan.",
            task: "Ketik `history` dan tekan Enter.",
            check: (cmd: string) => cmd.trim() === "history"
        },
        {
            title: "Modul Selesai",
            instruction: "Selamat! Kamu telah mempelajari dasar-dasar navigasi di Linux.",
            task: "Ketik `exit` untuk menyelesaikan modul ini.",
            check: (cmd: string) => cmd.trim() === "exit"
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
                { type: "response", content: "Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-1018-kvm x86_64)" },
                { type: "response", content: <span className="text-white/60">Modul 2: Basic Commands dimuat...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    const getCurrentDir = () => {
        let current = fs;
        for (const dir of cwd) {
            if (current[dir] && current[dir].children) {
                current = current[dir].children!;
            } else {
                return null;
            }
        }
        return current;
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        setHistory([...history, cmd]);
        setOutput([...output, { type: "command", content: cmd }]);
        setInput("");

        const args = cmd.split(" ");
        const command = args[0];

        // Tutorial Check
        if (steps[step] && steps[step].check(cmd)) {
            setIsStepCompleted(true);
            setTimeout(() => {
                if (step < steps.length - 1) {
                    setStep(step + 1);
                    setIsStepCompleted(false);
                }
            }, 1000);
        }

        // Logic
        switch (command) {
            case "pwd":
                setOutput(prev => [...prev, { type: "response", content: `/${cwd.join("/")}` }]);
                break;
            case "ls":
                const dir = getCurrentDir();
                if (dir) {
                    const items = Object.keys(dir).map(name => {
                        const isDir = dir[name].type === "dir";
                        return <span key={name} className={isDir ? "text-blue-400 font-bold mr-4" : "text-white mr-4"}>{name}</span>
                    });
                    setOutput(prev => [...prev, { type: "response", content: <div className="flex flex-wrap">{items}</div> }]);
                }
                break;
            case "cd":
                const target = args[1];
                if (!target) {
                    setCwd(["home", "cadet"]); // cd home
                } else if (target === "..") {
                    if (cwd.length > 2) { // don't go above home/cadet for simplicity in this level, or allow up to root? let's stick to simple
                        // Actually, let's allow going up to root if structure exists, but for safety in tutorial:
                        if (cwd.length > 0) setCwd(cwd.slice(0, -1));
                    }
                } else if (target.startsWith("/")) {
                    // Absolute path - simplified
                    setOutput(prev => [...prev, { type: "response", content: `bash: cd: ${target}: No such file or directory (Simulator Limitation)` }]);
                } else {
                    const current = getCurrentDir();
                    if (current && current[target] && current[target].type === "dir") {
                        setCwd([...cwd, target]);
                    } else {
                        setOutput(prev => [...prev, { type: "response", content: `bash: cd: ${target}: No such file or directory` }]);
                    }
                }
                break;
            case "clear":
                setOutput([]);
                break;
            case "man":
                if (args[1]) {
                    setOutput(prev => [...prev, { type: "response", content: <div className="text-white/80 italic">Opening manual page for {args[1]}... (Press q to quit - Simulated: output shown directly)</div> }]);
                    setOutput(prev => [...prev, {
                        type: "response", content: <div className="text-xs text-white/60 border border-white/20 p-2 my-2">
                            NAME<br />
                            &nbsp;&nbsp;&nbsp;{args[1]} - command description<br /><br />
                            SYNOPSIS<br />
                            &nbsp;&nbsp;&nbsp;{args[1]} [OPTION]... [FILE]...<br /><br />
                            DESCRIPTION<br />
                            &nbsp;&nbsp;&nbsp;This is a simulated manual page entry for {args[1]}.
                        </div>
                    }]);
                } else {
                    setOutput(prev => [...prev, { type: "response", content: "What manual page do you want?" }]);
                }
                break;
            case "history":
                setOutput(prev => [...prev, { type: "response", content: <div className="flex flex-col">{history.map((h, i) => <span key={i} className="text-xs">{i + 1}  {h}</span>)}<span className="text-xs">{history.length + 1}  history</span></div> }]);
                break;
            case "exit":
                if (step === steps.length - 1) {
                    await updateProgress(1002);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/3";
                } else {
                    setOutput(prev => [...prev, { type: "response", content: "Please complete the tutorial steps first." }]);
                }
                break;
            case "help":
                setOutput(prev => [...prev, { type: "response", content: "Available commands in this module: pwd, ls, cd, clear, man, history, exit" }]);
                break;
            default:
                setOutput(prev => [...prev, { type: "response", content: `bash: ${command}: command not found` }]);
        }
    };

    return (
        <div className={`flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden font-mono shadow-2xl transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50 rounded-none border-0" : "w-full h-[600px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-bold">cadet@yadika-server:~</span>
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

            {/* Tutorial Pane (Sidebar or Top) */}
            <div className={`p-4 bg-[#222] border-b border-white/10 flex flex-col gap-2 shrink-0`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-[#E95420] font-bold text-sm uppercase flex items-center gap-2">
                        <Play size={14} fill="currentColor" />
                        Step {step + 1}/{steps.length}: {steps[step].title}
                    </h3>
                    {isStepCompleted && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> COMPLETED</span>}
                </div>
                <p className="text-sm text-white/80">{steps[step].instruction}</p>
                <div className="bg-black/30 p-2 rounded border-l-2 border-[#E95420] text-xs text-secondary font-mono">
                    <span className="opacity-50">Task: </span>
                    {steps[step].task}
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

                {/* Active Input Line */}
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
