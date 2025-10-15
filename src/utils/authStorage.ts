/**
 * Authentication storage utility with base64 encryption
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
 * Utility functions for managing encrypted authentication data in localStorage
 */
export const authStorage = {
  /**
   * Save authentication data with base64 encryption
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
        } catch (error) {
          console.warn("Could not decode token to get expiry date for BTP:", error);
        }
      }

      // Convert to JSON string and then encrypt with base64
      const jsonString = JSON.stringify(data);
      const encryptedData = btoa(jsonString);
      localStorage.setItem(AUTH_STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error("Error saving encrypted auth data:", error);
      // Fallback to unencrypted storage if encryption fails
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
  },

  /**
   * Load and decrypt authentication data
   */
  load: (): AuthData | null => {
    if (!isBrowser) return null;

    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedData) return null;

    try {
      // Try to decrypt with base64 first
      const decryptedData = atob(storedData);
      return JSON.parse(decryptedData) as AuthData;
    } catch (error) {
      // Handle legacy format or failed decryption
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
      } catch (jsonError) {
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
      } catch (error) {
        console.warn("Could not decode token during update to get expiry date for BTP:", error);
      }
    }

    authStorage.save(updated);
    return updated;
  }
};