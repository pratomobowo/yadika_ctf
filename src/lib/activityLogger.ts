import { prisma } from './db';

type ActivityType = 'LEVEL_COMPLETE' | 'BADGE_EARNED' | 'QUIZ_CORRECT' | 'REGISTER';

export async function logActivity(
    userId: string,
    type: ActivityType,
    message: string,
    icon: string = 'Terminal'
) {
    try {
        await (prisma as any).activityLog.create({
            data: { userId, type, message, icon }
        });
    } catch (e) {
        // Non-blocking: don't let activity logging break the main flow
        console.error('Failed to log activity:', e);
    }
}
