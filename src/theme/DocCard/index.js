/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useRef, useEffect } from 'react';
import { findFirstSidebarItemLink } from '@docusaurus/plugin-content-docs/client';
import { usePluralForm } from '@docusaurus/theme-common';
import { translate } from '@docusaurus/Translate';
import { Card, Text, Icon, FlexBox, Tag, Title, Popover } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/dimension';
import '@ui5/webcomponents-icons/dist/action';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

function useCategoryItemsPlural() {
    const { selectMessage } = usePluralForm();
    return (count) =>
        selectMessage(
            count,
            translate(
                {
                    message: '1 item|{count} items',
                    id: 'theme.docs.DocCard.categoryDescription.plurals',
                    description:
                        'The default description for a category card in the generated index about how many items this category includes',
                },
                { count }
            )
        );
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Set hydration flag first
        setIsHydrated(true);
        
        function handleResize() {
            if (typeof window !== 'undefined') {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }
        }
        
        // Only add event listener and call handleResize after hydration
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            handleResize(); // Set initial size
        }
        
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    return { ...windowSize, isHydrated };
}

function CardLayout({ href, title, description, tags, lastUpdate, item }) {
    const moreTagsRef = useRef(null);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const [compressedTags, setCompressedTags] = useState([]);
    const [remainingTags, setRemainingTags] = useState([]);
    const [readableTitle, setReadableTitle] = useState(title); // Initialize with title
    const [readableDescription, setReadableDescription] = useState(description); // Initialize with description
    const { width, height, isHydrated } = useWindowSize();

    const card = useRef(null);
    const [componentSize, setComponentSize] = useState({ width: 0, height: 0 });

    // ResizeObserver effect with hydration guard
    useEffect(() => {
        if (!isHydrated) return;
        
        const cardElement = card.current;
        if (!cardElement || typeof ResizeObserver === 'undefined') return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setComponentSize({ width, height });
            }
        });

        resizeObserver.observe(cardElement);

        return () => {
            resizeObserver.disconnect();
        };
    }, [isHydrated]);

    // Tag and text processing effect with hydration guard
    useEffect(() => {
        if (!isHydrated || width === undefined || !card.current) return;
        
        setCompressedTags([]);
        setRemainingTags([]);
        
        let counter = 0;
        const cardWidth = card.current.offsetWidth || 400; // Fallback width
        const tagsLength = tags?.length || 0;
        let compressedTagsLength = 0;
        
        if (tags) {
            for (const tag of tags) {
                counter += tag.label.length;
                const remainingTagsLength = tagsLength - compressedTagsLength;
                if (
                    (width <= 996 &&
                        counter <
                            Math.round(
                                (cardWidth / 360) *
                                    (remainingTagsLength <= 1 ? 49 - compressedTagsLength : 42 - compressedTagsLength)
                            )) ||
                    counter <
                        Math.round(
                            (cardWidth / 400) *
                                (remainingTagsLength <= 1 ? 52 - compressedTagsLength : 46 - compressedTagsLength)
                        )
                ) {
                    compressedTagsLength += 1;
                    setCompressedTags((_tags) => [..._tags, tag]);
                    continue;
                }
                counter -= tag.label.length;
            }
        }

        /* cut off description if it is too long */
        if (description && description.length > Math.round((cardWidth / 360) * 200)) {
            const _description = description.slice(0, Math.round((cardWidth / 360) * 200));
            const lastSpaceIndex = _description.lastIndexOf(' ');
            const lastCharacterIsDot = _description.slice(-1) === '.';
            setReadableDescription(_description.slice(0, lastSpaceIndex) + (lastCharacterIsDot ? '..' : '...'));
        } else {
            setReadableDescription(description || '');
        }

        /* Change title length if title is too long */
        if (title && title.length > Math.ceil((cardWidth / 400) * 63)) {
            setReadableTitle(
                title.length - title.slice(0, Math.round((cardWidth / 400) * 63)).length <= 2
                    ? title
                    : title.slice(0, Math.round((cardWidth / 400) * 63)) + '...'
            );
        } else {
            setReadableTitle(title || '');
        }
    }, [componentSize, description, tags, title, width, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        setRemainingTags(calculateRemainingTags());
    }, [compressedTags, isHydrated]);

    function calculateRemainingTags() {
        if (!tags) return [];
        return tags.filter((obj1) => !compressedTags.some((obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)));
    }

    return (
        <Card
            ref={card}
            className={styles.docCard}
            onClick={(event) => {
                if (event.target.tagName === 'UI5-TAG' || event.target.tagName === 'UI5-POPOVER') return;
                window.location.href = href;
            }}
        >
            <FlexBox direction="Column" justifyContent="End" style={{ height: '100%' }}>
                {/* Banner */}
                <FlexBox direction="Column">
                    <img
                        src={useBaseUrl('/img/card_header_blue.webp')}
                        width={430}
                        height={50}
                        alt=""
                        className={styles.cardBanner}
                        loading="lazy"
                        decoding="async"
                    />
                </FlexBox>
                {/* Accent and Content */}
                <FlexBox direction="Column" style={{ height: '175px' }}>
                    <FlexBox justifyContent="Start" alignItems="Center" style={{ height: '60px' }}>
                        <div className={styles.cardAccent} />
                        <Title className={styles.cardTitle}>{readableTitle}</Title>
                    </FlexBox>
                    <FlexBox className={styles.cardDescription}>
                        <Text>{readableDescription}</Text>
                    </FlexBox>
                </FlexBox>
                {/* Tags */}
                <FlexBox direction="Column" className={styles.tagsContainer}>
                    <FlexBox className={styles.tagsRow}>
                        {compressedTags.map((tag, index) => (
                            <a href={'/docs/tags/' + tag.tag} key={index}>
                                <Tag
                                    design="Information"
                                    hideStateIcon
                                    className={styles.tag}
                                    title={tag.description || tag.label}
                                >
                                    <div style={{ whiteSpace: 'nowrap' }}>{tag.label}</div>
                                </Tag>
                            </a>
                        ))}
                        {remainingTags.length > 0 && (
                            <>
                                <Tag
                                    ref={moreTagsRef}
                                    design="Information"
                                    hideStateIcon
                                    id="moreTags"
                                    className={styles.tag}
                                    onClick={() => setPopoverIsOpen(!popoverIsOpen)}
                                    title="Show more tags"
                                >
                                    <div style={{ padding: '0px 2px' }}>+{remainingTags.length}</div>
                                </Tag>
                                <Popover
                                    opener={moreTagsRef.current}
                                    open={popoverIsOpen}
                                    onClose={() => setPopoverIsOpen(false)}
                                    style={{ cursor: 'initial' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {remainingTags.map((tag, index) => (
                                            <a href={'/docs/tags/' + tag.tag} id="popover" key={index}>
                                                <Tag
                                                    design="Information"
                                                    hideStateIcon
                                                    title={tag.description || tag.label}
                                                    className={styles.tag}
                                                >
                                                    {tag.label}
                                                </Tag>
                                            </a>
                                        ))}
                                    </div>
                                </Popover>
                            </>
                        )}
                    </FlexBox>
                    {/* Date and Link */}
                    <FlexBox className={styles.lastUpdateRow}>
                        <FlexBox direction="Row" alignItems="Center">
                            <Text className={styles.lastUpdateText}>Last Update:</Text>
                            <Text className={styles.lastUpdateText}>
                                {lastUpdate
                                    ? new Date(lastUpdate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : ''}
                            </Text>
                        </FlexBox>
                        <FlexBox
                            className={styles.openInNew}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(href, '_blank');
                            }}
                        >
                            <Icon
                                name="action"
                                title="Open in a new window"
                                style={{ color: '#0070F2', width: '15px' }}
                            />
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </Card>
    );
}

function CardCategory({ item }) {
    const href = findFirstSidebarItemLink(item);
    const categoryItemsPlural = useCategoryItemsPlural();
    // Unexpected: categories that don't have a link have been filtered upfront
    if (!href) {
        return null;
    }
    return (
        <CardLayout
            href={href}
            title={item.label}
            description={item.description ?? categoryItemsPlural(item.items.length)}
        />
    );
}

function CardLink({ item }) {
    const href = item.customProps?.href;
    const description = item.description ?? item.customProps?.description ?? '';

    return (
        <CardLayout
            href={item.href ?? href}
            title={item.customProps?.title || item.label}
            description={description.length > 300 ? description.substring(0, 300) + '...' : description}
            tags={item.customProps?.tags}
            lastUpdate={item.customProps?.last_update}
            item={item}
        />
    );
}

export default function DocCard({ item }) {
    switch (item.type) {
        case 'link':
            return <CardLink item={item} />;
        case 'category':
            return <CardCategory item={item} />;
        default:
            throw new Error(`unknown item type ${JSON.stringify(item)}`);
    }
}
