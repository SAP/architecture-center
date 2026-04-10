import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Input, Popover, FlexBox, Text, Icon } from '@ui5/webcomponents-react';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface ArchitectureSelectorProps {
    onCreateNew: () => void;
}

export default function ArchitectureSelector({ onCreateNew }: ArchitectureSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    const {
        getRootArchitectures,
        getSelectedArchitecture,
        setSelectedArchitecture,
        getPageCount,
        lastSaveTimestamp,
    } = usePageDataStore();

    const architectures = getRootArchitectures();
    const selectedArch = getSelectedArchitecture();

    // Filter architectures based on search
    const filteredArchitectures = useMemo(() => {
        if (!searchQuery.trim()) return architectures;
        const query = searchQuery.toLowerCase();
        return architectures.filter(
            (arch) =>
                arch.title.toLowerCase().includes(query) ||
                arch.tags.some((tag) => tag.toLowerCase().includes(query))
        );
    }, [architectures, searchQuery]);

    const handleSelect = (arch: Document) => {
        setSelectedArchitecture(arch.id);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleCreateNew = () => {
        setIsOpen(false);
        setSearchQuery('');
        onCreateNew();
    };

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div className={styles.selectorContainer}>
            <Button
                ref={buttonRef}
                design="Transparent"
                className={styles.selectorButton}
                onClick={() => setIsOpen(!isOpen)}
                icon="navigation-down-arrow"
                iconEnd
            >
                <span className={styles.selectedTitle}>
                    {selectedArch?.title || 'Select Architecture'}
                </span>
            </Button>

            <Popover
                open={isOpen}
                opener={buttonRef.current!}
                onClose={() => setIsOpen(false)}
                placementType="Bottom"
                className={styles.popover}
            >
                <div className={styles.popoverContent}>
                    {/* Search */}
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder="Search architectures..."
                            value={searchQuery}
                            onInput={(e: any) => setSearchQuery(e.target.value)}
                            icon={<Icon name="search" />}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Architecture List */}
                    <div className={styles.architectureList}>
                        {filteredArchitectures.length === 0 ? (
                            <div className={styles.emptyState}>
                                {searchQuery ? 'No architectures found' : 'No architectures yet'}
                            </div>
                        ) : (
                            filteredArchitectures.map((arch) => {
                                const pageCount = getPageCount(arch.id);
                                const isSelected = selectedArch?.id === arch.id;

                                return (
                                    <button
                                        key={arch.id}
                                        className={`${styles.architectureItem} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handleSelect(arch)}
                                    >
                                        <div className={styles.archHeader}>
                                            <span className={styles.archTitle}>{arch.title}</span>
                                            <span className={styles.statusBadge} title="Draft">
                                                Draft
                                            </span>
                                        </div>
                                        <div className={styles.archMeta}>
                                            <span className={styles.pageCount}>
                                                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                                            </span>
                                            {arch.tags.length > 0 && (
                                                <span className={styles.tags}>
                                                    {arch.tags.slice(0, 2).join(', ')}
                                                    {arch.tags.length > 2 && ` +${arch.tags.length - 2}`}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Create New */}
                    <div className={styles.createNewContainer}>
                        <Button
                            design="Transparent"
                            icon="add"
                            className={styles.createNewButton}
                            onClick={handleCreateNew}
                        >
                            New Architecture
                        </Button>
                    </div>
                </div>
            </Popover>
        </div>
    );
}
