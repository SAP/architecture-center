import React, { JSX, useState } from 'react';
import { navigationCardsData } from '../constant/constants';
import ArchitectureTabs from '../components/ArchitectureTabs/ArchitectureTabs';
import ScrollStops from '../components/ScrollStops/ScrollStops';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import latestNewsData from '../data/latest-news.json';

// Dynamically import all images from news/img folder (including subdirectories)
// @ts-ignore - require.context is a webpack feature
const newsImagesContext = require.context('@site/news/img', true, /\.(png|jpe?g|svg|webp)$/);

// Helper function to get the image URL for blog posts
function getBlogImageUrl(imagePath: string | null): string {
    if (!imagePath) {
        return '/img/ArchitectureTabs/default-1000x750.webp';
    }

    try {
        // Remove 'img/' prefix if present (e.g., "img/2026-04-15/photo.jpg" -> "2026-04-15/photo.jpg")
        const relativePath = imagePath.startsWith('img/') ? imagePath.substring(4) : imagePath;

        // Try to load the image from the webpack context
        const imageModule = newsImagesContext(`./${relativePath}`);
        return imageModule.default || imageModule;
    } catch (e) {
        console.warn(`Could not load spotlight image: ${imagePath}`, e);
        return '/img/ArchitectureTabs/default-1000x750.webp';
    }
}

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
            title: 'Under the Spotlight: In Focus',
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
            image: getBlogImageUrl(latestArticle.image),
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
        return [...existingCards, latestArticleTab];
    };

    const visibleCards = getVisibleNavigationCards();

    return (
        <ScrollStops
            stops={visibleCards.length}
        >
            {(currentStop) => {
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
