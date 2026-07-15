import React, { useMemo } from 'react';
import {
  Button,
  Divider,
  Select,
  Space,
  Tooltip
} from '@arco-design/web-react';
import { IconDown, IconStar, IconStarFill } from '@arco-design/web-react/icon';
import {
  CANVAS_MODE_OPTIONS,
  DEFAULT_CANVAS_MODE,
  GRAPH_ALGORITHM_CATEGORY_COLOR,
  GRAPH_ALGORITHM_CATEGORY_LABEL,
  GRAPH_ALGORITHM_OPTIONS,
  GRAPH_LAYOUT_OPTIONS,
  getGraphAlgorithmOption
} from '../constants';
import type {
  CanvasModeKey,
  GraphAlgorithmCategory,
  GraphAlgorithmKey,
  GraphLayoutKey
} from '../types';
import styles from '../index.module.scss';

const Option = Select.Option;
const OptGroup = Select.OptGroup;

interface RelationInsightToolbarProps {
  selectedCount: number;
  algorithm: GraphAlgorithmKey;
  canvasMode: CanvasModeKey;
  layout: GraphLayoutKey;
  favorited: boolean;
  onOpenSelect: () => void;
  onAlgorithmSelect: (value: GraphAlgorithmKey) => void;
  onCanvasModeChange: (value: CanvasModeKey) => void;
  onLayoutChange: (value: GraphLayoutKey) => void;
  onClearCanvas: () => void;
  onToggleFavorite: () => void;
  onOpenGuide: () => void;
}

export const RelationInsightToolbar: React.FC<RelationInsightToolbarProps> = ({
  selectedCount,
  algorithm,
  canvasMode,
  layout,
  favorited,
  onOpenSelect,
  onAlgorithmSelect,
  onCanvasModeChange,
  onLayoutChange,
  onClearCanvas,
  onToggleFavorite,
  onOpenGuide
}) => {
  const canvasModeLabel =
    CANVAS_MODE_OPTIONS.find((item) => item.value === canvasMode)?.label ??
    CANVAS_MODE_OPTIONS.find((item) => item.value === DEFAULT_CANVAS_MODE)
      ?.label ??
    '画布模式';

  const algorithmLabel =
    getGraphAlgorithmOption(algorithm)?.label ?? '图算法分析';

  const algorithmGroups = useMemo(() => {
    const groups = new Map<string, typeof GRAPH_ALGORITHM_OPTIONS>();
    GRAPH_ALGORITHM_OPTIONS.forEach((item) => {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    });
    return Array.from(groups.entries());
  }, []);

  return (
    <div className={styles['floating-toolbar']}>
      <Space size={12} align="center">
        <Button
          type="outline"
          className={styles['toolbar-select-btn']}
          onClick={onOpenSelect}
        >
          选择对象{selectedCount > 0 ? `（${selectedCount}）` : ''}
        </Button>

        <Select
          className={styles['toolbar-select']}
          value={algorithm}
          triggerElement={
            <span className={styles['toolbar-pill']}>
              {algorithmLabel}
              <IconDown className={styles['toolbar-select-arrow']} />
            </span>
          }
          onChange={onAlgorithmSelect}
          triggerProps={{
            className: styles['toolbar-algo-dropdown']
          }}
        >
          {algorithmGroups.map(([category, items]) => {
            const categoryKey = category as GraphAlgorithmCategory;
            return (
              <OptGroup
                key={category}
                label={
                  <span
                    className={styles['algo-category-label']}
                    data-algo-category={categoryKey}
                    style={{
                      color: GRAPH_ALGORITHM_CATEGORY_COLOR[categoryKey]
                    }}
                  >
                    {GRAPH_ALGORITHM_CATEGORY_LABEL[categoryKey]}
                  </span>
                }
              >
                {items.map((item) => (
                  <Option key={item.value} value={item.value}>
                    <Tooltip
                      content={`${item.description}（Nebula: ${item.nebulaAlgo}）`}
                    >
                      <span>{item.label}</span>
                    </Tooltip>
                  </Option>
                ))}
              </OptGroup>
            );
          })}
        </Select>

        <Select
          className={styles['toolbar-select']}
          value={canvasMode}
          triggerElement={
            <span className={styles['toolbar-pill']}>
              {canvasModeLabel}
              <IconDown className={styles['toolbar-select-arrow']} />
            </span>
          }
          onChange={onCanvasModeChange}
        >
          {CANVAS_MODE_OPTIONS.map((item) => (
            <Option
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              <Tooltip content={item.description}>{item.label}</Tooltip>
            </Option>
          ))}
        </Select>

        <Select
          className={styles['toolbar-select']}
          value={layout}
          triggerProps={{ className: styles['toolbar-select-trigger'] }}
          arrowIcon={<IconDown className={styles['toolbar-select-arrow']} />}
          onChange={onLayoutChange}
        >
          {GRAPH_LAYOUT_OPTIONS.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>
      </Space>

      <Divider type="vertical" className={styles['toolbar-divider']} />

      <Space size={16} align="center">
        <Tooltip
          content={
            selectedCount === 1
              ? favorited
                ? '取消收藏'
                : '收藏当前对象'
              : '仅在选择单个对象时可收藏'
          }
        >
          <Button
            type="text"
            className={styles['toolbar-text-btn']}
            icon={favorited ? <IconStarFill /> : <IconStar />}
            onClick={onToggleFavorite}
            disabled={selectedCount !== 1}
          >
            收藏
          </Button>
        </Tooltip>
        <Button
          type="text"
          className={styles['toolbar-text-btn']}
          onClick={onOpenGuide}
        >
          操作说明
        </Button>
        <Button
          type="text"
          className={styles['toolbar-text-btn']}
          onClick={onClearCanvas}
        >
          清空画布
        </Button>
      </Space>
    </div>
  );
};
