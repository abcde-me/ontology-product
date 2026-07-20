import type { SpatiotemporalAnalysisResult, JourneyConclusion } from '../types';
import { buildTrajectorySummaryText } from './trajectoryAnalysis';
import { formatTimeLabel } from './loadDataset';
import { REGION_HEAT_LABEL } from '../constants';

const TREND_LABEL = {
  expanding: '活动范围在扩大',
  contracting: '活动范围在收缩',
  stable: '活动范围基本稳定',
  shifted: '活动重心发生迁移'
} as const;

export const buildJourneyConclusion = (
  result: SpatiotemporalAnalysisResult
): JourneyConclusion => {
  switch (result.mode) {
    case 'trajectory': {
      const { data } = result;
      const top = data.trajectories[0];
      const anomaly = data.summary.anomalyCount;
      return {
        headline: top
          ? `已还原 ${data.summary.entityCount} 条移动轨迹，最长路径来自「${top.entityLabel}」`
          : '当前条件下未识别有效轨迹',
        findings: [
          buildTrajectorySummaryText(data),
          data.summary.totalStopCount > 0
            ? `共发现 ${data.summary.totalStopCount} 处驻留点，可作为重点核查位置`
            : '未发现明显驻留点',
          anomaly > 0
            ? `${anomaly} 条轨迹存在速度异常，建议优先复核`
            : '未发现显著速度异常'
        ].filter(Boolean),
        recommendations: [
          '点击轨迹明细行，可在地图中高亮对应路径',
          anomaly > 0
            ? '优先跟进速度异常目标的时间窗口与周边事件'
            : '可将驻留点与态势事件做关联比对',
          '如需缩小分析时段，可在高级设置中开启时间筛选'
        ]
      };
    }
    case 'clustering': {
      const { data } = result;
      const top = data.clusters[0];
      return {
        headline: top
          ? `发现 ${data.summary.clusterCount} 处时空共现聚集，最强簇含 ${top.memberCount} 个实例`
          : '未发现显著时空聚集',
        findings: [
          top
            ? `「${top.label}」中心约 (${top.centerLon.toFixed(2)}, ${top.centerLat.toFixed(2)})，时间 ${formatTimeLabel(top.centerTimeMs).slice(0, 16)}`
            : '共现簇为空',
          data.summary.highRiskCount > 0
            ? `${data.summary.highRiskCount} 个高风险聚集簇需重点关注`
            : '暂无高风险聚集簇',
          `${data.noiseCount} 个离散点未纳入任何聚集`
        ],
        recommendations: [
          '点击聚集簇行查看成员分布',
          '缩小空间半径或时间窗口可提高共现判定精度',
          '建议结合轨迹分析，看聚集成员是否存在同向机动'
        ]
      };
    }
    case 'region': {
      const { data } = result;
      const hot = data.summary.hottestRegion;
      return {
        headline: hot
          ? `最活跃区域为 R${hot.row + 1}C${hot.col + 1}（${REGION_HEAT_LABEL[hot.heatLevel]}），占总量 ${hot.sharePercent.toFixed(1)}%`
          : '暂无显著热点区域',
        findings: [
          `${data.summary.activeRegions} 个区域有活动记录，热点 ${data.summary.hotRegionCount} 个`,
          hot
            ? `最热区域覆盖 ${hot.count} 个实例，活跃时长约 ${hot.activeHours?.toFixed(1) || '-'} 小时`
            : '区域分布较均匀',
          `区域覆盖率 ${data.summary.coveragePercent.toFixed(1)}%`
        ],
        recommendations: [
          '热点区域适合作为巡逻、侦察或资源投放优先区',
          '增大网格规模可获得更细的空间划分',
          '可将热点区域时段与轨迹/聚集结果交叉验证'
        ]
      };
    }
    case 'migration': {
      const { data } = result;
      const flow = data.summary.dominantFlow;
      return {
        headline: flow
          ? `${data.summary.migrationRate.toFixed(1)}% 实体发生区域迁移，主流向 ${flow.fromLabel} → ${flow.toLabel}`
          : '未发现显著迁徙流向',
        findings: [
          `${data.summary.migratingEntities} / ${data.summary.totalEntities} 个实体跨区域迁移`,
          flow
            ? `主流向涉及 ${flow.entityCount} 个实体，平均位移 ${flow.avgDistanceKm.toFixed(1)} km`
            : '迁移整体较弱',
          `全样本平均位移 ${data.summary.avgDisplacementKm.toFixed(1)} km`
        ],
        recommendations: [
          '调整「前期占比」可对比事件前后两阶段',
          '主流向箭头粗细代表迁移规模，优先核查大流量路径',
          '建议联动轨迹分析，确认迁移实体的具体路径'
        ]
      };
    }
    case 'evolution': {
      const { data } = result;
      return {
        headline: `态势${TREND_LABEL[data.summary.trend]}，峰值 ${data.summary.peakCount} 个实例`,
        findings: [
          data.summary.peakBucketLabel
            ? `峰值出现在 ${data.summary.peakBucketLabel.slice(0, 32)}`
            : '峰值时段未识别',
          `整体数量变化 ${data.summary.totalGrowthRate > 0 ? '+' : ''}${data.summary.totalGrowthRate.toFixed(1)}%`,
          `共 ${data.summary.bucketCount} 个时间分桶参与演化分析`
        ],
        recommendations: [
          '点击分桶明细行，地图将切换至对应时段点位',
          '若数量持续上升，建议扩大监测范围或提高采样频率',
          '可将演化峰值时段与聚集/热点结果对照，定位关键事件窗口'
        ]
      };
    }
    default:
      return {
        headline: '分析完成',
        findings: [],
        recommendations: []
      };
  }
};
