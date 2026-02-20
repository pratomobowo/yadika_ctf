"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ApacheServerTerminal({ onComplete }: { onComplete?: () => void }) {
    const { user, updateProgress } = useAuth();
    const username = user?.discord || 'cadet';

    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response' | 'success'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [isMaximized, setIsMaximized] = useState(false);

    // Mock states for this tutorial
    const [isAptUpdated, setIsAptUpdated] = useState(false);
    const [isApacheInstalled, setIsApacheInstalled] = useState(false);
    const [isApacheRunning, setIsApacheRunning] = useState(false);

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tutorials = [
        {
            title: "Update Repository",
            instruction: "Sebagai SysAdmin, langkah pertama sebelum menginstall aplikasi adalah memperbarui daftar paket (repository) agar mendapatkan versi terbaru.",
            task: "Ketik `sudo apt update`.",
            check: (cmd: string) => cmd.trim() === 'sudo apt update'
        },
        {
            title: "Install Apache Web Server",
            instruction: "Setelah update, mari install Apache (salah satu web server paling populer di dunia Linux).",
            task: "Ketik `sudo apt install apache2`.",
            check: (cmd: string) => cmd.trim() === 'sudo apt install apache2'
        },
        {
            title: "Jalankan Service Apache",
            instruction: "Aplikasi sudah terinstall, saatnya menjalankannya melalui systemd (service manager di Ubuntu/Debian).",
            task: "Ketik `sudo systemctl start apache2`.",
            check: (cmd: string) => cmd.trim() === 'sudo systemctl start apache2' || cmd.trim() === 'systemctl start apache2'
        },
        {
            title: "Cek Status Apache",
            instruction: "Pastikan service Apache benar-benar berjalan tanpa error dengan mengecek statusnya.",
            task: "Ketik `sudo systemctl status apache2`.",
            check: (cmd: string) => cmd.trim() === 'sudo systemctl status apache2' || cmd.trim() === 'systemctl status apache2'
        },
        {
            title: "Selesai",
            instruction: "Luar biasa! Server web Apache Anda sekarang aktif dan berjalan. Jika ini server sungguhan, Anda bisa mengaksesnya via IP server.",
            task: "Ketik `exit` untuk menyelesaikan modul ini.",
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
                { type: "response", content: <span className="text-white/60">Modul 6: Web Server Apache loaded...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        setOutput([...output, { type: 'command', content: cmd }]);
        setHistory([...history, cmd]);
        setInput('');

        const args = cmd.split(/\s+/);
        const mainCmd = args[0];

        let response: React.ReactNode = '';
        let newOutputLines: { type: 'command' | 'response' | 'success'; content: string }[] = [];

        switch (mainCmd) {
            case 'help':
                response = "Perintah simulasi tersedia: sudo, apt, systemctl, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'sudo':
                if (args[1] === 'apt' && args[2] === 'update') {
                    newOutputLines = [
                        { type: 'response', content: 'Hit:1 http://id.archive.ubuntu.com/ubuntu noble InRelease' },
                        { type: 'response', content: 'Get:2 http://id.archive.ubuntu.com/ubuntu noble-updates InRelease [89.7 kB]' },
                        { type: 'response', content: 'Get:3 http://security.ubuntu.com/ubuntu noble-security InRelease [89.7 kB]' },
                        { type: 'response', content: 'Fetched 179 kB in 1s (180 kB/s)' },
                        { type: 'response', content: 'Reading package lists... Done' },
                        { type: 'response', content: 'Building dependency tree... Done' },
                        { type: 'response', content: 'Reading state information... Done' },
                    ];
                    setIsAptUpdated(true);
                } else if (args[1] === 'apt' && args[2] === 'install' && args[3] === 'apache2') {
                    if (!isAptUpdated) {
                        newOutputLines = [
                            { type: 'response', content: 'Reading package lists... Done' },
                            { type: 'response', content: 'Building dependency tree... Done' },
                            { type: 'response', content: 'E: Unable to locate package apache2 (Simulasi: Jalankan apt update dulu ya!)' },
                        ];
                    } else {
                        newOutputLines = [
                            { type: 'response', content: 'Reading package lists... Done' },
                            { type: 'response', content: 'Building dependency tree... Done' },
                            { type: 'response', content: 'The following NEW packages will be installed:' },
                            { type: 'response', content: '  apache2 apache2-bin apache2-data apache2-utils' },
                            { type: 'response', content: '0 upgraded, 4 newly installed, 0 to remove and 0 not upgraded.' },
                            { type: 'response', content: 'Need to get 1,514 kB of archives.' },
                            { type: 'response', content: 'After this operation, 5,340 kB of additional disk space will be used.' },
                            { type: 'response', content: 'Get:1 http://id.archive.ubuntu.com/ubuntu noble/main amd64 apache2 amd64 2.4.58-1ubuntu8 [101 kB]' },
                            { type: 'response', content: 'Selecting previously unselected package apache2.' },
                            { type: 'response', content: 'Preparing to unpack .../apache2_2.4.58-1ubuntu8_amd64.deb ...' },
                            { type: 'response', content: 'Unpacking apache2 (2.4.58-1ubuntu8) ...' },
                            { type: 'response', content: 'Setting up apache2 (2.4.58-1ubuntu8) ...' },
                            { type: 'success', content: 'SUCCESS: Apache2 installed.' },
                        ];
                        setIsApacheInstalled(true);
                    }
                } else if ((args[1] === 'systemctl' || cmd.startsWith('systemctl')) && args.includes('start') && args.includes('apache2')) {
                    if (!isApacheInstalled) {
                        newOutputLines = [
                            { type: 'response', content: 'Failed to start apache2.service: Unit apache2.service not found.' }
                        ];
                    } else {
                        newOutputLines = []; // Systemctl start usually has no output on success
                        setIsApacheRunning(true);
                    }
                } else if ((args[1] === 'systemctl' || cmd.startsWith('systemctl')) && args.includes('status') && args.includes('apache2')) {
                    if (!isApacheInstalled) {
                        newOutputLines = [
                            { type: 'response', content: 'Unit apache2.service could not be found.' }
                        ];
                    } else {
                        const statusColor = isApacheRunning ? '\x1b[32mactive (running)\x1b[0m' : 'inactive (dead)';
                        const statusDot = isApacheRunning ? '●' : '○';
                        newOutputLines = [
                            { type: 'response', content: `${statusDot} apache2.service - The Apache HTTP Server` },
                            { type: 'response', content: `     Loaded: loaded (/usr/lib/systemd/system/apache2.service; enabled; preset: enabled)` },
                            { type: 'response', content: `     Active: ${isApacheRunning ? 'active (running)' : 'inactive (dead)'} since ${new Date().toLocaleTimeString()} WIB` },
                            { type: 'response', content: `       Docs: https://httpd.apache.org/docs/2.4/` },
                            { type: 'response', content: `   Main PID: 1234 (apache2)` },
                            { type: 'response', content: `      Tasks: 55 (limit: 4614)` },
                            { type: 'response', content: `     Memory: 5.1M (peak: 6.2M)` },
                        ];
                    }
                } else {
                    response = `sudo: ${args[1]}: command not found or not supported in this simulation`;
                }
                break;
            case 'systemctl':
                // Pass through to sudo logic for simplicity if they forget sudo
                const proxyArgs = ['sudo', ...args];
                if (proxyArgs[2] === 'start' && proxyArgs[3] === 'apache2') {
                    if (!isApacheInstalled) {
                        newOutputLines = [
                            { type: 'response', content: 'Failed to start apache2.service: Unit apache2.service not found.' }
                        ];
                    } else {
                        newOutputLines = [];
                        setIsApacheRunning(true);
                    }
                } else if (proxyArgs[2] === 'status' && proxyArgs[3] === 'apache2') {
                    if (!isApacheInstalled) {
                        newOutputLines = [
                            { type: 'response', content: 'Unit apache2.service could not be found.' }
                        ];
                    } else {
                        const statusDot = isApacheRunning ? '●' : '○';
                        newOutputLines = [
                            { type: 'response', content: `${statusDot} apache2.service - The Apache HTTP Server` },
                            { type: 'response', content: `     Loaded: loaded (/usr/lib/systemd/system/apache2.service; enabled; preset: enabled)` },
                            { type: 'response', content: `     Active: ${isApacheRunning ? 'active (running)' : 'inactive (dead)'} since ${new Date().toLocaleTimeString()} WIB` },
                            { type: 'response', content: `   Main PID: 1234 (apache2)` },
                        ];
                    }
                } else {
                    response = `systemctl: command not found or not supported without sudo in this simulation`;
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1006);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/7"; // Next session
                } else {
                    response = "Selesaikan tutorial terlebih dahulu.";
                }
                break;
            default:
                response = `${mainCmd}: command not found`;
        }

        if (response) {
            setOutput(prev => [...prev, { type: 'response', content: response }]);
        } else if (newOutputLines.length > 0) {
            setOutput(prev => [...prev, ...newOutputLines.map(l => ({ type: l.type, content: l.content }))]);
        }

        // Check completion
        if (tutorials[step].check(cmd)) {
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
                    <span className="text-xs font-bold">{username}@ctf:~</span>
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

            {/* STANDARD TERMINAL */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1 bg-[#0c0c0c]"
                onClick={() => inputRef.current?.focus()}
            >
                {output.map((line, i) => (
                    <div key={i} className={`text-[10px] md:text-sm break-all font-mono ${line.type === 'success' ? 'text-green-400' : 'text-white/80'}`}>
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                                <span className="text-blue-400 font-bold shrink-0">~ $</span>
                                <span>{line.content}</span>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap pl-0">
                                {line.content}
                            </div>
                        )}
                    </div>
                ))}

                {/* Active Input */}
                <div className="flex gap-2 text-[10px] md:text-sm text-white font-mono items-center mt-2">
                    <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                    <span className="text-blue-400 font-bold shrink-0">~ $</span>
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
