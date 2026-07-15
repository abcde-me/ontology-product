import React, { useMemo, useState } from 'react';
import { Input, Radio, Tag } from '@arco-design/web-react';
import PageHeader from '@/components/PageHeader';
import { SECONDARY_MENU_ITEMS } from '@/config/secondaryMenuItems';
import {
  APP_COMPONENT_CATALOG,
  COMPONENT_CATEGORY_LABEL,
  COMPONENT_CATEGORY_OPTIONS
} from './constants';
import type { ComponentCategory, ComponentStatus } from './types';
import styles from './index.module.scss';

const { Search } = Input;

type CategoryFilter = ComponentCategory | 'all';

const STATUS_MAP: Record<ComponentStatus, { label: string; color: string }> = {
  available: { label: '可用', color: 'green' },
  planned: { label: '规划中', color: 'orangered' }
};

const CATEGORY_ORDER: ComponentCategory[] = [
  'geo',
  'time',
  'chart',
  'data',
  'graph',
  'interaction',
  'content'
];

export default function ComponentManagement() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return APP_COMPONENT_CATALOG.filter((item) => {
      if (category !== 'all' && item.category !== category) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return [item.name, item.description, item.tags.join(' '), item.reference]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [category, keyword]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((key) => ({
      key,
      label: COMPONENT_CATEGORY_LABEL[key],
      items: filtered.filter((item) => item.category === key)
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  const availableCount = filtered.filter(
    (item) => item.status === 'available'
  ).length;

  return (
    <div className={styles.page}>
      <PageHeader
        title={SECONDARY_MENU_ITEMS.ComponentManagement}
        subTitle="管理应用场景可复用的可视化与交互组件，覆盖地图、时间轴、常用图表，并参考 Workshop 等产品能力持续补充"
      />

      <div className={styles.toolbar}>
        <Search
          allowClear
          className={styles.search}
          placeholder="搜索组件名称、能力或标签"
          value={keyword}
          onChange={setKeyword}
        />
        <Radio.Group
          type="button"
          value={category}
          onChange={(value) => setCategory(value as CategoryFilter)}
        >
          {COMPONENT_CATEGORY_OPTIONS.map((option) => (
            <Radio key={option.key} value={option.key}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
        <span className={styles.summary}>
          共 {filtered.length} 项 · 可用 {availableCount} · 规划中{' '}
          {filtered.length - availableCount}
        </span>
      </div>

      <div className={styles.scroll}>
        {grouped.length === 0 ? (
          <div className={styles.empty}>未找到匹配的组件</div>
        ) : (
          grouped.map((group) => (
            <section key={group.key} className={styles.section}>
              <div className={styles.sectionTitle}>
                {group.label}
                <span className={styles.sectionCount}>
                  {group.items.length}
                </span>
              </div>
              <div className={styles.grid}>
                {group.items.map((item) => {
                  const status = STATUS_MAP[item.status];
                  return (
                    <article key={item.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardName}>{item.name}</div>
                        <Tag color={status.color} size="small">
                          {status.label}
                        </Tag>
                      </div>
                      <p className={styles.cardDesc}>{item.description}</p>
                      <div className={styles.tags}>
                        {item.tags.map((tag) => (
                          <Tag key={tag} size="small">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                      {item.reference ? (
                        <div className={styles.footer}>
                          <span className={styles.reference}>
                            参考：{item.reference}
                          </span>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
