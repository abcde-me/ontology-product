import React from 'react';
import { Drawer } from '@arco-design/web-react';
import type { DataSourceItem } from '../types';
import { DataSourceType } from '../types';

interface DataSourceDetailDrawerProps {
  visible: boolean;
  dataSource: DataSourceItem | null;
  onClose: () => void;
}

export const DataSourceDetailDrawer: React.FC<DataSourceDetailDrawerProps> = ({
  visible,
  dataSource,
  onClose
}) => {
  if (!dataSource) {
    return null;
  }

  // 解析连接信息
  const parseConnectionInfo = (connectionInfo: string) => {
    try {
      const match = connectionInfo.match(/\/\/([^:]+):(\d+)(?:\/(.+))?/);
      if (match) {
        return {
          host: match[1],
          port: match[2],
          database: match[3] || '-'
        };
      }
    } catch (e) {
      console.error('解析连接信息失败', e);
    }
    return {
      host: '-',
      port: '-',
      database: '-'
    };
  };

  const connectionDetails = parseConnectionInfo(dataSource.connectionInfo);

  // 从 config 中获取用户名
  const username = dataSource.config?.user || '-';

  // 格式化时间
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return timeStr;
    }
  };

  // 数据源类型映射
  const getDataSourceTypeTag = (type: DataSourceType) => {
    const typeMap = {
      [DataSourceType.MYSQL]: { text: 'MySQL' },
      [DataSourceType.DAMENG]: { text: '达梦数据库' },
      [DataSourceType.POSTGRESQL]: { text: 'PostgreSQL' }
    };
    const config = typeMap[type];
    return (
      <div
        className="flex items-center gap-1 rounded border border-solid border-[#dfe2eb] px-2"
        style={{ borderRadius: '4px' }}
      >
        <p className="whitespace-nowrap text-xs leading-[18px] text-[#292f42]">
          {config.text}
        </p>
      </div>
    );
  };

  return (
    <Drawer
      width={640}
      title="数据源详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className="flex flex-col gap-4">
        {/* 标题区域 */}
        <div className="flex flex-col gap-1">
          <div className="flex h-8 items-center gap-2">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold leading-[30px] text-[#0f172a]">
              {dataSource.name}
            </p>
            {getDataSourceTypeTag(dataSource.dataSourceType)}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px w-full bg-[#dfe2eb]" />

        {/* 连接信息区域 */}
        <div className="flex w-full flex-wrap gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
                服务地址
              </p>
            </div>
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
                数据库名
              </p>
            </div>
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
                用户名
              </p>
            </div>
          </div>
          <div className="flex min-w-[386px] flex-1 flex-col gap-4 overflow-clip">
            <div className="flex w-full items-center gap-2">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
                {connectionDetails.host}:{connectionDetails.port}
              </p>
            </div>
            <div className="flex w-full items-center gap-2">
              <p className="min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
                {connectionDetails.database}
              </p>
            </div>
            <div className="flex w-full items-center gap-2">
              <p className="min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
                {username}
              </p>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px w-full bg-[#dfe2eb]" />

        {/* 创建信息区域 */}
        <div className="flex w-full flex-wrap gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
                创建人
              </p>
            </div>

            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
                更新时间
              </p>
            </div>
          </div>
          <div className="flex min-w-[386px] flex-1 flex-col gap-4 overflow-clip">
            <div className="flex w-full items-center gap-2">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
                {dataSource.creator || '-'}
              </p>
            </div>
            <div className="flex w-full items-center gap-2">
              <p className="min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
                {formatTime(dataSource.updateTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
