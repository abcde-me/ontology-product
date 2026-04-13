import React, { ComponentProps, memo } from 'react';
import { Button, ButtonProps } from '@arco-design/web-react';
import { PermissionWrapper } from '@/components/PermissionGuard';

type PermissionWrapperProps = Omit<
  ComponentProps<typeof PermissionWrapper>,
  'children'
>;

const PermissionButton = (
  props: { permission?: PermissionWrapperProps } & ButtonProps
) => {
  const { permission = {}, ...btnProps } = props;
  return (
    <PermissionWrapper {...permission}>
      <Button {...btnProps} />
    </PermissionWrapper>
  );
};
export default memo(PermissionButton);
