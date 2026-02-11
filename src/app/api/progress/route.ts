import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getAllFlags, getLevelById } from '@/lib/ctfLevels';

// CTF Flags from central config
const CTF_FLAGS = getAllFlags();

// Module Flags (keep existing for now if any, or merge into central config later)
const MODULE_FLAGS: { [level: number]: string } = {
    // Modules use 1XXX, 2XXX, etc.
};

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const progress = await prisma.progress.findMany({
            where: { userId: session.id },
            select: {
                level: true,
                completedAt: true,
            },
            orderBy: { level: 'asc' },
        });

        return NextResponse.json({ progress });
    } catch (error) {
        console.error('Get progress error:', error);
        return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { level, flag } = body;

        // Validate input
        if (!level || !flag) {
            return NextResponse.json(
                { error: 'Level dan flag harus diisi' },
                { status: 400 }
            );
        }

        let correctFlag = '';
        let pointsToAward = 10; // Default for modules

        if (level < 1000) {
            // It's a CTF level
            const levelData = getLevelById(level);
            correctFlag = levelData?.flag || '';
            pointsToAward = levelData?.points || 20;

            if (!correctFlag || flag.toLowerCase() !== correctFlag.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Flag salah!', correct: false },
                    { status: 400 }
                );
            }
        } else {
            // It's a Module level
            correctFlag = MODULE_FLAGS[level] || '';
            if (!correctFlag || flag.toLowerCase() !== correctFlag.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Flag salah!', correct: false },
                    { status: 400 }
                );
            }
        }

        // Check if already completed
        const existingProgress = await prisma.progress.findUnique({
            where: {
                userId_level: {
                    userId: session.id,
                    level,
                },
            },
        });

        if (existingProgress) {
            return NextResponse.json({
                success: true,
                correct: true,
                message: 'Level sudah diselesaikan sebelumnya',
                alreadyCompleted: true,
            });
        }

        // Save progress
        await prisma.progress.create({
            data: {
                userId: session.id,
                level,
                flag,
            },
        });

        await (prisma.user as any).update({
            where: { id: session.id },
            data: { points: { increment: pointsToAward } },
        });

        return NextResponse.json({
            success: true,
            correct: true,
            message: 'Selamat! Flag benar!',
            pointsAwarded: pointsToAward,
        });
    } catch (error) {
        console.error('Submit progress error:', error);
        return NextResponse.json({ error: 'Failed to submit progress' }, { status: 500 });
    }
}
