import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/clan/join — Join a clan via invite code
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { inviteCode } = body;

        if (!inviteCode || typeof inviteCode !== 'string') {
            return NextResponse.json({ error: 'Kode invite harus diisi' }, { status: 400 });
        }

        // Check if user already in a clan
        const user = await prisma.user.findUnique({ where: { id: session.id } });
        if (!user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        if (user.clanId) {
            return NextResponse.json({ error: 'Kamu sudah bergabung di klan lain. Keluar dulu sebelum join klan baru.' }, { status: 400 });
        }

        // Find clan by invite code
        const clan = await prisma.clan.findUnique({
            where: { inviteCode: inviteCode.toUpperCase() },
            include: {
                _count: { select: { members: true } },
            },
        });

        if (!clan) {
            return NextResponse.json({ error: 'Kode invite tidak valid atau klan tidak ditemukan' }, { status: 404 });
        }

        // Check max members
        if (clan._count.members >= clan.maxMembers) {
            return NextResponse.json({ error: `Klan "${clan.name}" sudah penuh (${clan.maxMembers}/${clan.maxMembers} anggota)` }, { status: 400 });
        }

        // Join the clan
        await prisma.user.update({
            where: { id: session.id },
            data: { clanId: clan.id },
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil bergabung ke klan [${clan.tag}] ${clan.name}!`,
            clan: {
                id: clan.id,
                name: clan.name,
                tag: clan.tag,
            },
        });
    } catch (error) {
        console.error('Join clan error:', error);
        return NextResponse.json({ error: 'Gagal bergabung ke klan' }, { status: 500 });
    }
}
