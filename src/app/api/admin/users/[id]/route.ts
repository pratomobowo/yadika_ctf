import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const data = await req.json();
        const { fullName, discord, role, points } = data;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                fullName,
                discord,
                role,
                points: parseInt(points) || 0
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Admin Update User error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin Delete User error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Reset Progress Sub-Action
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { action } = await req.json();

        if (action === 'reset_progress') {
            await prisma.progress.deleteMany({
                where: { userId: id }
            });

            await prisma.user.update({
                where: { id },
                data: { points: 0 }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Reset Progress error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
