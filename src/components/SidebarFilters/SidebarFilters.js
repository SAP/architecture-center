import React, { useMemo } from 'react';
import { MultiComboBox, MultiComboBoxItem } from '@ui5/webcomponents-react';
import jsonSchema from '@site/src/_scripts/_generatedIndexCategories.json';
import style from './styles.module.css';

export default function SidebarFilters({ onFilterChange, initialValues }) {
  const { partners, techDomains } = useMemo(() => {
    const allCategories = jsonSchema.generatedIndexes.map((cat) => ({
      value: cat.customProps.id ?? 'unknown',
      label: cat.label,
    }));

    return {
      partners: allCategories.slice(0, 3),
      techDomains: allCategories.slice(-5),
    };
  }, []);

  const handleSelectionChange = (event, filterGroup) => {
    const selectedKeys = event.detail.items.map(item => item.dataset.key);
    onFilterChange(filterGroup, selectedKeys);
  };

  return (
    <div className={style.dropdownDiv}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
          Technology Partners
        </label>
        <MultiComboBox
          style={{ width: '100%' }}
          placeholder="Filter by partner..."
          onSelectionChange={(event) => handleSelectionChange(event, 'partners')}
        >
          {partners.map(partner => (
            <MultiComboBoxItem
              key={partner.value}
              text={partner.label}
              data-key={partner.value} 
              selected={initialValues.partners.includes(partner.value)} 
            />
          ))}
        </MultiComboBox>
      </div>
      <div>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
          Technology Domains
        </label>
        <MultiComboBox
          style={{ width: '100%' }}
          placeholder="Filter by domain..."
          onSelectionChange={(event) => handleSelectionChange(event, 'techDomains')}
        >
          {techDomains.map(domain => (
            <MultiComboBoxItem
              key={domain.value}
              text={domain.label}
              data-key={domain.value} 
              selected={initialValues.techDomains.includes(domain.value)} 
            />
          ))}
        </MultiComboBox>
      </div>
    </div>
  );
}