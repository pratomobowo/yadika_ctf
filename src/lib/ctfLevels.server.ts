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

// Stage colors
const STAGE2 = { themeColor: 'cyan-400', themeBorder: 'border-cyan-500/30', themeShadow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]' };
const STAGE3 = { themeColor: 'orange-400', themeBorder: 'border-orange-500/30', themeShadow: 'shadow-[0_0_30px_rgba(251,146,60,0.15)]' };
const STAGE4 = { themeColor: 'pink-400', themeBorder: 'border-pink-500/30', themeShadow: 'shadow-[0_0_30px_rgba(244,114,182,0.15)]' };
const STAGE5 = { themeColor: 'rose-400', themeBorder: 'border-rose-500/30', themeShadow: 'shadow-[0_0_30px_rgba(251,113,133,0.15)]' };

export const ctfLevelData: CTFLevel[] = [
    // ============ STAGE 1: Linux Fundamentals (1-10) ============
    {
        id: 1,
        title: 'Welcome to the Shell',
        flag: 'yadika{shell_king}',
        points: 20,
        hint: 'Gunakan perintah ls dan cat.',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory',
                    children: {
                        'guest': {
                            type: 'directory',
                            children: {
                                'welcome.txt': { type: 'file', content: 'Selamat datang di Yadika CTF!\nGunakan perintah Linux untuk menjelajahi sistem.\nCoba cari file tersembunyi...' },
                                'catatan.txt': { type: 'file', content: 'Catatan Harian:\n- Belajar Linux\n- Jangan lupa cek folder lain\n- Ada sesuatu yang tersembunyi...' },
                                '.secret': {
                                    type: 'directory',
                                    children: {
                                        'flag.txt': { type: 'file', content: 'Selamat! Kamu menemukan flag pertama!\n\nFLAG: yadika{shell_king}' },
                                        'readme.md': { type: 'file', content: '# Rahasia\nFolder ini tersembunyi.\nHanya yang jeli yang bisa menemukannya!' }
                                    }
                                }
                            }
                        },
                        'admin': {
                            type: 'directory',
                            children: {
                                'config.txt': { type: 'file', content: '[Access Denied]\nAnda tidak memiliki akses ke file ini.' }
                            }
                        }
                    }
                },
                'var': {
                    type: 'directory',
                    children: {
                        'log': {
                            type: 'directory',
                            children: {
                                'system.log': { type: 'file', content: '[2026-02-09] System started\n[2026-02-09] User guest logged in\n[2026-02-09] Hint: coba ls -a untuk melihat file tersembunyi' }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'directory',
                    children: {
                        'notes.txt': { type: 'file', content: 'Temporary notes:\n- Flag ada di suatu tempat\n- Cek folder home dengan teliti' }
                    }
                }
            }
        }
    },
    {
        id: 2,
        title: 'The Hidden Message',
        flag: 'yadika{b4se64_d3c0d3r}',
        points: 20,
        hint: 'Gunakan echo dan base64 --decode.',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory',
                    children: {
                        'guest': {
                            type: 'directory',
                            children: {
                                'README.txt': { type: 'file', content: 'Level 2: The Hidden Message\n\nAda pesan rahasia yang tersembunyi di sistem ini.\nPesan tersebut di-encode menggunakan Base64.\n\nGunakan perintah "decode <teks>" untuk mendecode pesan.\nCoba cari file yang mencurigakan...' },
                                'messages': {
                                    type: 'directory',
                                    children: {
                                        'from_admin.txt': { type: 'file', content: 'Pesan dari Admin:\n\nHei, aku menyembunyikan sesuatu penting.\nCek folder backup, ada file yang menarik di sana.\n\n- Admin' },
                                        'notes.txt': { type: 'file', content: 'Catatan:\n- Base64 adalah encoding, bukan enkripsi\n- Mudah di-decode jika tahu caranya\n- Sering digunakan untuk menyembunyikan data' }
                                    }
                                },
                                'backup': {
                                    type: 'directory',
                                    children: {
                                        'secret_message.b64': { type: 'file', content: 'RmxhZyBMZXZlbCAyIGFkYWxhaDogCgp5YWRpa2F7YjRzZTY0X2QzYzBkM3J9CgpTZWxhbWF0ISBLYW11IGJlcmhhc2lsIG1lbmRlY29kZSBwZXNhbiBpbmku' },
                                        'info.txt': { type: 'file', content: 'File .b64 berisi data yang di-encode dengan Base64.\nGunakan: decode <isi_file> untuk membacanya.' }
                                    }
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'directory',
                    children: {
                        'log': {
                            type: 'directory',
                            children: {
                                'auth.log': { type: 'file', content: '[LOG] User guest login\n[LOG] Accessed /home/guest\n[LOG] Hint: coba baca file dengan ekstensi .b64' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 3, title: 'Needle in a Haystack', flag: 'yadika{gr3p_m4st3r}', points: 20, hint: 'Gunakan grep.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'logs': {
                                    type: 'directory', children: {
                                        'access.log': { type: 'file', content: '192.168.1.1 - - [2026-02-12 10:00:01] "GET /index.html HTTP/1.1" 200\n192.168.1.2 - - [2026-02-12 10:05:22] "GET /login HTTP/1.1" 200\n192.168.1.5 - - [2026-02-12 10:10:45] "POST /api/flag HTTP/1.1" 200 yadika{gr3p_m4st3r}' },
                                        'error.log': { type: 'file', content: 'ERROR: 404 Not Found /favicon.ico\nERROR: 500 Internal Server Error /upload' }
                                    }
                                },
                                'readme.txt': { type: 'file', content: 'Dapatkan flag dari access.log di dalam folder logs.\nGunakan grep untuk mencari "yadika{"' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 4, title: 'Pipelining', flag: 'yadika{p1p3_dr34m3r}', points: 20, hint: 'Gunakan pipe (|).', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'data.txt': { type: 'file', content: 'line 1\nline 2\nline 3\nSECRET: yadika{p1p3_dr34m3r}\nline 5' },
                                'readme.txt': { type: 'file', content: 'Gunakan cat dan grep dengan pipe untuk menemukan flag.\nContoh: cat data.txt | grep yadika' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 5, title: 'Strict Rules', flag: 'yadika{ch0wn_th3_w0rld}', points: 20, hint: 'Pahami chmod.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'locked_file.txt': { type: 'file', content: 'yadika{ch0wn_th3_w0rld}', permissions: '---------' },
                                'readme.txt': { type: 'file', content: 'File locked_file.txt tidak bisa dibaca.\nUbah permission-nya agar bisa dibaca.\nGunakan: chmod 644 locked_file.txt' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 6, title: 'Process Hunting', flag: 'yadika{ps_aux_grep}', points: 20, hint: 'Gunakan ps aux.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Cari flag di daftar proses yang sedang berjalan.\nGunakan: ps aux | grep hacker' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'ps' && (args.includes('aux') || args.includes('-ef'))) {
                addLines([
                    { text: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND', type: 'output' },
                    { text: 'root         1  0.0  0.1  10240  2048 ?        Ss   09:00   0:00 /init', type: 'output' },
                    { text: 'www-data    42  0.0  0.5  45000  8192 ?        S    09:01   0:00 nginx', type: 'output' },
                    { text: 'hacker     999  0.1  0.2  15000  4096 ?        S    09:05   0:01 hacker_service --key=yadika{ps_aux_grep}', type: 'output' },
                    { text: 'user      1002  0.0  0.1  12000  2048 ?        R    12:00   0:00 ps aux', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 7, title: 'Output Master', flag: 'yadika{redir_master_ok}', points: 20, hint: 'Gunakan redirection (>).', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Ketik "echo <flag>" dan arahkan ke file flag.txt.\nFlagnya adalah: yadika{redir_master_ok}' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 8, title: 'Environment Secrets', flag: 'yadika{env_var_found}', points: 20, hint: 'Gunakan env atau printenv.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Flag tersembunyi di Environment Variable.\nGunakan perintah env atau printenv.' }
                            }
                        }
                    }
                }
            }
        },
        initialEnv: { 'FLAG': 'yadika{env_var_found}', 'SECRET_KEY': '12345' }
    },
    {
        id: 9, title: 'Web Recon', flag: 'yadika{web_root_explorer}', points: 20, hint: 'Cari flag di web folder.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'var': {
                    type: 'directory', children: {
                        'www': {
                            type: 'directory', children: {
                                'html': {
                                    type: 'directory', children: {
                                        'index.html': { type: 'file', content: '<h1>It Works!</h1>' },
                                        '.htaccess': { type: 'file', content: 'Flag: yadika{web_root_explorer}' }
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Cari flag di folder /var/www/html.\nJangan lupa cek file tersembunyi dengan ls -la' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 10, title: 'Bash Script Runner', flag: 'yadika{bash_script_hero}', points: 20, hint: 'Jalankan script .sh.', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'get_flag.sh': { type: 'file', content: '#!/bin/bash\necho "Running script..."\nsleep 1\necho "Flag: yadika{bash_script_hero}"', permissions: 'rwxr-xr-x' },
                                'readme.txt': { type: 'file', content: 'Ada script get_flag.sh. Jalankan script tersebut!\nGunakan: ./get_flag.sh' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            const isScriptExec = cmd === './get_flag.sh' ||
                ((cmd === 'sh' || cmd === 'bash') && args[0] === 'get_flag.sh');

            if (isScriptExec) {
                addLines([
                    { text: 'Running script...', type: 'output' },
                    { text: 'Flag: yadika{bash_script_hero}', type: 'success' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    // ============ STAGE 2: Intermediate Linux (11-20) ============
    {
        id: 11, title: 'Find the Needle', flag: 'yadika{f1nd_th3_n33dl3}', points: 25,
        hint: 'Gunakan perintah find untuk mencari file berdasarkan nama.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Flag tersembunyi jauh di dalam labirin folder sistem.\nCoba temukan file yang berakhiran ".flag" di seluruh sistem.' }
                            }
                        }
                    }
                },
                'var': {
                    type: 'directory', children: {
                        'cache': {
                            type: 'directory', children: {
                                'app': {
                                    type: 'directory', children: {
                                        'temp': {
                                            type: 'directory', children: {
                                                'old': {
                                                    type: 'directory', children: {
                                                        'secret.flag': { type: 'file', content: 'yadika{f1nd_th3_n33dl3}' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': { type: 'directory', children: { 'noise.txt': { type: 'file', content: 'nothing here' } } },
                'etc': { type: 'directory', children: { 'config.txt': { type: 'file', content: 'system config' } } }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'find') {
                const nameArg = args.indexOf('-name');
                if (nameArg !== -1) {
                    const pattern = (args[nameArg + 1] || '').replace(/['"]/g, '');
                    if (pattern.includes('.flag') || pattern.includes('*')) {
                        addLines([{ text: '/var/cache/app/temp/old/secret.flag', type: 'output' }, { text: '', type: 'output' }]);
                        return true;
                    }
                }
                if (args.length >= 1) {
                    addLines([{ text: 'find: gunakan -name untuk mencari berdasarkan nama file', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: 12, title: 'Cron Job Spy', flag: 'yadika{cr0n_sp1_m4st3r}', points: 25,
        hint: 'Periksa crontab untuk melihat scheduled tasks.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Sistem ini menjalankan tugas otomatis secara berkala.\nPeriksa daftar tugas terjadwal (schedule) milik user saat ini.' }
                            }
                        }
                    }
                },
                'etc': { type: 'directory', children: { 'crontab': { type: 'file', content: '# system crontab\n*/5 * * * * /usr/bin/backup.sh\n0 2 * * * /opt/secret/exfil.sh --key=yadika{cr0n_sp1_m4st3r}\n0 0 * * 0 /usr/bin/cleanup.sh' } } }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'crontab' && args[0] === '-l') {
                addLines([
                    { text: '# Crontab for user', type: 'output' },
                    { text: '*/5 * * * * /usr/bin/backup.sh', type: 'output' },
                    { text: '0 2 * * * /opt/secret/exfil.sh --key=yadika{cr0n_sp1_m4st3r}', type: 'output' },
                    { text: '0 0 * * 0 /usr/bin/cleanup.sh', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 13, title: 'Symlink Trail', flag: 'yadika{syml1nk_tr41l}', points: 25,
        hint: 'Ikuti symbolic links dengan readlink atau ls -la.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'clue.txt': { type: 'file', content: 'Ada jalan pintas (shortcut) di /tmp/shortcut.\nCari tahu ke mana jalan pintas itu mengarah.' },
                                'final_destination.txt': { type: 'file', content: 'Selamat! Flag: yadika{syml1nk_tr41l}' }
                            }
                        }
                    }
                },
                'tmp': { type: 'directory', children: { 'shortcut': { type: 'file', content: '[symlink -> /home/guest/final_destination.txt]' } } }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'readlink' && args[0]) {
                if (args[0].includes('shortcut')) {
                    addLines([{ text: '/home/guest/final_destination.txt', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: 14, title: 'Archive Digger', flag: 'yadika{t4r_d1gg3r}', points: 25,
        hint: 'Ekstrak arsip .tar.gz untuk menemukan flag.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'backup.tar.gz': { type: 'file', content: '[compressed archive]' },
                                'readme.txt': { type: 'file', content: 'Terdapat file cadangan backup.tar.gz yang dikompresi.\nBongkar arsip tersebut untuk melihat isinya.' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'tar') {
                if (args.some(a => a.includes('backup'))) {
                    addLines([
                        { text: 'backup/', type: 'output' },
                        { text: 'backup/data.txt', type: 'output' },
                        { text: 'backup/secret/', type: 'output' },
                        { text: 'backup/secret/flag.txt', type: 'output' },
                        { text: '', type: 'output' },
                        { text: 'Extracted! Cek folder backup/', type: 'success' },
                        { text: 'flag.txt berisi: yadika{t4r_d1gg3r}', type: 'output' },
                        { text: '', type: 'output' }
                    ]);
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: 15, title: 'Disk Detective', flag: 'yadika{d1sk_d3t3ct1v3}', points: 25,
        hint: 'Gunakan df dan du untuk memeriksa penggunaan disk.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Sistem penyimpanan hampir penuh.\nIdentifikasi partisi mana yang mencapai kapasitas Use% 100%.' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'df') {
                addLines([
                    { text: 'Filesystem      Size  Used Avail Use% Mounted on', type: 'output' },
                    { text: '/dev/sda1        50G   45G    5G  90% /', type: 'output' },
                    { text: '/dev/sdb1       100G   10G   90G  10% /data', type: 'output' },
                    { text: '/dev/secret      1G    1G     0  100% /mnt/flag_yadika{d1sk_d3t3ct1v3}', type: 'output' },
                    { text: 'tmpfs           2.0G     0  2.0G   0% /dev/shm', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'du') {
                addLines([
                    { text: '45G\t/', type: 'output' },
                    { text: '10G\t/data', type: 'output' },
                    { text: '1G\t/mnt/flag_yadika{d1sk_d3t3ct1v3}', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 16, title: 'Log Analyzer', flag: 'yadika{l0g_4n4lyz3r}', points: 25,
        hint: 'Analisis file log untuk menemukan aktivitas mencurigakan.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Sistem mencatat aktivitas mencurigakan di /var/log/auth.log.\nCari baris yang mengandung pesan peringatan "ALERT".' }
                            }
                        }
                    }
                },
                'var': {
                    type: 'directory', children: {
                        'log': {
                            type: 'directory', children: {
                                'auth.log': { type: 'file', content: 'Jan 10 08:00:01 srv sshd[1234]: Accepted password for admin\nJan 10 08:05:33 srv sshd[1235]: Failed password for root\nJan 10 08:10:00 srv sshd[1236]: Accepted publickey for deploy\nJan 10 09:00:00 srv ALERT: unauthorized access flag=yadika{l0g_4n4lyz3r}\nJan 10 09:05:00 srv sshd[1237]: Connection closed by 10.0.0.5\nJan 10 10:00:00 srv cron[999]: (root) CMD (/usr/bin/backup)' },
                                'syslog': { type: 'file', content: 'System log - nothing interesting here.' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 17, title: 'User Hunter', flag: 'yadika{us3r_hunt3r}', points: 25,
        hint: 'Periksa /etc/passwd untuk menemukan user mencurigakan.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Daftar pengguna sistem disimpan di /etc/passwd.\nAda penyusup yang menyisipkan flag di dalam informasi akun salah satu user.' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'directory', children: {
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nhacker:x:1337:1337:yadika{us3r_hunt3r}:/home/hacker:/bin/bash\nguest:x:1000:1000:Guest:/home/guest:/bin/bash' }
                    }
                }
            }
        }
    },
    {
        id: 18, title: 'Network Peek', flag: 'yadika{n3t_p33k3r}', points: 25,
        hint: 'Lihat konfigurasi jaringan dengan ip addr atau ifconfig.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: 'Informasi kartu jaringan mungkin menyimpan rahasia.\nLihat detail alamat IP dan konfigurasi interface server ini.' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'ip' && args[0] === 'addr' || cmd === 'ifconfig') {
                addLines([
                    { text: '1: lo: <LOOPBACK,UP> mtu 65536', type: 'output' },
                    { text: '    inet 127.0.0.1/8 scope host lo', type: 'output' },
                    { text: '2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500', type: 'output' },
                    { text: '    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0', type: 'output' },
                    { text: '3: docker0: <NO-CARRIER,BROADCAST> mtu 1500', type: 'output' },
                    { text: '    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0', type: 'output' },
                    { text: '4: flag0: <UP> mtu 9000', type: 'output' },
                    { text: '    inet 10.13.37.1/24 label yadika{n3t_p33k3r}', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 19, title: 'Sed Surgeon', flag: 'yadika{s3d_surg30n}', points: 25,
        hint: 'Gunakan sed untuk memanipulasi teks.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'encoded.txt': { type: 'file', content: 'yXdikX{s3d_surg30n}' },
                                'readme.txt': { type: 'file', content: 'Flag di dalam encoded.txt sedikit rusak.\nSepertinya semua huruf "a" berubah menjadi "X".\nGunakan editor teks otomatis (Stream Editor) untuk memperbaikinya.' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'sed') {
                const pattern = args.join(' ');
                if (pattern.includes('s/X/a') || pattern.includes("s/X/a")) {
                    addLines([{ text: 'yadika{s3d_surg30n}', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
                addLines([{ text: 'sed: coba gunakan s/X/a/g pada file encoded.txt', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            return false;
        }
    },
    {
        id: 20, title: 'Awk Wizard', flag: 'yadika{4wk_w1z4rd}', points: 25,
        hint: 'Gunakan awk untuk mengekstrak kolom tertentu.',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'data.csv': { type: 'file', content: 'id,name,secret\n1,admin,fake_flag\n2,user,nothing\n3,hacker,yadika{4wk_w1z4rd}\n4,guest,nope' },
                                'readme.txt': { type: 'file', content: 'Data rahasia tersimpan di data.csv.\nAmbil nilai di kolom ketiga ($3) hanya untuk baris milik "hacker".' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'awk') {
                const full = args.join(' ');
                if (full.includes('hacker') || full.includes('$3') || full.includes('print')) {
                    addLines([{ text: 'yadika{4wk_w1z4rd}', type: 'output' }, { text: '', type: 'output' }]);
                    return true;
                }
                addLines([{ text: 'awk: coba filter baris "hacker" dan print kolom $3', type: 'error' }, { text: '', type: 'output' }]);
                return true;
            }
            return false;
        }
    },
    // ============ STAGE 3: Networking & Protocols (21-30) ============
    {
        id: 21, title: 'Ping Sweep', flag: 'yadika{p1ng_sw33p}', points: 30, hint: 'Gunakan ping atau nmap -sn untuk menemukan host aktif.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Scan jaringan 192.168.1.0/24 untuk host aktif.\nGunakan: nmap -sn 192.168.1.0/24' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'nmap') { addLines([{ text: 'Starting Nmap scan...', type: 'output' }, { text: 'Host 192.168.1.1 is up (gateway)', type: 'output' }, { text: 'Host 192.168.1.10 is up (web-server)', type: 'output' }, { text: 'Host 192.168.1.50 is up (db-server)', type: 'output' }, { text: 'Host 192.168.1.99 is up (flag=yadika{p1ng_sw33p})', type: 'output' }, { text: 'Nmap done: 4 hosts up', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'ping') { addLines([{ text: 'PING: 64 bytes from ' + (args[0] || 'host') + ': icmp_seq=1 ttl=64 time=0.5ms', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 22, title: 'Port Scanner', flag: 'yadika{p0rt_sc4nn3r}', points: 30, hint: 'Scan port yang terbuka pada server.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Scan port pada 192.168.1.10.\nGunakan: nmap 192.168.1.10 atau ss -tlnp' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'nmap' || (cmd === 'ss' && args.some(a => a.includes('t')))) { addLines([{ text: 'PORT     STATE SERVICE', type: 'output' }, { text: '22/tcp   open  ssh', type: 'output' }, { text: '80/tcp   open  http', type: 'output' }, { text: '443/tcp  open  https', type: 'output' }, { text: '1337/tcp open  flag_service (yadika{p0rt_sc4nn3r})', type: 'output' }, { text: '3306/tcp open  mysql', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 23, title: 'DNS Lookup', flag: 'yadika{dns_l00kup}', points: 30, hint: 'Gunakan dig atau nslookup untuk resolusi DNS.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Lakukan DNS lookup pada domain flag.yadika.local\nGunakan: dig flag.yadika.local atau nslookup flag.yadika.local' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'dig' || cmd === 'nslookup' || cmd === 'host') { addLines([{ text: '; <<>> DiG <<>> flag.yadika.local', type: 'output' }, { text: ';; ANSWER SECTION:', type: 'output' }, { text: 'flag.yadika.local.  300  IN  A     10.13.37.100', type: 'output' }, { text: 'flag.yadika.local.  300  IN  TXT   "yadika{dns_l00kup}"', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 24, title: 'HTTP Inspector', flag: 'yadika{http_1nsp3ct0r}', points: 30, hint: 'Periksa HTTP header dengan curl -I, atau gunakan User-Agent khusus.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Web server target.local memblokir agent standar.\nGunakan User-Agent "Yadika-Agent" untuk mendapatkan flag.' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'curl') {
                const userAgentArg = args.find((_, i) => args[i - 1] === '-A' || args[i - 1] === '--user-agent');
                const hasCorrectAgent = args.some(a => a === 'Yadika-Agent');

                if (args.includes('-I') || args.includes('--head')) {
                    addLines([
                        { text: 'HTTP/1.1 200 OK', type: 'output' },
                        { text: 'Server: nginx/1.18.0', type: 'output' },
                        { text: 'X-Hint: Flag disisipkan di body jika User-Agent valid.', type: 'output' },
                        { text: '', type: 'output' }
                    ]);
                    return true;
                }

                if (hasCorrectAgent || userAgentArg === 'Yadika-Agent') {
                    addLines([
                        { text: '<html><body>', type: 'output' },
                        { text: '  <h1>Welcome Yadika Agent</h1>', type: 'output' },
                        { text: '  <p>Flag: yadika{http_1nsp3ct0r}</p>', type: 'success' },
                        { text: '</body></html>', type: 'output' },
                        { text: '', type: 'output' }
                    ]);
                } else {
                    addLines([
                        { text: 'HTTP/1.1 403 Forbidden', type: 'error' },
                        { text: 'Error: Browser Not Allowed. Try using Yadika-Agent.', type: 'error' },
                        { text: '', type: 'output' }
                    ]);
                }
                return true;
            }
            return false;
        }
    },
    {
        id: 25, title: 'Wget Warrior', flag: 'yadika{wg3t_w4rr10r}', points: 30, hint: 'Unduh file dari server remote.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Download file dari http://files.yadika.local/secret.txt\nGunakan: wget http://files.yadika.local/secret.txt' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'wget' || (cmd === 'curl' && args.some(a => a.includes('-O') || a.includes('-o')))) { addLines([{ text: 'Connecting to files.yadika.local...', type: 'output' }, { text: 'HTTP request sent, awaiting response... 200 OK', type: 'output' }, { text: 'Saving to: \'secret.txt\'', type: 'output' }, { text: '100%[==================>] 128B  --.-KB/s  in 0s', type: 'output' }, { text: '', type: 'output' }, { text: 'Isi file secret.txt: yadika{wg3t_w4rr10r}', type: 'success' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 26, title: 'Firewall Rules', flag: 'yadika{f1r3w4ll_rul3s}', points: 30, hint: 'Baca aturan firewall dengan iptables atau ufw.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Periksa aturan firewall.\nGunakan: iptables -L atau ufw status' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'iptables' || cmd === 'ufw') { addLines([{ text: 'Chain INPUT (policy DROP)', type: 'output' }, { text: 'target  prot  source       destination', type: 'output' }, { text: 'ACCEPT  tcp   anywhere     anywhere  tcp dpt:22', type: 'output' }, { text: 'ACCEPT  tcp   anywhere     anywhere  tcp dpt:80', type: 'output' }, { text: 'ACCEPT  tcp   anywhere     anywhere  tcp dpt:443', type: 'output' }, { text: 'LOG     all   anywhere     anywhere  LOG "flag=yadika{f1r3w4ll_rul3s}"', type: 'output' }, { text: 'DROP    all   anywhere     anywhere', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 27, title: 'SSH Key Master', flag: 'yadika{ssh_k3y_m4st3r}', points: 30, hint: 'Inspeksi SSH key untuk menemukan flag.', ...STAGE3,
        filesystem: {
            type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.ssh': { type: 'directory', children: { 'authorized_keys': { type: 'file', content: 'ssh-rsa AAAAB3...key1... user@host\nssh-rsa AAAAB3...key2... admin@yadika # comment: yadika{ssh_k3y_m4st3r}' }, 'id_rsa.pub': { type: 'file', content: 'ssh-rsa AAAAB3...mykey... guest@ctf' } } }, 'readme.txt': { type: 'file', content: 'Periksa file SSH key.\nCek .ssh/authorized_keys' } } } } } }
        }
    },
    {
        id: 28, title: 'SCP Transfer', flag: 'yadika{scp_tr4nsf3r}', points: 30, hint: 'Transfer file antar server menggunakan scp.', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Download file dari remote server.\nGunakan: scp user@remote:/tmp/flag.txt .' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'scp') { addLines([{ text: 'Connecting to remote server...', type: 'output' }, { text: 'flag.txt                  100%   32     0.1KB/s   00:00', type: 'output' }, { text: 'Transfer complete! Isi file:', type: 'success' }, { text: 'yadika{scp_tr4nsf3r}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 29, title: 'Network Sniffer', flag: 'yadika{n3t_sn1ff3r}', points: 30, hint: 'Analisis network capture dengan tcpdump. Flag terpecah!', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'capture.pcap': { type: 'file', content: '[binary pcap data]' }, 'readme.txt': { type: 'file', content: 'Lalu lintas data terekam di capture.pcap.\nFlag dikirim berkala dalam beberapa paket.\nAnalisis dengan: tcpdump -r capture.pcap' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'tcpdump' && args.includes('-r')) {
                addLines([
                    { text: 'reading from file capture.pcap, link-type EN10MB', type: 'output' },
                    { text: '08:00:01 IP 10.0.0.5 > 10.0.0.10: HTTP GET /index.html', type: 'output' },
                    { text: '08:00:02 IP 10.0.0.10 > 10.0.0.5: HTTP 200 OK', type: 'output' },
                    { text: '08:00:03 IP 10.0.0.5 > 10.0.0.99: PSH [1/3] "yadika{n3t_"', type: 'output' },
                    { text: '08:00:04 IP 10.0.0.5 > 10.0.0.10: UDP dns.lookup', type: 'output' },
                    { text: '08:00:05 IP 10.0.0.5 > 10.0.0.99: PSH [2/3] "sn1ff"', type: 'output' },
                    { text: '08:00:06 IP 10.0.0.10 > 10.0.0.5: ICMP echo reply', type: 'output' },
                    { text: '08:00:07 IP 10.0.0.5 > 10.0.0.99: PSH [3/3] "3r}"', type: 'output' },
                    { text: '', type: 'output' },
                    { text: 'Tip: Gabungkan string dalam tanda kutip untuk membentuk flag.', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 30, title: 'Reverse Shell 101', flag: 'yadika{r3v_sh3ll_101}', points: 30, hint: 'Siapkan listener untuk menerima flag.', ...STAGE3,
        filesystem: {
            type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'send_data.sh': { type: 'file', content: '#!/bin/bash\n# Script ini akan mengirim data ke port 4444\nnc localhost 4444' }, 'readme.txt': { type: 'file', content: 'Sebuah script (send_data.sh) akan mengirim flag ke port local 4444.\nSiapkan listener di terminal ini untuk menangkap datanya!\nPerintah: nc -lvp 4444 lalu jalankan script di tab lain (simulasi: ketik nc -lvp 4444 saja)' } } } } } }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'nc') {
                if (args.includes('-l') && (args.includes('4444') || args.includes('-p'))) {
                    addLines([
                        { text: 'Listening on [0.0.0.0] (family 0, port 4444)', type: 'output' },
                        { text: 'Connection from 127.0.0.1 received!', type: 'success' },
                        { text: 'yadika{r3v_sh3ll_101}', type: 'output' },
                        { text: '', type: 'output' }
                    ]);
                    return true;
                }
            }
            return false;
        }
    },
    // ============ STAGE 4: DevOps Tools & Containers (31-40) ============
    {
        id: 31, title: 'Git Basics', flag: 'yadika{g1t_b4s1cs}', points: 35, hint: 'Telusuri Git history.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Ini adalah repo Git.\nGunakan: git log untuk melihat history.' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'git' && args[0] === 'log') { addLines([{ text: 'commit a1b2c3d (HEAD -> main)', type: 'output' }, { text: 'Author: admin', type: 'output' }, { text: '    fix: remove secret key', type: 'output' }, { text: '', type: 'output' }, { text: 'commit f4e5d6c', type: 'output' }, { text: '    feat: add config with flag yadika{g1t_b4s1cs}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'git' && args[0] === 'show') { addLines([{ text: '+SECRET_KEY=yadika{g1t_b4s1cs}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'git') { addLines([{ text: 'git: coba git log atau git show', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 32, title: 'Git Secrets', flag: 'yadika{g1t_s3cr3ts}', points: 35, hint: 'Temukan credential di commit lama.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Developer lupa hapus password dari commit.\nGunakan: git log lalu git diff' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'git' && args[0] === 'log') { addLines([{ text: 'abc1234 remove credentials', type: 'output' }, { text: 'def5678 add database config', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'git' && (args[0] === 'diff' || args[0] === 'show')) { addLines([{ text: '-DB_PASSWORD=yadika{g1t_s3cr3ts}', type: 'output' }, { text: '+DB_PASSWORD=*****', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'git') { addLines([{ text: 'git: coba git log lalu git diff', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 33, title: 'Docker Hello', flag: 'yadika{d0ck3r_h3ll0}', points: 35, hint: 'Jalankan container Docker.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Jalankan container!\nGunakan: docker run hello-world' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'docker' && args[0] === 'run') { addLines([{ text: 'Pulling image...', type: 'output' }, { text: 'Hello from Docker!', type: 'success' }, { text: 'Flag: yadika{d0ck3r_h3ll0}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'docker') { addLines([{ text: 'Usage: docker run <image>', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 34, title: 'Docker Inspect', flag: 'yadika{d0ck3r_1nsp3ct}', points: 35, hint: 'Baca metadata container.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Ada container berjalan.\nGunakan: docker ps lalu docker inspect <id>' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'docker' && args[0] === 'ps') { addLines([{ text: 'CONTAINER ID  IMAGE       NAMES', type: 'output' }, { text: 'abc123def4    secret-app  web-app', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'docker' && args[0] === 'inspect') { addLines([{ text: '{ "Config": { "Env": [', type: 'output' }, { text: '  "SECRET_FLAG=yadika{d0ck3r_1nsp3ct}"', type: 'output' }, { text: ']}}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'docker') { addLines([{ text: 'docker: coba docker ps', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 35, title: 'Dockerfile Builder', flag: 'yadika{d0ck3rf1l3_b0ss}', points: 35, hint: 'Build image dari Dockerfile.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'Dockerfile': { type: 'file', content: 'FROM node:18-alpine\nWORKDIR /app\nENV FLAG=yadika{d0ck3rf1l3_b0ss}\nCOPY . .\nCMD ["node", "server.js"]' }, 'readme.txt': { type: 'file', content: 'Gunakan Dockerfile untuk membangun image.\nKetik: docker build -t myapp .' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'docker' && args[0] === 'build') {
                addLines([
                    { text: 'Sending build context to Docker daemon  2.048kB', type: 'output' },
                    { text: 'Step 1/5 : FROM node:18-alpine', type: 'output' },
                    { text: 'Step 2/5 : WORKDIR /app', type: 'output' },
                    { text: 'Step 3/5 : ENV FLAG=yadika{d0ck3rf1l3_b0ss}', type: 'output' },
                    { text: '---> Running in abc123def', type: 'output' },
                    { text: 'Successfully built abc123def', type: 'success' },
                    { text: 'Successfully tagged myapp:latest', type: 'success' },
                    { text: 'Flag ditemukan di Step 3: yadika{d0ck3rf1l3_b0ss}', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },
    {
        id: 36, title: 'Docker Compose', flag: 'yadika{c0mp0s3_m4st3r}', points: 35, hint: 'Analisis docker-compose.yml.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'docker-compose.yml': { type: 'file', content: 'version: "3.8"\nservices:\n  web:\n    image: nginx\n  db:\n    image: postgres\n    environment:\n      POSTGRES_PASSWORD: yadika{c0mp0s3_m4st3r}\n  redis:\n    image: redis' }, 'readme.txt': { type: 'file', content: 'Analisis docker-compose.yml.\nCari password database.' } } } } } } }
    },
    {
        id: 37, title: 'Systemd Service', flag: 'yadika{syst3md_pr0}', points: 35, hint: 'Periksa systemd unit files.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Ada service mencurigakan.\nCek /etc/systemd/system/' } } } } }, 'etc': { type: 'directory', children: { 'systemd': { type: 'directory', children: { 'system': { type: 'directory', children: { 'backdoor.service': { type: 'file', content: '[Unit]\nDescription=Backdoor\n[Service]\nExecStart=/usr/bin/python3 -c "flag=\'yadika{syst3md_pr0}\'"' } } } } } } } } },
        customCommands: (cmd, _a, _cp, addLines) => {
            if (cmd === 'systemctl') { addLines([{ text: 'sshd.service      active  OpenSSH', type: 'output' }, { text: 'backdoor.service  active  Backdoor', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 38, title: 'Nginx Config', flag: 'yadika{ng1nx_c0nf1g}', points: 35, hint: 'Verifikasi konfigurasi Nginx dan akses port.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Periksa konfigurasi nginx di /etc/nginx/sites-enabled/default\ndan temukan port backend yang digunakan.' } } } } }, 'etc': { type: 'directory', children: { 'nginx': { type: 'directory', children: { 'sites-enabled': { type: 'directory', children: { 'default': { type: 'file', content: 'server {\n  listen 80;\n  location / {\n    proxy_pass http://localhost:8888;\n  }\n}' } } } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'nginx' && args.includes('-t')) {
                addLines([
                    { text: 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok', type: 'output' },
                    { text: 'nginx: configuration file /etc/nginx/nginx.conf test is successful', type: 'success' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'curl' && args.some(a => a.includes('8888'))) {
                addLines([
                    { text: 'Welcome to Backend API', type: 'output' },
                    { text: 'Status: Online', type: 'output' },
                    { text: 'Flag: yadika{ng1nx_c0nf1g}', type: 'success' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'curl') {
                addLines([{ text: 'Connection refused on port 80 (Simulated)', type: 'error' }]);
                return true;
            }
            return false;
        }
    },
    {
        id: 39, title: 'Environment Deploy', flag: 'yadika{3nv_d3pl0y}', points: 35, hint: 'Periksa file .env.', ...STAGE4,
        filesystem: {
            type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'app': { type: 'directory', children: { '.env': { type: 'file', content: 'NODE_ENV=production\nSECRET_KEY=yadika{3nv_d3pl0y}\nJWT_SECRET=supersecret123' }, 'readme.txt': { type: 'file', content: 'Cek .env file (ls -a dulu)' } } } } } } } }
        }
    },
    {
        id: 40, title: 'CI/CD Pipeline', flag: 'yadika{c1cd_p1p3l1n3}', points: 35, hint: 'Analisis pipeline YAML.', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.github': { type: 'directory', children: { 'workflows': { type: 'directory', children: { 'deploy.yml': { type: 'file', content: 'name: Deploy\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    env:\n      DEPLOY_KEY: yadika{c1cd_p1p3l1n3}\n    steps:\n      - run: npm run build' } } } } }, 'readme.txt': { type: 'file', content: 'Cek .github/workflows/ (ls -a)' } } } } } } }
    },
    // ============ STAGE 5: Security & Advanced (41-50) ============
    {
        id: 41, title: 'Password Crack', flag: 'yadika{p4ss_cr4ck3r}', points: 40, hint: 'Crack hash sederhana.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'hashes.txt': { type: 'file', content: 'admin:$1$salt$5d41402abc4b2a76b9719d911017c592\nuser:$1$salt$7c6a180b36896a6ba87e50c0b032e8b0\nhacker:$1$salt$flag_yadika{p4ss_cr4ck3r}' }, 'readme.txt': { type: 'file', content: 'Crack hash di hashes.txt.\nGunakan: john hashes.txt atau hashcat' } } } } } } },
        customCommands: (cmd, _a, _cp, addLines) => {
            if (cmd === 'john' || cmd === 'hashcat') { addLines([{ text: 'Cracking hashes...', type: 'output' }, { text: 'admin:password123', type: 'output' }, { text: 'user:abc123', type: 'output' }, { text: 'hacker:yadika{p4ss_cr4ck3r}', type: 'success' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 42, title: 'SSL Inspector', flag: 'yadika{ssl_1nsp3ct0r}', points: 40, hint: 'Periksa sertifikat SSL.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Periksa sertifikat SSL.\nGunakan: openssl s_client -connect target:443' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'openssl') { addLines([{ text: 'CONNECTED(00000003)', type: 'output' }, { text: 'subject=CN = yadika.local', type: 'output' }, { text: 'issuer=CN = Yadika CA', type: 'output' }, { text: 'X509v3 Subject Alt: DNS:flag.yadika{ssl_1nsp3ct0r}', type: 'output' }, { text: 'Not After: Dec 31 2026', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 43, title: 'Sudo Escalation', flag: 'yadika{sud0_3sc4l4t3}', points: 40, hint: 'Cek sudo misconfig.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Periksa sudo permissions.\nGunakan: sudo -l' } } } } }, 'etc': { type: 'directory', children: { 'sudoers': { type: 'file', content: 'root ALL=(ALL:ALL) ALL\nguest ALL=(ALL) NOPASSWD: /usr/bin/cat /root/flag.txt\n# flag: yadika{sud0_3sc4l4t3}' } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'sudo' && args[0] === '-l') { addLines([{ text: 'User guest may run:', type: 'output' }, { text: '(ALL) NOPASSWD: /usr/bin/cat /root/flag.txt', type: 'output' }, { text: '', type: 'output' }]); return true; }
            if (cmd === 'sudo') { addLines([{ text: 'yadika{sud0_3sc4l4t3}', type: 'success' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 44, title: 'SUID Exploit', flag: 'yadika{su1d_3xpl01t}', points: 40, hint: 'Temukan SUID binary.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Cari file SUID.\nGunakan: find / -perm -4000' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'find' && args.some(a => a.includes('4000') || a.includes('suid'))) { addLines([{ text: '/usr/bin/passwd', type: 'output' }, { text: '/usr/bin/sudo', type: 'output' }, { text: '/opt/vulnerable_app (FLAG=yadika{su1d_3xpl01t})', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 45, title: 'Backup Recovery', flag: 'yadika{b4ckup_r3c0v3ry}', points: 40, hint: 'Pulihkan data dari backup.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'backup.enc': { type: 'file', content: '[encrypted backup data]' }, 'decrypt_key.txt': { type: 'file', content: 'AES-256-CBC Key: s3cr3t_k3y_2026' }, 'readme.txt': { type: 'file', content: 'Pulihkan backup terenkripsi.\nGunakan: openssl enc -d -aes-256-cbc -in backup.enc' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'openssl' && args.some(a => a === '-d' || a === 'enc')) { addLines([{ text: 'Decrypting backup...', type: 'output' }, { text: 'Recovery successful!', type: 'success' }, { text: 'Content: yadika{b4ckup_r3c0v3ry}', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 46, title: 'Steganography', flag: 'yadika{st3g0_h1dd3n}', points: 40, hint: 'Flag tersembunyi di metadata.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'image.png': { type: 'file', content: '[PNG image data, 800x600]' }, 'readme.txt': { type: 'file', content: 'Flag tersembunyi di gambar.\nGunakan: strings image.png atau exiftool image.png' } } } } } } },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'strings' || cmd === 'exiftool') { addLines([{ text: 'PNG', type: 'output' }, { text: 'IHDR', type: 'output' }, { text: 'Comment: yadika{st3g0_h1dd3n}', type: 'output' }, { text: 'IEND', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 47, title: 'Log Forensics', flag: 'yadika{l0g_f0r3ns1cs}', points: 40, hint: 'Analisis log serangan.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'access.log': { type: 'file', content: '10.0.0.1 GET /index.html 200\n10.0.0.1 GET /login 200\n10.0.0.99 POST /login 401\n10.0.0.99 POST /login 401\n10.0.0.99 POST /login 401\n10.0.0.99 POST /admin 403\n10.0.0.99 GET /../../etc/passwd 400\n10.0.0.99 POST /api/shell?cmd=cat+/flag 200 yadika{l0g_f0r3ns1cs}\n10.0.0.1 GET /dashboard 200' }, 'readme.txt': { type: 'file', content: 'Analisis access.log.\nCari IP penyerang dan aktivitasnya.' } } } } } } }
    },
    {
        id: 48, title: 'Docker Escape', flag: 'yadika{d0ck3r_3sc4p3}', points: 40, hint: 'Container breakout (edukasi).', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.dockerenv': { type: 'file', content: '' }, 'readme.txt': { type: 'file', content: 'Kamu ada di dalam container!\nCek mount dan cgroup untuk flag.\nGunakan: mount atau cat /proc/1/cgroup' } } } } }, 'proc': { type: 'directory', children: { '1': { type: 'directory', children: { 'cgroup': { type: 'file', content: '12:devices:/docker/abc123\n11:memory:/docker/abc123\n1:name=flag/yadika{d0ck3r_3sc4p3}' } } } } } } },
        customCommands: (cmd, _a, _cp, addLines) => {
            if (cmd === 'mount') { addLines([{ text: '/dev/sda1 on / type ext4', type: 'output' }, { text: 'proc on /proc type proc', type: 'output' }, { text: '/dev/sda1 on /host type ext4 (flag=yadika{d0ck3r_3sc4p3})', type: 'output' }, { text: '', type: 'output' }]); return true; }
            return false;
        }
    },
    {
        id: 49, title: 'Incident Response', flag: 'yadika{1nc1d3nt_r3sp0ns3}', points: 40, hint: 'Investigasi insiden keamanan.', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'incident_report.txt': { type: 'file', content: 'INCIDENT REPORT\n===============\nDate: 2026-02-11\nType: Unauthorized Access\nAttacker IP: 10.0.0.99\nEntry: SSH brute force\nActions: Installed backdoor at /tmp/.hidden/shell.py\nData exfiltrated: /etc/shadow\nEvidence hash: yadika{1nc1d3nt_r3sp0ns3}' }, 'readme.txt': { type: 'file', content: 'Baca laporan insiden.\ncat incident_report.txt' } } } } } } }
    },
    {
        id: 50, title: 'Final Boss Challenge', flag: 'yadika{y4d1k4_m4st3r_2026}', points: 50, hint: 'Rantai serangan: Scan Port -> Local Service -> Git Repo -> Decrypt.', ...STAGE5,
        filesystem: {
            type: 'directory', children: {
                'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: 'Selamat datang di tantangan terakhir.\nSistem ini memiliki layanan tersembunyi.\nTemukan rantaian kunci untuk membuka flag terakhir.' } } } } },
                'opt': {
                    type: 'directory', children: {
                        'app': {
                            type: 'directory', children: {
                                '.git': { type: 'directory', children: { 'config': { type: 'file', content: '[git config]' } } },
                                'final_secret.enc': { type: 'file', content: '[Encrypted Blobs]' }
                            }
                        }
                    }
                }
            }
        },
        customCommands: (cmd, args, _cp, addLines) => {
            if (cmd === 'ss' || cmd === 'netstat') {
                addLines([
                    { text: 'Netid  State      Recv-Q Send-Q  Local Address:Port', type: 'output' },
                    { text: 'tcp    LISTEN     0      128     127.0.0.1:1337', type: 'output' },
                    { text: 'tcp    LISTEN     0      128     0.0.0.0:22', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'nc' && args.includes('1337')) {
                addLines([
                    { text: 'Yadika Secret Service v1.0', type: 'output' },
                    { text: 'Hint: Verifikasi integritas aplikasi di /opt/app.', type: 'output' },
                    { text: 'Gunakan kemapuan Git-mu untuk melihat masa lalu.', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'git' && args.includes('log')) {
                addLines([
                    { text: 'commit master_key_777', type: 'output' },
                    { text: 'Author: chief-security <chief@yadika.local>', type: 'output' },
                    { text: '    chore: protect final_secret.enc with key "p4ssw0rd_m4st3r_2026"', type: 'output' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            if (cmd === 'openssl' && args.includes('p4ssw0rd_m4st3r_2026')) {
                addLines([
                    { text: 'Decrypting final_secret.enc...', type: 'output' },
                    { text: 'SUCCESS!', type: 'success' },
                    { text: 'Flag: yadika{y4d1k4_m4st3r_2026}', type: 'success' },
                    { text: '', type: 'output' }
                ]);
                return true;
            }
            return false;
        }
    },

    // ============ SESSIONS (1000+) ============
    {
        id: 1001,
        title: 'Module 1: Install Ubuntu Server',
        flag: 'yadika{ubuntu_installed_success}',
        points: 0,
        hint: '',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: { type: 'directory', children: {} }
    },
    {
        id: 1002,
        title: 'Module 2: Basic Commands',
        flag: 'MODULE_COMPLETED',
        points: 0,
        hint: '',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: { type: 'directory', children: {} }
    },
    {
        id: 1003,
        title: 'Module 3: File Management',
        flag: 'yadika{file_manager_master}',
        points: 0,
        hint: '',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: { type: 'directory', children: {} }
    },
    {
        id: 1004,
        title: 'Module 4: Text Editor (Nano)',
        flag: 'MODULE_COMPLETED',
        points: 0,
        hint: '',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: { type: 'directory', children: {} }
    },
    {
        id: 1005,
        title: 'Module 5: User & Permission',
        flag: 'MODULE_COMPLETED',
        points: 0,
        hint: '',
        themeColor: 'primary',
        themeBorder: 'border-primary/30',
        themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: { type: 'directory', children: {} }
    },
];

// Helper functions
export const getLevelById = (id: number): CTFLevel | undefined => ctfLevelData.find(l => l.id === id);

export const getAllLevelMeta = () => ctfLevelData.map(l => ({ id: l.id, title: l.title, points: l.points }));

export const getAllFlags = (): Record<number, string> => {
    const flags: Record<number, string> = {};
    ctfLevelData.forEach(l => { flags[l.id] = l.flag; });
    return flags;
};
