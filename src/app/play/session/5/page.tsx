"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import UserManagementTerminal from '@/components/UserManagementTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Session5Page() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1005);
        router.push('/play/session/completed');
    };

    return (
        <SessionLayout
            title="MODUL 5: MANAJEMEN USER & PERMISSION"
            currentLevel={1005}
            objectives={[
                "Mengelola akun user (useradd)",
                "Memahami hak akses file (rwx)",
                "Mengubah hak akses (chmod)",
                "Mengubah kepemilikan file (chown)"
            ]}
        >
            <UserManagementTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
