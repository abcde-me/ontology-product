import type { FC } from 'react';
import React from 'react';
import { RiDownloadLine } from '@remixicon/react';
import { useCSVDownloader } from 'react-papaparse';
import { useTranslation } from 'react-i18next';
import ActionButton from '@/pages/workflowConfig/components/action-button';
import Button from '@/pages/workflowConfig/components/button';
import cn from '@/pages/workflowConfig/utils/classnames';

export type IResDownloadProps = {
  isMobile: boolean;
  values: Record<string, string>[];
};

const ResDownload: FC<IResDownloadProps> = ({ isMobile, values }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <CSVDownloader
      className="block cursor-pointer"
      type={Type.Link}
      filename={'result'}
      bom={true}
      config={
        {
          // delimiter: ';',
        }
      }
      data={values}
    >
      {isMobile && (
        <ActionButton>
          <RiDownloadLine className="h-4 w-4" />
        </ActionButton>
      )}
      {!isMobile && (
        <Button className={cn('space-x-1')}>
          <RiDownloadLine className="h-4 w-4" />
          <span>{t('common.operation.download')}</span>
        </Button>
      )}
    </CSVDownloader>
  );
};
export default React.memo(ResDownload);
