import type { FC } from 'react';
import React from 'react';
import { useCSVDownloader } from 'react-papaparse';
import { useTranslation } from 'react-i18next';
import { RiDownloadCloudLine } from '@remixicon/react';

export type ICSVDownloadProps = {
  vars: { name: string }[];
};

const CSVDownload: FC<ICSVDownloadProps> = ({ vars }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { CSVDownloader, Type } = useCSVDownloader();
  const addQueryContentVars = [...vars];
  const template = (() => {
    const res: Record<string, string> = {};
    addQueryContentVars.forEach((item) => {
      res[item.name] = '';
    });
    return res;
  })();

  return (
    <div className="mt-[20px]">
      <div className="system-md-medium text-[16px]/[24px] text-[#1E293B] text-text-primary">
        {t('share.generation.csvStructureTitle')}
      </div>
      <div className="mt-2 max-h-[500px] overflow-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 rounded-[4px] border border-divider-regular text-xs">
          <thead className="text-text-tertiary">
            <tr>
              {addQueryContentVars.map((item, i) => (
                <td
                  key={i}
                  className="h-9 border-b border-divider-regular pl-3 pr-2"
                >
                  {item.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            <tr>
              {addQueryContentVars.map((item, i) => (
                <td key={i} className="h-9 pl-4">
                  {item.name} {t('share.generation.field')}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <CSVDownloader
        className="mt-[8px] block cursor-pointer"
        type={Type.Link}
        filename={'template'}
        bom={true}
        config={
          {
            // delimiter: ';',
          }
        }
        data={[template]}
      >
        <div className="system-xs-medium flex h-[18px] items-center space-x-1 text-[#007DFA] text-text-accent">
          <RiDownloadCloudLine className="h-3 w-3" />
          <span>{t('share.generation.downloadTemplate')}</span>
        </div>
      </CSVDownloader>
    </div>
  );
};
export default React.memo(CSVDownload);
