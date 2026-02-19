
import { prisma } from './db';
import { logActivity } from './activityLogger';

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
    console.log(`Checking badges for user: ${userId}`);

    // 1. Get all available badges
    const allBadges = await (prisma as any).badge.findMany();

    // 2. Get user's current badges
    const userBadges = await (prisma as any).userBadge.findMany({
        where: { userId },
        select: { badgeId: true }
    });
    const userBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));

    // 3. Get user metrics
    const progressCount = await prisma.progress.count({ where: { userId } });
    const maxLevelRecord = await prisma.progress.findFirst({
        where: { userId },
        orderBy: { level: 'desc' },
        select: { level: true }
    });
    const maxLevel = maxLevelRecord?.level || 0;

    const awardedBadges: string[] = [];

    for (const badge of allBadges) {
        if (userBadgeIds.has(badge.id)) continue;

        let shouldAward = false;
        const criteria = JSON.parse(badge.criteria);

        if (criteria.type === 'level') {
            // Milestone level (10, 20, 30, etc.)
            if (maxLevel >= criteria.threshold) {
                shouldAward = true;
            }
        } else if (criteria.type === 'speed') {
            // X levels in Y hours
            const timeframeHours = criteria.timeframe || 24;
            const thresholdCount = criteria.count || 10;
            const cutoff = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

            const recentCount = await prisma.progress.count({
                where: {
                    userId,
                    completedAt: { gte: cutoff }
                }
            });

            if (recentCount >= thresholdCount) {
                shouldAward = true;
            }
        } else if (criteria.type === 'quiz_streak') {
            const thresholdDays = criteria.days || 7;

            const correctAttempts = await prisma.quizAttempt.findMany({
                where: { userId, isCorrect: true },
                orderBy: { attemptedAt: 'desc' },
                take: thresholdDays * 5 // Take more samples to find consecutive days
            });

            const uniqueDays = Array.from(new Set(correctAttempts.map(a =>
                new Date(a.attemptedAt).toISOString().split('T')[0]
            ))).sort((a, b) => b.localeCompare(a)); // Newest first

            if (uniqueDays.length >= thresholdDays) {
                let consecutiveCount = 1;
                for (let i = 0; i < uniqueDays.length - 1; i++) {
                    const d1 = new Date(uniqueDays[i]);
                    const d2 = new Date(uniqueDays[i + 1]);
                    const diffDays = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);

                    if (Math.round(diffDays) === 1) {
                        consecutiveCount++;
                    } else {
                        break;
                    }
                }
                if (consecutiveCount >= thresholdDays) shouldAward = true;
            }
        }

        if (shouldAward) {
            try {
                await (prisma as any).userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id
                    }
                });
                awardedBadges.push(badge.name);
                // Log badge earned activity
                await logActivity(userId, 'BADGE_EARNED', `mendapatkan badge "${badge.name}"!`, badge.icon || 'Award');
            } catch (e) {
                // Parallel attempts might cause unique constraint failure, ignore
                console.error(`Error awarding badge ${badge.name}:`, e);
            }
        }
    }

    return awardedBadges;
}
