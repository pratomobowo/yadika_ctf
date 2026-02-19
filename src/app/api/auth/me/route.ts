import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSession, deleteSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ user: null });
        }

        // Get user with progress
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                fullName: true,
                discord: true,
                role: true,
                points: true,
                createdAt: true,
                progress: {
                    select: {
                        level: true,
                        completedAt: true,
                    },
                    orderBy: { level: 'asc' },
                },
                badges: {
                    select: {
                        awardedAt: true,
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                icon: true,
                            }
                        }
                    }
                }
            },
        });

        if (!user) {
            await deleteSession();
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get session error:', error);
        return NextResponse.json({ user: null });
    }
}

export async function DELETE() {
    await deleteSession();
    return NextResponse.json({ success: true });
}
