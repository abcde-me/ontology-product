import React from 'react';
import {
  EllipsisPopover as AAEllipsisPopover,
  GlobalTooltip
} from '@ceai-front/arco-material';

export const EllipsisPopover = (
  props: React.ComponentProps<typeof AAEllipsisPopover>
) => {
  const { value, className, style } = props;
  return (
    <GlobalTooltip.Ellipsis
      text={value || '-'}
      className={className}
      style={style}
    />
  );
};
