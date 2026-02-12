
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all users
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                progress: true
            }
        });

        // Format data for Excel
        const data = users.map(user => ({
            ID: user.id,
            'Full Name': user.fullName,
            'Discord': user.discord,
            'Role': user.role,
            'Points': user.points,
            'Levels Completed': user.progress.length,
            'Joined Date': new Date(user.createdAt).toLocaleDateString(),
        }));

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Generate buffer
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Return as download
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

    } catch (error) {
        console.error('Export failed:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
