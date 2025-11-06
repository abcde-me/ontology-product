import type { FC } from 'react';
import React from 'react';
// import {
//   RiSparklingFill,
// } from '@remixicon/react'
import { useTranslation } from 'react-i18next';

export type INoDataProps = any;
const NoData: FC<INoDataProps> = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* <RiSparklingFill className='w-12 h-12 text-text-empty-state-icon' /> */}
      <div className="right-part-empty-icon" />
      <div className="system-sm-regular mt-2 text-text-quaternary">
        {/* {t('share.generation.noData')} */}
        AI会在这里给你惊喜
      </div>
    </div>
  );
};
export default React.memo(NoData);
