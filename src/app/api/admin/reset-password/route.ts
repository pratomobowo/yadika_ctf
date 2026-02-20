import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/admin/reset-password — Admin resets a user's password
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'userId dan newPassword harus diisi' }, { status: 400 });
        }

        if (newPassword.length < 4) {
            return NextResponse.json({ error: 'Password minimal 4 karakter' }, { status: 400 });
        }

        // Verify target user exists
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: `Password user ${targetUser.discord} berhasil di-reset.`,
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Gagal reset password' }, { status: 500 });
    }
}
