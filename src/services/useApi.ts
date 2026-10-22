import { useMemo } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getApiService } from './api';

/**
 * Hook to get the API service instance configured with the backend URL
 */
export function useApi() {
  const { siteConfig } = useDocusaurusContext();
  const authenticatedApiPath = siteConfig.customFields?.authenticatedApiPath as string;

  const api = useMemo(() => {
    if (!authenticatedApiPath) {
      console.warn('Authenticated API path not configured');
      return null;
    }
    return getApiService(authenticatedApiPath);
  }, [authenticatedApiPath]);

  return api;
}

export default useApi;
