import { FileNode } from './vfsUtils';
import { TerminalLine } from '@/hooks/useTerminalShell';
import { mediumCtfLevels } from './ctfLevels.medium';

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
    category: string;
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
        flag: '',
        points: 20,
        hint: 'Gunakan perintah ls dan cat.',
        category: 'Linux CLI',
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
                                'welcome.txt': { type: 'file', content: '[REDACTED]' },
                                'catatan.txt': { type: 'file', content: '[REDACTED]' },
                                '.secret': {
                                    type: 'directory',
                                    children: {
                                        'flag.txt': { type: 'file', content: '[REDACTED]' },
                                        'readme.md': { type: 'file', content: '[REDACTED]' }
                                    }
                                }
                            }
                        },
                        'admin': {
                            type: 'directory',
                            children: {
                                'config.txt': { type: 'file', content: '[REDACTED]' }
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
                                'system.log': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'directory',
                    children: {
                        'notes.txt': { type: 'file', content: '[REDACTED]' }
                    }
                }
            }
        }
    },
    {
        id: 2,
        title: 'The Hidden Message',
        flag: '',
        points: 20,
        hint: 'Gunakan echo dan base64 --decode.',
        category: 'Linux CLI',
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
                                'README.txt': { type: 'file', content: '[REDACTED]' },
                                'messages': {
                                    type: 'directory',
                                    children: {
                                        'from_admin.txt': { type: 'file', content: '[REDACTED]' },
                                        'notes.txt': { type: 'file', content: '[REDACTED]' }
                                    }
                                },
                                'backup': {
                                    type: 'directory',
                                    children: {
                                        'secret_message.b64': { type: 'file', content: '[REDACTED]' },
                                        'info.txt': { type: 'file', content: '[REDACTED]' }
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
                                'auth.log': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 3, title: 'Needle in a Haystack', flag: '', points: 20, hint: 'Gunakan grep.', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'logs': {
                                    type: 'directory', children: {
                                        'access.log': { type: 'file', content: '[REDACTED]' },
                                        'error.log': { type: 'file', content: '[REDACTED]' }
                                    }
                                },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 4, title: 'Pipelining', flag: '', points: 20, hint: 'Gunakan pipe (|).', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'data.txt': { type: 'file', content: '[REDACTED]' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 5, title: 'Strict Rules', flag: '', points: 20, hint: 'Pahami chmod.', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'locked_file.txt': { type: 'file', content: '[REDACTED]', permissions: '---------' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 6, title: 'Process Hunting', flag: '', points: 20, hint: 'Gunakan ps aux.', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 7, title: 'Output Master', flag: '', points: 20, hint: 'Gunakan redirection (>).', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 8, title: 'Environment Secrets', flag: '', points: 20, hint: 'Gunakan env atau printenv.', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 9, title: 'Web Recon', flag: '', points: 20, hint: 'Cari flag di web folder.', category: 'Linux CLI', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'var': {
                    type: 'directory', children: {
                        'www': {
                            type: 'directory', children: {
                                'html': {
                                    type: 'directory', children: {
                                        'index.html': { type: 'file', content: '[REDACTED]' },
                                        '.htaccess': { type: 'file', content: '[REDACTED]' }
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
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 10, title: 'Bash Script Runner', flag: '', points: 20, hint: 'Jalankan script .sh.', category: 'Scripting', themeColor: 'primary', themeBorder: 'border-primary/30', themeShadow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'get_flag.sh': { type: 'file', content: '[REDACTED]', permissions: 'rwxr-xr-x' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    // ============ STAGE 2: Intermediate Linux (11-20) ============
    {
        id: 11, title: 'Find the Needle', flag: '', points: 25,
        hint: 'Gunakan perintah find untuk mencari file berdasarkan nama.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
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
                                                        'secret.flag': { type: 'file', content: '[REDACTED]' }
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
                'tmp': { type: 'directory', children: { 'noise.txt': { type: 'file', content: '[REDACTED]' } } },
                'etc': { type: 'directory', children: { 'config.txt': { type: 'file', content: '[REDACTED]' } } }
            }
        }
    },
    {
        id: 12, title: 'Cron Job Spy', flag: '', points: 25,
        hint: 'Periksa crontab untuk melihat scheduled tasks.',
        category: 'Scripting',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                },
                'etc': { type: 'directory', children: { 'crontab': { type: 'file', content: '[REDACTED]' } } }
            }
        }
    },
    {
        id: 13, title: 'Symlink Trail', flag: '', points: 25,
        hint: 'Ikuti symbolic links dengan readlink atau ls -la.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'clue.txt': { type: 'file', content: '[REDACTED]' },
                                'final_destination.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                },
                'tmp': { type: 'directory', children: { 'shortcut': { type: 'file', content: '[REDACTED]' } } }
            }
        }
    },
    {
        id: 14, title: 'Archive Digger', flag: '', points: 25,
        hint: 'Ekstrak arsip .tar.gz untuk menemukan flag.',
        category: 'Scripting',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'backup.tar.gz': { type: 'file', content: '[REDACTED]' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 15, title: 'Disk Detective', flag: '', points: 25,
        hint: 'Gunakan df dan du untuk memeriksa penggunaan disk.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 16, title: 'Log Analyzer', flag: '', points: 25,
        hint: 'Analisis file log untuk menemukan aktivitas mencurigakan.',
        category: 'Scripting',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                },
                'var': {
                    type: 'directory', children: {
                        'log': {
                            type: 'directory', children: {
                                'auth.log': { type: 'file', content: '[REDACTED]' },
                                'syslog': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 17, title: 'User Hunter', flag: '', points: 25,
        hint: 'Periksa /etc/passwd untuk menemukan user mencurigakan.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'directory', children: {
                        'passwd': { type: 'file', content: '[REDACTED]' }
                    }
                }
            }
        }
    },
    {
        id: 18, title: 'Network Peek', flag: '', points: 25,
        hint: 'Lihat konfigurasi jaringan dengan ip addr atau ifconfig.',
        category: 'Networking',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 19, title: 'Sed Surgeon', flag: '', points: 25,
        hint: 'Gunakan sed untuk memanipulasi teks.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'encoded.txt': { type: 'file', content: '[REDACTED]' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 20, title: 'Awk Wizard', flag: '', points: 25,
        hint: 'Gunakan awk untuk mengekstrak kolom tertentu.',
        category: 'Linux CLI',
        ...STAGE2,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'data.csv': { type: 'file', content: '[REDACTED]' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    // ============ STAGE 3: Networking & Protocols (21-30) ============
    {
        id: 21, title: 'Ping Sweep', flag: '', points: 30, hint: 'Gunakan ping atau nmap -sn untuk menemukan host aktif.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 22, title: 'Port Scanner', flag: '', points: 30, hint: 'Scan port yang terbuka pada server.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 23, title: 'DNS Lookup', flag: '', points: 30, hint: 'Gunakan dig atau nslookup untuk resolusi DNS.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 24, title: 'HTTP Inspector', flag: '', points: 30, hint: 'Periksa HTTP header dengan curl -I, atau gunakan User-Agent khusus.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 25, title: 'Wget Warrior', flag: '', points: 30, hint: 'Unduh file dari server remote.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 26, title: 'Firewall Rules', flag: '', points: 30, hint: 'Baca aturan firewall dengan iptables atau ufw.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 27, title: 'SSH Key Master', flag: '', points: 30, hint: 'Inspeksi SSH key untuk menemukan flag.', category: 'Networking', ...STAGE3,
        filesystem: {
            type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.ssh': { type: 'directory', children: { 'authorized_keys': { type: 'file', content: '[REDACTED]' }, 'id_rsa.pub': { type: 'file', content: '[REDACTED]' } } }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } }
        }
    },
    {
        id: 28, title: 'SCP Transfer', flag: '', points: 30, hint: 'Transfer file antar server menggunakan scp.', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 29, title: 'Network Sniffer', flag: '', points: 30, hint: 'Analisis network capture dengan tcpdump. Flag terpecah!', category: 'Networking', ...STAGE3,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'capture.pcap': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 30, title: 'Reverse Shell 101', flag: '', points: 30, hint: 'Siapkan listener untuk menerima flag.', category: 'Networking', ...STAGE3,
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'guest': {
                            type: 'directory', children: {
                                'send_data.sh': { type: 'file', content: '[REDACTED]' },
                                'readme.txt': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },
    // ============ STAGE 4: DevOps Tools & Containers (31-40) ============
    {
        id: 31, title: 'Git Basics', flag: '', points: 35, hint: 'Telusuri Git history.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 32, title: 'Git Secrets', flag: '', points: 35, hint: 'Temukan credential di commit lama.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 33, title: 'Docker Hello', flag: '', points: 35, hint: 'Jalankan container Docker.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 34, title: 'Docker Inspect', flag: '', points: 35, hint: 'Baca metadata container.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 35, title: 'Dockerfile Builder', flag: '', points: 35, hint: 'Build image dari Dockerfile.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'Dockerfile': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 36, title: 'Docker Compose', flag: '', points: 35, hint: 'Analisis docker-compose.yml.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'docker-compose.yml': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 37, title: 'Systemd Service', flag: '', points: 35, hint: 'Periksa systemd unit files.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } }, 'etc': { type: 'directory', children: { 'systemd': { type: 'directory', children: { 'system': { type: 'directory', children: { 'backdoor.service': { type: 'file', content: '[REDACTED]' } } } } } } } } }
    },
    {
        id: 38, title: 'Nginx Config', flag: '', points: 35, hint: 'Verifikasi konfigurasi Nginx dan akses port.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } }, 'etc': { type: 'directory', children: { 'nginx': { type: 'directory', children: { 'sites-enabled': { type: 'directory', children: { 'default': { type: 'file', content: '[REDACTED]' } } } } } } } } }
    },
    {
        id: 39, title: 'Environment Deploy', flag: '', points: 35, hint: 'Periksa file .env.', category: 'DevOps', ...STAGE4,
        filesystem: {
            type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'app': { type: 'directory', children: { '.env': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } } }
        }
    },
    {
        id: 40, title: 'CI/CD Pipeline', flag: '', points: 35, hint: 'Analisis pipeline YAML.', category: 'DevOps', ...STAGE4,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.github': { type: 'directory', children: { 'workflows': { type: 'directory', children: { 'deploy.yml': { type: 'file', content: '[REDACTED]' } } } } }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    // ============ STAGE 5: Security & Advanced (41-50) ============
    {
        id: 41, title: 'Password Crack', flag: '', points: 40, hint: 'Crack hash sederhana.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'hashes.txt': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 42, title: 'SSL Inspector', flag: '', points: 40, hint: 'Periksa sertifikat SSL.', category: 'Networking', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 43, title: 'Sudo Escalation', flag: '', points: 40, hint: 'Cek sudo misconfig.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } }, 'etc': { type: 'directory', children: { 'sudoers': { type: 'file', content: '[REDACTED]' } } } } }
    },
    {
        id: 44, title: 'SUID Exploit', flag: '', points: 40, hint: 'Temukan SUID binary.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 45, title: 'Backup Recovery', flag: '', points: 40, hint: 'Pulihkan data dari backup.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'backup.enc': { type: 'file', content: '[REDACTED]' }, 'decrypt_key.txt': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 46, title: 'Steganography', flag: '', points: 40, hint: 'Flag tersembunyi di metadata.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'image.png': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 47, title: 'Log Forensics', flag: '', points: 40, hint: 'Analisis log serangan.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'access.log': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 48, title: 'Docker Escape', flag: '', points: 40, hint: 'Container breakout (edukasi).', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { '.dockerenv': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } }, 'proc': { type: 'directory', children: { '1': { type: 'directory', children: { 'cgroup': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 49, title: 'Incident Response', flag: '', points: 40, hint: 'Investigasi insiden keamanan.', category: 'Security', ...STAGE5,
        filesystem: { type: 'directory', children: { 'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'incident_report.txt': { type: 'file', content: '[REDACTED]' }, 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } } } }
    },
    {
        id: 50, title: 'Final Boss Challenge', flag: '', points: 50, hint: 'Rantai serangan: Scan Port -> Local Service -> Git Repo -> Decrypt.', category: 'Security', ...STAGE5,
        filesystem: {
            type: 'directory', children: {
                'home': { type: 'directory', children: { 'guest': { type: 'directory', children: { 'readme.txt': { type: 'file', content: '[REDACTED]' } } } } },
                'opt': {
                    type: 'directory', children: {
                        'app': {
                            type: 'directory', children: {
                                '.git': { type: 'directory', children: { 'config': { type: 'file', content: '[REDACTED]' } } },
                                'final_secret.enc': { type: 'file', content: '[REDACTED]' }
                            }
                        }
                    }
                }
            }
        }
    },

];

// Merge medium levels
const allCtfLevels = [...ctfLevelData, ...mediumCtfLevels];

// Helper functions — use merged array
export const getLevelById = (id: number): CTFLevel | undefined => allCtfLevels.find(l => l.id === id);

export const getAllLevelMeta = () => allCtfLevels.map(l => ({ id: l.id, title: l.title, points: l.points }));

export { allCtfLevels as ctfLevels };
