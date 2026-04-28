import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FiFilter } from 'react-icons/fi';
import styles from './CollapsibleFilterBar.module.css';

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
    searchTerm: string;
    onSearchChange: (value: string) => void;
    resultCount?: number;
}

const CollapsibleFilterBar: React.FC<CollapsibleFilterBarProps> = ({
    partners,
    selectedPartners,
    onPartnersChange,
    resetFilters,
    isResetEnabled,
    searchTerm,
    onSearchChange: _onSearchChange,
    resultCount,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    const hasActiveFilters = selectedPartners.length > 0 || searchTerm.length > 0;

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
                            {selectedPartners.length}
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
                    </div>
                </div>
            )}

            {/* Result Count */}
            {resultCount !== undefined && (
                <div className={styles.resultCount}>
                    {resultCount} unique {resultCount === 1 ? 'document' : 'documents'} found
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