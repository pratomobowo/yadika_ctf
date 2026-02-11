import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// One-time endpoint to recalculate points for all users based on existing progress
export async function POST() {
    try {
        const users = await prisma.user.findMany({
            include: {
                progress: {
                    select: { level: true },
                },
            },
        });

        const results = [];

        for (const user of users) {
            let totalPoints = 0;
            for (const p of user.progress) {
                totalPoints += p.level >= 1000 ? 10 : 20; // Module = 10pts, CTF = 20pts
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { points: totalPoints },
            });

            results.push({
                fullName: user.fullName,
                completedLevels: user.progress.length,
                points: totalPoints,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Recalculated points for ${results.length} users`,
            results,
        });
    } catch (error) {
        console.error('Recalculate points error:', error);
        return NextResponse.json({ error: 'Failed to recalculate' }, { status: 500 });
    }
}
