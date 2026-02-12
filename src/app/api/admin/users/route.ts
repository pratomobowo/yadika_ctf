import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
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
                orderBy: { points: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count()
        ]);

        const formattedUsers = users.map(u => ({
            ...u,
            completedCount: u._count.progress,
            _count: undefined
        }));

        return NextResponse.json({
            users: formattedUsers,
            pagination: {
                total: totalUsers,
                pages: Math.ceil(totalUsers / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Admin Fetch Users error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
