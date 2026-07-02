import React, { useState } from 'react';
import SceneIcon from '@/pages/ontologyScene/assets/menu.svg';
import ObjectTypeIcon from '@/pages/ontologyScene/assets/object-small.svg';
import AttributeIcon from '@/pages/ontologyScene/assets/menu-attribute.svg';
import InstanceIcon from '@/pages/ontologyScene/assets/menu-object.svg';
import LinkIcon from '@/pages/ontologyScene/assets/link-small.svg';
import BehaviorIcon from '@/pages/ontologyScene/assets/behavior-small.svg';
import FunctionIcon from '@/pages/ontologyScene/assets/function-small.svg';
import DataTaskIcon from '@/assets/file/database-icon.svg';
import type { OverviewStats } from '../types';
import { DEFAULT_OVERVIEW_STATS } from '../types';
import { OverviewStatCard } from './OverviewStatCard';
import styles from '../index.module.scss';

interface OverviewStatsCardsProps {
  stats?: OverviewStats;
}

const STAT_ITEMS: {
  key: keyof OverviewStats;
  title: string;
  icon: React.ComponentType<React.SVGAttributes<SVGElement>>;
}[] = [
  { key: 'sceneCount', title: '场景数', icon: SceneIcon },
  { key: 'objectTypeCount', title: '对象类型数', icon: ObjectTypeIcon },
  { key: 'propertyCount', title: '属性数', icon: AttributeIcon },
  { key: 'instanceCount', title: '实例数', icon: InstanceIcon },
  { key: 'linkCount', title: '链接数', icon: LinkIcon },
  { key: 'behaviorCount', title: '行为数', icon: BehaviorIcon },
  { key: 'functionCount', title: '函数量', icon: FunctionIcon },
  { key: 'dataTaskCount', title: '数据任务量', icon: DataTaskIcon }
];

export const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({
  stats = DEFAULT_OVERVIEW_STATS
}) => {
  const [selectedKey, setSelectedKey] = useState<keyof OverviewStats | null>(
    null
  );

  return (
    <div className={styles['stats-row']}>
      {STAT_ITEMS.map((item) => (
        <OverviewStatCard
          key={item.key}
          title={item.title}
          value={stats[item.key]}
          icon={item.icon}
          selected={selectedKey === item.key}
          onClick={() =>
            setSelectedKey((prev) => (prev === item.key ? null : item.key))
          }
        />
      ))}
    </div>
  );
};
