import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'yadika-ctf-secret-key-change-in-production'
);

export interface UserSession {
    id: string;
    discord: string;
    fullName: string;
}

export async function createSession(user: UserSession): Promise<string> {
    const token = await new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });

    return token;
}

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as UserSession;
    } catch {
        return null;
    }
}

export async function deleteSession(): Promise<void> {
    (await cookies()).delete('session');
}
