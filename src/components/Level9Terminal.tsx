"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success';
}

export function Level9Terminal({ onFlagFound }: { onFlagFound: (flag: string) => void }) {
    const [input, setInput] = useState('');
    const [pwd, setPwd] = useState('/home/user');
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'Yadika Terminal v1.0.0 (Web Directory Recon)', type: 'output' },
        { text: 'Target: Periksa folder default web server (Apache/Nginx) dan temukan flag rahasia.', type: 'output' },
        { text: 'Type "help" for a list of commands.', type: 'output' },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [lines]);

    const fs: Record<string, string[]> = {
        '/home/user': ['notes.txt'],
        '/var/www/html': ['index.html', '.hidden_backup'],
        '/var/www/html/.hidden_backup': ['flag_backup.txt'],
    };

    const files: Record<string, string> = {
        '/home/user/notes.txt': 'Web server ada di /var/www/html',
        '/var/www/html/index.html': '<html><body>Yadika SMK CTF</body></html>',
        '/var/www/html/.hidden_backup/flag_backup.txt': 'yadika{web_root_explorer}',
    };

    const handleCommand = (cmd: string) => {
        const fullCmd = cmd.trim();
        const [command, ...args] = fullCmd.split(' ');

        setLines(prev => [...prev, { text: `user@yadika:${pwd}$ ${fullCmd}`, type: 'input' }]);

        switch (command.toLowerCase()) {
            case 'help':
                setLines(prev => [...prev, { text: 'Available commands: ls, cd, cat, pwd, clear, help', type: 'output' }]);
                break;
            case 'clear': setLines([]); break;
            case 'pwd': setLines(prev => [...prev, { text: pwd, type: 'output' }]); break;
            case 'ls':
                const items = fs[pwd] || [];
                if (args.includes('-a')) {
                    setLines(prev => [...prev, { text: items.join('  '), type: 'output' }]);
                } else {
                    setLines(prev => [...prev, { text: items.filter(i => !i.startsWith('.')).join('  '), type: 'output' }]);
                }
                break;
            case 'cd':
                let target = args[0] || '/home/user';
                if (target.startsWith('/')) {
                    // absolute
                } else if (target === '..') {
                    const parts = pwd.split('/').filter(Boolean);
                    parts.pop();
                    target = '/' + parts.join('/');
                } else {
                    target = (pwd === '/' ? '/' : pwd + '/') + target;
                }
                if (fs[target] || target === '/') {
                    setPwd(target === '' ? '/' : target);
                } else {
                    setLines(prev => [...prev, { text: `cd: ${target}: No such directory`, type: 'error' }]);
                }
                break;
            case 'cat':
                const filename = args[0];
                const fullPath = filename.startsWith('/') ? filename : (pwd === '/' ? '/' : pwd + '/') + filename;
                if (files[fullPath]) {
                    setLines(prev => [...prev, { text: files[fullPath], type: files[fullPath].includes('yadika{') ? 'success' : 'output' }]);
                    if (files[fullPath].includes('yadika{')) onFlagFound(files[fullPath]);
                } else {
                    setLines(prev => [...prev, { text: `cat: ${filename}: No such file`, type: 'error' }]);
                }
                break;
            default:
                setLines(prev => [...prev, { text: `bash: ${command}: command not found`, type: 'error' }]);
        }
    };

    return (
        <div className="bg-black/90 border border-terminal/20 rounded-lg p-4 font-mono text-sm h-[400px] flex flex-col shadow-2xl">
            <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-1">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'input' ? 'text-primary' : 'text-terminal/80'}`}>
                        {line.text}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 border-t border-terminal/10 pt-3 text-sm">
                <span className="text-primary font-bold">user@yadika:{pwd}$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            handleCommand(input);
                            setInput('');
                        }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-terminal"
                    autoFocus
                />
            </div>
        </div>
    );
}
