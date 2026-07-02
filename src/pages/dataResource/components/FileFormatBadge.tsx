import React from 'react';
import {
  IconFile,
  IconFileImage,
  IconFilePdf
} from '@arco-design/web-react/icon';
import styles from '../index.module.scss';

type FileFormatTone = 'pdf' | 'image' | 'data' | 'text' | 'default';

const resolveFormatTone = (format: string): FileFormatTone => {
  const normalized = format.toUpperCase();
  if (normalized === 'PDF') {
    return 'pdf';
  }
  if (
    ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'BMP', 'SVG'].includes(normalized)
  ) {
    return 'image';
  }
  if (['CSV', 'XLS', 'XLSX', 'JSON', 'XML'].includes(normalized)) {
    return 'data';
  }
  if (['TXT', 'MD', 'LOG', 'YAML', 'YML'].includes(normalized)) {
    return 'text';
  }
  return 'default';
};

const FormatIcon: React.FC<{ tone: FileFormatTone }> = ({ tone }) => {
  if (tone === 'pdf') {
    return <IconFilePdf />;
  }
  if (tone === 'image') {
    return <IconFileImage />;
  }
  return <IconFile />;
};

interface FileFormatBadgeProps {
  format: string;
  showLabel?: boolean;
}

export const FileFormatBadge: React.FC<FileFormatBadgeProps> = ({
  format,
  showLabel = true
}) => {
  const tone = resolveFormatTone(format);

  return (
    <span
      className={`${styles['file-format-badge']} ${styles[`file-format-badge--${tone}`]}`}
    >
      <span className={styles['file-format-badge-icon']}>
        <FormatIcon tone={tone} />
      </span>
      {showLabel ? <span>{format || '-'}</span> : null}
    </span>
  );
};

interface FileNameCellProps {
  fileName: string;
  fileFormat: string;
  onClick?: () => void;
}

export const FileNameCell: React.FC<FileNameCellProps> = ({
  fileName,
  fileFormat,
  onClick
}) => {
  const tone = resolveFormatTone(fileFormat);

  return (
    <div className={styles['file-name-cell']} onClick={onClick}>
      <span
        className={`${styles['file-name-icon']} ${styles[`file-name-icon--${tone}`]}`}
      >
        <FormatIcon tone={tone} />
      </span>
      <span
        className={`link-text ${styles['file-name-text']}`}
        title={fileName}
      >
        {fileName || '-'}
      </span>
    </div>
  );
};
