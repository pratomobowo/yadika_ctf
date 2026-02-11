"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success';
}

export function Level6Terminal({ onFlagFound }: { onFlagFound: (flag: string) => void }) {
    const [input, setInput] = useState('');
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'Yadika Terminal v1.0.0 (Process Hunting)', type: 'output' },
        { text: 'Target: Cari Process ID (PID) dari process "hacker_service".', type: 'output' },
        { text: 'Type "help" for a list of commands.', type: 'output' },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const handleCommand = (cmd: string) => {
        const fullCmd = cmd.trim();
        const [command, ...args] = fullCmd.split(' ');

        setLines(prev => [...prev, { text: `user@yadika:~$ ${fullCmd}`, type: 'input' }]);

        switch (command.toLowerCase()) {
            case 'help':
                setLines(prev => [...prev, { text: 'Available commands: ls, cat, ps, grep, clear, help', type: 'output' }]);
                break;
            case 'clear':
                setLines([]);
                break;
            case 'ls':
                setLines(prev => [...prev, { text: 'nothing_here.txt', type: 'output' }]);
                break;
            case 'ps':
                if (args.includes('aux') || args.includes('-ef')) {
                    setLines(prev => [
                        ...prev,
                        { text: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND', type: 'output' },
                        { text: 'root         1  0.0  0.1  10240  2048 ?        Ss   09:00   0:00 /init', type: 'output' },
                        { text: 'www-data    42  0.0  0.5  45000  8192 ?        S    09:01   0:00 nginx', type: 'output' },
                        { text: 'hacker     999  0.1  0.2  15000  4096 ?        S    09:05   0:01 hacker_service --key=yadika{ps_aux_grep}', type: 'output' },
                        { text: 'user      1002  0.0  0.1  12000  2048 ?        R    12:00   0:00 ps aux', type: 'output' },
                    ]);
                } else {
                    setLines(prev => [
                        ...prev,
                        { text: '  PID TTY          TIME CMD', type: 'output' },
                        { text: ' 1002 pts/0    00:00:00 ps', type: 'output' },
                    ]);
                }
                break;
            case 'grep':
                setLines(prev => [...prev, { text: 'Usage: grep <pattern> [file]', type: 'error' }]);
                break;
            default:
                if (fullCmd.includes('ps') && fullCmd.includes('|') && fullCmd.includes('grep')) {
                    if (fullCmd.includes('hacker')) {
                        setLines(prev => [...prev, { text: 'hacker     999  0.1  0.2  15000  4096 ?        S    09:05   0:01 hacker_service --key=yadika{ps_aux_grep}', type: 'success' }]);
                        onFlagFound('yadika{ps_aux_grep}');
                    } else {
                        setLines(prev => [...prev, { text: '(no output)', type: 'output' }]);
                    }
                } else {
                    setLines(prev => [...prev, { text: `bash: ${command}: command not found`, type: 'error' }]);
                }
        }
    };

    return (
        <div className="bg-black/90 border border-terminal/20 rounded-lg p-4 font-mono text-sm h-[400px] flex flex-col shadow-2xl">
            <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-1 scrollbar-thin scrollbar-thumb-terminal/20">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'input' ? 'text-primary' : 'text-terminal/80'}`}>
                        {line.text}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 border-t border-terminal/10 pt-3">
                <span className="text-primary font-bold">user@yadika:~$</span>
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
                    className="flex-1 bg-transparent border-none outline-none text-terminal ring-0 border-0 p-0"
                    autoFocus
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
