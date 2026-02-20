import { NextRequest, NextResponse } from 'next/server';
import { getLevelById } from '@/lib/ctfLevels.server';
import { getSession } from '@/lib/auth';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ level: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = await params;
    const levelId = parseInt(level, 10);
    const levelData = getLevelById(levelId);

    if (!levelData) {
        return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    return NextResponse.json({ env: levelData.initialEnv || {} });
}
