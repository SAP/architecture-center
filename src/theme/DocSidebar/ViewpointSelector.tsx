import React, { useState, type ReactNode } from 'react';
import {
  Select,
  Option,
  Label,
} from '@ui5/webcomponents-react';
import styles from './styles.module.css';

interface ViewpointItem {
  text: string;
  value: string;
}

interface ViewpointGroup {
  heading: string;
  items: ViewpointItem[];
}

interface ViewpointSelectorProps {
  label: string;
  data: ViewpointGroup[];
  onSelectionChange: (selectedValue: string) => void;
  initialSelectedValue?: string;
}

export function ViewpointSelector({
  label,
  data,
  onSelectionChange,
  initialSelectedValue = '',
}: ViewpointSelectorProps): ReactNode {
  const [selectedValue, setSelectedValue] = useState(initialSelectedValue);

  const handleSelectionChange = (event) => {
    // The selected option's value is in the event detail
    const newValue = event.detail.selectedOption.value;
    // Don't do anything if a disabled header is somehow clicked
    if (!newValue) return;

    setSelectedValue(newValue);
    onSelectionChange(newValue);
  };

  return (
    <div className={styles.viewpointSelector}>
      <Label className={styles.viewpointLabel}>{label}</Label>
      <Select
        value={selectedValue}
        onChange={handleSelectionChange}
        className={styles.viewpointSelect} // Optional: for width or other styling
      >
        <Option value="" disabled selected>
          Select the Viewpoint...
        </Option>

        {data.map((group) => (
          <React.Fragment key={group.heading}>
            <Option disabled className={styles.groupHeader}>
              {group.heading}
            </Option>

            {group.items.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.text}
              </Option>
            ))}
          </React.Fragment>
        ))}
      </Select>
    </div>
  );
}