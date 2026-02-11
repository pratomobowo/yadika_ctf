import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                discord: true,
                points: true,
                progress: {
                    select: { level: true, completedAt: true },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                },
                _count: {
                    select: { progress: true },
                },
            },
            orderBy: { points: 'desc' },
            take: 20,
        });

        const leaderboard = users.map((u, i) => ({
            rank: i + 1,
            fullName: u.fullName,
            discord: u.discord,
            points: u.points,
            completedCount: u._count.progress,
            lastActive: u.progress[0]?.completedAt || null,
        }));

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
    }
}
