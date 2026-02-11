import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteAdmin(discordTag: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { discord: discordTag }
        });

        if (!user) {
            console.error(`User not found: ${discordTag}`);
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        console.log(`Successfully promoted ${discordTag} to ADMIN.`);
    } catch (error) {
        console.error('Promotion failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const tag = process.argv[2];
if (!tag) {
    console.log('Usage: npx tsx scripts/promote-admin.ts <discord_tag>');
} else {
    promoteAdmin(tag);
}
