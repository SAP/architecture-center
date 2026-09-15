import { useMemo } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getApiService } from './api';

/**
 * Hook to get the API service instance configured with the backend URL
 */
export function useApi() {
  const { siteConfig } = useDocusaurusContext();
  const expressBackendUrl = siteConfig.customFields?.expressBackendUrl as string;

  const api = useMemo(() => {
    if (!expressBackendUrl) {
      console.warn('Express Backend URL not configured');
      return null;
    }
    return getApiService(expressBackendUrl);
  }, [expressBackendUrl]);

  return api;
}

export default useApi;
