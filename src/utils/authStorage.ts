/**
 * Authentication storage utility with base64 encoding
 *
 * SECURITY WARNING:
 * - base64 is NOT encryption - it provides NO security, only encoding for storage
 * - localStorage is accessible to ANY JavaScript on the same origin
 * - Any XSS vulnerability will expose ALL stored tokens
 * - Tokens can be trivially decoded with atob() in browser console
 *
 * RECOMMENDED MIGRATION:
 * - Move to httpOnly cookies (Secure; SameSite=Strict) set by backend
 * - Use short-lived access tokens with refresh token rotation
 * - Never store sensitive tokens client-side
 */

import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const AUTH_STORAGE_KEY = process.env.NODE_ENV === "development" ? "sap-architecture-center-dev" : "sap-architecture-center";
const isBrowser = typeof window !== "undefined";

export interface AuthData {
  token: string;
  email?: string;
  expiresAt?: number;
}

/**
 * Utility functions for managing base64-encoded authentication data in localStorage.
 *
 * SECURITY LIMITATIONS (see file header for details):
 * - This is NOT secure storage - base64 provides no protection
 * - Vulnerable to XSS attacks - any injected script can read tokens
 * - Consider migrating to httpOnly cookies for production security
 */
export const authStorage = {
  /**
   * Save authentication data with base64 encoding (NOT encryption)
   */
  save: (data: AuthData) => {
    if (!isBrowser) return;

    try {
      // If a token is provided and no expiresAt is set, try to decode it
      if (data.token && !data.expiresAt) {
        try {
          const decoded = jwtDecode<{ exp?: number }>(data.token);
          if (decoded.exp) {
            data.expiresAt = decoded.exp; // Store the expiry timestamp
          }
        } catch {
          console.warn("Could not decode token to get expiry date for BTP");
        }
      }

      // Convert to JSON string and then encode with base64
      const jsonString = JSON.stringify(data);
      const encodedData = btoa(jsonString);
      localStorage.setItem(AUTH_STORAGE_KEY, encodedData);
    } catch {
      console.error("Error saving auth data");
      // Fallback to plain JSON storage if encoding fails
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
  },

  /**
   * Load and decode authentication data (NOT decryption)
   */
  load: (): AuthData | null => {
    if (!isBrowser) return null;

    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedData) return null;

    try {
      // Try to decode from base64 first
      const decodedData = atob(storedData);
      return JSON.parse(decodedData) as AuthData;
    } catch {
      // Handle legacy format or failed decode
      try {
        const parsed = JSON.parse(storedData) as AuthData;
        // If it's a legacy unencrypted token without expiresAt, try to decode
        if (parsed.token && !parsed.expiresAt) {
            try {
                const decoded = jwtDecode<{ exp?: number }>(parsed.token);
                if (decoded.exp) {
                    parsed.expiresAt = decoded.exp;
                    // Optionally re-save to update with expiry
                    authStorage.save(parsed);
                }
            } catch (jwtError) {
                console.warn("Could not decode legacy token to get expiry date for BTP:", jwtError);
            }
        }
        return parsed;
    } catch {
        // Last resort: it's a plain token string from old version
        const tokenOnly: AuthData = { token: storedData };
        try {
            const decoded = jwtDecode<{ exp?: number }>(storedData);
            if (decoded.exp) {
                tokenOnly.expiresAt = decoded.exp;
                // Optionally re-save to update with expiry
                authStorage.save(tokenOnly);
            }
        } catch (jwtError) {
            console.warn("Could not decode plain token string to get expiry date for BTP:", jwtError);
        }
        return tokenOnly;
      }
    }
  },

  /**
   * Clear authentication data
   */
  clear: () => {
    if (!isBrowser) return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Update partial authentication data while preserving existing values
   */
  update: (partial: Partial<AuthData>) => {
    if (!isBrowser) return { token: "" };
    const current = authStorage.load() || { token: "" };
    const updated = { ...current, ...partial };

    // If updating token and no expiresAt is provided, try to decode it
    if (updated.token && !updated.expiresAt) {
      try {
        const decoded = jwtDecode<{ exp?: number }>(updated.token);
        if (decoded.exp) {
          updated.expiresAt = decoded.exp;
        }
      } catch {
        console.warn("Could not decode token during update to get expiry date for BTP");
      }
    }

    authStorage.save(updated);
    return updated;
  }
};