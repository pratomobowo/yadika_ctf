import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { discord, password } = body;

        // Validate input
        if (!discord || !password) {
            return NextResponse.json(
                { error: 'Username dan password harus diisi' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { discord },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Username tidak ditemukan' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Password salah' },
                { status: 401 }
            );
        }

        // Create session
        await createSession({
            id: user.id,
            discord: user.discord,
            fullName: user.fullName,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                discord: user.discord,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Gagal login' },
            { status: 500 }
        );
    }
}
