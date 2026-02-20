import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getAllFlags, getLevelById } from '@/lib/ctfLevels.server';

// CTF Flags from central config
const CTF_FLAGS = getAllFlags();

// Module Flags (keep existing for now if any, or merge into central config later)
const MODULE_FLAGS: { [level: number]: string } = {
    // Modules use 1XXX, 2XXX, etc.
};

import { checkRateLimit } from '@/lib/rateLimit';
import { checkAndAwardBadges } from '@/lib/badgeUtils';
import { logActivity } from '@/lib/activityLogger';

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
        let pointsToAward = 10;

        const levelData = getLevelById(level);

        // For tutorial modules (level >= 1000), accept 'MODULE_COMPLETED' as a valid completion signal
        const isTutorialAutoCompletion = level >= 1000 && flag === 'MODULE_COMPLETED';

        if (!isTutorialAutoCompletion) {
            if (!levelData) {
                return NextResponse.json(
                    { error: 'Level tidak valid' },
                    { status: 400 }
                );
            }
            correctFlag = levelData.flag;
            pointsToAward = levelData.points || 20;

            if (flag.toLowerCase() !== correctFlag.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Flag salah!', correct: false },
                    { status: 400 }
                );
            }
        } else {
            correctFlag = 'MODULE_COMPLETED';
            pointsToAward = 10;
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

        // Check for new badges
        const newBadges = await checkAndAwardBadges(session.id);

        // Log activity
        const tutorialModuleNames: Record<number, string> = {
            1001: '1. Install Ubuntu',
            1002: '2. Basic Commands',
            1003: '3. File Management',
            1004: '4. Text Editing & Manipulation',
            1005: '5. User & Permission Mgmt',
            1006: '6. Web Server Apache',
            1007: '7. Nginx Web Server',
            1008: '8. Setup MySQL',
            1009: '9. phpMyAdmin Setup',
            1010: '10. Apache VirtualHost',
            1011: '11. Nginx VirtualHost',
        };
        const levelTitle = levelData ? levelData.title : tutorialModuleNames[level] || `Module ${level}`;
        const activityMessage = isTutorialAutoCompletion
            ? `menyelesaikan materi ${levelTitle}!`
            : `memecahkan CTF Level ${level}: ${levelTitle}!`;
        await logActivity(session.id, 'LEVEL_COMPLETE', activityMessage, isTutorialAutoCompletion ? 'Tutorial' : 'Flag');

        return NextResponse.json({
            success: true,
            correct: true,
            message: 'Selamat! Flag benar!',
            pointsAwarded: pointsToAward,
            newBadges: newBadges.length > 0 ? newBadges : undefined
        });
    } catch (error) {
        console.error('Submit progress error:', error);
        return NextResponse.json({ error: 'Failed to submit progress' }, { status: 500 });
    }
}
