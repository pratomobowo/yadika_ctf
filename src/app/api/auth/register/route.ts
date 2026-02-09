import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, discord, password } = body;

        // Validate input
        if (!fullName || !discord || !password) {
            return NextResponse.json(
                { error: 'Semua field harus diisi (fullName, discord, password)' },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                { error: 'Password minimal 4 karakter' },
                { status: 400 }
            );
        }

        // Check if discord username already exists
        const existingUser = await prisma.user.findUnique({
            where: { discord },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username Discord sudah terdaftar' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName,
                discord,
                password: hashedPassword,
            },
        });

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
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Gagal mendaftarkan user' },
            { status: 500 }
        );
    }
}
