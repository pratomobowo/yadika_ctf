import { NextRequest, NextResponse } from 'next/server';
import { getLevelById } from '@/lib/ctfLevels.server';
import { getSession } from '@/lib/auth';

interface TerminalLine {
    text: string;
    type: 'output' | 'input' | 'error' | 'success' | 'system';
}

export async function POST(
    request: NextRequest,
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

    if (!levelData.customCommands) {
        return NextResponse.json({ handled: false, lines: [] });
    }

    const { command, args, currentPath } = await request.json();

    const lines: TerminalLine[] = [];
    const addLines = (newLines: TerminalLine[]) => {
        lines.push(...newLines);
    };

    const handled = levelData.customCommands(command, args || [], currentPath || '/', addLines);

    return NextResponse.json({ handled, lines });
}
