"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Check, Plus, Trash2, HardDrive, Database } from 'lucide-react';

type Step =
    | 'WELCOME'
    | 'LANGUAGE'
    | 'KEYBOARD'
    | 'TYPE'
    | 'NETWORK'
    | 'STORAGE_SELECT'
    | 'STORAGE_CUSTOM'
    | 'PROFILE'
    | 'INSTALLING'
    | 'FINISH';

interface Partition {
    id: string;
    mount: string;
    size: number; // in GB
}

interface InstallerState {
    language: string;
    keyboard: string;
    type: string;
    network: string;
    yourName: string;
    serverName: string;
    username: string;
    password: string;
    storageType: 'entire' | 'custom';
    partitions: Partition[];
}

// --- Moved Components Outside ---
const Header = ({ step }: { step: Step }) => (
    <div className="bg-[#5E2750] text-white px-4 py-1 flex justify-between items-center text-xs font-bold border-b border-white/10">
        <span>Ubuntu Server 24.04 LTS Installer</span>
        <span className="opacity-60">{step.replace('_', ' ')}</span>
    </div>
);

const Footer = ({ onDone, next, disabled, secondaryLabel, onSecondary }: { onDone?: () => void, next: () => void, disabled?: boolean, secondaryLabel?: string, onSecondary?: () => void }) => (
    <div className="absolute bottom-0 left-0 w-full bg-[#1e1e1e] p-4 flex justify-end gap-3 border-t border-white/5">
        {secondaryLabel && (
            <button
                onClick={onSecondary}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-1 text-sm font-bold transition-colors"
            >
                [ {secondaryLabel} ]
            </button>
        )}
        <button
            onClick={onDone || next}
            disabled={disabled}
            className={`bg-[#E95420] hover:bg-[#C7461B] text-white px-6 py-1 text-sm font-bold shadow-lg transition-colors ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
        >
            [ DONE ]
        </button>
    </div>
);

const Screen = ({ title, children, showFooter = true, forceNext, next, footerDisabled = false, secondaryLabel, onSecondary }: {
    title: string;
    children: React.ReactNode;
    showFooter?: boolean;
    forceNext?: () => void;
    next: () => void;
    footerDisabled?: boolean;
    secondaryLabel?: string;
    onSecondary?: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 h-full flex flex-col items-center"
    >
        <h2 className="text-xl font-bold mb-4 text-[#E95420] border-b-2 border-[#E95420] px-4 pb-1 uppercase tracking-tighter">{title}</h2>
        <div className="w-full max-w-2xl bg-[#2a2a2a] p-6 border border-white/10 rounded-sm shadow-2xl overflow-y-auto max-h-[360px] custom-scrollbar">
            {children}
        </div>
        {showFooter && (
            <Footer
                onDone={forceNext}
                next={next}
                disabled={footerDisabled}
                secondaryLabel={secondaryLabel}
                onSecondary={onSecondary}
            />
        )}
    </motion.div>
);

export const UbuntuInstallSimulator: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState<Step>('WELCOME');
    const [state, setState] = useState<InstallerState>({
        language: 'English',
        keyboard: 'English (US)',
        type: 'Ubuntu Server',
        network: 'enp0s3 (DHCP: 192.168.1.50)',
        yourName: 'Cadet',
        serverName: 'ctf',
        username: 'cadet',
        password: '',
        storageType: 'custom',
        partitions: [],
    });
    const [progress, setProgress] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPart, setNewPart] = useState({ mount: '/', size: '' });

    const DISK_SIZE = 100;
    const usedSpace = state.partitions.reduce((acc, p) => acc + p.size, 0);
    const freeSpace = Math.max(0, Math.round((DISK_SIZE - usedSpace) * 100) / 100);

    useEffect(() => {
        if (step === 'INSTALLING') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('FINISH');
                        return 100;
                    }
                    return prev + Math.random() * 5;
                });
            }, 300);
            return () => clearInterval(interval);
        }
    }, [step]);

    const next = () => {
        if (step === 'STORAGE_SELECT') {
            if (state.storageType === 'custom') {
                setStep('STORAGE_CUSTOM');
                return;
            }
        }

        if (step === 'STORAGE_CUSTOM') {
            if (!state.partitions.some(p => p.mount === '/')) {
                alert('Partisi Root (/) wajib dibuat!');
                return;
            }
            setStep('PROFILE');
            return;
        }

        const flow: Step[] = [
            'WELCOME',
            'LANGUAGE',
            'KEYBOARD',
            'TYPE',
            'NETWORK',
            'STORAGE_SELECT',
            'PROFILE',
            'INSTALLING',
            'FINISH'
        ];
        const currentIndex = flow.indexOf(step as Step);
        if (currentIndex < flow.length - 1) {
            setStep(flow[currentIndex + 1]);
        }
    };

    const parseSize = (input: string): number => {
        if (!input) return NaN;
        const match = input.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([gm])?$/);
        if (!match) return NaN;
        const val = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 'm') return val / 1024; // Better precision
        return val; // default to G
    };

    const addPartition = () => {
        const size = parseSize(newPart.size);
        if (isNaN(size) || size <= 0) {
            alert('Format ukuran tidak valid! Gunakan angka, misal: 10 atau 500m');
            return;
        }
        if (size > freeSpace + 0.001) { // Buffer for rounding
            alert('Tidak cukup ruang!');
            return;
        }

        setState({
            ...state,
            partitions: [...state.partitions, { id: Math.random().toString(), mount: newPart.mount, size: Math.round(size * 100) / 100 }]
        });
        setShowAddModal(false);
        setNewPart({ mount: '/', size: '' }); // Clear input
    };

    const removePartition = (id: string) => {
        setState({
            ...state,
            partitions: state.partitions.filter(p => p.id !== id)
        });
    };

    return (
        <div className="w-full h-[600px] bg-[#1a1a1c] border border-white/10 rounded-lg overflow-hidden relative font-mono text-foreground/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <Header step={step} />

            <AnimatePresence mode="wait">
                {step === 'WELCOME' && (
                    <Screen key="welcome" title="Welcome" showFooter={false} next={next}>
                        <div className="text-center space-y-6 py-10">
                            <TerminalIcon size={64} className="mx-auto text-[#E95420] animate-pulse" />
                            <p className="text-lg">Welcome to Ubuntu Server</p>
                            <p className="text-sm opacity-60">This installer will guide you through the initial configuration of your Ubuntu Server.</p>
                            <button
                                onClick={next}
                                className="mt-8 bg-[#E95420] text-white px-10 py-2 font-bold hover:scale-105 transition-transform"
                            >
                                CONTINUE
                            </button>
                        </div>
                    </Screen>
                )}

                {step === 'LANGUAGE' && (
                    <Screen key="lang" title="LanguageSelection" next={next}>
                        <div className="space-y-2">
                            {['English', 'Bahasa Indonesia', 'Español', 'Français'].map(lang => (
                                <div
                                    key={lang}
                                    onClick={() => setState({ ...state, language: lang })}
                                    className={`p-3 border ${state.language === lang ? 'border-[#E95420] bg-[#E95420]/10' : 'border-transparent'} cursor-pointer hover:bg-white/5 flex justify-between`}
                                >
                                    <span>{lang}</span>
                                    {state.language === lang && <Check size={16} className="text-[#E95420]" />}
                                </div>
                            ))}
                        </div>
                    </Screen>
                )}

                {step === 'KEYBOARD' && (
                    <Screen key="kb" title="Keyboard Configuration" next={next}>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs text-white/40 block mb-2 uppercase">Layout</label>
                                <div className="p-3 bg-black text-[#E95420] border border-white/10">English (US)</div>
                            </div>
                            <div>
                                <label className="text-xs text-white/40 block mb-2 uppercase">Variant</label>
                                <div className="p-3 bg-black text-[#E95420] border border-white/10">English (US)</div>
                            </div>
                            <p className="text-xs opacity-50 italic">Try your keyboard here: <span className="border-b border-dashed">________________</span></p>
                        </div>
                    </Screen>
                )}

                {step === 'TYPE' && (
                    <Screen key="type" title="Type of Installation" next={next}>
                        <div className="space-y-4">
                            <div
                                onClick={() => setState({ ...state, type: 'Ubuntu Server' })}
                                className={`p-4 border ${state.type === 'Ubuntu Server' ? 'border-[#E95420] bg-[#E95420]/10' : 'border-white/5'} cursor-pointer`}
                            >
                                <div className="font-bold flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${state.type === 'Ubuntu Server' ? 'bg-[#E95420] border-[#E95420]' : 'border-white/20'}`} />
                                    Ubuntu Server
                                </div>
                                <p className="text-[10px] opacity-60 mt-1 pl-6">The standard server installation. Includes common tools.</p>
                            </div>
                            <div
                                onClick={() => setState({ ...state, type: 'Ubuntu Server (minimized)' })}
                                className={`p-4 border ${state.type === 'Ubuntu Server (minimized)' ? 'border-[#E95420] bg-[#E95420]/10' : 'border-white/5'} cursor-pointer`}
                            >
                                <div className="font-bold flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${state.type === 'Ubuntu Server (minimized)' ? 'bg-[#E95420] border-[#E95420]' : 'border-white/20'}`} />
                                    Ubuntu Server (minimized)
                                </div>
                                <p className="text-[10px] opacity-60 mt-1 pl-6">A runtime-optimized footprint for use by humans.</p>
                            </div>
                        </div>
                    </Screen>
                )}

                {step === 'NETWORK' && (
                    <Screen key="net" title="Network Configuration" next={next}>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/40 border border-[#E95420]/30 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-[#E95420]">enp0s3</span>
                                    <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded">CONNECTED</span>
                                </div>
                                <div className="text-xs space-y-1 opacity-80">
                                    <p>IPv4 address: 192.168.1.50/24</p>
                                    <p>Gateway: 192.168.1.1</p>
                                    <p>DNS: 8.8.8.8</p>
                                </div>
                            </div>
                            <p className="text-[10px] opacity-50">Setup at least one interface this server can use to talk to other machines.</p>
                        </div>
                    </Screen>
                )}

                {step === 'STORAGE_SELECT' && (
                    <Screen key="storage_select" title="Guided Storage Config" next={next}>
                        <div className="space-y-4">
                            <div
                                onClick={() => setState({ ...state, storageType: 'entire' })}
                                className={`p-4 border bg-[#111] ${state.storageType === 'entire' ? 'border-[#E95420]' : 'border-white/5 opacity-50 grayscale cursor-not-allowed'}`}
                            >
                                <p className="font-bold text-sm">[ ] Use an entire disk</p>
                                <p className="text-[11px] mt-1 pl-6 opacity-60 italic">Disabled: Sesi 1 requires manual identification.</p>
                            </div>
                            <div
                                onClick={() => setState({ ...state, storageType: 'custom' })}
                                className={`bg-[#E95420]/5 p-4 border ${state.storageType === 'custom' ? 'border-[#E95420]' : 'border-white/10'}`}
                            >
                                <p className="font-bold text-sm">[X] Custom storage layout</p>
                                <p className="text-[11px] mt-1 pl-6 opacity-80">Create a specialized partition table tailored to your needs.</p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[11px] opacity-50">This session focuses on manual disk management to ensure you understand file system hierarchy.</p>
                            </div>
                        </div>
                    </Screen>
                )}

                {step === 'STORAGE_CUSTOM' && (
                    <Screen
                        key="storage_custom"
                        title="Storage Configuration"
                        next={next}
                        footerDisabled={!state.partitions.some(p => p.mount === '/')}
                        secondaryLabel="BACK"
                        onSecondary={() => setStep('STORAGE_SELECT')}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[#E95420] pb-2 border-b border-white/5">
                                <HardDrive size={18} />
                                <span className="text-xs font-bold">DEVICE: QEMU HARDDISK ({DISK_SIZE}GB)</span>
                            </div>

                            <div className="bg-black/60 rounded border border-white/5 overflow-hidden">
                                <div className="bg-white/5 px-3 py-1 text-[10px] flex justify-between opacity-50 font-bold">
                                    <span>FILE SYSTEM</span>
                                    <span>SIZE / USAGE</span>
                                </div>
                                <div className="p-3 space-y-3 min-h-[120px]">
                                    {state.partitions.map(p => (
                                        <div key={p.id} className="flex justify-between items-center group bg-[#111] p-2 border-l-2 border-[#E95420]">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-primary">{p.mount}</span>
                                                <span className="text-[9px] opacity-40 uppercase tracking-widest leading-none mt-1">ext4 filesystem</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-bold">{p.size >= 1 ? `${p.size}GB` : `${Math.round(p.size * 1024)}MB`}</span>
                                                <button onClick={() => removePartition(p.id)} className="text-red-500/30 hover:text-red-500">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {state.partitions.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 opacity-20">
                                            <Database size={24} className="mb-2" />
                                            <p className="text-[10px] font-bold">UNPARTITIONED DISK</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-[#E95420]/10 px-3 py-2 flex justify-between items-center border-t border-[#E95420]/20">
                                    <span className="text-[10px] opacity-60">FREE SPACE</span>
                                    <span className="text-sm font-bold text-[#E95420]">{freeSpace >= 1 ? `${freeSpace}GB` : `${Math.round(freeSpace * 1024)}MB`}</span>
                                </div>
                            </div>

                            {showAddModal ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#333] p-4 border border-[#E95420]/50 shadow-2xl relative"
                                >
                                    <h4 className="text-[10px] font-bold text-[#E95420] mb-3 uppercase tracking-wider">Add Partition</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] opacity-40 uppercase">Mount Point</label>
                                            <select
                                                value={newPart.mount}
                                                onChange={e => setNewPart({ ...newPart, mount: e.target.value })}
                                                className="w-full bg-black border border-white/10 text-xs p-1.5 focus:border-[#E95420] outline-none"
                                            >
                                                <option value="/">/</option>
                                                <option value="/boot">/boot</option>
                                                <option value="/home">/home</option>
                                                <option value="swap">swap</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] opacity-40 uppercase">Size (e.g. 10G, 500M)</label>
                                            <input
                                                type="text"
                                                value={newPart.size}
                                                placeholder="10G"
                                                onChange={e => setNewPart({ ...newPart, size: e.target.value })}
                                                className="w-full bg-black border border-white/10 text-xs p-1.5 focus:border-[#E95420] outline-none placeholder:opacity-20"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={addPartition} className="flex-1 bg-[#E95420] text-xs font-bold py-2 hover:bg-[#C7461B]">CREATE</button>
                                        <button onClick={() => setShowAddModal(false)} className="px-4 bg-white/5 text-xs py-2 hover:bg-white/10">CANCEL</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    disabled={freeSpace <= 0}
                                    className="w-full py-3 border border-dashed border-[#E95420]/40 hover:bg-[#E95420]/5 text-[#E95420] text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-10"
                                >
                                    <Plus size={14} /> ADD NEW PARTITION
                                </button>
                            )}

                            <p className="text-[9px] opacity-40 leading-tight">
                                Recommendation: Add at least a Root (/) partition. Advanced users may add swap and /boot.
                            </p>
                        </div>
                    </Screen>
                )}

                {step === 'PROFILE' && (
                    <Screen key="profile" title="Profile Setup" next={next} footerDisabled={state.password.length < 4 || !state.yourName || !state.serverName || !state.username}>
                        <div className="space-y-4 text-xs font-mono">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white/40 block mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={state.yourName}
                                        onChange={e => setState({ ...state, yourName: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-2 text-primary focus:border-primary outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/40 block mb-1">Your Server&apos;s Name</label>
                                    <input
                                        type="text"
                                        value={state.serverName}
                                        onChange={e => setState({ ...state, serverName: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-2 text-primary focus:border-primary outline-none"
                                        placeholder="e.g. ubuntusrv"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/40 block mb-1">Pick a username</label>
                                    <input
                                        type="text"
                                        value={state.username}
                                        onChange={e => setState({ ...state, username: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-2 text-primary focus:border-primary outline-none"
                                        placeholder="e.g. cadet"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/40 block mb-1">Choose a password</label>
                                    <input
                                        type="password"
                                        value={state.password}
                                        onChange={e => setState({ ...state, password: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-2 text-primary focus:border-primary outline-none"
                                        placeholder="Min 4 chars"
                                    />
                                </div>
                            </div>
                        </div>
                    </Screen>
                )}

                {step === 'INSTALLING' && (
                    <Screen key="installing" title="Installing System" showFooter={false} next={next}>
                        <div className="space-y-6 py-10">
                            <div className="w-full h-8 bg-black/50 border border-white/10 rounded-sm overflow-hidden p-1">
                                <motion.div
                                    className="h-full bg-[#E95420]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-[10px] font-mono opacity-60 h-[100px] overflow-hidden">
                                <p>[ OK ] Reached target System Check.</p>
                                <p>[ OK ] Started File System Check on /dev/sda2.</p>
                                {progress > 30 && <p className="text-green-400">{"->"} Installing kernel 6.8.0-ubuntu...</p>}
                                {progress > 60 && <p className="text-blue-400">{"->"} Setting up packages... (apt-get install)</p>}
                                {progress > 90 && <p>{"->"} Finishing installation configuration...</p>}
                            </div>
                        </div>
                    </Screen>
                )}

                <Screen key="finish" title="Installation Complete" showFooter={false} next={next}>
                    <div className="text-center space-y-6 py-10">
                        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center text-black">
                            <Check size={32} strokeWidth={3} />
                        </div>
                        <p className="text-lg text-green-400 font-bold">Installation Successful!</p>
                        <p className="text-sm opacity-60">Ubuntu has been installed to your virtual drive.</p>
                        <button
                            onClick={onComplete}
                            className="mt-8 bg-[#E95420] text-white px-10 py-2 font-bold hover:bg-white hover:text-[#E95420] transition-all"
                        >
                            [ REBOOT NOW ]
                        </button>
                    </div>
                </Screen>
            </AnimatePresence>
        </div>
    );
};
