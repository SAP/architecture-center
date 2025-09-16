/**
 * Authentication storage utility with base64 encryption
 */

const AUTH_STORAGE_KEY = process.env.NODE_ENV === "development" ? "sap-architecture-center-dev" : "sap-architecture-center";
const isBrowser = typeof window !== "undefined";

export interface AuthData {
  token: string;
  email?: string;
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
        // Maybe it's just JSON without encryption
        return JSON.parse(storedData) as AuthData;
      } catch (jsonError) {
        // Last resort: it's a plain token string from old version
        return { token: storedData };
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
    authStorage.save({ ...current, ...partial });
    return { ...current, ...partial };
  }
};
