import React from 'react';
import { Button, Tooltip } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { ButtonProps } from '@arco-design/web-react/lib';

const RefreshButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <Tooltip content="刷新">
      <Button
        type="outline"
        icon={<IconRefresh />}
        {...props}
        style={{
          borderColor: 'var(--color-border-1)',
          backgroundColor: '#ffffff',
          color: 'var(--color-text-2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#438DFB';
          e.currentTarget.style.color = 'var(--color-text-3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = 'var(--color-border-1)';
          e.currentTarget.style.color = 'var(--color-text-2)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.borderColor = '#2563EB';
          e.currentTarget.style.color = 'var(--color-text-1)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.borderColor = '#438DFB';
          e.currentTarget.style.color = 'var(--color-text-2)';
        }}
      />
    </Tooltip>
  );
};

export default RefreshButton;
