import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { fullName, discord } = data;

        // Validation
        if (!fullName || fullName.trim().length < 2) {
            return NextResponse.json({ error: 'Nama lengkap minimial 2 karakter' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { id: true, role: true, discord: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        const updateData: any = { fullName };

        // Only allow discord tag change if user is ADMIN
        if (discord && discord !== user.discord) {
            if (user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Hanya admin yang dapat mengubah username Discord' }, { status: 403 });
            }

            // Check if new discord tag is already taken
            const existingUser = await prisma.user.findUnique({
                where: { discord }
            });

            if (existingUser && existingUser.id !== user.id) {
                return NextResponse.json({ error: 'Username Discord sudah digunakan' }, { status: 400 });
            }

            updateData.discord = discord;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                discord: updatedUser.discord,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Profile Update error:', error);
        return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
