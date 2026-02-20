"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import ApacheServerTerminal from '@/components/ApacheServerTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstallApachePage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1006);
        router.push('/play/session/7');
    };

    return (
        <SessionLayout
            title="MODUL 6: WEB SERVER APACHE"
            currentLevel={1006}
            objectives={[
                "Mengenal Apache HTTP Server",
                "Menginstall package apache2",
                "Menjalankan service apache2",
                "Mengecek status web server"
            ]}
        >
            <ApacheServerTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
