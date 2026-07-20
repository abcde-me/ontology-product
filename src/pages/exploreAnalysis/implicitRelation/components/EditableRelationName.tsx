import React, { useEffect, useState } from 'react';
import { Button, Input, Tooltip } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import styles from './EditableRelationName.module.scss';

interface EditableRelationNameProps {
  value: string;
  onChange: (name: string) => void;
  className?: string;
  size?: 'mini' | 'small';
}

export default function EditableRelationName({
  value,
  onChange,
  className,
  size = 'mini'
}: EditableRelationNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className={[styles.editor, className].filter(Boolean).join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        <Input
          size={size}
          value={draft}
          maxLength={32}
          autoFocus
          onChange={setDraft}
          onPressEnter={commit}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              cancel();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      onClick={(event) => event.stopPropagation()}
    >
      <span className={styles.name} title={value}>
        {value}
      </span>
      <Tooltip content="修改关系名称">
        <Button
          type="text"
          size="mini"
          className={styles.editBtn}
          icon={<IconEdit />}
          onClick={() => setEditing(true)}
        />
      </Tooltip>
    </div>
  );
}
