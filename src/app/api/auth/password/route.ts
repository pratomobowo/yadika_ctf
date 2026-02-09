import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Password lama dan baru harus diisi' },
                { status: 400 }
            );
        }

        if (newPassword.length < 4) {
            return NextResponse.json(
                { error: 'Password baru minimal 4 karakter' },
                { status: 400 }
            );
        }

        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { id: session.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Password lama salah' }, { status: 401 });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Gagal mengubah password' }, { status: 500 });
    }
}
