import React, { useState, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FiFilter } from 'react-icons/fi';
import { Icon, Popover } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/hint.js';
import styles from './CollapsibleFilterBar.module.css';
import { RECENT_FILTER_LABEL } from '@site/src/theme/DocSidebar/filterUtils';

interface Option {
    value: string;
    label: string;
}

interface CollapsibleFilterBarProps {
    partners: Option[];
    selectedPartners: Option[];
    onPartnersChange: (values: Option[]) => void;
    resetFilters: () => void;
    isResetEnabled: boolean;
    resultCount?: number;
    showCommunityContent?: boolean;
    onCommunityContentChange?: (value: boolean) => void;
    showArchived?: boolean;
    onArchiveChange?: (value: boolean) => void;
    showRecentlyUpdated?: boolean;
    onRecentlyUpdatedChange?: (value: boolean) => void;
}

const CollapsibleFilterBar: React.FC<CollapsibleFilterBarProps> = ({
    partners,
    selectedPartners,
    onPartnersChange,
    resetFilters,
    isResetEnabled,
    resultCount,
    showCommunityContent = false,
    onCommunityContentChange,
    showArchived = false,
    onArchiveChange,
    showRecentlyUpdated = false,
    onRecentlyUpdatedChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const infoIconRef = useRef<HTMLDivElement>(null);

    const toggleFilter = (option: Option, currentSelection: Option[], onChange: (values: Option[]) => void) => {
        const isSelected = currentSelection.some((item) => item.value === option.value);
        if (isSelected) {
            onChange(currentSelection.filter((item) => item.value !== option.value));
        } else {
            onChange([...currentSelection, option]);
        }
    };

    const removeFilter = (option: Option, currentSelection: Option[], onChange: (values: Option[]) => void) => {
        onChange(currentSelection.filter((item) => item.value !== option.value));
    };

    const handleArchiveToggle = () => {
        if (onArchiveChange) {
            onArchiveChange(!showArchived);
        }
    };

    const handleCommunityContentToggle = () => {
        if (onCommunityContentChange) {
            onCommunityContentChange(!showCommunityContent);
        }
    };

    const handleRecentlyUpdatedToggle = () => {
        if (onRecentlyUpdatedChange) {
            onRecentlyUpdatedChange(!showRecentlyUpdated);
        }
    };

    const hasActiveFilters = selectedPartners.length > 0 || showCommunityContent || showArchived || showRecentlyUpdated;
    const activeFilterCount = selectedPartners.length + (showCommunityContent ? 1 : 0) + (showArchived ? 1 : 0) + (showRecentlyUpdated ? 1 : 0);

    return (
        <div className={styles.filterBarContainer}>
            {/* Filter Toggle and Clear Filters */}
            <div className={styles.topBar}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`${styles.filterToggleButton} ${isExpanded ? styles.active : ''}`}
                    aria-label={isExpanded ? 'Hide filters' : 'Show filters'}
                >
                    <FiFilter />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <span className={styles.filterBadge}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {isResetEnabled && (
                    <button onClick={resetFilters} className={styles.clearFiltersButton}>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Active Filters Display (always visible when there are active filters) */}
            {hasActiveFilters && (
                <div className={styles.activeFiltersBar}>
                    <div className={styles.activeFiltersList}>
                        {selectedPartners.map((partner) => (
                            <button
                                key={partner.value}
                                onClick={() => removeFilter(partner, selectedPartners, onPartnersChange)}
                                className={styles.activeFilterChip}
                            >
                                {partner.label}
                                <IoMdClose className={styles.chipCloseIcon} />
                            </button>
                        ))}
                        {showCommunityContent && (
                            <button
                                onClick={handleCommunityContentToggle}
                                className={styles.activeFilterChip}
                            >
                                Community Content
                                <IoMdClose className={styles.chipCloseIcon} />
                            </button>
                        )}
                        {showArchived && (
                            <button
                                onClick={handleArchiveToggle}
                                className={styles.activeFilterChip}
                            >
                                Archived
                                <IoMdClose className={styles.chipCloseIcon} />
                            </button>
                        )}
                        {showRecentlyUpdated && (
                            <button
                                onClick={handleRecentlyUpdatedToggle}
                                className={styles.activeFilterChip}
                            >
                                {RECENT_FILTER_LABEL}
                                <IoMdClose className={styles.chipCloseIcon} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Result Count with Recently Updated Link */}
            {resultCount !== undefined && (
                <div className={styles.resultCount}>
                    {resultCount} unique {resultCount === 1 ? 'document' : 'documents'} found
                    <div
                        ref={infoIconRef}
                        onClick={() => setPopoverOpen(!popoverOpen)}
                        className={styles.infoIconWrapper}
                    >
                        <Icon name="hint" className={styles.infoIcon} />
                    </div>
                    <Popover
                        opener={infoIconRef.current!}
                        open={popoverOpen}
                        onClose={() => setPopoverOpen(false)}
                        placement="Bottom"
                        horizontalAlign="Center"
                        className={styles.infoPopover}
                    >
                        <div className={styles.popoverContent}>
                            Some documents may appear in multiple technology domains
                        </div>
                    </Popover>
                    <span className={styles.recentlyUpdatedSeparator}>|</span>
                    <button
                        onClick={handleRecentlyUpdatedToggle}
                        className={`${styles.recentlyUpdatedLink} ${showRecentlyUpdated ? styles.active : ''}`}
                        aria-pressed={showRecentlyUpdated}
                    >
                        Show Recent
                    </button>
                </div>
            )}

            {/* Collapsible Filter Panel */}
            {isExpanded && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterGroup}>
                        <h3 className={styles.filterTitle}>Technology Partners</h3>
                        <div className={styles.filterChips}>
                            {partners.map((partner) => {
                                const isSelected = selectedPartners.some((item) => item.value === partner.value);
                                return (
                                    <button
                                        key={partner.value}
                                        onClick={() => toggleFilter(partner, selectedPartners, onPartnersChange)}
                                        className={`${styles.filterChip} ${isSelected ? styles.selected : ''}`}
                                    >
                                        {partner.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.filterSeparator} />
                    <div className={styles.filterGroup}>
                        <h3 className={styles.filterTitle}>Other Filters</h3>
                        <div className={styles.filterChips}>
                            <button
                                onClick={handleCommunityContentToggle}
                                className={`${styles.filterChip} ${showCommunityContent ? styles.selected : ''}`}
                            >
                                Community Content
                            </button>
                            <button
                                onClick={handleArchiveToggle}
                                className={`${styles.filterChip} ${showArchived ? styles.selected : ''}`}
                            >
                                Archived
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(false)}
                        className={styles.hideFiltersButton}
                    >
                        Hide Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default CollapsibleFilterBar;