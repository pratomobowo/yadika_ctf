
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkAndAwardBadges } from '@/lib/badgeUtils';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { quizId, answerIndex } = body;

        if (!quizId || answerIndex === undefined) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // 1. Verify not attempted today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const existingAttempt = await prisma.quizAttempt.findFirst({
            where: {
                userId: session.id,
                attemptedAt: { gte: startOfDay }
            }
        });

        if (existingAttempt) {
            return NextResponse.json({ error: 'Sudah mencoba hari ini' }, { status: 403 });
        }

        // 2. Fetch quiz
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
        }

        // 3. Check answer
        const isCorrect = quiz.correctAnswer === answerIndex;

        // 4. Record attempt transaction
        const result = await prisma.$transaction(async (tx) => {
            const attempt = await tx.quizAttempt.create({
                data: {
                    userId: session.id,
                    quizId: quiz.id,
                    isCorrect
                }
            });

            let newPoints = 0;
            if (isCorrect) {
                const updatedUser = await tx.user.update({
                    where: { id: session.id },
                    data: {
                        points: { increment: quiz.points }
                    }
                });
                newPoints = updatedUser.points;
            } else {
                const user = await tx.user.findUnique({
                    where: { id: session.id },
                    select: { points: true }
                });
                newPoints = user?.points || 0;
            }

            return { attempt, newPoints };
        });

        // Check for new badges
        const newBadges = await checkAndAwardBadges(session.id);

        // Log activity
        if (isCorrect) {
            await logActivity(session.id, 'QUIZ_CORRECT', 'menjawab kuis harian dengan benar!', 'HelpCircle');
        }

        return NextResponse.json({
            success: true,
            isCorrect,
            pointsAwarded: isCorrect ? quiz.points : 0,
            newTotalPoints: result.newPoints,
            correctAnswer: isCorrect ? undefined : quiz.correctAnswer,
            newBadges: newBadges.length > 0 ? newBadges : undefined
        });

    } catch (error) {
        console.error('Quiz Submit Error:', error);
        return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
    }
}
