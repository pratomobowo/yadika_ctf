
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding badges...');

    const badges = [
        // Progression Badges
        {
            name: "Script Kiddie",
            description: "Selesaikan Stage 1 (Level 1-10)",
            icon: "Terminal",
            criteria: JSON.stringify({ type: "level", threshold: 10 })
        },
        {
            name: "Sudoer Apprentice",
            description: "Selesaikan Stage 2 (Level 11-20)",
            icon: "ShieldCheck",
            criteria: JSON.stringify({ type: "level", threshold: 20 })
        },
        {
            name: "Network Wanderer",
            description: "Selesaikan Stage 3 (Level 21-30)",
            icon: "Globe",
            criteria: JSON.stringify({ type: "level", threshold: 30 })
        },
        {
            name: "Container Architect",
            description: "Selesaikan Stage 4 (Level 31-40)",
            icon: "Package",
            criteria: JSON.stringify({ type: "level", threshold: 40 })
        },
        {
            name: "Kernel Overlord",
            description: "Selesaikan Stage 5 (Level 41-50)",
            icon: "Cpu",
            criteria: JSON.stringify({ type: "level", threshold: 50 })
        },
        // Skill Badges
        {
            name: "Zero-Day Hunter",
            description: "Selesaikan 10 level dalam 24 jam",
            icon: "Zap",
            criteria: JSON.stringify({ type: "speed", count: 10, timeframe: 24 })
        },
        {
            name: "Quiz Wizard",
            description: "7 hari beruntun menjawab kuis harian dengan benar",
            icon: "Wand",
            criteria: JSON.stringify({ type: "quiz_streak", days: 7 })
        }
    ];

    for (const b of badges) {
        await prisma.badge.upsert({
            where: { name: b.name },
            update: b,
            create: b,
        });
    }

    console.log(`Seeded ${badges.length} badges.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
