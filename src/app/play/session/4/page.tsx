"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import TextEditorTerminal from '@/components/TextEditorTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Session4Page() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1004);
        router.push('/play/session/5');
    };

    return (
        <SessionLayout
            title="MODUL 4: EDITOR TEKS (NANO)"
            currentLevel={1004}
            objectives={[
                "Memahami Text Editor CLI (Nano)",
                "Membuat file baru menggunakan editor",
                "Mengubah konfigurasi sistem",
                "Menyimpan perubahan dan keluar dari editor"
            ]}
        >
            <TextEditorTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
