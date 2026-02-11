import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'yadika-ctf-secret-key-change-in-production'
);

export interface UserSession {
    id: string;
    discord: string;
    fullName: string;
    role: string;
}

export async function createSession(user: UserSession): Promise<string> {
    const token = await new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);

    const isProd = process.env.NODE_ENV === 'production';
    const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1') || !isProd;

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: isProd && !isLocal, // Only secure in real prod
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });

    return token;
}

export async function getSession(): Promise<UserSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as UserSession;
    } catch (error) {
        return null;
    }
}

export async function deleteSession(): Promise<void> {
    (await cookies()).delete('session');
}
