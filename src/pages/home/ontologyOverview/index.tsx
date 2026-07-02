import React, { useCallback, useEffect, useState } from 'react';
import { Button, Spin, Message, Tooltip } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import {
  InstanceUpdateTrend,
  ObjectInstanceChart,
  DataTaskOverviewTable,
  OverviewStatsCards
} from './components';
import { fetchOntologyOverviewData } from './services/api';
import type { OntologyOverviewData } from './types';
import { createEmptyOverviewData } from './types';
import styles from './index.module.scss';

const emptyData = createEmptyOverviewData();

export default function OntologyOverview() {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] =
    useState<OntologyOverviewData>(emptyData);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOntologyOverviewData();
      setOverviewData(data);
      setStatsUpdatedAt(new Date());
    } catch (error) {
      console.error('获取本体概览数据失败:', error);
      setOverviewData(createEmptyOverviewData());
      Message.error('获取本体概览数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnterDataTask = () => {
    history.push('/tenant/compute/onto/dataConnection/dataTask');
  };

  return (
    <div className={styles['overview-page']}>
      <div className={styles['overview-header-row']}>
        <PageHeader
          className={styles['overview-header']}
          title="本体概览"
          subTitle="总览本体资源统计、对象实例更新趋势、对象实例分布及数据任务运行状态"
        />
        <div className={styles['overview-refresh']}>
          <span className={styles['overview-refresh-hint']}>
            每小时更新
            {statsUpdatedAt ? (
              <span className={styles['overview-refresh-time']}>
                · 统计时间 {dayjs(statsUpdatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            ) : null}
          </span>
          <Tooltip content="手动刷新">
            <Button
              type="text"
              className={styles['overview-refresh-btn']}
              icon={<IconRefresh />}
              loading={loading}
              onClick={() => void loadData()}
            />
          </Tooltip>
        </div>
      </div>

      <div className={styles['overview-stats']}>
        <OverviewStatsCards stats={overviewData.stats} />
      </div>

      <div className={styles['overview-body']}>
        <Spin loading={loading} style={{ width: '100%' }}>
          <div className={styles['chart-row']}>
            <InstanceUpdateTrend data={overviewData.trend} />
            <ObjectInstanceChart data={overviewData.objectStats} />
          </div>

          <DataTaskOverviewTable
            data={overviewData.dataTasks}
            onEnterDataTask={handleEnterDataTask}
          />
        </Spin>
      </div>
    </div>
  );
}
