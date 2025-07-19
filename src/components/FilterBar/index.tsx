import React from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { IoMdRefresh } from 'react-icons/io';
import styles from './FilterBar.module.css';

interface Option {
  value: string;
  label: string;
}

interface FilterBarProps {
  techDomains: Option[];
  partners: Option[];
  selectedTechDomains: Option[];
  selectedPartners: Option[];
  onTechDomainsChange: (value: MultiValue<Option>) => void;
  onPartnersChange: (value: MultiValue<Option>) => void;
  resetFilters: () => void;
  isResetEnabled: boolean;
  selectStyles: StylesConfig<Option, true>;
}

const FilterBar: React.FC<FilterBarProps> = ({
  techDomains,
  partners,
  selectedTechDomains,
  selectedPartners,
  onTechDomainsChange,
  onPartnersChange,
  resetFilters,
  isResetEnabled,
  selectStyles,
}) => (
  <aside className={styles.filters}>
    <div className={styles.filterRow}>
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Technology Domains</h3>
        <Select
          isMulti
          options={techDomains}
          value={selectedTechDomains}
          onChange={onTechDomainsChange}
          placeholder="Select Technology Domains..."
          styles={selectStyles}
        />
      </div>
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Technology Partners</h3>
        <Select
          isMulti
          options={partners}
          value={selectedPartners}
          onChange={onPartnersChange}
          placeholder="Select Technology Partners..."
          styles={selectStyles}
        />
      </div>
      <div className={styles.resetIconWrapper}>
        <IoMdRefresh
          className={`${styles.resetIcon} ${isResetEnabled ? '' : styles.resetDisabled}`}
          data-tip="Reset Filters"
          onClick={isResetEnabled ? resetFilters : undefined}
          style={{ cursor: isResetEnabled ? 'pointer' : 'not-allowed' }}
        />
      </div>
    </div>
  </aside>
);

export default FilterBar;