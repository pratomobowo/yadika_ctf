
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Check if user attempted a quiz today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayAttempt = await prisma.quizAttempt.findFirst({
            where: {
                userId: session.id,
                attemptedAt: {
                    gte: startOfDay
                }
            }
        });

        if (todayAttempt) {
            return NextResponse.json({
                available: false,
                message: 'Kamu sudah menyelesaikan kuis harian hari ini.',
                nextAvailable: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
            });
        }

        // 2. Get a random quiz
        // Optimization: For larger datasets, use raw query for random.
        // For now, fetch IDs and pick one.
        const quizzes = await prisma.quiz.findMany({
            select: { id: true }
        });

        if (quizzes.length === 0) {
            return NextResponse.json({ available: false, message: 'Tidak ada kuis yang tersedia.' });
        }

        const randomIndex = Math.floor(Math.random() * quizzes.length);
        const randomQuizId = quizzes[randomIndex].id;

        const quiz = await prisma.quiz.findUnique({
            where: { id: randomQuizId },
            select: {
                id: true,
                question: true,
                options: true,
                points: true
            }
        });

        return NextResponse.json({
            available: true,
            quiz
        });

    } catch (error) {
        console.error('Daily Quiz Error:', error);
        return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
    }
}
