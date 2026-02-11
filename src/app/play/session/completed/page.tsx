"use client";

import { CheckCircle2, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function CourseCompletedPage() {
    return (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-white/10 rounded-lg p-8 bg-[#111] text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <Trophy size={40} className="text-green-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">Selamat!</h1>
                    <p className="text-white/60">
                        Kamu telah menyelesaikan semua materi dasar administrasi sistem Linux yang tersedia saat ini.
                    </p>
                </div>

                <div className="bg-black/30 p-4 rounded border border-white/5 text-sm">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <CheckCircle2 size={16} />
                        <span className="font-bold">Materi Terselesaikan:</span>
                    </div>
                    <ul className="text-left space-y-1 text-white/50 pl-6 list-disc">
                        <li>Installasi Ubuntu Server</li>
                        <li>Basic Commands</li>
                        <li>File Management</li>
                        <li>Text Editing (Nano)</li>
                        <li>User & Permission</li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-white/40 mb-4">Modul lanjutan akan segera hadir.</p>
                    <Link
                        href="/play/session/1"
                        className="block w-full py-2 bg-[#E95420] hover:bg-[#d04616] text-white rounded font-bold transition-colors"
                    >
                        Kembali ke Menu Awal
                    </Link>
                </div>
            </div>
        </div>
    );
}
