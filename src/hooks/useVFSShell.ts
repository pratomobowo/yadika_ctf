import { useState, useCallback, FormEvent } from 'react';
import { useTerminalShell, TerminalLine } from './useTerminalShell';
import { FileNode, resolvePath, getNode, updateVFS } from '@/lib/vfsUtils';

interface VFSShellOptions {
    initialFilesystem: FileNode;
    initialPath?: string;
    onFlagFound?: (flag: string) => void;
    user?: string;
    hostname?: string;
    levelTitle: string;
    customCommands?: (command: string, args: string[], currentPath: string, addLines: (lines: TerminalLine[]) => void) => boolean;
    initialEnv?: Record<string, string>;
    levelId: number;
}

export const useVFSShell = (options: VFSShellOptions) => {
    const {
        initialFilesystem,
        initialPath = '/home/guest',
        onFlagFound,
        user = 'guest',
        hostname = 'ctf',
        levelTitle,
        customCommands,
        levelId
    } = options;

    const shell = useTerminalShell([
        { text: `Yadika Virtual Shell v1.0 — ${levelTitle}`, type: 'output' },
        { text: 'Ketik "help" untuk melihat daftar perintah.', type: 'output' },
        { text: '', type: 'output' }
    ]);

    const [filesystem, setFilesystem] = useState<FileNode>(initialFilesystem);
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [env, setEnv] = useState<Record<string, string>>({
        'SHELL': '/bin/bash',
        'USER': user,
        'HOSTNAME': hostname,
        'PWD': initialPath,
        'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'LANG': 'en_US.UTF-8',
        ...(options.initialEnv || {})
    });

    const fetchFileContent = async (path: string): Promise<string | null> => {
        try {
            const res = await fetch(`/api/levels/${levelId}/file?path=${encodeURIComponent(path)}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.content;
        } catch (e) {
            console.error('Failed to fetch file:', e);
            return null;
        }
    };

    const executeSingleCommand = useCallback(async (cmd: string, pipeInput?: TerminalLine[]): Promise<TerminalLine[]> => {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        if (!command) return [];

        let output: TerminalLine[] = [];

        switch (command) {
            case 'cat': {
                if (pipeInput && pipeInput.length > 0) return pipeInput;
                if (!args[0]) {
                    output = [{ text: 'cat: file tidak ditentukan', type: 'error' }];
                } else {
                    const resolved = resolvePath(currentPath, args[0]);
                    const node = getNode(filesystem, resolved);

                    if (!node) {
                        output = [{ text: `cat: ${args[0]}: Tidak ada file atau direktori`, type: 'error' }];
                    } else if (node.type === 'directory') {
                        output = [{ text: `cat: ${args[0]}: Adalah direktori`, type: 'error' }];
                    } else {
                        // Permission check
                        const perms = node.permissions || 'rw-r--r--';
                        const canRead = perms[0] === 'r' || perms[3] === 'r' || perms[6] === 'r';

                        if (!canRead) {
                            output = [{ text: `cat: ${args[0]}: Permission denied`, type: 'error' }];
                        } else {
                            let content = node.content || '';

                            // Lazy load content if redacted
                            if (content === '[REDACTED]') {
                                shell.addLines([{ text: 'Loading...', type: 'system' }]); // Optional feedback
                                const fetched = await fetchFileContent(resolved);
                                if (fetched !== null) {
                                    content = fetched;
                                    // Update cache
                                    setFilesystem(prev => updateVFS(prev, resolved, n => ({ ...n, content: fetched })));
                                } else {
                                    return [{ text: `cat: error reading file`, type: 'error' }];
                                }
                            }

                            output = content.split('\n').map(text => ({ text, type: 'output' as const }));

                            if (content.includes('yadika{')) {
                                const match = content.match(/yadika\{[^}]+\}/);
                                if (match && onFlagFound) {
                                    setTimeout(() => onFlagFound(match[0]), 500);
                                }
                            }
                        }
                    }
                }
                break;
            }

            case 'grep': {
                let pattern = args[0]?.replace(/['"]/g, '') || '';
                const fileArg = args[1];
                let inputLines = pipeInput || [];

                if (!pipeInput && fileArg) {
                    const resolved = resolvePath(currentPath, fileArg);
                    const node = getNode(filesystem, resolved);
                    if (node?.type === 'file') {
                        let content = node.content || '';
                        if (content === '[REDACTED]') {
                            const fetched = await fetchFileContent(resolved);
                            if (fetched !== null) {
                                content = fetched;
                                setFilesystem(prev => updateVFS(prev, resolved, n => ({ ...n, content: fetched })));
                            }
                        }
                        inputLines = content.split('\n').map(text => ({ text, type: 'output' as const }));
                    } else if (node?.type === 'directory') {
                        return [{ text: `grep: ${fileArg}: Adalah direktori`, type: 'error' }];
                    } else {
                        return [{ text: `grep: ${fileArg}: Tidak ada file`, type: 'error' }];
                    }
                }

                if (!pattern) return [{ text: 'Usage: grep <pattern> [file]', type: 'error' }];

                output = inputLines.filter(line => line.text.toLowerCase().includes(pattern.toLowerCase()));
                break;
            }

            case 'head':
            case 'tail': {
                const isTail = command === 'tail';
                let n = 10;
                let fileArg: string | undefined;

                if (args[0] === '-n' && args[1]) {
                    n = parseInt(args[1]) || 10;
                    fileArg = args[2];
                } else {
                    fileArg = args[0];
                }

                let inputLines = pipeInput || [];
                if (!pipeInput && fileArg) {
                    const resolved = resolvePath(currentPath, fileArg);
                    const node = getNode(filesystem, resolved);
                    if (node?.type === 'file') {
                        let content = node.content || '';
                        if (content === '[REDACTED]') {
                            const fetched = await fetchFileContent(resolved);
                            if (fetched !== null) {
                                content = fetched;
                                setFilesystem(prev => updateVFS(prev, resolved, n => ({ ...n, content: fetched })));
                            }
                        }
                        inputLines = content.split('\n').map(text => ({ text, type: 'output' as const }));
                    }
                }

                output = isTail ? inputLines.slice(-n) : inputLines.slice(0, n);
                break;
            }

            // ... (Other commands like ls, pwd, etc. usually don't need content fetch, just metadata)
            // But we need to keep them here.
            // I will copy the rest of the cases from the original file, they are safe to stay sync-like but wrapped in async.

            case 'ls': {
                const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
                const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
                const targetArg = args.find(a => !a.startsWith('-')) || '.';
                const resolved = resolvePath(currentPath, targetArg);
                const node = getNode(filesystem, resolved);

                if (!node) {
                    output = [{ text: `ls: tidak dapat mengakses '${targetArg}': Tidak ada file atau direktori`, type: 'error' }];
                } else if (node.type !== 'directory') {
                    output = [{ text: targetArg, type: 'output' }];
                } else {
                    const entries = Object.keys(node.children || {})
                        .filter(name => showHidden || !name.startsWith('.'))
                        .sort();

                    if (showHidden) {
                        entries.unshift('.', '..');
                    }

                    if (entries.length === 0) {
                        output = [{ text: '(direktori kosong)', type: 'system' }];
                    } else if (showLong) {
                        output = entries.map(name => {
                            const child = node.children![name];
                            const typeStr = child.type === 'directory' ? 'd' : '-';
                            const perms = child.permissions || (child.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--');
                            const owner = child.owner || 'guest';
                            const suffix = child.type === 'directory' ? '/' : '';
                            return { text: `${typeStr}${perms}  ${owner.padEnd(8)}  ${name}${suffix}`, type: 'output' as const };
                        });
                    } else {
                        const formatted = entries.map(name => {
                            const child = node.children![name];
                            return child.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name;
                        }).join('  ');
                        output = [{ text: formatted, type: 'output' }];
                    }
                }
                break;
            }

            case 'chmod': {
                if (args.length < 2) {
                    output = [{ text: 'Usage: chmod <mode> <file>', type: 'error' }];
                } else {
                    const mode = args[0];
                    const targetFile = args[1];
                    const resolved = resolvePath(currentPath, targetFile);
                    const node = getNode(filesystem, resolved);

                    if (!node) {
                        output = [{ text: `chmod: ${targetFile}: Tidak ada file`, type: 'error' }];
                    } else {
                        // Reuse existing chmod logic
                        let newPerms = node.permissions || (node.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--');
                        // ... (same chmod logic)
                        if (/^[0-7]{3}$/.test(mode)) {
                            const octalToPerms = (n: number): string => {
                                return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
                            };
                            newPerms = octalToPerms(parseInt(mode[0])) + octalToPerms(parseInt(mode[1])) + octalToPerms(parseInt(mode[2]));
                        } else if (mode.startsWith('+') || mode.startsWith('-')) {
                            const add = mode.startsWith('+');
                            const p = mode.slice(1);
                            const arr = newPerms.split('');
                            if (p === 'r') { arr[0] = add ? 'r' : '-'; arr[3] = add ? 'r' : '-'; arr[6] = add ? 'r' : '-'; }
                            if (p === 'w') { arr[1] = add ? 'w' : '-'; arr[4] = add ? 'w' : '-'; arr[7] = add ? 'w' : '-'; }
                            if (p === 'x') { arr[2] = add ? 'x' : '-'; arr[5] = add ? 'x' : '-'; arr[8] = add ? 'x' : '-'; }
                            newPerms = arr.join('');
                        }

                        setFilesystem(prev => updateVFS(prev, resolved, (n) => ({ ...n, permissions: newPerms })));
                        output = [];
                    }
                }
                break;
            }

            case 'ps': {
                // SAME PS LOGIC
                const showAll = args.includes('aux') || args.includes('-ef');
                if (showAll) {
                    output = [
                        { text: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND', type: 'output' },
                        { text: 'root         1  0.0  0.1  10240  2048 ?        Ss   09:00   0:00 /init', type: 'output' },
                        { text: 'www-data    42  0.0  0.5  45000  8192 ?        S    09:01   0:00 nginx', type: 'output' },
                        { text: 'hacker     999  0.1  0.2  15000  4096 ?        S    09:05   0:01 hacker_service --key=****', type: 'output' }, // REDACTED in logic too
                        { text: 'user      1002  0.0  0.1  12000  2048 ?        R    12:00   0:00 ps aux', type: 'output' }
                    ];
                } else {
                    output = [
                        { text: '  PID TTY          TIME CMD', type: 'output' },
                        { text: ' 1002 pts/0    00:00:00 ps', type: 'output' }
                    ];
                }
                break;
            }

            case 'env':
            case 'printenv':
                output = Object.entries(env).map(([key, val]) => ({ text: `${key}=${val}`, type: 'output' as const }));
                break;

            case 'echo':
                const text = args.map(arg => {
                    if (arg.startsWith('$')) {
                        const varName = arg.slice(1);
                        return env[varName] || '';
                    }
                    return arg;
                }).join(' ');
                output = [{ text, type: 'output' }];
                break;

            case 'wc':
                const wcLines = pipeInput || [];
                if (args[0] === '-l') {
                    output = [{ text: `${wcLines.length}`, type: 'output' }];
                } else {
                    output = [{ text: `${wcLines.length} lines`, type: 'output' }];
                }
                break;

            case 'sort':
                const sortLines = pipeInput || [];
                output = [...sortLines].sort((a, b) => a.text.localeCompare(b.text));
                break;

            case 'uniq':
                const uniqLines = pipeInput || [];
                output = uniqLines.filter((line, i, arr) => i === 0 || line.text !== arr[i - 1].text);
                break;

            case 'pwd':
                output = [{ text: currentPath, type: 'output' }];
                break;

            case 'whoami':
                output = [{ text: user, type: 'output' }];
                break;

            case 'tree':
                // Same tree logic
                const targetPath = args[0] ? resolvePath(currentPath, args[0]) : currentPath;
                const node = getNode(filesystem, targetPath);
                if (!node || node.type !== 'directory') {
                    output = [{ text: 'tree: tidak dapat membaca direktori', type: 'error' }];
                } else {
                    const buildTree = (n: FileNode, prefix: string = '', isLast: boolean = true): string[] => {
                        const result: string[] = [];
                        if (n.type === 'directory' && n.children) {
                            const entries = Object.entries(n.children).filter(([name]) => !name.startsWith('.'));
                            entries.forEach(([name, child], i) => {
                                const isLastEntry = i === entries.length - 1;
                                const connector = isLastEntry ? '└── ' : '├── ';
                                const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
                                result.push(prefix + connector + name + (child.type === 'directory' ? '/' : ''));
                                if (child.type === 'directory') result.push(...buildTree(child, newPrefix, isLastEntry));
                            });
                        }
                        return result;
                    };
                    output = [{ text: '.', type: 'output' }, ...buildTree(node).map(text => ({ text, type: 'output' as const }))];
                }
                break;

            case 'help':
                output = [
                    { text: 'Perintah yang tersedia:', type: 'output' },
                    { text: '  ls [-la]      - Lihat isi direktori', type: 'output' },
                    { text: '  cd <path>     - Pindah direktori', type: 'output' },
                    { text: '  cat <file>    - Baca isi file', type: 'output' },
                    { text: '  chmod <mode>  - Ubah permission file', type: 'output' },
                    { text: '  ps [aux]      - Lihat proses yang berjalan', type: 'output' },
                    { text: '  pwd           - Tampilkan direktori saat ini', type: 'output' },
                    { text: '  grep <pola>   - Cari teks', type: 'output' },
                    { text: '  wc -l         - Hitung baris', type: 'output' },
                    { text: '  head/tail     - Potong baris', type: 'output' },
                    { text: '  sort/uniq     - Urutkan/unikkan', type: 'output' },
                    { text: '  clear         - Bersihkan layar', type: 'output' },
                    { text: '', type: 'output' }
                ];
                break;

            default:
                output = [{ text: `${command}: perintah tidak ditemukan`, type: 'error' }];
        }

        return output;
    }, [currentPath, filesystem, onFlagFound, user, levelId, shell]); // Added levelId, shell

    const executeCommand = useCallback(async (cmd: string) => {
        const trimmed = cmd.trim();
        const prompt = `${user}@${hostname}:${currentPath}$ ${cmd}`;
        shell.addLines([{ text: prompt, type: 'input' }]);

        if (!trimmed) return;

        if (trimmed.toLowerCase() === 'clear') {
            shell.clearLines();
            return;
        }

        // Handle cd (updates state) - Sync for now
        if (trimmed.toLowerCase().startsWith('cd ') || trimmed.toLowerCase() === 'cd') {
            const target = trimmed.split(/\s+/)[1] || initialPath;
            const resolved = resolvePath(currentPath, target);
            const node = getNode(filesystem, resolved);

            if (!node) {
                shell.addLines([{ text: `cd: ${target}: Tidak ada file atau direktori`, type: 'error' }, { text: '', type: 'output' }]);
            } else if (node.type !== 'directory') {
                shell.addLines([{ text: `cd: ${target}: Bukan direktori`, type: 'error' }, { text: '', type: 'output' }]);
            } else {
                setCurrentPath(resolved);
            }
            return;
        }

        // Try custom commands
        const parts = trimmed.split(/\s+/);
        if (customCommands && customCommands(parts[0], parts.slice(1), currentPath, shell.addLines)) {
            return;
        }

        // Handle Redirection or Pipeline or Single Command
        let result: TerminalLine[] = [];
        try {
            if (trimmed.includes('>')) {
                const [cmdText, targetFileText] = trimmed.split('>');
                const targetFile = targetFileText.trim();
                const sourceCmd = cmdText.trim();

                let cmdOutput: TerminalLine[] = [];
                if (sourceCmd.includes('|')) {
                    const commands = sourceCmd.split('|').map(c => c.trim());
                    let currentPipeOutput: TerminalLine[] | undefined = undefined;
                    for (const c of commands) {
                        currentPipeOutput = await executeSingleCommand(c, currentPipeOutput);
                    }
                    cmdOutput = currentPipeOutput || [];
                } else {
                    cmdOutput = await executeSingleCommand(sourceCmd);
                }

                if (cmdOutput.some(l => l.type === 'error')) {
                    result = cmdOutput;
                } else {
                    const content = cmdOutput.map(l => l.text).join('\n');
                    const resolved = resolvePath(currentPath, targetFile);
                    setFilesystem(prev => updateVFS(prev, resolved, (node) => ({ ...node, content, type: 'file' })));
                    result = [];
                }
            } else if (trimmed.includes('|')) {
                const commands = trimmed.split('|').map(c => c.trim());
                let currentPipeOutput: TerminalLine[] | undefined = undefined;
                for (const c of commands) {
                    currentPipeOutput = await executeSingleCommand(c, currentPipeOutput);
                }
                result = currentPipeOutput || [];
            } else {
                result = await executeSingleCommand(trimmed);
            }
        } catch (e) {
            console.error(e);
            result = [{ text: 'Error executing command', type: 'error' }];
        }

        if (result.length > 0) {
            shell.addLines([...result, { text: '', type: 'output' }]);

            // Global flag detection
            result.forEach(line => {
                if (line.text.includes('yadika{')) {
                    const match = line.text.match(/yadika\{[^}]+\}/);
                    if (match && onFlagFound) {
                        setTimeout(() => onFlagFound(match[0]), 500);
                    }
                }
            });
        }
    }, [user, hostname, currentPath, shell, customCommands, initialPath, filesystem, executeSingleCommand, onFlagFound]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const input = shell.input;
        if (input.trim() || input === '') {
            shell.setInput(''); // Clear input immediately
            await executeCommand(input);
            if (input.trim()) {
                shell.setHistory(prev => [...prev, input.trim()]);
                shell.setHistoryIndex(-1);
            }
        }
    };

    return {
        ...shell,
        filesystem,
        setFilesystem,
        currentPath,
        setCurrentPath,
        executeCommand,
        handleSubmit,
        prompt: `${user}@${hostname}:${currentPath}$`
    };
};
