import { useState, useEffect } from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { isDateRecent } from '@site/src/utils/dateUtils';

// Hook to determine if the current document was recently updated
export function useIsRecentlyUpdated(): boolean {
    const { frontMatter } = useDoc();
    const rawDate = frontMatter.last_update?.date;
    const [isRecent, setIsRecent] = useState(false);

    useEffect(() => {
        setIsRecent(isDateRecent(rawDate));
    }, [rawDate]);

    return isRecent;
}
