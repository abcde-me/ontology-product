import React from 'react';
import { Header } from '@ceai-front/arco-material';
import { PLATFORM_BRAND_NAME } from '@/common/constants';

type PlatformHeaderProps = React.ComponentProps<typeof Header>;

export default function PlatformHeader(props: PlatformHeaderProps) {
  return (
    <div
      className="platform-header-brand"
      style={
        {
          '--platform-brand-name': `"${PLATFORM_BRAND_NAME}"`
        } as React.CSSProperties
      }
    >
      <Header {...props} />
    </div>
  );
}
