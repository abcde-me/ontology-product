import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { NoDataCard } from '@ceai-front/arco-material';
import type { ObjectInstanceStat } from '../types';
import styles from '../index.module.scss';

const BAR_COLORS = [
  '#165DFF',
  '#4080FF',
  '#722ED1',
  '#B37FEB',
  '#00B42A',
  '#14C9C9'
];

interface ObjectInstanceChartProps {
  data: ObjectInstanceStat[];
}

export const ObjectInstanceChart: React.FC<ObjectInstanceChartProps> = ({
  data
}) => {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.count - b.count);

    return {
      grid: {
        left: 120,
        right: 48,
        top: 8,
        bottom: 8
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#86909C' },
        splitLine: { lineStyle: { color: '#F2F3F5' } }
      },
      yAxis: {
        type: 'category',
        data: sorted.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#4E5969',
          width: 110,
          overflow: 'truncate'
        }
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((item, index) => ({
            value: item.count,
            itemStyle: {
              color: BAR_COLORS[index % BAR_COLORS.length],
              borderRadius: [0, 4, 4, 0]
            },
            label: {
              show: true,
              position: 'right',
              color: BAR_COLORS[index % BAR_COLORS.length],
              fontWeight: 600
            }
          })),
          barWidth: 16
        }
      ]
    };
  }, [data]);

  return (
    <div className={styles['section-card']}>
      <div className={styles['section-header']}>
        <div className={styles['section-title']}>对象实例数</div>
      </div>
      <div className={styles['chart-body']}>
        {data.length > 0 ? (
          <ReactECharts
            option={option}
            style={{ height: '100%', minHeight: 280 }}
          />
        ) : (
          <NoDataCard type="block" title="暂无对象实例数据" />
        )}
      </div>
    </div>
  );
};
