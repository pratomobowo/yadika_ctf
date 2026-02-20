"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import ApacheVhostTerminal from '@/components/ApacheVhostTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ApacheVHostPage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1010);
        router.push('/play/session/11');
    };

    return (
        <SessionLayout
            title="MODUL 10: APACHE VIRTUAL HOST"
            currentLevel={1010}
            objectives={[
                "Konsep Virtual Host (VHost)",
                "Menulis konfigurasi server block",
                "Mengaktifkan site (a2ensite)",
                "Reload konfigurasi web server"
            ]}
        >
            <ApacheVhostTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
