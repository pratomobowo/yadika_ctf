import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const activities = await (prisma as any).activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                type: true,
                message: true,
                icon: true,
                createdAt: true,
                user: {
                    select: { discord: true }
                }
            }
        });

        return NextResponse.json({ activities });
    } catch (error) {
        console.error('Activity feed error:', error);
        return NextResponse.json({ activities: [] });
    }
}
