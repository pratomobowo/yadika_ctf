import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                discord: true,
                role: true,
                points: true,
                createdAt: true,
                _count: {
                    select: { progress: true }
                }
            },
            orderBy: { points: 'desc' }
        });

        const formattedUsers = users.map(u => ({
            ...u,
            completedCount: u._count.progress,
            _count: undefined
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error('Admin Fetch Users error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
