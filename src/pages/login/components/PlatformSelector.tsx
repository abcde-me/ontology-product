import React from 'react';
import { SCAN_LOGIN_PROVIDERS } from '../constants';
import type { ScanLoginProvider } from '../types';
import styles from '../index.module.scss';

interface PlatformSelectorProps {
  value: ScanLoginProvider;
  onChange: (provider: ScanLoginProvider) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className={styles.platformList}>
      {SCAN_LOGIN_PROVIDERS.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            className={`${styles.platformItem} ${
              active ? styles.platformItemActive : ''
            }`}
            onClick={() => onChange(item.key)}
          >
            <span
              className={styles.platformIcon}
              style={{ backgroundColor: item.color }}
            >
              {item.abbr}
            </span>
            <span className={styles.platformLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
