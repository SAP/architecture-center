import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

interface FolderLoaderProps {
  text?: string;
  usePuns?: boolean;
}

const COMMAND_CENTER_PUNS = [
  'Clearing the launchpad',
  'Initializing mission control',
  'Loading navigation charts',
  'Calibrating flight systems',
  'Preparing the cargo bay',
  'Running pre-flight checks',
  'Powering up the thrusters',
  'Establishing ground control',
  'Configuring orbital parameters',
  'Assembling the crew manifest',
];

export default function FolderLoader({ text = 'Loading...', usePuns = false }: FolderLoaderProps) {
  const [currentPun, setCurrentPun] = useState(
    usePuns ? COMMAND_CENTER_PUNS[Math.floor(Math.random() * COMMAND_CENTER_PUNS.length)] : text
  );

  useEffect(() => {
    if (!usePuns) return;

    const interval = setInterval(() => {
      setCurrentPun(COMMAND_CENTER_PUNS[Math.floor(Math.random() * COMMAND_CENTER_PUNS.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [usePuns]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <div className={styles.folder}>
          <div className={styles.folderBack}></div>
          <div className={styles.paper}></div>
          <div className={styles.paper}></div>
          <div className={styles.paper}></div>
          <div className={styles.folderFront}></div>
        </div>
        <div className={styles.label}>
          {usePuns ? currentPun : text}<span className={styles.dots}></span>
        </div>
      </div>
    </div>
  );
}
