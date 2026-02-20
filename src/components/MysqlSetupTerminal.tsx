"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MysqlSetupTerminal({ onComplete }: { onComplete?: () => void }) {
    const { updateProgress } = useAuth();

    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'command' | 'response' | 'success'; content: React.ReactNode }[]>([]);
    const [cwd, setCwd] = useState<string[]>(['home', 'cadet']);
    const [isMaximized, setIsMaximized] = useState(false);

    // Mock states for this tutorial
    const [isAptUpdated, setIsAptUpdated] = useState(false);
    const [isMysqlInstalled, setIsMysqlInstalled] = useState(false);
    const [isMysqlRunning, setIsMysqlRunning] = useState(false);
    const [isMysqlSecured, setIsMysqlSecured] = useState(false);

    // Interactive Secure Installation State
    const [secureInstallStep, setSecureInstallStep] = useState(0);
    // 0 = completely inactive
    // 1 = waiting for Y/n to VALIDATE PASSWORD COMPONENT
    // 2 = waiting for password strength (0, 1, 2)
    // 3 = waiting for new root password
    // 4 = waiting for remove anonymous users Y/n

    // Interactive mysql prompt state
    const [isMysqlPrompt, setIsMysqlPrompt] = useState(false);
    const [waitingForMysqlPass, setWaitingForMysqlPass] = useState(false);

    // Tutorial State
    const [step, setStep] = useState(0);
    const [isStepCompleted, setIsStepCompleted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const tutorials = [
        {
            title: "Update Repository",
            instruction: "Ritual wajib sebelum instalasi: perbarui daftar paket agar sistem tahu versi terbaru MySQL.",
            task: "Ketik `sudo apt update`.",
            check: (cmd: string) => cmd.trim() === 'sudo apt update'
        },
        {
            title: "Install MySQL Server",
            instruction: "Install database engine MySQL.",
            task: "Ketik `sudo apt install mysql-server`.",
            check: (cmd: string) => cmd.trim() === 'sudo apt install mysql-server'
        },
        {
            title: "Amankan Instalasi (Secure Install)",
            instruction: "Berbeda dengan aplikasi lain, MySQL perlu pengaturan keamanan awal (menghapus user anonym, setup password root).",
            task: "Ketik `sudo mysql_secure_installation`. Panduan: jawab dengan 'y' atau masukkan password saat diminta.",
            check: (cmd: string, states: any) => states.isMysqlSecured
        },
        {
            title: "Login ke MySQL Prompt",
            instruction: "Mari tes login ke dalam shell MySQL sebagai user root.",
            task: "Ketik `sudo mysql` atau `mysql -u root -p`. Jika diminta password, isi secara bebas.",
            check: (cmd: string, states: any) => states.isMysqlPrompt
        },
        {
            title: "Keluar & Selesai",
            instruction: "Kamu sudah berhasil mengontrol database MySQL langsung dari command line!",
            task: "Ketik `exit` untuk keluar dari prompt MySQL, kemudian ketik `exit` lagi untuk menyelesaikan modul.",
            check: (cmd: string) => cmd.trim() === 'exit' && !isMysqlPrompt // check if they are completely exiting
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
                { type: "response", content: <span className="text-white/60">Modul 8: Setup Database MySQL loaded...</span> },
                { type: "response", content: " " },
            ]);
        }
    }, []);

    const processInteractiveSecureInstall = (cmd: string) => {
        const line = cmd.trim().toLowerCase();
        let newOutputLines: { type: 'command' | 'response' | 'success'; content: string }[] = [];

        if (secureInstallStep === 1) {
            newOutputLines.push({ type: 'response', content: 'There are three levels of password validation policy:' });
            newOutputLines.push({ type: 'response', content: 'LOW    Length >= 8' });
            newOutputLines.push({ type: 'response', content: 'MEDIUM Length >= 8, numeric, mixed case, and special characters' });
            newOutputLines.push({ type: 'response', content: 'STRONG Length >= 8, numeric, mixed case, special characters and dictionary file' });
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'response', content: 'Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: ' });
            setSecureInstallStep(2);
        } else if (secureInstallStep === 2) {
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'response', content: 'Please set the password for root here.' });
            newOutputLines.push({ type: 'response', content: 'New password: ' });
            setSecureInstallStep(3);
        } else if (secureInstallStep === 3) {
            newOutputLines.push({ type: 'response', content: 'Re-enter new password: ' });
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'response', content: 'Remove anonymous users? (Press y|Y for Yes, any other key for No) : ' });
            setSecureInstallStep(4);
        } else if (secureInstallStep === 4) {
            newOutputLines.push({ type: 'response', content: 'Success.' });
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'response', content: 'Disallow root login remotely? (Press y|Y for Yes, any other key for No) : ' });
            newOutputLines.push({ type: 'response', content: 'Success.' });
            newOutputLines.push({ type: 'response', content: 'Remove test database and access to it? (Press y|Y) : ' });
            newOutputLines.push({ type: 'response', content: 'Success.' });
            newOutputLines.push({ type: 'response', content: 'Reload privilege tables now? (Press y|Y) : ' });
            newOutputLines.push({ type: 'response', content: 'Success.' });
            newOutputLines.push({ type: 'response', content: ' ' });
            newOutputLines.push({ type: 'success', content: 'All done! If you\'ve completed all of the above steps, your MySQL installation should now be secure.' });
            setSecureInstallStep(0);
            setIsMysqlSecured(true);
            setTimeout(() => { if (tutorials[2].check('', { isMysqlSecured: true })) completeStep(); }, 100);
        }

        return newOutputLines;
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input;

        // Hide password input
        const displayCmd = waitingForMysqlPass ? '********' : cmd;
        setOutput([...output, { type: 'command', content: displayCmd }]);
        if (!waitingForMysqlPass) setHistory([...history, cmd]);
        setInput('');

        let response: React.ReactNode = '';
        let newOutputLines: { type: 'command' | 'response' | 'success'; content: string }[] = [];

        // 1. Handlers for active interactive modes
        if (waitingForMysqlPass) {
            setWaitingForMysqlPass(false);
            setIsMysqlPrompt(true);
            newOutputLines.push({ type: 'response', content: 'Welcome to the MySQL monitor.  Commands end with ; or \\g.' });
            newOutputLines.push({ type: 'response', content: 'Your MySQL connection id is 8' });
            newOutputLines.push({ type: 'response', content: 'Server version: 8.0.35-0ubuntu0.22.04.1 (Ubuntu)' });
            setTimeout(() => { if (tutorials[3].check('', { isMysqlPrompt: true })) completeStep(); }, 100);
            setOutput(prev => [...prev, ...newOutputLines.map(l => ({ type: l.type, content: l.content }))]);
            return;
        }

        if (secureInstallStep > 0) {
            const lines = processInteractiveSecureInstall(cmd);
            setOutput(prev => [...prev, ...lines.map(l => ({ type: l.type, content: l.content }))]);
            return;
        }

        if (isMysqlPrompt) {
            const trimmed = cmd.trim().toLowerCase();
            if (trimmed === 'exit' || trimmed === 'quit') {
                setIsMysqlPrompt(false);
                response = 'Bye';
            } else if (trimmed === 'show databases;') {
                newOutputLines.push({ type: 'response', content: '+--------------------+' });
                newOutputLines.push({ type: 'response', content: '| Database           |' });
                newOutputLines.push({ type: 'response', content: '+--------------------+' });
                newOutputLines.push({ type: 'response', content: '| information_schema |' });
                newOutputLines.push({ type: 'response', content: '| mysql              |' });
                newOutputLines.push({ type: 'response', content: '| performance_schema |' });
                newOutputLines.push({ type: 'response', content: '| sys                |' });
                newOutputLines.push({ type: 'response', content: '+--------------------+' });
                newOutputLines.push({ type: 'response', content: '4 rows in set (0.00 sec)' });
            } else if (trimmed !== '') {
                response = "ERROR 1064 (42000): You have an error in your SQL syntax; (Simulated)";
            }
            if (response) setOutput(prev => [...prev, { type: 'response', content: response }]);
            if (newOutputLines.length > 0) setOutput(prev => [...prev, ...newOutputLines]);
            return;
        }

        // 2. Standard Shell Handlers
        const args = cmd.trim().split(/\s+/);
        const mainCmd = args[0];

        if (!mainCmd) return;

        switch (mainCmd) {
            case 'help':
                response = "Perintah simulasi tersedia: sudo, apt, mysql_secure_installation, mysql, clear, exit";
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'sudo':
                if (args[1] === 'apt' && args[2] === 'update') {
                    newOutputLines = [
                        { type: 'response', content: 'Hit:1 http://id.archive.ubuntu.com/ubuntu noble InRelease' },
                        { type: 'response', content: 'Reading package lists... Done' },
                    ];
                    setIsAptUpdated(true);
                } else if (args[1] === 'apt' && args[2] === 'install' && args[3] === 'mysql-server') {
                    if (!isAptUpdated) {
                        newOutputLines = [{ type: 'response', content: 'E: Unable to locate package mysql-server (Simulasi: apt update dulu ya)' }];
                    } else {
                        newOutputLines = [
                            { type: 'response', content: 'Reading package lists... Done' },
                            { type: 'response', content: 'The following NEW packages will be installed:' },
                            { type: 'response', content: '  mysql-client-8.0 mysql-server mysql-server-8.0' },
                            { type: 'response', content: 'Unpacking mysql-server-8.0 ...' },
                            { type: 'response', content: 'Setting up mysql-server-8.0 ...' },
                            { type: 'success', content: 'SUCCESS: MySQL installed.' },
                        ];
                        setIsMysqlInstalled(true);
                        setIsMysqlRunning(true);
                    }
                } else if (args[1] === 'mysql_secure_installation') {
                    if (!isMysqlInstalled) {
                        response = 'mysql_secure_installation: command not found';
                    } else {
                        newOutputLines = [
                            { type: 'response', content: 'Connecting to MySQL using a blank password.' },
                            { type: 'response', content: ' ' },
                            { type: 'response', content: 'VALIDATE PASSWORD COMPONENT can be used to test passwords' },
                            { type: 'response', content: 'and improve security. It checks the strength of password' },
                            { type: 'response', content: 'and allows the users to set only those passwords which are' },
                            { type: 'response', content: 'secure enough. Would you like to setup VALIDATE PASSWORD component?' },
                            { type: 'response', content: ' ' },
                            { type: 'response', content: 'Press y|Y for Yes, any other key for No: ' },
                        ];
                        setSecureInstallStep(1);
                    }
                } else if (args[1] === 'mysql') {
                    if (!isMysqlInstalled) {
                        response = 'mysql: command not found';
                    } else {
                        newOutputLines.push({ type: 'response', content: 'Welcome to the MySQL monitor.  Commands end with ; or \\g.' });
                        setIsMysqlPrompt(true);
                        setTimeout(() => { if (tutorials[3].check('', { isMysqlPrompt: true })) completeStep(); }, 100);
                    }
                } else {
                    response = `sudo: ${args[1]}: simulator not responding to this`;
                }
                break;
            case 'mysql':
                if (!isMysqlInstalled) {
                    response = 'Command \'mysql\' not found, but can be installed with: sudo apt install mysql-client-core-8.0';
                } else if (args.includes('-u') && args.includes('root')) {
                    if (args.includes('-p')) {
                        newOutputLines.push({ type: 'response', content: 'Enter password: ' });
                        setWaitingForMysqlPass(true);
                    } else {
                        response = 'ERROR 1045 (28000): Access denied for user \'root\'@\'localhost\' (using password: NO)';
                    }
                } else {
                    response = 'ERROR 1045 (28000): Access denied for user \'cadet\'@\'localhost\' (using password: NO)';
                }
                break;
            case 'exit':
                if (step === tutorials.length - 1 && !isMysqlPrompt) {
                    await updateProgress(1008);
                    if (onComplete) onComplete();
                    window.location.href = "/play/session/9"; // Next session
                } else {
                    response = "Selesaikan tutorial terlebih dahulu.";
                }
                break;
            default:
                response = `${mainCmd}: command not found`;
        }

        if (response) setOutput(prev => [...prev, { type: 'response', content: response }]);
        else if (newOutputLines.length > 0) setOutput(prev => [...prev, ...newOutputLines.map(l => ({ type: l.type, content: l.content }))]);

        // General tutorial check
        if (tutorials[step].check(cmd, { isMysqlSecured, isMysqlPrompt })) completeStep();
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

    // Determine prefix
    let promptPrefix = <><span className="text-green-500 font-bold shrink-0">cadet@ctf:</span><span className="text-blue-400 font-bold shrink-0">~ $</span></>;
    if (isMysqlPrompt) promptPrefix = <span className="text-white font-bold shrink-0">mysql&gt;</span>;
    if (waitingForMysqlPass) promptPrefix = <span className="text-white shrink-0">Enter password:</span>;
    if (secureInstallStep > 0) promptPrefix = <span className="text-white shrink-0">&gt;</span>;

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
                                {line.content === '********' ? <span className="text-white shrink-0">Enter password:</span> : (line.content === 'QUIT' ? <span className="text-white font-bold shrink-0">mysql&gt;</span> : <><span className="text-green-500 font-bold shrink-0">cadet@ctf:</span><span className="text-blue-400 font-bold shrink-0">~ $</span></>)}
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
                            type={waitingForMysqlPass ? "password" : "text"}
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
