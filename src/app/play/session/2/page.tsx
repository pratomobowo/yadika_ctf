"use client";

import BasicCommandsTerminal from '@/components/BasicCommandsTerminal';
import { SessionLayout } from '@/components/layouts/SessionLayout';

export default function BasicCommandsPage() {
    return (
        <SessionLayout
            title="MODULE 2: BASIC COMMANDS"
            currentLevel={1002}
            objectives={[
                "Memahami direktori kerja saat ini (`pwd`).",
                "Melihat daftar isi file (`ls`).",
                "Berpindah antar direktori (`cd`).",
                "Membersihkan layar (`clear`) dan melihat riwayat (`history`)."
            ]}
        >
            <BasicCommandsTerminal />
        </SessionLayout>
    );
}
