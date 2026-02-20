"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ApacheVhostTerminal({ onComplete }: { onComplete?: () => void }) {
    const { user, updateProgress } = useAuth();
    const username = user?.discord || 'cadet';

    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response' | 'success'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [isMaximized, setIsMaximized] = useState(false);

    // Mock states
    const [vhostCreated, setVhostCreated] = useState(false);
    const [vhostEnabled, setVhostEnabled] = useState(false);
    const [apacheReloaded, setApacheReloaded] = useState(false);

    // Editor Mode State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [editorFilename, setEditorFilename] = useState('');
    const [editorMessage, setEditorMessage] = useState('');

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const tutorials = [
        {
            title: "Pindah ke folder VHost",
            instruction: "Di Apache, file konfigurasi Virtual Host (VHost) disimpan di /etc/apache2/sites-available/.",
            task: "Ketik `cd /etc/apache2/sites-available/`.",
            check: (cmd: string, states: any) => states.cwd.join('/') === 'etc/apache2/sites-available'
        },
        {
            title: "Buat File VHost dengan Nano",
            instruction: "Buat file konfigurasi web baru. Anda bebas membuat web apa saja, mari namakan web1.conf.",
            task: "Ketik `sudo nano web1.conf`.",
            check: (cmd: string) => cmd.trim() === 'sudo nano web1.conf' || cmd.trim() === 'nano web1.conf'
        },
        {
            title: "Isi VHost & Simpan",
            instruction: "Ketik konfigurasi dasar apache:\n<VirtualHost *:80>\n  ServerName web1.com\n  DocumentRoot /var/www/html/web1\n</VirtualHost>",
            task: "Ketik isi file, simpan (Ctrl+O Enter), lalu keluar (Ctrl+X).",
            check: (cmd: string, states: any) => states.vhostCreated
        },
        {
            title: "Aktifkan VHost",
            instruction: "File konfigurasi sudah ada, tapi Apache belum menggunakannya. Gunakan tool bawaan Apache untuk mengaktifkannya (enable site).",
            task: "Ketik `sudo a2ensite web1.conf`.",
            check: (cmd: string) => cmd.trim() === 'sudo a2ensite web1.conf' || cmd.trim() === 'a2ensite web1.conf'
        },
        {
            title: "Reload Apache",
            instruction: "Setiap ada perubahan konfigurasi, service Apache harus di-reload agar konfigurasi baru dimuat.",
            task: "Ketik `sudo systemctl reload apache2`.",
            check: (cmd: string) => cmd.trim() === 'sudo systemctl reload apache2' || cmd.trim() === 'systemctl reload apache2'
        },
        {
            title: "Selesai",
            instruction: "Luar Biasa! Ini adalah skill utama dalam cloud hosting: membuat Virtual Host agar satu server bisa berisi banyak website.",
            task: "Ketik `exit` untuk lanjut.",
            check: (cmd: string) => cmd.trim() === 'exit'
        }
    ];

    useEffect(() => {
        if (!isEditorOpen && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [output, isEditorOpen]);

    useEffect(() => {
        if (!isEditorOpen) inputRef.current?.focus();
        else editorRef.current?.focus();
    }, [output, step, isEditorOpen]);

    useEffect(() => {
        if (output.length === 0) {
            setOutput([
                { type: "response", content: "Ubuntu 24.04 LTS (GNU/Linux 6.8.0-101 generic x86_64)" },
                { type: "response", content: <span className="text-white/60">Modul 10: Apache VirtualHost Server loaded...</span> },
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
                response = "Perintah simulasi tersedia: cd, sudo, nano, a2ensite, systemctl, ls, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'cd':
                const path = args[1];
                if (path === '/etc/apache2/sites-available' || path === '/etc/apache2/sites-available/') {
                    setCwd(['etc', 'apache2', 'sites-available']);
                } else if (!path || path === '~') {
                    setCwd(['home', 'cadet']);
                } else {
                    response = `cd: ${path}: No such file or directory`;
                }
                break;
            case 'sudo':
            case 'nano':
            case 'a2ensite':
            case 'systemctl':
                const isSudo = mainCmd === 'sudo';
                const actionCmd = isSudo ? args[1] : args[0];
                const actionSub = isSudo ? args[2] : args[1];

                if (!actionCmd) {
                    response = "sudo: missing operand";
                    break;
                }

                if (actionCmd === 'nano') {
                    if (!actionSub) {
                        response = "nano: missing filename";
                    } else {
                        setEditorFilename(actionSub);
                        setEditorContent(vhostCreated && actionSub === 'web1.conf' ? "<VirtualHost *:80>\n  ServerName web1.com\n  DocumentRoot /var/www/html/web1\n</VirtualHost>" : "");
                        setIsEditorOpen(true);
                        setTimeout(() => { if (tutorials[step]?.check(cmd, {})) completeStep(); }, 100);
                    }
                } else if (actionCmd === 'a2ensite') {
                    if (actionSub === 'web1.conf') {
                        if (!vhostCreated) {
                            newOutputLines = [{ type: 'response', content: 'ERROR: Site web1 does not exist!' }];
                        } else {
                            newOutputLines = [
                                { type: 'response', content: 'Enabling site web1.' },
                                { type: 'response', content: 'To activate the new configuration, you need to run:' },
                                { type: 'response', content: '  systemctl reload apache2' },
                            ];
                            setVhostEnabled(true);
                            setTimeout(() => { if (tutorials[step]?.check(cmd, {})) completeStep(); }, 100);
                        }
                    } else {
                        newOutputLines = [{ type: 'response', content: `ERROR: Site ${actionSub || ''} does not exist!` }];
                    }
                } else if (actionCmd === 'systemctl') {
                    if (actionSub === 'reload' && args.includes('apache2')) {
                        if (!vhostEnabled) {
                            newOutputLines = [{ type: 'response', content: 'apache2 reloaded (nothing changed).' }];
                        } else {
                            newOutputLines = []; // usually empty on success
                            setApacheReloaded(true);
                            setTimeout(() => { if (tutorials[step]?.check(cmd, {})) completeStep(); }, 100);
                        }
                    } else {
                        response = `systemctl: simulasi tidak merespon perintah ini`;
                    }
                } else {
                    response = `sudo: ${actionCmd}: command not found in simulation`;
                }
                break;
            case 'ls':
                if (cwd.join('/') === 'etc/apache2/sites-available') {
                    let list = "000-default.conf  default-ssl.conf";
                    if (vhostCreated) list += "  web1.conf";
                    response = list;
                } else {
                    response = "file.txt";
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1) {
                    await updateProgress(1010);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/11"; // Next session
                } else {
                    response = "Selesaikan tutorial terlebih dahulu.";
                }
                break;
            default:
                response = `${mainCmd}: command not found`;
        }

        if (response) setOutput(prev => [...prev, { type: 'response', content: response }]);
        if (newOutputLines.length > 0) setOutput(prev => [...prev, ...newOutputLines.map(l => ({ type: l.type, content: l.content }))]);

        // General tutorial check
        if (step !== 1 && step !== 2 && step !== 3 && step !== 4) { // Checked manually in logic above to avoid sync issues
            if (tutorials[step]?.check(cmd, { cwd })) completeStep();
        }
    };

    const handleEditorSave = () => {
        if (editorFilename === 'web1.conf') {
            setVhostCreated(true);
        }
        setEditorMessage(`[ Wrote ${editorContent.length} lines ]`);
        setTimeout(() => setEditorMessage(''), 2000);
    };

    const handleEditorExit = () => {
        setIsEditorOpen(false);
        setOutput(prev => [...prev]);
        if (step === 2 && vhostCreated) {
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

    const handleEditorKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key === 'o') { e.preventDefault(); handleEditorSave(); }
            else if (e.key === 'x') { e.preventDefault(); handleEditorExit(); }
        }
    };

    return (
        <div className={`flex flex-col bg-black border border-white/10 rounded-lg overflow-hidden font-mono shadow-2xl transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50 rounded-none border-0" : "w-full h-[600px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1c] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-2 text-white/60">
                    <TerminalIcon size={14} />
                    <span className="text-xs font-bold">{username}@ctf:{cwd[cwd.length - 1] === 'cadet' ? '~' : `/${cwd.join('/')}`}</span>
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
                <div className="bg-black/30 p-2 rounded border-l-2 border-[#E95420] text-[10px] md:text-xs text-secondary font-mono whitespace-pre-line">
                    <span className="opacity-50">Task: </span>
                    {tutorials[step].task}
                </div>
            </div>

            {/* Content Area */}
            {isEditorOpen ? (
                // NANO EDITOR SIMULATOR
                <div className="flex-1 flex flex-col bg-[#1e1e1e] text-white font-mono relative">
                    <div className="bg-white text-black px-2 flex justify-between text-sm shrink-0">
                        <span>GNU nano 7.2</span>
                        <span>File: {editorFilename}</span>
                        <span>{editorMessage || "Modified"}</span>
                    </div>
                    <textarea
                        ref={editorRef}
                        className="flex-1 bg-transparent resize-none outline-none p-2 text-white font-mono"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        onKeyDown={handleEditorKeyDown}
                    />
                    {editorMessage && (
                        <div className="bg-white text-black px-2 text-sm text-center shrink-0">
                            {editorMessage}
                        </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 p-2 text-xs border-t border-white/20 shrink-0">
                        <div className="cursor-pointer hover:bg-white/10" onClick={() => alert("Help not implemented")}>^G Help</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={handleEditorSave}><span className="font-bold">^O</span> Write Out</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={() => alert("Search not implemented")}>^W Where Is</div>
                        <div className="cursor-pointer hover:bg-white/10" onClick={handleEditorExit}><span className="font-bold">^X</span> Exit</div>
                    </div>
                </div>
            ) : (
                // STANDARD TERMINAL
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1 bg-[#0c0c0c]" onClick={() => inputRef.current?.focus()}>
                    {output.map((line, i) => (
                        <div key={i} className={`text-[10px] md:text-sm break-all font-mono ${line.type === 'success' ? 'text-green-400' : 'text-white/80'}`}>
                            {line.type === 'command' ? (
                                <div className="flex gap-2 text-white">
                                    <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                                    <span className="text-blue-400 font-bold shrink-0">{cwd[cwd.length - 1] === 'cadet' ? '~' : `/${cwd.join('/')}`} $</span>
                                    <span>{line.content}</span>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap pl-0">{line.content}</div>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-2 text-[10px] md:text-sm text-white font-mono items-center mt-2">
                        <span className="text-green-500 font-bold shrink-0">{username}@ctf:</span>
                        <span className="text-blue-400 font-bold shrink-0">{cwd[cwd.length - 1] === 'cadet' ? '~' : `/${cwd.join('/')}`} $</span>
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
