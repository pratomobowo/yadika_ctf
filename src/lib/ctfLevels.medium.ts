import { CTFLevel } from './ctfLevels';

const MEDIUM_THEME = { themeColor: 'amber-400', themeBorder: 'border-amber-500/30', themeShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' };

export const mediumCtfLevels: CTFLevel[] = [
    {
        id: 51, title: 'JWT Token Forgery', flag: '', points: 60,
        hint: 'Sebuah token telah di-intercept. Apakah kamu bisa menjadi orang lain?',
        category: 'Web Security', ...MEDIUM_THEME,
        user: 'pentester', hostname: 'webapp', initialPath: '/home/pentester',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'pentester': {
                            type: 'directory', children: {
                                'briefing.txt': { type: 'file', content: '[REDACTED]' },
                                'intercepted_token.txt': { type: 'file', content: '[REDACTED]' },
                                'wordlist.txt': { type: 'file', content: '[REDACTED]' },
                            }
                        },
                    }
                },
            }
        },
    },
    {
        id: 52, title: 'SQL Injection', flag: '', points: 60,
        hint: 'Source code aplikasi bocor. Apakah query-nya aman?',
        category: 'Web Security', ...MEDIUM_THEME,
        user: 'hacker', hostname: 'target-db', initialPath: '/home/hacker',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'hacker': {
                            type: 'directory', children: {
                                'briefing.txt': { type: 'file', content: '[REDACTED]' },
                                'auth_source.py': { type: 'file', content: '[REDACTED]' },
                            }
                        },
                    }
                },
            }
        },
    },
    {
        id: 53, title: 'Reverse Shell Forensics', flag: '', points: 65,
        hint: 'Server dikompromikan. Investigasi apa yang terjadi.',
        category: 'Forensics', ...MEDIUM_THEME,
        user: 'analyst', hostname: 'soc-workstation', initialPath: '/home/analyst/incident',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'analyst': {
                            type: 'directory', children: {
                                'incident': {
                                    type: 'directory', children: {
                                        'README.txt': { type: 'file', content: '[REDACTED]' },
                                        'auth.log': { type: 'file', content: '[REDACTED]' },
                                        'capture.pcap': { type: 'file', content: '[REDACTED]' },
                                        'processes.txt': { type: 'file', content: '[REDACTED]' },
                                    }
                                },
                            }
                        },
                    }
                },
                'tmp': { type: 'directory', children: {} },
            }
        },
    },
    {
        id: 54, title: 'Crypto: Multi-Layer Encoding', flag: '', points: 65,
        hint: 'Pesan rahasia tersembunyi dalam beberapa lapisan. Kenali pola-nya.',
        category: 'Cryptography', ...MEDIUM_THEME,
        user: 'cryptoanalyst', hostname: 'crypto-lab', initialPath: '/home/cryptoanalyst',
        filesystem: {
            type: 'directory', children: {
                'home': {
                    type: 'directory', children: {
                        'cryptoanalyst': {
                            type: 'directory', children: {
                                'challenge.txt': { type: 'file', content: '[REDACTED]' },
                            }
                        },
                    }
                },
            }
        },
    },
    {
        id: 55, title: 'Linux Privesc: Cronjob', flag: '', points: 70,
        hint: 'Kamu terjebak sebagai www-data. Target: /root/flag.txt',
        category: 'Privilege Escalation', ...MEDIUM_THEME,
        user: 'www-data', hostname: 'vuln-server', initialPath: '/var/www',
        filesystem: {
            type: 'directory', children: {
                'var': {
                    type: 'directory', children: {
                        'www': {
                            type: 'directory', children: {
                                'html': {
                                    type: 'directory', children: {
                                        'index.html': { type: 'file', content: '[REDACTED]' },
                                    }
                                },
                            }
                        },
                    }
                },
                'etc': {
                    type: 'directory', children: {
                        'crontab': { type: 'file', content: '[REDACTED]' },
                        'passwd': { type: 'file', content: '[REDACTED]' },
                    }
                },
                'opt': {
                    type: 'directory', children: {
                        'scripts': {
                            type: 'directory', children: {
                                'backup.sh': { type: 'file', content: '[REDACTED]' },
                            }
                        },
                    }
                },
                'root': {
                    type: 'directory', children: {
                        'flag.txt': { type: 'file', content: '[REDACTED]' },
                    }
                },
                'tmp': { type: 'directory', children: {} },
            }
        },
    },
];
