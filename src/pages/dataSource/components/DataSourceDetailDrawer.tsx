import React from 'react';
import { Drawer, Tag, Divider } from '@arco-design/web-react';
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

  // 数据源类型映射
  const getDataSourceTypeTag = (type: DataSourceType) => {
    const typeMap = {
      [DataSourceType.MYSQL]: { text: 'MySQL' },
      [DataSourceType.DAMENG]: { text: '达梦数据库' },
      [DataSourceType.POSTGRESQL]: { text: 'PostgreSQL' }
    };
    const config = typeMap[type];
    return (
      <Tag
        style={{
          backgroundColor: 'rgb(24, 79, 242)',
          color: '#fff',
          border: 'none'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // 密码脱敏显示
  const maskPassword = (password = 'root') => {
    if (password.length <= 4) {
      return '*'.repeat(password.length);
    }
    const firstPart = password.substring(0, 4);
    const lastPart = password.substring(password.length - 3);
    return `${firstPart}${'*'.repeat(7)}${lastPart}`;
  };

  return (
    <Drawer
      width={600}
      title="数据源详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className="py-1">
        {/* 数据源名称和类型 */}
        <div className="mb-8 border-b border-[#e5e6eb] pb-5">
          <div className="flex items-center gap-3">
            <div className="text-base font-semibold leading-[26px] text-[#1d2129]">
              {dataSource.name}
            </div>
            {getDataSourceTypeTag(dataSource.dataSourceType)}
          </div>
        </div>

        {/* 详细信息 */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              服务地址：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {connectionDetails.host}:{connectionDetails.port}
            </div>
          </div>

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              数据库名：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {connectionDetails.database}
            </div>
          </div>

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              用户名：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">root</div>
          </div>

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              密码：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {maskPassword()}
            </div>
          </div>

          {dataSource.databaseIdentifier && (
            <div className="flex items-start leading-[22px]">
              <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
                数据库标识：
              </div>
              <div className="flex-1 break-all text-sm text-[#1d2129]">
                {dataSource.databaseIdentifier}
              </div>
            </div>
          )}

          <Divider />

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              创建人：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {dataSource.creator || '赵四'}
            </div>
          </div>

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              创建组织：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {dataSource.creatorOrg || '数据供方机构A01'}
            </div>
          </div>

          <div className="flex items-start leading-[22px]">
            <div className="w-[100px] flex-shrink-0 text-sm font-normal text-[#86909c]">
              创建时间：
            </div>
            <div className="flex-1 break-all text-sm text-[#1d2129]">
              {dataSource.createTime}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
