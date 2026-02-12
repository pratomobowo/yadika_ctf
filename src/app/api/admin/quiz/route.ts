
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const quizzes = await prisma.quiz.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { attempts: true }
                }
            }
        });
        return NextResponse.json({ quizzes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { question, options, correctAnswer, points } = body;

        if (!question || !options || options.length < 2 || correctAnswer === undefined) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                question,
                options,
                correctAnswer,
                points: points || 2
            }
        });

        return NextResponse.json({ quiz });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.quiz.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
    }
}
