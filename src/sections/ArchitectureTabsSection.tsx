import React, { JSX, useState } from 'react';
import { navigationCardsData } from '../constant/constants';
import ArchitectureTabs from '../components/ArchitectureTabs/ArchitectureTabs';
import ScrollStops from '../components/ScrollStops/ScrollStops';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import latestNewsData from '../data/latest-news.json';

export default function ArchitectureTabsSection(): JSX.Element {
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const [manualOverride, setManualOverride] = useState(false);

    const getVisibleNavigationCards = () => {
        const { authProviders } = siteConfig.customFields as {
            authProviders: Record<string, 'btp' | 'github'>;
        };

        // Get the latest article
        const latestArticle = latestNewsData[0];

        // Create the latest article tab with formatted subtitle (title + description)
        const latestArticleTab = {
            title: 'Under the Spotlight',
            tabLabel: 'Spotlight',
            subtitle: (
                <>
                    <strong>{latestArticle.title}</strong>
                    <br />
                    {latestArticle.description}
                </>
            ),
            icon: 'sap-icon://newspaper',
            link: latestArticle.permalink,
            isNew: false,
            image: '/img/ArchitectureTabs/default-1000x750.webp', // Use the default image
        };

        // Map existing navigation cards
        const existingCards = navigationCardsData.map((card) => {
            const requiredProvider = authProviders?.[card.link];
            let disabled = false;

            if (requiredProvider) {
                const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
                disabled = !isLoggedInWithRequiredProvider;
            } else if ('requiresAuth' in card && card.requiresAuth) {
                const isLoggedIn = users.github || users.btp;
                disabled = !isLoggedIn;
            }

            return {
                ...card,
                disabled,
            };
        });

        // Prepend latest article as the first tab
        return [latestArticleTab, ...existingCards];
    };

    const visibleCards = getVisibleNavigationCards();

    return (
        <ScrollStops
            stops={visibleCards.length}
            onStopChange={(stopIndex) => {
                console.log('Stop changed to:', stopIndex);
            }}
        >
            {(currentStop) => {
                console.log('Rendering ArchitectureTabs with currentStop:', currentStop);
                return (
                    <ArchitectureTabs
                        tabs={visibleCards}
                        enableScrollActivation={!manualOverride}
                        scrollActiveIndex={manualOverride ? undefined : currentStop}
                        onManualTabChange={() => setManualOverride(true)}
                    />
                );
            }}
        </ScrollStops>
    );
}
