import React from 'react';
import { DatePicker, InputNumber, Switch } from '@arco-design/web-react';
import dayjs from 'dayjs';
import type {
  SpatiotemporalAnalysisMode,
  SpatiotemporalAnalysisParams,
  SpatiotemporalDataset
} from '../types';
import styles from '../index.module.scss';

interface ModeParamsPanelProps {
  mode: SpatiotemporalAnalysisMode;
  params: SpatiotemporalAnalysisParams;
  dataset?: SpatiotemporalDataset;
  onChange: (next: SpatiotemporalAnalysisParams) => void;
}

const ParamRow: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className={styles.paramRow}>
    <div className={styles.paramLabelWrap}>
      <div className={styles.paramLabel}>{label}</div>
      {hint ? <div className={styles.paramHint}>{hint}</div> : null}
    </div>
    <div className={styles.paramControl}>{children}</div>
  </div>
);

export const ModeParamsPanel: React.FC<ModeParamsPanelProps> = ({
  mode,
  params,
  dataset,
  onChange
}) => {
  const patch = (partial: Partial<SpatiotemporalAnalysisParams>) =>
    onChange({ ...params, ...partial });

  const timeRange = dataset?.timeRange;

  return (
    <div className={styles.paramsPanel}>
      <div className={styles.paramsPanelTitle}>分析参数</div>

      <ParamRow label="时间筛选" hint="仅分析指定时段内的时空点">
        <Switch
          checked={params.timeFilter.enabled}
          onChange={(enabled) =>
            patch({
              timeFilter: {
                ...params.timeFilter,
                enabled,
                startMs: timeRange?.min,
                endMs: timeRange?.max
              }
            })
          }
        />
      </ParamRow>

      {params.timeFilter.enabled && timeRange ? (
        <ParamRow label="起止时间">
          <DatePicker.RangePicker
            showTime
            style={{ width: '100%' }}
            value={[
              params.timeFilter.startMs
                ? dayjs(params.timeFilter.startMs)
                : dayjs(timeRange.min),
              params.timeFilter.endMs
                ? dayjs(params.timeFilter.endMs)
                : dayjs(timeRange.max)
            ]}
            onChange={(values) => {
              if (!values) {
                return;
              }
              patch({
                timeFilter: {
                  ...params.timeFilter,
                  startMs: values[0] ? dayjs(values[0]).valueOf() : undefined,
                  endMs: values[1] ? dayjs(values[1]).valueOf() : undefined
                }
              });
            }}
          />
        </ParamRow>
      ) : null}

      {mode === 'trajectory' ? (
        <>
          <ParamRow label="最少点数" hint="过滤掉点位过少的轨迹">
            <InputNumber
              min={1}
              max={20}
              value={params.trajectory.minPointCount}
              onChange={(value) =>
                patch({
                  trajectory: {
                    ...params.trajectory,
                    minPointCount: Number(value) || 1
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="最短路径(km)">
            <InputNumber
              min={0}
              value={params.trajectory.minDistanceKm}
              onChange={(value) =>
                patch({
                  trajectory: {
                    ...params.trajectory,
                    minDistanceKm: Number(value) || 0
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow
            label="驻留判定(分钟)"
            hint="相邻点距离近且间隔超过该值视为驻留"
          >
            <InputNumber
              min={5}
              value={params.trajectory.stopDwellMinutes}
              onChange={(value) =>
                patch({
                  trajectory: {
                    ...params.trajectory,
                    stopDwellMinutes: Number(value) || 30
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="超速阈值(km/h)">
            <InputNumber
              min={20}
              value={params.trajectory.speedAnomalyKmh}
              onChange={(value) =>
                patch({
                  trajectory: {
                    ...params.trajectory,
                    speedAnomalyKmh: Number(value) || 120
                  }
                })
              }
            />
          </ParamRow>
        </>
      ) : null}

      {mode === 'clustering' ? (
        <>
          <ParamRow label="空间半径(km)" hint="两点距离小于该值视为空间邻近">
            <InputNumber
              min={1}
              value={params.clustering.epsKm}
              onChange={(value) =>
                patch({
                  clustering: {
                    ...params.clustering,
                    epsKm: Number(value) || 30
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="时间窗口(h)">
            <InputNumber
              min={1}
              value={params.clustering.timeWindowHours}
              onChange={(value) =>
                patch({
                  clustering: {
                    ...params.clustering,
                    timeWindowHours: Number(value) || 72
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="最少成员数">
            <InputNumber
              min={2}
              value={params.clustering.minPoints}
              onChange={(value) =>
                patch({
                  clustering: {
                    ...params.clustering,
                    minPoints: Number(value) || 2
                  }
                })
              }
            />
          </ParamRow>
        </>
      ) : null}

      {mode === 'region' ? (
        <>
          <ParamRow label="网格规模" hint="N×N 网格，越大区域划分越细">
            <InputNumber
              min={3}
              max={12}
              value={params.region.gridSize}
              onChange={(value) =>
                patch({
                  region: {
                    ...params.region,
                    gridSize: Number(value) || 6
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="热点占比(%)" hint="实例数排名前 X% 标记为热点">
            <InputNumber
              min={5}
              max={50}
              value={params.region.hotTopPercent}
              onChange={(value) =>
                patch({
                  region: {
                    ...params.region,
                    hotTopPercent: Number(value) || 20
                  }
                })
              }
            />
          </ParamRow>
        </>
      ) : null}

      {mode === 'migration' ? (
        <>
          <ParamRow label="前期占比" hint="0.4 表示前 40% 时段为前期">
            <InputNumber
              min={0.1}
              max={0.9}
              step={0.1}
              value={params.migration.earlyPeriodRatio}
              onChange={(value) =>
                patch({
                  migration: {
                    ...params.migration,
                    earlyPeriodRatio: Number(value) || 0.5
                  }
                })
              }
            />
          </ParamRow>
          <ParamRow label="最小位移(km)" hint="低于该值的迁移不计入统计">
            <InputNumber
              min={0}
              value={params.migration.minDisplacementKm}
              onChange={(value) =>
                patch({
                  migration: {
                    ...params.migration,
                    minDisplacementKm: Number(value) || 0
                  }
                })
              }
            />
          </ParamRow>
        </>
      ) : null}

      {mode === 'evolution' ? (
        <ParamRow label="时间分桶数" hint="分桶越多，演化曲线越细">
          <InputNumber
            min={3}
            max={12}
            value={params.evolution.bucketCount}
            onChange={(value) =>
              patch({
                evolution: {
                  ...params.evolution,
                  bucketCount: Number(value) || 6
                }
              })
            }
          />
        </ParamRow>
      ) : null}
    </div>
  );
};
