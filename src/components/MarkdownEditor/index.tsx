import React from 'react';
import { Input } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './index.module.scss';

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = '支持 Markdown 格式，如 # 标题、**加粗**、- 列表',
  className,
  minHeight = 360
}: MarkdownEditorProps) {
  return (
    <Input.TextArea
      className={classNames(styles.editor, className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ minHeight, height: '100%' }}
    />
  );
}
