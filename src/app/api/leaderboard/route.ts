import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // @ts-ignore - Bypass outdated Prisma types in IDE
        const users = await (prisma.user as any).findMany({
            select: {
                id: true,
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
                badges: {
                    select: {
                        badge: {
                            select: { icon: true }
                        }
                    }
                }
            },
            orderBy: { points: 'desc' },
            take: 20,
        });

        const leaderboard = users.map((u: any, i: number) => ({
            rank: i + 1,
            discord: u.discord,
            points: u.points,
            completedCount: u._count.progress,
            lastActive: u.progress[0]?.completedAt || null,
            badgeIcons: u.badges.map((ub: any) => ub.badge.icon),
        }));

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
    }
}
