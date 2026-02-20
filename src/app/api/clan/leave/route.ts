import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/clan/leave — Leave current clan (or disband if leader)
export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { clanId: true },
        });

        if (!user?.clanId) {
            return NextResponse.json({ error: 'Kamu tidak tergabung di klan manapun' }, { status: 400 });
        }

        const clan = await prisma.clan.findUnique({
            where: { id: user.clanId },
            include: { _count: { select: { members: true } } },
        });

        if (!clan) {
            // Orphaned clanId, just clear it
            await prisma.user.update({ where: { id: session.id }, data: { clanId: null } });
            return NextResponse.json({ success: true, message: 'Kamu telah keluar dari klan.' });
        }

        // If user is the leader
        if (clan.leaderId === session.id) {
            if (clan._count.members > 1) {
                return NextResponse.json({
                    error: 'Kamu adalah ketua klan. Tidak bisa keluar selama masih ada anggota lain. Keluarkan semua anggota terlebih dahulu, atau transfer kepemimpinan.',
                }, { status: 400 });
            }

            // Leader is the only member — disband the clan
            await prisma.$transaction(async (tx) => {
                await tx.user.update({ where: { id: session.id }, data: { clanId: null } });
                await tx.clan.delete({ where: { id: clan.id } });
            });

            return NextResponse.json({
                success: true,
                message: `Klan [${clan.tag}] ${clan.name} telah dibubarkan.`,
                disbanded: true,
            });
        }

        // Regular member leaves
        await prisma.user.update({
            where: { id: session.id },
            data: { clanId: null },
        });

        return NextResponse.json({
            success: true,
            message: `Kamu telah keluar dari klan [${clan.tag}] ${clan.name}.`,
        });
    } catch (error) {
        console.error('Leave clan error:', error);
        return NextResponse.json({ error: 'Gagal keluar dari klan' }, { status: 500 });
    }
}
