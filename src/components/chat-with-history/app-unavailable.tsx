'use client';
import type { FC } from 'react';
import React from 'react';

type IAppUnavailableProps = {
  code?: number;
  isUnknwonReason?: boolean;
  unknownReason?: string;
};

const AppUnavailable: FC<IAppUnavailableProps> = ({
  code = 404,
  unknownReason
}) => {
  return (
    <div className="flex h-full items-center justify-center">
      <h1
        className="mr-5 h-[50px] pr-5 text-[24px] font-medium leading-[50px]"
        style={{
          borderRight: '1px solid rgba(0,0,0,.3)'
        }}
      >
        {code}
      </h1>
      <div className="text-sm">{unknownReason || '应用不可用'}</div>
    </div>
  );
};
export default React.memo(AppUnavailable);
