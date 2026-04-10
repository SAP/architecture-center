import React from 'react';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

interface ArchitecturePillSwitcherProps {
    onCreateNew: () => void;
}

const ArchitecturePillSwitcher: React.FC<ArchitecturePillSwitcherProps> = ({ onCreateNew }) => {
    const {
        getRootArchitectures,
        getSelectedArchitecture,
        setSelectedArchitecture,
        getPageCount,
    } = usePageDataStore();

    const architectures = getRootArchitectures();
    const selectedArch = getSelectedArchitecture();

    const handlePillClick = (id: string) => {
        setSelectedArchitecture(id);
    };

    if (architectures.length === 0) {
        return null;
    }

    return (
        <div className={styles.pillBar}>
            <div className={styles.pillScroll}>
                {architectures.map((arch) => {
                    const isActive = selectedArch?.id === arch.id;
                    const pageCount = getPageCount(arch.id);
                    // For now, all are "draft" - could add status field later
                    const status = 'draft';

                    return (
                        <button
                            key={arch.id}
                            className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                            onClick={() => handlePillClick(arch.id)}
                            title={`${arch.title} - ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`}
                        >
                            <span className={`${styles.pillDot} ${styles[status]}`} />
                            <span className={styles.pillTitle}>{arch.title || 'Untitled'}</span>
                        </button>
                    );
                })}
                <button
                    className={`${styles.pill} ${styles.addPill}`}
                    onClick={onCreateNew}
                    title="Create new architecture"
                >
                    + New
                </button>
            </div>
        </div>
    );
};

export default ArchitecturePillSwitcher;
