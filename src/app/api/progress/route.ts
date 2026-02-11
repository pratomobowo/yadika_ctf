import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Flags for each level
const FLAGS: { [level: number]: string } = {
    1: 'yadika{shell_king}',
    2: 'yadika{b4se64_d3c0d3r}',
    3: 'yadika{gr3p_m4st3r}',
    4: 'yadika{p1p3_dr34m3r}',
    5: 'yadika{ch0wn_th3_w0rld}',
    6: 'yadika{ps_aux_grep}',
    7: 'yadika{redir_master_ok}',
    8: 'yadika{env_var_found}',
    9: 'yadika{web_root_explorer}',
    10: 'yadika{bash_script_hero}',
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

        // Check if flag is correct
        // Check if flag is correct
        if (level < 1000) {
            const correctFlag = FLAGS[level];
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
        const pointsToAward = level >= 1000 ? 10 : 20; // Module = 10pts, CTF = 20pts

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
