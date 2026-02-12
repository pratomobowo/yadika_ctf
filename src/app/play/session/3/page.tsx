"use client";

import FileManagementTerminal from '@/components/FileManagementTerminal';
import { SessionLayout } from '@/components/layouts/SessionLayout';
import { useSubmitFlag } from '@/hooks/useSubmitFlag';
import { useRouter } from 'next/navigation';

const SESSION_ID = 1003;
const SESSION_FLAG = 'yadika{file_manager_master}';

export default function FileManagementPage() {
    // Note: useSubmitFlag helps with tracking progress state locally and updating context
    const { submitFlag } = useSubmitFlag(SESSION_ID);
    const router = useRouter();

    const handleComplete = async () => {
        // Technically "flag" doesn't matter for >1000 due to our API fix, 
        // but we pass a valid string anyway for consistency
        await submitFlag(SESSION_FLAG);

        // Redirect to next module (Module 4 - Text Editing, not yet created)
        // or back to home if this is the last one implemented
        router.push('/play/session/4');
    };

    return (
        <SessionLayout
            title="MODULE 3: FILE MANAGEMENT"
            currentLevel={1003}
            objectives={[
                "Melihat file tersembunyi dengan `ls -a`.",
                "Membaca isi file dengan `cat`.",
                "Membuat folder dengan `mkdir`.",
                "Memindahkan & Mengatur file dengan `mv`.",
                "Membersihkan file sampah dengan `rm`.",
                "Backup data dengan `cp`."
            ]}
        >
            <FileManagementTerminal onComplete={handleComplete} />
        </SessionLayout>
    );
}
