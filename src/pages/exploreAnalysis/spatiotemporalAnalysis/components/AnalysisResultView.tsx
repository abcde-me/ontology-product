import React, { useState } from 'react';
import { Empty, Table, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import {
  CLUSTER_RISK_COLOR,
  CLUSTER_RISK_LABEL,
  REGION_HEAT_LABEL,
  TRAJECTORY_SPEED_ANOMALY_LABEL
} from '../constants';
import type {
  SpatiotemporalAnalysisParams,
  SpatiotemporalAnalysisResult,
  SpatiotemporalDataset
} from '../types';
import { buildTrajectorySummaryText } from '../services/trajectoryAnalysis';
import { formatTimeLabel } from '../services/loadDataset';
import { GeoScatterChart, TimeSeriesChart } from './charts';
import { MetricGrid } from './MetricCards';
import styles from '../index.module.scss';

const TREND_LABEL = {
  expanding: '空间扩散',
  contracting: '空间收缩',
  stable: '相对稳定',
  shifted: '重心迁移'
} as const;

const HEAT_COLOR = {
  hot: 'red',
  warm: 'orangered',
  cold: 'gray'
} as const;

interface AnalysisResultViewProps {
  result: SpatiotemporalAnalysisResult;
  dataset: SpatiotemporalDataset;
  params: SpatiotemporalAnalysisParams;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  dataset,
  params
}) => {
  const [selectedTrajectoryKey, setSelectedTrajectoryKey] = useState<string>();
  const [selectedClusterId, setSelectedClusterId] = useState<string>();
  const [selectedEvolutionBucket, setSelectedEvolutionBucket] =
    useState<number>();

  if (result.mode === 'trajectory') {
    const { data } = result;
    const summaryText = buildTrajectorySummaryText(data);
    const highlighted =
      data.trajectories.find(
        (item) =>
          `${item.objectTypeName || ''}:${item.entityKey}` ===
          selectedTrajectoryKey
      ) || data.trajectories[0];
    const topLines = highlighted
      ? [highlighted]
      : data.trajectories.slice(0, 8);

    const columns: ColumnProps<(typeof data.trajectories)[number]>[] = [
      {
        title: '实体',
        dataIndex: 'entityLabel',
        width: 140,
        render: (value, record) => (
          <span>
            {value}
            {record.isSpeedAnomaly ? (
              <Tag size="small" color="red" style={{ marginLeft: 6 }}>
                {TRAJECTORY_SPEED_ANOMALY_LABEL}
              </Tag>
            ) : null}
          </span>
        )
      },
      { title: '对象类型', dataIndex: 'objectTypeName', width: 110 },
      {
        title: '点数',
        render: (_, record) => record.points.length,
        width: 70
      },
      {
        title: '路径(km)',
        render: (_, record) => record.distanceKm.toFixed(1),
        width: 90
      },
      {
        title: '驻留',
        render: (_, record) => record.stopCount,
        width: 70
      },
      {
        title: '均速',
        render: (_, record) => `${record.avgSpeedKmh.toFixed(1)} km/h`,
        width: 100
      },
      {
        title: '起止时间',
        width: 170,
        render: (_, record) =>
          `${formatTimeLabel(record.startTimeMs).slice(5, 16)} ~ ${formatTimeLabel(record.endTimeMs).slice(5, 16)}`
      }
    ];

    return (
      <div className={styles.resultLayout}>
        <div className={styles.summaryBox}>{summaryText}</div>
        <MetricGrid
          items={[
            { label: '有效轨迹', value: data.summary.entityCount },
            { label: '时空点', value: data.summary.pointCount },
            {
              label: '总路径(km)',
              value: data.summary.totalDistanceKm.toFixed(1)
            },
            {
              label: '速度异常',
              value: data.summary.anomalyCount,
              hint: `阈值 ${params.trajectory.speedAnomalyKmh} km/h`
            }
          ]}
        />
        <div className={styles.splitLayout}>
          <GeoScatterChart
            title="轨迹路径（点击表格行高亮）"
            lineSeries={topLines.map((item) => ({
              name: item.entityLabel,
              points: item.points
            }))}
            scatterSeries={
              highlighted?.stops.length
                ? [
                    {
                      name: '驻留点',
                      points: highlighted.stops.map((stop, index) => ({
                        key: `stop-${index}`,
                        instanceId: `stop-${index}`,
                        objectTypeId: 0,
                        label: `驻留 ${stop.dwellMinutes.toFixed(0)} 分钟`,
                        lon: stop.lon,
                        lat: stop.lat,
                        timeMs: stop.startMs,
                        entityKey: 'stop'
                      })),
                      symbolSize: 14
                    }
                  ]
                : undefined
            }
          />
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>轨迹明细</div>
            <Table
              className={styles.resultTable}
              rowKey={(record) =>
                `${record.objectTypeName || 'type'}:${record.entityKey}`
              }
              columns={columns}
              data={data.trajectories}
              pagination={{ pageSize: 8, showTotal: true }}
              scroll={{ x: 'max-content', y: 300 }}
              rowClassName={(record) =>
                `${record.objectTypeName || 'type'}:${record.entityKey}` ===
                `${highlighted?.objectTypeName || 'type'}:${highlighted?.entityKey}`
                  ? styles.tableRowActive
                  : ''
              }
              onRow={(record) => ({
                onClick: () =>
                  setSelectedTrajectoryKey(
                    `${record.objectTypeName || 'type'}:${record.entityKey}`
                  )
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'clustering') {
    const { data } = result;
    const summaryText = `识别 ${data.summary.clusterCount} 个聚集簇，其中高风险 ${data.summary.highRiskCount} 个；覆盖 ${data.summary.coveredPoints} 个实例，离散点 ${data.noiseCount} 个。`;
    const highlighted =
      data.clusters.find((item) => item.id === selectedClusterId) ||
      data.clusters[0];

    const columns: ColumnProps<(typeof data.clusters)[number]>[] = [
      {
        title: '聚集簇',
        dataIndex: 'label',
        width: 90,
        render: (value, record) => (
          <span>
            {value}
            <Tag
              size="small"
              color={CLUSTER_RISK_COLOR[record.riskLevel]}
              style={{ marginLeft: 6 }}
            >
              {CLUSTER_RISK_LABEL[record.riskLevel]}风险
            </Tag>
          </span>
        )
      },
      { title: '成员', dataIndex: 'memberCount', width: 70 },
      {
        title: '强度',
        render: (_, record) => record.intensity.toFixed(2),
        width: 80
      },
      {
        title: '半径(km)',
        render: (_, record) => record.radiusKm.toFixed(1),
        width: 90
      },
      {
        title: '时间跨度',
        render: (_, record) => `${record.timeSpanHours.toFixed(1)} h`,
        width: 90
      },
      {
        title: '中心时间',
        render: (_, record) =>
          formatTimeLabel(record.centerTimeMs).slice(0, 16),
        width: 140
      }
    ];

    return (
      <div className={styles.resultLayout}>
        <div className={styles.summaryBox}>{summaryText}</div>
        <MetricGrid
          items={[
            { label: '聚集簇', value: data.summary.clusterCount },
            { label: '高风险簇', value: data.summary.highRiskCount },
            { label: '最大规模', value: data.summary.largestClusterSize },
            {
              label: '空间半径',
              value: `${params.clustering.epsKm} km`,
              hint: `窗口 ${params.clustering.timeWindowHours} h`
            }
          ]}
        />
        <div className={styles.splitLayout}>
          <GeoScatterChart
            title="聚集分布（点击行查看成员）"
            scatterSeries={
              highlighted
                ? [
                    {
                      name: highlighted.label,
                      points: highlighted.members,
                      symbolSize: 12
                    },
                    {
                      name: '其他',
                      points: dataset.points.filter(
                        (point) =>
                          !highlighted.members.some(
                            (member) => member.key === point.key
                          )
                      ),
                      symbolSize: 5
                    }
                  ]
                : data.clusters.map((cluster, index) => ({
                    name: cluster.label,
                    points: cluster.members,
                    symbolSize: 10 + index
                  }))
            }
          />
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>聚集簇列表</div>
            <Table
              className={styles.resultTable}
              rowKey="id"
              columns={columns}
              data={data.clusters}
              pagination={{ pageSize: 8, showTotal: true }}
              scroll={{ x: 'max-content', y: 300 }}
              rowClassName={(record) =>
                record.id === highlighted?.id ? styles.tableRowActive : ''
              }
              onRow={(record) => ({
                onClick: () => setSelectedClusterId(record.id)
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'region') {
    const { data } = result;
    const hottest = data.summary.hottestRegion;
    const summaryText = hottest
      ? `${data.summary.activeRegions} 个活跃区域，热点 ${data.summary.hotRegionCount} 个；最热区域 R${hottest.row + 1}C${hottest.col + 1} 占 ${hottest.sharePercent.toFixed(1)}% 实例。`
      : '暂无区域统计结果';

    const columns: ColumnProps<(typeof data.regions)[number]>[] = [
      {
        title: '区域',
        width: 100,
        render: (_, record) => (
          <span>
            R{record.row + 1}C{record.col + 1}
            <Tag
              size="small"
              color={HEAT_COLOR[record.heatLevel]}
              style={{ marginLeft: 6 }}
            >
              {REGION_HEAT_LABEL[record.heatLevel]}
            </Tag>
          </span>
        )
      },
      { title: '实例', dataIndex: 'count', width: 70 },
      {
        title: '占比',
        render: (_, record) => `${record.sharePercent.toFixed(1)}%`,
        width: 80
      },
      {
        title: '活跃(h)',
        render: (_, record) => record.activeHours?.toFixed(1) ?? '-',
        width: 80
      },
      {
        title: '时间覆盖',
        width: 160,
        render: (_, record) =>
          record.earliestMs && record.latestMs
            ? `${formatTimeLabel(record.earliestMs).slice(5, 16)} ~ ${formatTimeLabel(record.latestMs).slice(5, 16)}`
            : '-'
      }
    ];

    return (
      <div className={styles.resultLayout}>
        <div className={styles.summaryBox}>{summaryText}</div>
        <MetricGrid
          items={[
            { label: '活跃区域', value: data.summary.activeRegions },
            { label: '热点区域', value: data.summary.hotRegionCount },
            {
              label: '区域覆盖率',
              value: `${data.summary.coveragePercent.toFixed(1)}%`
            },
            { label: '网格', value: `${data.gridSize}×${data.gridSize}` }
          ]}
        />
        <div className={styles.splitLayout}>
          <GeoScatterChart
            title="区域密度（气泡大小代表实例数）"
            heatmapCells={data.regions.map((region) => ({
              name: `R${region.row + 1}C${region.col + 1}`,
              center: [region.centerLon, region.centerLat],
              value: region.count
            }))}
          />
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>区域排行</div>
            <Table
              className={styles.resultTable}
              rowKey="id"
              columns={columns}
              data={data.regions}
              pagination={{ pageSize: 10, showTotal: true }}
              scroll={{ x: 'max-content', y: 300 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'migration') {
    const { data } = result;
    const dominant = data.summary.dominantFlow;
    const summaryText = dominant
      ? `${data.summary.migrationRate.toFixed(1)}% 实体发生迁徙（${data.summary.migratingEntities}/${data.summary.totalEntities}）；主流向 ${dominant.fromLabel} → ${dominant.toLabel}，占 ${dominant.migrationRate.toFixed(1)}%。`
      : '所选时段内未检测到显著区域迁移，可尝试降低最小位移或调整前期占比';

    const columns: ColumnProps<(typeof data.flows)[number]>[] = [
      { title: '起点', dataIndex: 'fromLabel', width: 100 },
      { title: '终点', dataIndex: 'toLabel', width: 100 },
      { title: '实体数', dataIndex: 'entityCount', width: 80 },
      {
        title: '占比',
        render: (_, record) => `${record.migrationRate.toFixed(1)}%`,
        width: 80
      },
      {
        title: '均距(km)',
        render: (_, record) => record.avgDistanceKm.toFixed(1),
        width: 90
      }
    ];

    return (
      <div className={styles.resultLayout}>
        <div className={styles.summaryBox}>{summaryText}</div>
        <MetricGrid
          items={[
            {
              label: '迁徙率',
              value: `${data.summary.migrationRate.toFixed(1)}%`
            },
            { label: '迁徙实体', value: data.summary.migratingEntities },
            { label: '流向数', value: data.flows.length },
            {
              label: '平均位移',
              value: `${data.summary.avgDisplacementKm.toFixed(1)} km`
            }
          ]}
        />
        <div className={styles.splitLayout}>
          <GeoScatterChart
            title={`迁徙流向（前期 ${Math.round(params.migration.earlyPeriodRatio * 100)}% / 后期 ${Math.round((1 - params.migration.earlyPeriodRatio) * 100)}%）`}
            flowLines={data.flows.slice(0, 12).map((flow) => ({
              name: `${flow.fromLabel}→${flow.toLabel}`,
              from: [flow.fromLon, flow.fromLat],
              to: [flow.toLon, flow.toLat],
              width: Math.min(6, 1 + flow.entityCount)
            }))}
            scatterSeries={[
              {
                name: '实例分布',
                points: dataset.points,
                symbolSize: 6
              }
            ]}
          />
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>迁徙流向</div>
            <Table
              className={styles.resultTable}
              rowKey="id"
              columns={columns}
              data={data.flows}
              pagination={{ pageSize: 8, showTotal: true }}
              scroll={{ x: 'max-content', y: 300 }}
              noDataElement={<Empty description="未检测到跨区域迁移" />}
            />
          </div>
        </div>
      </div>
    );
  }

  const { data } = result;
  const selectedBucket =
    data.snapshots.find(
      (item) => item.bucketIndex === selectedEvolutionBucket
    ) || data.snapshots.find((item) => item.count > 0);
  const filteredPoints =
    selectedBucket == null
      ? dataset.points
      : dataset.points.filter(
          (point) =>
            point.timeMs >= selectedBucket.startMs &&
            point.timeMs <= selectedBucket.endMs
        );

  const summaryText = `共 ${data.summary.bucketCount} 个时段，峰值 ${data.summary.peakCount} 个实例（${data.summary.peakBucketLabel?.slice(0, 16) || '-'}），趋势「${TREND_LABEL[data.summary.trend]}」，整体变化 ${data.summary.totalGrowthRate.toFixed(1)}%。`;

  const evolutionColumns: ColumnProps<(typeof data.snapshots)[number]>[] = [
    { title: '时段', dataIndex: 'label', width: 200 },
    { title: '实例', dataIndex: 'count', width: 70 },
    {
      title: '环比',
      render: (_, record) =>
        record.growthRate === 0
          ? '-'
          : `${record.growthRate > 0 ? '+' : ''}${record.growthRate.toFixed(1)}%`,
      width: 80
    },
    {
      title: '扩散(km)',
      render: (_, record) => record.spreadKm.toFixed(1),
      width: 90
    },
    { title: '热点区', dataIndex: 'hotRegionCount', width: 80 }
  ];

  const chartCategories = data.snapshots.map(
    (item) => `T${item.bucketIndex + 1}`
  );

  return (
    <div className={styles.resultLayout}>
      <div className={styles.summaryBox}>
        {summaryText}{' '}
        <Tag color="arcoblue">{TREND_LABEL[data.summary.trend]}</Tag>
      </div>
      <MetricGrid
        items={[
          { label: '时间分桶', value: data.summary.bucketCount },
          { label: '峰值实例', value: data.summary.peakCount },
          { label: '演化趋势', value: TREND_LABEL[data.summary.trend] },
          {
            label: '整体变化',
            value: `${data.summary.totalGrowthRate.toFixed(1)}%`
          }
        ]}
      />
      <TimeSeriesChart
        title="数量与扩散演化（点击表格行切换地图时段）"
        categories={chartCategories}
        series={[
          {
            name: '实例数',
            data: data.snapshots.map((item) => item.count),
            type: 'bar'
          },
          {
            name: '扩散半径(km)',
            data: data.snapshots.map((item) =>
              Number(item.spreadKm.toFixed(2))
            ),
            type: 'line'
          }
        ]}
      />
      <div className={styles.splitLayout}>
        <GeoScatterChart
          title={
            selectedBucket
              ? `时段点位：${selectedBucket.label.slice(0, 32)}`
              : '重心迁移轨迹'
          }
          lineSeries={[
            {
              name: '重心演化',
              points: data.snapshots
                .filter((item) => item.count > 0)
                .map((item, index) => ({
                  key: `evo-${index}`,
                  instanceId: `evo-${index}`,
                  objectTypeId: 0,
                  label: item.label,
                  lon: item.centerLon,
                  lat: item.centerLat,
                  timeMs: item.startMs,
                  entityKey: 'evolution'
                }))
            }
          ]}
          scatterSeries={[
            {
              name: '当前时段点位',
              points: filteredPoints,
              symbolSize: 7
            }
          ]}
        />
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>分桶明细</div>
          <Table
            className={styles.resultTable}
            rowKey="bucketIndex"
            columns={evolutionColumns}
            data={data.snapshots}
            pagination={false}
            scroll={{ x: 'max-content', y: 300 }}
            rowClassName={(record) =>
              record.bucketIndex === selectedBucket?.bucketIndex
                ? styles.tableRowActive
                : ''
            }
            onRow={(record) => ({
              onClick: () => setSelectedEvolutionBucket(record.bucketIndex)
            })}
          />
        </div>
      </div>
    </div>
  );
};
