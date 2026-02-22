import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/admin/users/[id]/progress — Get detailed progress for a specific user
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                discord: true,
                points: true,
                progress: {
                    select: {
                        level: true,
                        completedAt: true,
                    },
                    orderBy: { level: 'asc' },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Admin get user progress error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
