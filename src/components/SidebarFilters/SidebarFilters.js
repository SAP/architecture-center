import React from 'react';
import { MultiComboBox, MultiComboBoxItem } from '@ui5/webcomponents-react';
import { techDomain, techPartners } from '@site/src/constant/constants';
import style from './styles.module.css';

export default function SidebarFilters({ onFilterChange, initialValues }) {
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
          {techPartners.map(partner => (
            <MultiComboBoxItem
              key={partner.id}
              text={partner.title}
              data-key={partner.id} 
              selected={initialValues.partners.includes(partner.id)} 
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
          {techDomain.map(domain => (
            <MultiComboBoxItem
              key={domain.id}
              text={domain.title}
              data-key={domain.id} 
              selected={initialValues.techDomains.includes(domain.id)} 
            />
          ))}
        </MultiComboBox>
      </div>
    </div>
  );
}