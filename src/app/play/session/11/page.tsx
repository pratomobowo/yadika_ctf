"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import NginxVhostTerminal from '@/components/NginxVhostTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NginxVHostPage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1011);
        router.push('/play');
    };

    return (
        <SessionLayout
            title="MODUL 11: NGINX SERVER BLOCKS"
            currentLevel={1011}
            objectives={[
                "Konsep Server Blocks di Nginx",
                "Menulis konfigurasi dasar website",
                "Membuat Symbolic Link untuk VHost",
                "Reload konfigurasi web server"
            ]}
        >
            <NginxVhostTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
