import React, { JSX } from 'react';
import { navigationCardsData } from '../constant/constants';
import ArchitectureTabs from '../components/ArchitectureTabs/ArchitectureTabs';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ArchitectureTabsSection(): JSX.Element {
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();

    const getVisibleNavigationCards = () => {
        const { authProviders } = siteConfig.customFields as {
            authProviders: Record<string, 'btp' | 'github'>;
        };

        return navigationCardsData.map((card) => {
            const requiredProvider = authProviders?.[card.link];
            let disabled = false;

            if (requiredProvider) {
                const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
                disabled = !isLoggedInWithRequiredProvider;
            } else if (card.requiresAuth) {
                const isLoggedIn = users.github || users.btp;
                disabled = !isLoggedIn;
            }

            return {
                ...card,
                disabled,
            };
        });
    };

    return <ArchitectureTabs tabs={getVisibleNavigationCards()} />;
}
