"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success';
}

export function Level10Terminal({ onFlagFound }: { onFlagFound: (flag: string) => void }) {
    const [input, setInput] = useState('');
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'Yadika Terminal v1.0.0 (The Bash Runner)', type: 'output' },
        { text: 'Target: Jalankan script "collect_flag.sh" dengan menaruh parameter "YADIKA_SIAP" untuk mengambil flag.', type: 'output' },
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

        if (fullCmd === './collect_flag.sh' || command === 'sh' || command === 'bash') {
            const arg = command === './collect_flag.sh' ? args[0] : (args[0]?.includes('collect') ? args[1] : null);

            if (arg === 'YADIKA_SIAP') {
                setLines(prev => [
                    ...prev,
                    { text: 'Authenticating...', type: 'output' },
                    { text: 'Verification success!', type: 'output' },
                    { text: 'yadika{bash_script_hero}', type: 'success' },
                ]);
                onFlagFound('yadika{bash_script_hero}');
            } else {
                setLines(prev => [
                    ...prev,
                    { text: 'Error: WRONG PASSWORD', type: 'error' },
                    { text: 'Usage: ./collect_flag.sh <PASSWORD>', type: 'output' },
                ]);
            }
            return;
        }

        switch (command.toLowerCase()) {
            case 'help':
                setLines(prev => [...prev, { text: 'Available commands: ls, cat, chmod, clear, help', type: 'output' }]);
                break;
            case 'clear': setLines([]); break;
            case 'ls':
                setLines(prev => [...prev, { text: 'collect_flag.sh  README.txt', type: 'output' }]);
                break;
            case 'cat':
                if (args[0] === 'collect_flag.sh') {
                    setLines(prev => [...prev, { text: '#!/bin/bash\nif [ "$1" == "YADIKA_SIAP" ]; then\n  echo $FLAG\nelse\n  echo "Wrong"\nfi', type: 'output' }]);
                } else if (args[0] === 'README.txt') {
                    setLines(prev => [...prev, { text: 'Jalankan script ini dengan password yang benar.', type: 'output' }]);
                } else {
                    setLines(prev => [...prev, { text: 'cat: file not found', type: 'error' }]);
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
                    className="flex-1 bg-transparent border-none outline-none text-terminal px-0 py-0"
                    autoFocus
                />
            </div>
        </div>
    );
}
