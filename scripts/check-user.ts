import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(discordTag: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { discord: discordTag },
            select: { id: true, discord: true, role: true, fullName: true }
        });
        console.log('User Data:', JSON.stringify(user, null, 2));
    } catch (error) {
        console.error('Error fetching user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const tag = process.argv[2];
if (!tag) {
    console.log('Usage: npx tsx scripts/check-user.ts <discord_tag>');
} else {
    checkUser(tag);
}
