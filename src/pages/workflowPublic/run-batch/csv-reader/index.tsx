import type { FC } from 'react';
import React, { useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { useTranslation } from 'react-i18next';
import cn from '@/pages/workflowConfig/utils/classnames';
// import { RiFileExcelLine } from '@remixicon/react'

export type Props = {
  onParsed: (data: string[][]) => void;
};

const CSVReader: FC<Props> = ({ onParsed }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  return (
    <CSVReader
      onUploadAccepted={(results: any) => {
        onParsed(results.data);
        setZoneHover(false);
      }}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({ getRootProps, acceptedFile }: any) => (
        <>
          <div
            {...getRootProps()}
            className={cn(
              'system-sm-regular flex h-[126px] flex-col items-center justify-center gap-y-[12px] rounded-[4px] border border-dashed border-components-dropzone-border bg-components-dropzone-bg',
              acceptedFile &&
                'border-solid border-components-panel-border bg-components-panel-on-panel-item-bg px-6 hover:border-components-panel-bg-blur hover:bg-components-panel-on-panel-item-bg-hover',
              zoneHover &&
                'border border-components-dropzone-border-accent bg-components-dropzone-bg-accent'
            )}
          >
            {/* <CSVIcon className="shrink-0" /> */}
            <div className="csv-icon" />
            {acceptedFile ? (
              <div className="flex w-full items-center space-x-2">
                <div className="flex w-0 grow">
                  <span className="max-w-[calc(100%_-_30px)] truncate text-text-secondary">
                    {acceptedFile.name.replace(/.csv$/, '')}
                  </span>
                  <span className="shrink-0 text-text-tertiary">.csv</span>
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-center space-x-2">
                <div className="text-text-tertiary">
                  {t('share.generation.csvUploadTitle')}
                  <span className="cursor-pointer text-[#007DFA] text-text-accent">
                    {t('share.generation.browse')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
};

export default React.memo(CSVReader);
