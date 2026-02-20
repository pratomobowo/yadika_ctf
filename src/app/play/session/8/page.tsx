"use client";

import { SessionLayout } from '@/components/layouts/SessionLayout';
import MysqlSetupTerminal from '@/components/MysqlSetupTerminal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstallMysqlPage() {
    const { updateProgress } = useAuth();
    const router = useRouter();

    const handleComplete = async () => {
        await updateProgress(1008);
        router.push('/play/session/9');
    };

    return (
        <SessionLayout
            title="MODUL 8: SETUP DATABASE MYSQL"
            currentLevel={1008}
            objectives={[
                "Menginstall package mysql-server",
                "Memahami mysql_secure_installation",
                "Login ke prompt database MySQL CLI"
            ]}
        >
            <MysqlSetupTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
