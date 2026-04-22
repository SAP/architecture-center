import { logger } from '../logger';

describe('Logger Utility', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('basic logging functionality', () => {
        it('should have debug method', () => {
            expect(typeof logger.debug).toBe('function');
            logger.debug('test debug message');
            // In test environment, this should log
            expect(console.log).toHaveBeenCalled();
        });

        it('should have info method', () => {
            expect(typeof logger.info).toBe('function');
            logger.info('test info message');
            // Logger uses console.info which might map to console.log in tests
        });

        it('should have warn method', () => {
            expect(typeof logger.warn).toBe('function');
            logger.warn('test warn message');
            expect(console.warn).toHaveBeenCalled();
        });

        it('should have error method', () => {
            expect(typeof logger.error).toBe('function');
            logger.error('test error message');
            expect(console.error).toHaveBeenCalled();
        });

        it('should have log method', () => {
            expect(typeof logger.log).toBe('function');
        });
    });

    describe('sanitization', () => {
        it('should redact Bearer tokens', () => {
            logger.debug('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
            const calls = (console.log as jest.Mock).mock.calls;
            const loggedMessage = calls[calls.length - 1][0];
            expect(loggedMessage).toContain('[REDACTED]');
            expect(loggedMessage).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        });

        it('should redact passwords', () => {
            logger.debug('password: mySecretPassword123');
            const calls = (console.log as jest.Mock).mock.calls;
            const loggedMessage = calls[calls.length - 1][0];
            expect(loggedMessage).toContain('[REDACTED]');
            expect(loggedMessage).not.toContain('mySecretPassword123');
        });

        it('should redact API keys', () => {
            logger.debug('api_key: abc123def456');
            const calls = (console.log as jest.Mock).mock.calls;
            const loggedMessage = calls[calls.length - 1][0];
            expect(loggedMessage).toContain('[REDACTED]');
            expect(loggedMessage).not.toContain('abc123def456');
        });

        it('should redact secrets', () => {
            logger.debug('secret: superSecretValue');
            const calls = (console.log as jest.Mock).mock.calls;
            const loggedMessage = calls[calls.length - 1][0];
            expect(loggedMessage).toContain('[REDACTED]');
            expect(loggedMessage).not.toContain('superSecretValue');
        });
    });
});
