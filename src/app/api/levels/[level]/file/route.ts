import { NextRequest, NextResponse } from 'next/server';
import { getLevelById, CTFLevel } from '@/lib/ctfLevels.server';
import { FileNode } from '@/lib/vfsUtils';
import { getSession } from '@/lib/auth';

export async function GET(
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

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    // Traverse filesystem to find the file
    // We assume path is absolute or we resolve it.
    // Client sends absolute path usually.
    // We need a helper to traverse server-side FileNode.

    // Simple traversal logic
    const parts = path.split('/').filter(p => p !== '');
    let current: FileNode | undefined = levelData.filesystem;

    for (const part of parts) {
        if (!current || current.type !== 'directory' || !current.children) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        current = current.children[part];
    }

    if (!current || current.type !== 'file') {
        return NextResponse.json({ error: 'File not found or not a file' }, { status: 404 });
    }

    return NextResponse.json({ content: current.content || '' });
}
