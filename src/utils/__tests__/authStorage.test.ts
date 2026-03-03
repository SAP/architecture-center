import { authStorage, AuthData } from '../authStorage';

// In test mode, the key is 'sap-architecture-center' (not 'sap-architecture-center-dev')
const STORAGE_KEY = 'sap-architecture-center';

describe('authStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('save', () => {
        it('should save auth data with base64 encoding', () => {
            const authData: AuthData = {
                token: 'test-token',
                email: 'test@example.com',
                expiresAt: 1234567890,
            };

            authStorage.save(authData);

            const stored = localStorage.getItem(STORAGE_KEY);
            expect(stored).toBeTruthy();

            // Verify it's base64 encoded
            const decoded = JSON.parse(atob(stored!));
            expect(decoded).toEqual(authData);
        });
    });

    describe('load', () => {
        it('should load and decode auth data', () => {
            const authData: AuthData = {
                token: 'test-token',
                email: 'test@example.com',
                expiresAt: 1234567890,
            };

            // Manually set encoded data
            const encoded = btoa(JSON.stringify(authData));
            localStorage.setItem(STORAGE_KEY, encoded);

            const loaded = authStorage.load();
            expect(loaded).toEqual(authData);
        });

        it('should return null when no data exists', () => {
            const loaded = authStorage.load();
            expect(loaded).toBeNull();
        });

        it('should handle legacy plain JSON format', () => {
            const authData: AuthData = {
                token: 'test-token',
                email: 'test@example.com',
            };

            // Store as plain JSON (legacy format)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

            const loaded = authStorage.load();
            expect(loaded?.token).toBe('test-token');
            expect(loaded?.email).toBe('test@example.com');
        });
    });

    describe('clear', () => {
        it('should remove auth data from storage', () => {
            const authData: AuthData = { token: 'test-token' };
            authStorage.save(authData);

            expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

            authStorage.clear();

            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });
    });

    describe('update', () => {
        it('should update partial auth data while preserving existing values', () => {
            const initialData: AuthData = {
                token: 'initial-token',
                email: 'initial@example.com',
                expiresAt: 1234567890,
            };

            authStorage.save(initialData);

            const updated = authStorage.update({ email: 'updated@example.com' });

            expect(updated.token).toBe('initial-token');
            expect(updated.email).toBe('updated@example.com');
            expect(updated.expiresAt).toBe(1234567890);
        });

        it('should create new data if none exists', () => {
            const updated = authStorage.update({ email: 'new@example.com' });

            expect(updated.email).toBe('new@example.com');
            expect(updated.token).toBe('');
        });
    });
});
