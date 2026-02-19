
import { PrismaClient } from '@prisma/client';
import { checkAndAwardBadges } from '../src/lib/badgeUtils';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Retroactive Badge Awarding ---');

    // Get all users
    const users = await prisma.user.findMany({
        select: { id: true, discord: true }
    });

    console.log(`Found ${users.length} users. Processing...`);

    for (const user of users) {
        console.log(`Processing user: ${user.discord} (${user.id})`);
        try {
            const newBadges = await checkAndAwardBadges(user.id);
            if (newBadges.length > 0) {
                console.log(`  [+] Awarded ${newBadges.length} new badges: ${newBadges.join(', ')}`);
            } else {
                console.log(`  [-] No new badges awarded.`);
            }
        } catch (error) {
            console.error(`  [!] Error processing user ${user.discord}:`, error);
        }
    }

    console.log('--- Batch processing complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
