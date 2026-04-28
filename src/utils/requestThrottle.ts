/**
 * Request throttling and rate limiting utilities
 *
 * SECURITY PURPOSE:
 * - Prevents abuse of API endpoints
 * - Mitigates brute force attacks
 * - Reduces server load from excessive requests
 */

interface ThrottleOptions {
    delay: number;
    leading?: boolean;
    trailing?: boolean;
}


interface RateLimitOptions {
    maxRequests: number;
    windowMs: number;
}

/**
 * Throttle function execution to limit how often it can be called
 * @param func Function to throttle
 * @param delay Minimum time between executions in milliseconds
 * @param options Configuration options
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number,
    options: Partial<ThrottleOptions> = {}
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastRan: number = 0;
    const { leading = true, trailing = true } = options;

    return function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();

        if (!lastRan && !leading) {
            lastRan = now;
        }

        const remaining = delay - (now - lastRan);

        if (remaining <= 0 || remaining > delay) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            lastRan = now;
            func.apply(this, args);
        } else if (!timeoutId && trailing) {
            timeoutId = setTimeout(() => {
                lastRan = leading ? Date.now() : 0;
                timeoutId = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

/**
 * Debounce function execution - delays execution until after delay has elapsed since last call
 * @param func Function to debounce
 * @param delay Time to wait before executing in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Rate limiter class to track and limit requests
 */
export class RateLimiter {
    private requests: number[] = [];
    private maxRequests: number;
    private windowMs: number;

    constructor(options: RateLimitOptions) {
        this.maxRequests = options.maxRequests;
        this.windowMs = options.windowMs;
    }

    /**
     * Check if a request is allowed under the rate limit
     * @returns true if request is allowed, false if rate limit exceeded
     */
    public allowRequest(): boolean {
        const now = Date.now();

        // Remove requests outside the time window
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        // Check if we're under the limit
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }

        return false;
    }

    /**
     * Get time until next request is allowed (in milliseconds)
     */
    public getTimeUntilReset(): number {
        if (this.requests.length < this.maxRequests) {
            return 0;
        }

        const oldestRequest = this.requests[0];
        const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
        return Math.max(0, timeUntilReset);
    }

    /**
     * Reset the rate limiter
     */
    public reset(): void {
        this.requests = [];
    }
}

/**
 * Create a rate-limited version of an async function
 * @param func Async function to rate limit
 * @param options Rate limit configuration
 * @returns Rate-limited function that throws error if limit exceeded
 */
export function rateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
    func: T,
    options: RateLimitOptions
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    const limiter = new RateLimiter(options);

    return async function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
        if (!limiter.allowRequest()) {
            const waitTime = limiter.getTimeUntilReset();
            throw new Error(
                `Rate limit exceeded. Please try again in ${Math.ceil(waitTime / 1000)} seconds.`
            );
        }

        return func.apply(this, args) as ReturnType<T>;
    };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
    /** Strict rate limiter: 5 requests per minute */
    strict: (func: (...args: unknown[]) => Promise<unknown>) =>
        rateLimit(func, { maxRequests: 5, windowMs: 60000 }),

    /** Normal rate limiter: 10 requests per minute */
    normal: (func: (...args: unknown[]) => Promise<unknown>) =>
        rateLimit(func, { maxRequests: 10, windowMs: 60000 }),

    /** Relaxed rate limiter: 30 requests per minute */
    relaxed: (func: (...args: unknown[]) => Promise<unknown>) =>
        rateLimit(func, { maxRequests: 30, windowMs: 60000 }),
};
