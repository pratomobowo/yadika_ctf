"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import PhpMyAdminTerminal from '@/components/PhpMyAdminTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstallPhpMyAdminPage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1009);
        router.push('/play/session/10');
    };

    return (
        <SessionLayout
            title="MODUL 9: SETUP PHPMYADMIN"
            currentLevel={1009}
            objectives={[
                "Menginstall phpMyAdmin",
                "Mengetahui integrasi PMA dengan web server",
                "Membuat shortcut (symbolic link) di web root"
            ]}
        >
            <PhpMyAdminTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
