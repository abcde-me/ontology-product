import React from 'react';
import {
  IconCheckCircle,
  IconFile,
  IconRobot,
  IconStorage
} from '@arco-design/web-react/icon';
import { StatsCard } from '@/pages/ruleRunLog/components';
import type { DataResourceStats } from '../services/stats';
import { DEFAULT_DATA_RESOURCE_STATS } from '../services/stats';
import styles from '../index.module.scss';

interface DataResourceStatsCardsProps {
  stats?: DataResourceStats;
}

const DatabaseIcon = () => (
  <IconStorage className="h-[48px] w-[48px] text-[rgb(var(--primary-6))]" />
);

const FileIcon = () => (
  <IconFile className="h-[48px] w-[48px] text-[#722ED1]" />
);

const AuthorizedIcon = () => (
  <IconCheckCircle className="h-[48px] w-[48px] text-[#00B42A]" />
);

const ExtractIcon = () => (
  <IconRobot className="h-[48px] w-[48px] text-[#FF7D00]" />
);

export const DataResourceStatsCards: React.FC<DataResourceStatsCardsProps> = ({
  stats = DEFAULT_DATA_RESOURCE_STATS
}) => {
  const items = [
    {
      title: '数据库表',
      value: stats.databaseTableCount,
      icon: DatabaseIcon
    },
    {
      title: '文件资源',
      value: stats.fileResourceCount,
      icon: FileIcon
    },
    {
      title: '已授权查询',
      value: stats.authorizedQueryCount,
      icon: AuthorizedIcon
    },
    {
      title: '信息提取任务',
      value:
        stats.extractTaskCount > 0
          ? `${stats.completedExtractCount}/${stats.extractTaskCount}`
          : stats.extractTaskCount,
      icon: ExtractIcon
    }
  ];

  return (
    <div className={styles['data-resource-stats-row']}>
      {items.map((item) => (
        <StatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </div>
  );
};
