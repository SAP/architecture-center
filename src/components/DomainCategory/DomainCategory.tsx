import React from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import Link from '@docusaurus/Link';
import styles from './DomainCategory.module.css';

interface SidebarItem {
  type: 'doc' | 'link' | 'category';
  id?: string;
  docId?: string;
  label?: string;
  href?: string;
  items?: SidebarItem[];
  link?: {
    type?: string;
    href?: string;
    id?: string;
  };
}

interface DomainCategoryProps {
  domainId: string;
  domainLabel: string;
  domainIcon?: string;
  items: SidebarItem[];
  isExpanded: boolean;
  onToggle: () => void;
  duplicateCounts: Record<string, number>;
  activePath?: string;
  totalDocCount?: number; // Total count of docs (not top-level items)
}

const DomainCategory: React.FC<DomainCategoryProps> = ({
  domainId,
  domainLabel,
  items,
  isExpanded,
  onToggle,
  duplicateCounts,
  activePath,
  totalDocCount,
}) => {
  // Track which nested categories are expanded (local state within each domain)
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  const itemCount = totalDocCount ?? items.length;

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  const renderItem = (item: SidebarItem, level: number = 0): React.ReactNode => {
    const itemId = item.docId || item.id || '';
    const duplicateCount = duplicateCounts[itemId] || 0;
    const isActive = activePath && (activePath.includes(itemId) || activePath === item.href);

    // Handle categories (nested collapsible)
    if (item.type === 'category') {
      const categoryKey = `${domainId}-${item.label || item.id}`;
      const isCategoryExpanded = expandedCategories.has(categoryKey);

      // Check if category has a link (parent document)
      // The href can be directly on item.href or in item.link.href
      const categoryHref = item.href || item.link?.href || null;
      const categoryDocId = item.docId || item.id || item.link?.id || '';

      // Check if this category is the active page
      const isCategoryActive = activePath && categoryHref && (
        activePath === categoryHref ||
        activePath.includes(categoryHref)
      );

      // Use the category's docId for duplicate count if it has a link
      const categoryDuplicateCount = categoryDocId ? (duplicateCounts[categoryDocId] || 0) : 0;

      const handleCategoryClick = () => {
        toggleCategory(categoryKey);
        // Let Link component handle navigation if there's an href
      };

      return (
        <li key={categoryKey} className={styles.categoryItem}>
          <div className={styles.categoryWrapper}>
            {categoryHref ? (
              <Link
                to={categoryHref}
                className={`${styles.categoryToggle} ${styles.categoryLink} ${isCategoryActive ? styles.active : ''}`}
                onClick={handleCategoryClick}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                <span className={styles.chevron}>
                  {isCategoryExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
                {categoryDuplicateCount > 0 && (
                  <span className={styles.duplicateIndicator} title={`Also appears in ${categoryDuplicateCount} other ${categoryDuplicateCount === 1 ? 'domain' : 'domains'}`}>
                    +{categoryDuplicateCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                className={styles.categoryToggle}
                onClick={() => toggleCategory(categoryKey)}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                aria-expanded={isCategoryExpanded}
              >
                <span className={styles.chevron}>
                  {isCategoryExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
              </button>
            )}
          </div>
          {isCategoryExpanded && item.items && (
            <ul className={styles.nestedItems}>
              {item.items.map((child) => renderItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    // Handle docs and links
    if (item.type === 'doc' || item.type === 'link') {
      const href = item.href || (item.docId ? `/docs/${item.docId}` : `/docs/${item.id}`);

      return (
        <li key={itemId} className={styles.item}>
          <Link
            to={href}
            className={`${styles.itemLink} ${isActive ? styles.active : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            <span className={styles.itemLabel}>{item.label}</span>
            {duplicateCount > 0 && (
              <span className={styles.duplicateIndicator} title={`Also appears in ${duplicateCount} other ${duplicateCount === 1 ? 'domain' : 'domains'}`}>
                +{duplicateCount}
              </span>
            )}
          </Link>
        </li>
      );
    }

    return null;
  };

  return (
    <div className={styles.domainCategory} data-domain={domainId}>
      <button
        className={styles.domainHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`domain-${domainId}-content`}
      >
        <span className={styles.chevron}>
          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
        </span>
        <span className={styles.domainLabel}>{domainLabel}</span>
        <span
          className={styles.domainBadge}
          title="Total documents in this domain (some may appear in multiple domains)"
        >
          {itemCount}
        </span>
      </button>

      {isExpanded && (
        <ul
          id={`domain-${domainId}-content`}
          className={styles.domainContent}
        >
          {items.map((item) => renderItem(item, 0))}
        </ul>
      )}
    </div>
  );
};

export default DomainCategory;
