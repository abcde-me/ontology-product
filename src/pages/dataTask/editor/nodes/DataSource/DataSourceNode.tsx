import React, { useMemo } from 'react';
import {
  DATA_TASK_SOURCE_TYPE,
  DATA_TASK_SOURCE_TYPE_LABEL,
  type DataTaskSourceType
} from '@/pages/dataTask/constants/dataSourceTypes';

const buildSummary = (data: Record<string, unknown>) => {
  const sourceType =
    (data.sourceType as DataTaskSourceType) ?? DATA_TASK_SOURCE_TYPE.DATABASE;
  const typeLabel = DATA_TASK_SOURCE_TYPE_LABEL[sourceType] || sourceType;

  if (sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
    const fileName = data.documentFileName || data.documentFilePath;
    return fileName ? `${typeLabel} / ${fileName}` : `${typeLabel} / 待上传`;
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.DATABASE) {
    const sourceDataInfo = data.sourceDataInfo as
      | {
          connectorName?: string;
          databaseName?: string;
          tableName?: string;
        }
      | undefined;
    const parts = [
      typeLabel,
      sourceDataInfo?.connectorName,
      sourceDataInfo?.databaseName,
      sourceDataInfo?.tableName
    ].filter(Boolean);
    return parts.join(' / ') || `${typeLabel} / 待配置`;
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
    const parts = [
      typeLabel,
      data.messageQueueConnectorName,
      data.messageQueueTopic
    ].filter(Boolean);
    return parts.join(' / ') || `${typeLabel} / 待配置`;
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.API) {
    const connectorName = data.apiConnectorName;
    return connectorName
      ? `${typeLabel} / ${connectorName}`
      : `${typeLabel} / 待配置`;
  }

  return typeLabel;
};

const DataSourceNode = ({ data }: { data: Record<string, unknown> }) => {
  const summary = useMemo(() => buildSummary(data), [data]);

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {summary}
      </div>
    </div>
  );
};

export default React.memo(DataSourceNode);
