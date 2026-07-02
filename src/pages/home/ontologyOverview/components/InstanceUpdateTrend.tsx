import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { InstanceTrendPoint } from '../types';
import styles from '../index.module.scss';

interface InstanceUpdateTrendProps {
  data: InstanceTrendPoint[];
}

export const InstanceUpdateTrend: React.FC<InstanceUpdateTrendProps> = ({
  data
}) => {
  const option = useMemo(
    () => ({
      grid: {
        left: 48,
        right: 48,
        top: 24,
        bottom: 32
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((item) => item.time),
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisLabel: { color: '#86909C' }
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          axisLabel: { color: '#86909C' },
          splitLine: { lineStyle: { color: '#F2F3F5' } }
        },
        {
          type: 'value',
          name: '',
          axisLabel: { color: '#86909C' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '时点增量 (条/小时)',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          yAxisIndex: 0,
          data: data.map((item) => item.increment),
          lineStyle: { color: '#165DFF', width: 2 },
          itemStyle: { color: '#165DFF' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22, 93, 255, 0.25)' },
                { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }
              ]
            }
          }
        },
        {
          name: '当天累计实例数 (条)',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          data: data.map((item) => item.cumulative),
          lineStyle: { color: '#00B42A', width: 2 },
          itemStyle: { color: '#00B42A' }
        }
      ]
    }),
    [data]
  );

  return (
    <div className={styles['section-card']}>
      <div className={styles['section-header']}>
        <div className={styles['section-title']}>对象实例更新趋势</div>
        <div className={styles['section-extra']}>
          <div className={styles['legend-item']}>
            <span
              className={styles['legend-dot']}
              style={{ background: '#165DFF' }}
            />
            <span>时点增量 (条/小时)</span>
          </div>
          <div className={styles['legend-item']}>
            <span
              className={styles['legend-dot']}
              style={{ background: '#00B42A' }}
            />
            <span>当天累计实例数 (条)</span>
          </div>
        </div>
      </div>
      <div className={styles['chart-body']}>
        <ReactECharts
          option={option}
          style={{ height: '100%', minHeight: 280 }}
        />
      </div>
    </div>
  );
};
