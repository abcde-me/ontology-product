import React from 'react';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconSync
} from '@arco-design/web-react/icon';
import { StatsCard } from '@/pages/ruleRunLog/components';
import totalIcon from '@/pages/ruleRunLog/assets/total.svg';
import type { DataTaskOverviewStats } from '../services/stats';
import { DEFAULT_DATA_TASK_OVERVIEW_STATS } from '../services/stats';
import styles from '../index.module.scss';

interface DataTaskStatsCardsProps {
  stats?: DataTaskOverviewStats;
}

const RunningIcon = () => (
  <IconSync className="h-[48px] w-[48px] text-[rgb(var(--primary-6))]" />
);

const AvgDurationIcon = () => (
  <IconClockCircle className="h-[48px] w-[48px] text-[#722ED1]" />
);

const SuccessIcon = () => (
  <IconCheckCircle className="h-[48px] w-[48px] text-[#00B42A]" />
);

const FailedIcon = () => (
  <IconCloseCircle className="h-[48px] w-[48px] text-[#F53F3F]" />
);

export const DataTaskStatsCards: React.FC<DataTaskStatsCardsProps> = ({
  stats = DEFAULT_DATA_TASK_OVERVIEW_STATS
}) => {
  const items = [
    { title: '总任务数', value: stats.total, icon: totalIcon },
    { title: '同步成功', value: stats.success, icon: SuccessIcon },
    { title: '同步中', value: stats.running, icon: RunningIcon },
    { title: '同步失败', value: stats.failed, icon: FailedIcon },
    {
      title: '结束任务平均耗时',
      value: stats.avgFinishedDuration,
      icon: AvgDurationIcon
    }
  ];

  return (
    <div className={styles['stats-row']}>
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
