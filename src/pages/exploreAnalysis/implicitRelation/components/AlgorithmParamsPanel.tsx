import React from 'react';
import { InputNumber } from '@arco-design/web-react';
import type { ImplicitDiscoveryAlgorithm } from '../types';
import type { ImplicitDiscoveryParams } from '../types';
import styles from './AlgorithmParamsPanel.module.scss';

interface AlgorithmParamsPanelProps {
  algorithm: ImplicitDiscoveryAlgorithm;
  params: ImplicitDiscoveryParams;
  onChange: (next: ImplicitDiscoveryParams) => void;
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

export default function AlgorithmParamsPanel({
  algorithm,
  params,
  onChange
}: AlgorithmParamsPanelProps) {
  const patch = (partial: Partial<ImplicitDiscoveryParams>) =>
    onChange({ ...params, ...partial });

  const numberField = (
    field: keyof ImplicitDiscoveryParams,
    config: {
      min?: number;
      max?: number;
      step?: number;
      precision?: number;
    } = {}
  ) => (
    <InputNumber
      min={config.min}
      max={config.max}
      step={config.step}
      precision={config.precision}
      value={params[field]}
      onChange={(value) => {
        if (value == null || Number.isNaN(Number(value))) {
          return;
        }
        patch({ [field]: Number(value) } as Partial<ImplicitDiscoveryParams>);
      }}
      style={{ width: '100%' }}
    />
  );

  return (
    <div className={styles.panel}>
      <ParamRow label="最多发现条数" hint="单次分析返回的隐性关系上限">
        {numberField('maxDiscoveries', { min: 5, max: 100, step: 1 })}
      </ParamRow>

      {algorithm === 'community' ? (
        <>
          <ParamRow label="标签传播迭代次数" hint="社区划分算法的最大迭代轮数">
            {numberField('maxIterations', { min: 5, max: 50, step: 1 })}
          </ParamRow>
          <ParamRow label="路径搜索深度" hint="用于证据展示的间接路径长度上限">
            {numberField('maxPathDepth', { min: 2, max: 8, step: 1 })}
          </ParamRow>
        </>
      ) : null}

      {algorithm === 'path-prediction' ? (
        <>
          <ParamRow label="最小共同邻居数" hint="候选连边至少需共享的邻居数量">
            {numberField('minSharedNeighbors', { min: 1, max: 10, step: 1 })}
          </ParamRow>
          <ParamRow label="路径搜索深度" hint="链路预测与证据路径的最大跳数">
            {numberField('maxPathDepth', { min: 2, max: 8, step: 1 })}
          </ParamRow>
        </>
      ) : null}

      {algorithm === 'spatiotemporal' ? (
        <>
          <ParamRow label="空间邻近阈值(km)" hint="判定空间共现的距离阈值">
            {numberField('spatialNearKm', { min: 1, max: 500, step: 1 })}
          </ParamRow>
          <ParamRow label="时间邻近阈值(h)" hint="判定时间共现的小时间隔">
            {numberField('temporalNearHours', { min: 1, max: 720, step: 1 })}
          </ParamRow>
          <ParamRow label="最低得分门槛" hint="低于该值的候选将被过滤">
            {numberField('minScore', {
              min: 0.05,
              max: 0.9,
              step: 0.05,
              precision: 2
            })}
          </ParamRow>
        </>
      ) : null}

      {algorithm === 'core-node' ? (
        <>
          <ParamRow
            label="核心节点占比"
            hint="按中心性选取的核心节点比例（0-1）"
          >
            {numberField('coreNodeRatio', {
              min: 0.1,
              max: 0.6,
              step: 0.05,
              precision: 2
            })}
          </ParamRow>
          <ParamRow label="路径搜索深度" hint="核心节点关联的路径证据跳数">
            {numberField('maxPathDepth', { min: 2, max: 8, step: 1 })}
          </ParamRow>
        </>
      ) : null}

      {algorithm === 'weak-link' ? (
        <>
          <ParamRow
            label="桥接边数上限"
            hint="跨群体显式桥接超过该值则不再视为薄弱环节"
          >
            {numberField('maxBridgeCount', { min: 0, max: 20, step: 1 })}
          </ParamRow>
          <ParamRow label="路径搜索深度" hint="间接连通路径的最大跳数">
            {numberField('maxPathDepth', { min: 2, max: 8, step: 1 })}
          </ParamRow>
          <ParamRow
            label="标签传播迭代次数"
            hint="用于划分群体的社区发现迭代轮数"
          >
            {numberField('maxIterations', { min: 5, max: 50, step: 1 })}
          </ParamRow>
        </>
      ) : null}
    </div>
  );
}
