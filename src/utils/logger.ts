/**
 * Production-safe logger utility
 * Removes all console logs in production builds
 * Use this instead of console.log/error/warn throughout the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    log: (message: string, ...args: any[]) => void;
}

class ProductionLogger implements Logger {
    private isDevelopment: boolean;
    private isTest: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isTest = process.env.NODE_ENV === 'test';
    }

    private shouldLog(level: LogLevel): boolean {
        // Always log errors
        if (level === 'error') return true;
        
        // In production, only log errors
        if (!this.isDevelopment && !this.isTest) return false;
        
        // In development/test, log everything
        return true;
    }

    private sanitize(message: string): string {
        // Remove potential sensitive data patterns
        return message
            .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, 'Bearer [REDACTED]')
            .replace(/token["\s:=]+[\w-]+/gi, 'token: [REDACTED]')
            .replace(/password["\s:=]+\S+/gi, 'password: [REDACTED]')
            .replace(/api[_-]?key["\s:=]+\S+/gi, 'apiKey: [REDACTED]')
            .replace(/secret["\s:=]+\S+/gi, 'secret: [REDACTED]');
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(`[DEBUG] ${this.sanitize(message)}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${this.sanitize(message)}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${this.sanitize(message)}`, ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            // In production, sanitize error messages to avoid leaking sensitive info
            const sanitizedMessage = this.isDevelopment ? message : this.sanitize(message);
            console.error(`[ERROR] ${sanitizedMessage}`, ...args);
        }
    }

    log(message: string, ...args: any[]): void {
        // Alias for info
        this.info(message, ...args);
    }
}

// Export singleton instance
export const logger = new ProductionLogger();

// For backwards compatibility, export as default
export default logger;