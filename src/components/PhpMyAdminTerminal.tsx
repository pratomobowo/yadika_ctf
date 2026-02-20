"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PhpMyAdminTerminal({ onComplete }: { onComplete?: () => void }) {
    const { updateProgress } = useAuth();

    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response' | 'success'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [isMaximized, setIsMaximized] = useState(false);

    // Mock states for this tutorial
    const [isAptUpdated, setIsAptUpdated] = useState(false);
    const [isPmaInstalled, setIsPmaInstalled] = useState(false);
    const [isSymlinkCreated, setIsSymlinkCreated] = useState(false);

    // Interactive Installer State
    const [installStep, setInstallStep] = useState(0);
    // 0 = inactive
    // 1 = Web server selection (apache2, lighttpd)
    // 2 = Configure dbconfig-common for phpmyadmin?

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tutorials = [
        {
            title: "Update Repository",
            instruction: "Persiapan awal, pastikan index paket kita yang terbaru.",
            task: "Ketik `sudo apt update`.",
            check: (cmd: string) => cmd.trim() === 'sudo apt update'
        },
        {
            title: "Install phpMyAdmin",
            instruction: "Kita akan mendownload tool GUI berbasis web untuk me-manage MySQL.",
            task: "Ketik `sudo apt install phpmyadmin php-mbstring php-zip php-gd php-json php-curl`. Jawab wizard dengan memilih 'apache2' dan 'Yes' ketika diminta.",
            check: (cmd: string, states: any) => states.isPmaInstalled
        },
        {
            title: "Buat Symlink ke Web Root",
            instruction: "Agar phpMyAdmin bisa diakses dari browser, kita harus mendaftarkan / melink-kan file-file pma ke direktori web server (/var/www/html).",
            task: "Ketik `sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin`.",
            check: (cmd: string) => cmd.trim() === 'sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin' || cmd.trim() === 'ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin'
        },
        {
            title: "Verifikasi Folder (Opsional)",
            instruction: "Pastikan symlink (shortcut) berhasil dibuat di dalam folder html.",
            task: "Ketik `ls /var/www/html` - kamu harusnya melihat folder 'phpmyadmin' berwarna cyan (tanda symlink).",
            check: (cmd: string) => cmd.trim() === 'ls /var/www/html' || cmd.trim() === 'ls -l /var/www/html'
        },
        {
            title: "Selesai",
            instruction: "Bagus! GUI database kini sudah siap melayani developer.",
            task: "Ketik `exit` untuk kembali ke lobi utama.",
            check: (cmd: string) => cmd.trim() === 'exit'
        }
    ];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [output]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [output, step]);

    useEffect(() => {
        if (output.length === 0) {
            setOutput([
                { type: "response", content: "Ubuntu 24.04 LTS (GNU/Linux 6.8.0-101 generic x86_64)" },
                { type: "response", content: <span className="text-white/60">Modul 9: Setup phpMyAdmin loaded...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    const processInteractiveInstall = (cmd: string) => {
        const line = cmd.trim().toLowerCase();
        let newOutputLines: { type: 'command' | 'response' | 'success'; content: string }[] = [];

        if (installStep === 1) {
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'response', content: 'Configure database for phpmyadmin with dbconfig-common?' });
            newOutputLines.push({ type: 'response', content: '  1. Yes' });
            newOutputLines.push({ type: 'response', content: '  2. No' });
            newOutputLines.push({ type: 'response', content: 'Pilihan (1/2): ' });
            setInstallStep(2);
        } else if (installStep === 2) {
            newOutputLines.push({ type: 'response', content: 'Configuring phpmyadmin... Done.' });
            newOutputLines.push({ type: 'response', content: 'Enabling conf phpmyadmin.' });
            newOutputLines.push({ type: 'response', content: 'To activate the new configuration, you need to run:' });
            newOutputLines.push({ type: 'response', content: '  systemctl reload apache2' });
            newOutputLines.push({ type: 'success', content: 'SUCCESS: phpMyAdmin installed and configured.' });
            setInstallStep(0);
            setIsPmaInstalled(true);
            setTimeout(() => { if (tutorials[1].check('', { isPmaInstalled: true })) completeStep(); }, 100);
        }

        return newOutputLines;
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input;

        setOutput([...output, { type: 'command', content: cmd }]);
        setHistory([...history, cmd]);
        setInput('');

        let response: React.ReactNode = '';
        let newOutputLines: { type: 'command' | 'response' | 'success'; content: string }[] = [];

        if (installStep > 0) {
            const lines = processInteractiveInstall(cmd);
            setOutput(prev => [...prev, ...lines.map(l => ({ type: l.type, content: l.content }))]);
            return;
        }

        const args = cmd.trim().split(/\s+/);
        const mainCmd = args[0];

        if (!mainCmd) return;

        switch (mainCmd) {
            case 'help':
                response = "Perintah simulasi tersedia: sudo, apt, ln, ls, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'sudo':
            case 'apt':
                const isSudo = mainCmd === 'sudo';
                const actionCmd = isSudo ? args[1] : args[0];
                const actionSub = isSudo ? args[2] : args[1];

                if (actionCmd === 'apt' && actionSub === 'update') {
                    newOutputLines = [
                        { type: 'response', content: 'Hit:1 http://id.archive.ubuntu.com/ubuntu noble InRelease' },
                        { type: 'response', content: 'Reading package lists... Done' },
                    ];
                    setIsAptUpdated(true);
                } else if (actionCmd === 'apt' && actionSub === 'install' && args.includes('phpmyadmin')) {
                    if (!isAptUpdated) {
                        newOutputLines = [{ type: 'response', content: 'E: Unable to locate package phpmyadmin (Simulasi: apt update dulu ya)' }];
                    } else {
                        newOutputLines = [
                            { type: 'response', content: 'Reading package lists... Done' },
                            { type: 'response', content: 'The following NEW packages will be installed:' },
                            { type: 'response', content: '  phpmyadmin php-mbstring php-zip php-gd php-json php-curl' },
                            { type: 'response', content: 'Unpacking phpmyadmin ...' },
                            { type: 'response', content: ' ' },
                            { type: 'response', content: '─────────────────┤ Configuring phpmyadmin ├─────────────────' },
                            { type: 'response', content: 'Please choose the web server that should be automatically configured to run phpMyAdmin.' },
                            { type: 'response', content: '  1. apache2' },
                            { type: 'response', content: '  2. lighttpd' },
                            { type: 'response', content: 'Pilihan (1/2): ' },
                        ];
                        setInstallStep(1);
                    }
                } else if (actionCmd === 'ln' && args.includes('-s') && args.includes('/usr/share/phpmyadmin')) {
                    if (!isPmaInstalled) {
                        newOutputLines = [{ type: 'response', content: 'ln: failed to create symbolic link: No such file or directory /usr/share/phpmyadmin' }];
                    } else {
                        newOutputLines = [];
                        setIsSymlinkCreated(true);
                        setTimeout(() => { if (tutorials[2].check(cmd, {})) completeStep(); }, 100);
                    }
                } else {
                    response = `${mainCmd}: command not found or not supported in this simulation`;
                }
                break;
            case 'ln':
                if (args.includes('-s') && args.includes('/usr/share/phpmyadmin')) {
                    if (!isPmaInstalled) {
                        newOutputLines = [{ type: 'response', content: 'ln: failed to create symbolic link: No such file or directory /usr/share/phpmyadmin' }];
                    } else {
                        newOutputLines = [];
                        setIsSymlinkCreated(true);
                        setTimeout(() => { if (tutorials[2].check(cmd, {})) completeStep(); }, 100);
                    }
                } else {
                    response = `ln: command not found or not supported`;
                }
                break;
            case 'ls':
                if (args.includes('/var/www/html')) {
                    const pmaStr = isSymlinkCreated ? '\x1b[36mphpmyadmin\x1b[0m' : '';
                    newOutputLines = [
                        { type: 'response', content: `\x1b[32mindex.html\x1b[0m  ${pmaStr}` }
                    ];
                    setTimeout(() => { if (tutorials[3].check(cmd, {})) completeStep(); }, 100);
                } else {
                    response = `index.html`;
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1009);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/10"; // Next session
                } else {
                    response = "Selesaikan tutorial terlebih dahulu.";
                }
                break;
            default:
                response = `${mainCmd}: command not found`;
        }

        if (response) setOutput(prev => [...prev, { type: 'response', content: response }]);
        if (newOutputLines.length > 0) setOutput(prev => [...prev, ...newOutputLines.map(l => ({ type: l.type, content: l.content }))]);

        if (installStep === 0) {
            if (tutorials[step].check(cmd, { isPmaInstalled })) completeStep();
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

    let promptPrefix = <><span className="text-green-500 font-bold shrink-0">cadet@ctf:</span><span className="text-blue-400 font-bold shrink-0">~ $</span></>;
    if (installStep > 0) promptPrefix = <span className="text-white shrink-0">&gt;</span>;

    return (
        <div className={`flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden font-mono shadow-2xl transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50 rounded-none border-0" : "w-full h-[600px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-bold">cadet@ctf:~</span>
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
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1 bg-[#0c0c0c]" onClick={() => inputRef.current?.focus()}>
                {output.map((line, i) => (
                    <div key={i} className={`text-[10px] md:text-sm break-all font-mono ${line.type === 'success' ? 'text-green-400' : 'text-white/80'}`}>
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                {line.content === '1' || line.content === '2' || line.content === 'y' || line.content === 'Y' ? <span className="text-white shrink-0">&gt;</span> : promptPrefix}
                                <span>{line.content}</span>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap pl-0">{line.content}</div>
                        )}
                    </div>
                ))}

                {/* Active Input */}
                <div className="flex gap-2 text-[10px] md:text-sm text-white font-mono items-center mt-2">
                    {promptPrefix}
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
