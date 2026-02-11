"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type LoginState = 'boot' | 'welcome' | 'choice' | 'login_user' | 'login_pass' | 'register_name' | 'register_discord' | 'register_pass' | 'authenticating' | 'shell';

interface TerminalProps {
    initialLines?: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ initialLines = [] }) => {
    const [lines, setLines] = useState<string[]>(initialLines);
    const [input, setInput] = useState('');
    const [loginState, setLoginState] = useState<LoginState>('boot');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { user, login, register, loading } = useAuth();
    const [formData, setFormData] = useState({ fullName: '', discord: '', password: '' });
    const hasBooted = useRef(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    // Check if already logged in
    useEffect(() => {
        if (!loading && user) {
            setLines([
                'Yadika OS 1.0.0 LTS',
                '',
                `Selamat datang kembali, ${user.fullName}!`,
                '',
                'Ketik "start" untuk melanjutkan ke challenge.',
                ''
            ]);
            setLoginState('shell');
            hasBooted.current = true;
        }
    }, [user, loading]);

    // Boot sequence
    useEffect(() => {
        if (loading || user || hasBooted.current) return;
        hasBooted.current = true;

        const bootSequence = async () => {
            const bootMessages = [
                'Yadika OS 1.0.0 LTS (GNU/Linux 5.15.0-yadika)',
                '',
                'Starting system services...',
                '[  OK  ] Started Network Manager.',
                '[  OK  ] Started CTF Challenge Server.',
                '',
            ];

            for (let i = 0; i < bootMessages.length; i++) {
                await new Promise(r => setTimeout(r, 120));
                setLines(prev => [...prev, bootMessages[i]]);
            }

            await new Promise(r => setTimeout(r, 200));
            setLines(prev => [...prev,
                'System ready. Type a command to proceed.',
                ''
            ]);
            setLoginState('choice');
        };

        bootSequence();
    }, [loading, user]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [loginState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = input.trim();
        const cmd = value.toLowerCase();

        switch (loginState) {
            case 'choice':
                if (cmd === 'login') {
                    setLines(prev => [...prev, `guest@ctf:~$ ${value}`, '', 'LOGIN', '']);
                    setLoginState('login_user');
                } else if (cmd === 'register') {
                    setLines(prev => [...prev, `guest@ctf:~$ ${value}`, '', 'REGISTER', '']);
                    setLoginState('register_name');
                } else if (cmd === 'help') {
                    setLines(prev => [...prev,
                    `guest@ctf:~$ ${value}`,
                        'Perintah tersedia:',
                        '  login    - Memulai proses masuk',
                        '  register - Membuat akun baru',
                        '  help     - Menampilkan bantuan ini',
                        '  clear    - Membersihkan layar terminal',
                        ''
                    ]);
                } else if (cmd === 'clear') {
                    setLines([]);
                } else if (cmd) {
                    setLines(prev => [...prev, `guest@ctf:~$ ${value}`, `bash: ${value}: command not found. Need help? type 'help'`, '']);
                }
                break;

            case 'login_user':
                setFormData(prev => ({ ...prev, discord: value }));
                setLines(prev => [...prev, `Username: ${value}`]);
                setLoginState('login_pass');
                break;

            case 'login_pass':
                setLines(prev => [...prev, `Password: ${'*'.repeat(value.length)}`]);
                setLoginState('authenticating');

                const loginResult = await login(formData.discord, value);
                if (loginResult.success) {
                    setLines(prev => [...prev, '', '✓ Login berhasil!', '', 'Redirecting...']);
                    window.location.href = '/dashboard';
                } else {
                    setLines(prev => [...prev, '', `✗ Error: ${loginResult.error}`, '', 'Coba lagi:', '']);
                    setFormData({ fullName: '', discord: '', password: '' });
                    setLoginState('login_user');
                }
                break;

            case 'register_name':
                setFormData(prev => ({ ...prev, fullName: value }));
                setLines(prev => [...prev, `Nama Lengkap: ${value}`]);
                setLoginState('register_discord');
                break;

            case 'register_discord':
                setFormData(prev => ({ ...prev, discord: value }));
                setLines(prev => [...prev, `Username Discord: ${value}`]);
                setLoginState('register_pass');
                break;

            case 'register_pass':
                setLines(prev => [...prev, `Password: ${'*'.repeat(value.length)}`]);
                setLoginState('authenticating');

                const registerResult = await register(formData.fullName, formData.discord, value);
                if (registerResult.success) {
                    setLines(prev => [...prev, '', '✓ Registrasi berhasil!', '', 'Redirecting...']);
                    window.location.href = '/dashboard';
                } else {
                    setLines(prev => [...prev, '', `✗ Error: ${registerResult.error}`, '', 'Coba lagi:', '']);
                    setFormData({ fullName: '', discord: '', password: '' });
                    setLoginState('register_name');
                }
                break;

            case 'shell':
                if (!value) break;
                const shellCmd = value.toLowerCase();

                if (shellCmd === 'start') {
                    setLines(prev => [...prev, `${user?.fullName || 'cadet'}@ctf:~$ ${value}`, '', 'Initializing challenge...', '[████████████████████] 100%', '']);
                    setInput('');
                    setTimeout(() => router.push('/play/1'), 1000);
                    return;
                } else if (shellCmd === 'help') {
                    setLines(prev => [...prev, `${user?.fullName || 'cadet'}@ctf:~$ ${value}`, '  start  - Mulai CTF challenge', '  help   - Tampilkan bantuan', '  clear  - Bersihkan layar', '']);
                } else if (shellCmd === 'clear') {
                    setLines([]);
                } else {
                    setLines(prev => [...prev, `${user?.fullName || 'cadet'}@ctf:~$ ${value}`, `bash: ${value}: command not found`, '']);
                }
                break;
        }

        setInput('');
    };

    const getPrompt = () => {
        switch (loginState) {
            case 'choice': return 'guest@ctf:~$ ';
            case 'login_user': return 'Username: ';
            case 'login_pass': return 'Password: ';
            case 'register_name': return 'Nama Lengkap: ';
            case 'register_discord': return 'Username Discord: ';
            case 'register_pass': return 'Password: ';
            case 'shell': return `${user?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'cadet'}@ctf:~$ `;
            default: return '';
        }
    };

    const showInput = !['boot', 'authenticating'].includes(loginState) && !loading;

    return (
        <div
            className="w-full max-w-3xl mx-auto bg-[#0a0a0c] border border-terminal/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.1)] cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="bg-[#1a1a1c] px-4 py-2 border-b border-terminal/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-terminal/70">
                    <TerminalIcon size={16} />
                    <span className="text-xs font-mono">ctf-terminal</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div ref={scrollRef} className="p-3 md:p-4 h-[320px] md:h-[400px] overflow-y-auto font-mono text-[10px] sm:text-xs md:text-sm terminal-scrollbar">
                {loading && (
                    <div className="text-terminal animate-pulse">Loading...</div>
                )}
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`whitespace-pre-wrap ${line.startsWith('[  OK  ]') ? 'text-green-500' :
                            line.startsWith('✓') ? 'text-green-400' :
                                line.startsWith('✗') ? 'text-red-400' :
                                    line.includes('═') || line.includes('║') ? 'text-primary' :
                                        'text-terminal'
                            }`}
                    >
                        {line}
                    </motion.div>
                ))}

                {showInput && (
                    <form onSubmit={handleSubmit} className="flex items-center gap-0 mt-1">
                        <span className="text-terminal whitespace-nowrap text-[10px] sm:text-xs md:text-sm">{getPrompt()}</span>
                        <input
                            ref={inputRef}
                            type={loginState.includes('pass') ? 'password' : 'text'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            className="flex-1 bg-transparent border-none outline-none text-terminal caret-terminal focus:ring-0 p-0 text-[10px] sm:text-xs md:text-sm"
                        />
                    </form>
                )}

                {loginState === 'authenticating' && (
                    <div className="text-terminal animate-pulse text-[10px] sm:text-xs md:text-sm">Processing...</div>
                )}
            </div>
        </div>
    );
};
