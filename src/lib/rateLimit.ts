type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
    limit: number;      // Max requests
    windowMs: number;   // Time window in milliseconds
}

export function checkRateLimit(ip: string, config: RateLimitConfig): { success: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + config.windowMs });
        return { success: true, remaining: config.limit - 1 };
    }

    if (now > record.resetTime) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, resetTime: now + config.windowMs });
        return { success: true, remaining: config.limit - 1 };
    }

    if (record.count >= config.limit) {
        return { success: false, remaining: 0 };
    }

    record.count += 1;
    return { success: true, remaining: config.limit - record.count };
}

// Cleanup interval (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);
