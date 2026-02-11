"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success';
}

export function Level7Terminal({ onFlagFound }: { onFlagFound: (flag: string) => void }) {
    const [input, setInput] = useState('');
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'Yadika Terminal v1.0.0 (I/O Redirection)', type: 'output' },
        { text: 'Target: Redirect output dari perintah "get_flag" ke file bernama "flag.txt", lalu baca file tersebut.', type: 'output' },
        { text: 'Type "help" for a list of commands.', type: 'output' },
    ]);
    const [files, setFiles] = useState<Record<string, string>>({
        'readme.txt': 'Coba gunakan redirection untuk mendapatkan flag.'
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [lines]);

    const handleCommand = (cmd: string) => {
        const fullCmd = cmd.trim();
        setLines(prev => [...prev, { text: `user@yadika:~$ ${fullCmd}`, type: 'input' }]);

        if (fullCmd === 'help') {
            setLines(prev => [...prev, { text: 'Available commands: ls, cat, get_flag, clear, help', type: 'output' }]);
            return;
        }
        if (fullCmd === 'clear') { setLines([]); return; }
        if (fullCmd === 'ls') {
            setLines(prev => [...prev, { text: Object.keys(files).join('  '), type: 'output' }]);
            return;
        }

        // Handle redirection: get_flag > flag.txt
        if (fullCmd.includes('>')) {
            const parts = fullCmd.split('>');
            const sourceCmd = parts[0].trim();
            const targetFile = parts[1].trim();

            if (sourceCmd === 'get_flag') {
                setFiles(prev => ({ ...prev, [targetFile]: 'yadika{redir_master_ok}' }));
                setLines(prev => [...prev, { text: `Output redirected to ${targetFile}`, type: 'output' }]);
                return;
            } else {
                setLines(prev => [...prev, { text: `bash: ${sourceCmd}: command not found`, type: 'error' }]);
                return;
            }
        }

        const [command, ...args] = fullCmd.split(' ');

        if (command === 'cat') {
            const filename = args[0];
            if (files[filename]) {
                const content = files[filename];
                setLines(prev => [...prev, { text: content, type: content.includes('yadika{') ? 'success' : 'output' }]);
                if (content.includes('yadika{')) onFlagFound(content);
            } else {
                setLines(prev => [...prev, { text: `cat: ${filename}: No such file or directory`, type: 'error' }]);
            }
            return;
        }

        if (command === 'get_flag') {
            setLines(prev => [...prev, { text: 'Flag is sent to standard output, but you need to save it to a file!', type: 'output' }]);
            return;
        }

        setLines(prev => [...prev, { text: `bash: ${command}: command not found`, type: 'error' }]);
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
                    className="flex-1 bg-transparent border-none outline-none text-terminal"
                    autoFocus
                />
            </div>
        </div>
    );
}
