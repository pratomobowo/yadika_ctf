"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success';
}

export function Level8Terminal({ onFlagFound }: { onFlagFound: (flag: string) => void }) {
    const [input, setInput] = useState('');
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'Yadika Terminal v1.0.0 (Environment Variables)', type: 'output' },
        { text: 'Target: Temukan flag yang disimpan di dalam Environment Variables sistem.', type: 'output' },
        { text: 'Type "help" for a list of commands.', type: 'output' },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [lines]);

    const handleCommand = (cmd: string) => {
        const fullCmd = cmd.trim();
        const [command, ...args] = fullCmd.split(' ');

        setLines(prev => [...prev, { text: `user@yadika:~$ ${fullCmd}`, type: 'input' }]);

        switch (command.toLowerCase()) {
            case 'help':
                setLines(prev => [...prev, { text: 'Available commands: ls, printenv, env, echo, clear, help', type: 'output' }]);
                break;
            case 'clear': setLines([]); break;
            case 'ls': setLines(prev => [...prev, { text: 'configs/  logs/', type: 'output' }]); break;
            case 'env':
            case 'printenv':
                setLines(prev => [
                    ...prev,
                    { text: 'SHELL=/bin/bash', type: 'output' },
                    { text: 'USER=user', type: 'output' },
                    { text: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', type: 'output' },
                    { text: 'PWD=/home/user', type: 'output' },
                    { text: 'SECRET_FLAG=yadika{env_var_found}', type: 'success' },
                    { text: 'LANG=en_US.UTF-8', type: 'output' },
                ]);
                onFlagFound('yadika{env_var_found}');
                break;
            case 'echo':
                const varName = args[0];
                if (varName === '$SECRET_FLAG') {
                    setLines(prev => [...prev, { text: 'yadika{env_var_found}', type: 'success' }]);
                    onFlagFound('yadika{env_var_found}');
                } else if (varName?.startsWith('$')) {
                    setLines(prev => [...prev, { text: '(not set)', type: 'output' }]);
                } else {
                    setLines(prev => [...prev, { text: args.join(' '), type: 'output' }]);
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
                    className="flex-1 bg-transparent border-none outline-none text-terminal text-sm"
                    autoFocus
                />
            </div>
        </div>
    );
}
