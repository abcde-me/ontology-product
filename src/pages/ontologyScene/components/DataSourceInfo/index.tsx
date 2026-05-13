import React, { useState } from 'react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { SqlDetailModal } from '../SqlDetailModal';
import {
  SourceType,
  QueryMode,
  SourceDataInfo
} from '../CollapsibleSection/types';

interface DataSourceInfoProps {
  sourceType?: SourceType;
  sourceDataInfo?: SourceDataInfo;
  filePath?: string;
}

export const DataSourceInfo: React.FC<DataSourceInfoProps> = ({
  sourceType,
  sourceDataInfo,
  filePath
}) => {
  const [sqlModalVisible, setSqlModalVisible] = useState(false);

  // 渲染字段行
  const renderField = (
    label: string,
    value: React.ReactNode,
    width = 'w-[418px]'
  ) => {
    return (
      <div className={`flex gap-[8px] ${width}`}>
        <div className="w-[100px] flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-4)]">
          {label}：
        </div>
        <div className="min-w-0 flex-1">
          {typeof value === 'string' ? (
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
            />
          ) : (
            value || (
              <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                -
              </span>
            )
          )}
        </div>
      </div>
    );
  };

  // 文件上传类型
  if (sourceType === SourceType.FILE) {
    return (
      <>
        <div className="flex gap-[16px]">
          {renderField('数据来源', sourceDataInfo?.connectorName)}
          {renderField('文件上传', filePath)}
        </div>
      </>
    );
  }

  // 数据库/表类型
  if (sourceType === SourceType.DATABASE) {
    const queryMode = sourceDataInfo?.queryMode;

    // 选择数据表
    if (queryMode === QueryMode.SELECTED || queryMode === 'selected') {
      const tableDisplay =
        sourceDataInfo?.databaseName && sourceDataInfo?.tableName
          ? `${sourceDataInfo.databaseName}/${sourceDataInfo.tableName}`
          : '-';

      return (
        <>
          <div className="mb-[12px] flex gap-[16px]">
            {renderField('数据来源', sourceDataInfo?.connectorName)}
            {renderField('数据库', sourceDataInfo?.connectorSubtype)}
          </div>
          <div className="flex gap-[16px]">
            {renderField('数据表', tableDisplay)}
          </div>
        </>
      );
    }

    // 自定义SQL
    if (queryMode === QueryMode.SQL || queryMode === 'sql') {
      const tableDisplay = (
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
            自定义SQL
          </span>
          <span
            className="cursor-pointer text-[14px] leading-[22px] text-[rgba(var(--primary-6))] hover:underline"
            onClick={() => setSqlModalVisible(true)}
          >
            详情
          </span>
        </div>
      );

      return (
        <>
          <div className="mb-[12px] flex gap-[16px]">
            {renderField('数据来源', sourceDataInfo?.connectorName)}
            {renderField('数据库', sourceDataInfo?.connectorSubtype)}
          </div>
          <div className="flex gap-[16px]">
            {renderField('数据表', tableDisplay)}
          </div>

          {/* SQL详情弹窗 */}
          <SqlDetailModal
            visible={sqlModalVisible}
            onClose={() => setSqlModalVisible(false)}
            title="自定义SQL"
            sql={sourceDataInfo?.sql}
          />
        </>
      );
    }
  }

  // 默认显示 -
  return (
    <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
      -
    </div>
  );
};

export default DataSourceInfo;
