import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function generateInviteCode(tag: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${tag}-${code}`;
}

const CLAN_CREATION_COST = 50;

// POST /api/clan — Create a new clan
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, tag } = body;

        // Validate inputs
        if (!name || !tag) {
            return NextResponse.json({ error: 'Nama dan Tag harus diisi' }, { status: 400 });
        }

        const cleanTag = tag.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleanTag.length < 2 || cleanTag.length > 5) {
            return NextResponse.json({ error: 'Tag harus 2-5 karakter (huruf/angka)' }, { status: 400 });
        }

        if (name.length < 3 || name.length > 30) {
            return NextResponse.json({ error: 'Nama klan harus 3-30 karakter' }, { status: 400 });
        }

        // Check if user already has a clan
        const user = await prisma.user.findUnique({ where: { id: session.id } });
        if (!user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        if (user.clanId) {
            return NextResponse.json({ error: 'Kamu sudah bergabung di klan lain. Keluar dulu sebelum membuat klan baru.' }, { status: 400 });
        }

        if (user.points < CLAN_CREATION_COST) {
            return NextResponse.json({ error: `Poin tidak cukup! Butuh ${CLAN_CREATION_COST} poin untuk membuat klan. Kamu punya ${user.points} poin.` }, { status: 400 });
        }

        // Check uniqueness
        const existingName = await prisma.clan.findUnique({ where: { name } });
        if (existingName) {
            return NextResponse.json({ error: 'Nama klan sudah dipakai' }, { status: 400 });
        }

        const existingTag = await prisma.clan.findUnique({ where: { tag: cleanTag } });
        if (existingTag) {
            return NextResponse.json({ error: 'Tag klan sudah dipakai' }, { status: 400 });
        }

        // Generate unique invite code
        let inviteCode = generateInviteCode(cleanTag);
        let codeExists = await prisma.clan.findUnique({ where: { inviteCode } });
        while (codeExists) {
            inviteCode = generateInviteCode(cleanTag);
            codeExists = await prisma.clan.findUnique({ where: { inviteCode } });
        }

        // Create clan & deduct points in transaction
        const clan = await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: session.id },
                data: { points: { decrement: CLAN_CREATION_COST } },
            });

            // Create clan
            const newClan = await tx.clan.create({
                data: {
                    name,
                    tag: cleanTag,
                    inviteCode,
                    leaderId: session.id,
                },
            });

            // Add user as member
            await tx.user.update({
                where: { id: session.id },
                data: { clanId: newClan.id },
            });

            return newClan;
        });

        return NextResponse.json({
            success: true,
            message: `Klan "${clan.name}" berhasil dibuat!`,
            clan: {
                id: clan.id,
                name: clan.name,
                tag: clan.tag,
                inviteCode: clan.inviteCode,
            },
        });
    } catch (error) {
        console.error('Create clan error:', error);
        return NextResponse.json({ error: 'Gagal membuat klan' }, { status: 500 });
    }
}

// GET /api/clan — Get user's clan details
export async function GET() {
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
            return NextResponse.json({ clan: null });
        }

        const clan = await prisma.clan.findUnique({
            where: { id: user.clanId },
            include: {
                leader: { select: { id: true, discord: true, points: true } },
                members: {
                    select: { id: true, discord: true, points: true },
                    orderBy: { points: 'desc' },
                },
            },
        });

        if (!clan) {
            return NextResponse.json({ clan: null });
        }

        const totalPoints = clan.members.reduce((sum, m) => sum + m.points, 0);

        return NextResponse.json({
            clan: {
                id: clan.id,
                name: clan.name,
                tag: clan.tag,
                inviteCode: clan.leaderId === session.id ? clan.inviteCode : undefined,
                isLeader: clan.leaderId === session.id,
                leaderId: clan.leaderId,
                leaderName: clan.leader.discord,
                totalPoints,
                maxMembers: clan.maxMembers,
                members: clan.members.map(m => ({
                    id: m.id,
                    discord: m.discord,
                    points: m.points,
                    isLeader: m.id === clan.leaderId,
                })),
            },
        });
    } catch (error) {
        console.error('Get clan error:', error);
        return NextResponse.json({ error: 'Gagal memuat data klan' }, { status: 500 });
    }
}
