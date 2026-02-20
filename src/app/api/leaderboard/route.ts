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
                },
                clan: {
                    select: { tag: true }
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
            clanTag: u.clan?.tag || null,
        }));

        // Clan leaderboard
        const clans = await (prisma.clan as any).findMany({
            include: {
                members: {
                    select: { points: true },
                },
                leader: {
                    select: { discord: true },
                },
                _count: {
                    select: { members: true },
                },
            },
        });

        const clanLeaderboard = clans
            .map((c: any) => ({
                name: c.name,
                tag: c.tag,
                totalPoints: c.members.reduce((sum: number, m: any) => sum + m.points, 0),
                memberCount: c._count.members,
                maxMembers: c.maxMembers,
                leaderName: c.leader.discord,
            }))
            .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
            .slice(0, 10)
            .map((c: any, i: number) => ({ ...c, rank: i + 1 }));

        return NextResponse.json({ leaderboard, clanLeaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
    }
}
