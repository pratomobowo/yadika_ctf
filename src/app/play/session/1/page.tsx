"use client";

import { UbuntuInstallSimulator } from '@/components/UbuntuInstallSimulator';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useRouter } from 'next/navigation';

const SESSION_ID = 1001;
const SESSION_FLAG = 'yadika{ubuntu_installed_success}'; // This is technically unused by the new API for >1000 but required by hook

export default function InstallUbuntuPage() {
    const { submitFlag } = useSubmitFlag(SESSION_ID);
    const router = useRouter();

    const handleComplete = async () => {
        await submitFlag(SESSION_FLAG);
        router.push('/play/session/2');
    };

    return (
        <SessionLayout
            title="MODULE 1: INSTALL UBUNTU SERVER"
            currentLevel={1001}
            objectives={[
                "Memahami proses instalasi dasar Ubuntu Server.",
                "Mengkonfigurasi partisi storage secara manual.",
                "Mengatur profile user dan hostname server.",
                "Mengenal antarmuka installer Subiquity."
            ]}
        >
            <UbuntuInstallSimulator onComplete={handleComplete} />
        </SessionLayout>
    );
}
