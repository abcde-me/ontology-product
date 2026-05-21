import React from 'react';
import cn from 'classnames';
import styles from './Prompts.module.scss';

export interface PromptsProps {
  list: { id: string; value: string; disabled?: boolean }[];
  onSelect?: (askParams: { id: string; text: string }) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Prompts: React.FC<PromptsProps> = ({
  list = [],
  onSelect,
  className = '',
  style = {}
}) => {
  return (
    <div className={cn(styles.prompts, className)} style={style}>
      {list
        .filter((question) => question.value?.trim())
        .map(({ value, id, disabled }, index) => (
          <div
            key={index}
            className={cn(styles.promptItem, {
              [styles.disabled]: !!disabled
            })}
            onClick={() => !disabled && onSelect?.({ id, text: value })}
          >
            {value}
          </div>
        ))}
    </div>
  );
};

export default Prompts;
