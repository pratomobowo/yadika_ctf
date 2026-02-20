"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import NginxServerTerminal from '@/components/NginxServerTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstallNginxPage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1007);
        router.push('/play/session/8');
    };

    return (
        <SessionLayout
            title="MODUL 7: WEB SERVER NGINX"
            currentLevel={1007}
            objectives={[
                "Mengenal alternatif web server Nginx",
                "Menginstall package nginx",
                "Menjalankan service nginx",
                "Mengecek status Nginx"
            ]}
        >
            <NginxServerTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
