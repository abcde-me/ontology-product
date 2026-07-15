import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Checkbox, Input, Select, Spin } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { debounce } from 'lodash-es';
import {
  fetchDataResourceDetail,
  fetchDataResourceList
} from '@/pages/dataResource/services/api';
import { findDataResourceTableById } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import {
  DataQueryPermission,
  type DataResourceListItem,
  type DataResourceTable
} from '@/pages/dataResource/types';
import styles from './DataResourceTableSelector.module.scss';

interface DataResourceTableSelectorProps {
  value?: string | string[];
  onChange?: (tables: DataResourceTable[]) => void;
  readOnly?: boolean;
  disabled?: boolean;
  /** 已在画布中的数据资源表 id，不可再次选择 */
  disabledTableIds?: string[];
  /** select：下拉多选；list：固定列表 + 复选框（适合弹窗内选择） */
  variant?: 'select' | 'list';
  /** 是否允许多选，默认 true */
  multiple?: boolean;
  /** 检索时仅匹配中文名称（tableComment），默认同时匹配表注释等字段 */
  filterByTableCommentOnly?: boolean;
  /** list 模式下展示「全部」快捷选项，支持一键全选/取消 */
  showSelectAll?: boolean;
}

function normalizeValue(value?: string | string[]): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function toListItem(table: DataResourceTable): DataResourceListItem {
  return {
    id: table.id,
    databaseType: table.databaseType,
    tableName: table.tableName,
    tableComment: table.tableComment,
    sourceSystem: table.sourceSystem || '',
    queryPermission: table.queryPermission || DataQueryPermission.AUTHORIZED
  };
}

function resolveTableDetail(
  id: string,
  cache: Map<string, DataResourceTable>
): DataResourceTable | null {
  const cached = cache.get(id);
  if (cached) {
    return cached;
  }

  const fromCatalog = findDataResourceTableById(id);
  if (fromCatalog) {
    cache.set(id, fromCatalog);
    return fromCatalog;
  }

  return null;
}

export default function DataResourceTableSelector({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  disabledTableIds = [],
  variant = 'select',
  multiple = true,
  filterByTableCommentOnly = false,
  showSelectAll = false
}: DataResourceTableSelectorProps) {
  const [options, setOptions] = useState<DataResourceListItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<DataResourceListItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const selectedIds = useMemo(() => normalizeValue(value), [value]);
  const disabledTableIdSet = useMemo(
    () => new Set(disabledTableIds),
    [disabledTableIds]
  );
  const selectedDetailCacheRef = useRef<Map<string, DataResourceTable>>(
    new Map()
  );

  const loadOptions = useCallback(
    async (filter?: string) => {
      setLoading(true);
      try {
        const result = await fetchDataResourceList({
          pageNo: 1,
          pageSize: 1000,
          filter: filter?.trim() || undefined,
          filterByTableCommentOnly: filterByTableCommentOnly || undefined
        });
        setOptions(result.items);
      } finally {
        setLoading(false);
      }
    },
    [filterByTableCommentOnly]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((keyword: string) => {
        void loadOptions(keyword);
      }, 300),
    [loadOptions]
  );

  useEffect(() => {
    void loadOptions();
    return () => {
      debouncedSearch.cancel();
    };
  }, [loadOptions, debouncedSearch]);

  const emitSelection = useCallback(
    (ids: string[]) => {
      if (readOnly || disabled) {
        return;
      }

      const nextIds = multiple ? ids : ids.slice(-1);
      const selectableIds = nextIds.filter((id) => !disabledTableIdSet.has(id));

      if (!selectableIds.length) {
        setSelectedItems([]);
        onChange?.([]);
        return;
      }

      const tables = selectableIds
        .map((id) => resolveTableDetail(id, selectedDetailCacheRef.current))
        .filter(Boolean) as DataResourceTable[];

      setSelectedItems(tables.map(toListItem));
      onChange?.(tables);
    },
    [disabled, disabledTableIdSet, multiple, onChange, readOnly]
  );

  useEffect(() => {
    if (!selectedIds.length) {
      setSelectedItems([]);
      return;
    }

    let active = true;

    const hydrateSelectedItems = async () => {
      const items = await Promise.all(
        selectedIds.map(async (id) => {
          const resolved = resolveTableDetail(
            id,
            selectedDetailCacheRef.current
          );
          if (resolved) {
            return toListItem(resolved);
          }

          const detail = await fetchDataResourceDetail(id);
          if (!detail) {
            return null;
          }
          selectedDetailCacheRef.current.set(id, detail);
          return toListItem(detail);
        })
      );

      if (active) {
        setSelectedItems(items.filter(Boolean) as DataResourceListItem[]);
      }
    };

    void hydrateSelectedItems();

    return () => {
      active = false;
    };
  }, [selectedIds]);

  const selectOptions = useMemo(() => {
    const merged = new Map<string, DataResourceListItem>();
    options.forEach((item) => merged.set(item.id, item));
    selectedItems.forEach((item) => merged.set(item.id, item));
    return Array.from(merged.values()).map((item) => ({
      label: `${item.tableComment}（${item.tableName}）`,
      value: item.id
    }));
  }, [options, selectedItems]);

  const handleSearch = (keyword: string) => {
    debouncedSearch(keyword);
  };

  const handleSelectChange = (nextValue: string | string[]) => {
    emitSelection(normalizeValue(nextValue));
  };

  const handleSingleSelectChange = (nextValue: string) => {
    emitSelection(nextValue ? [nextValue] : []);
  };

  const handleListSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    debouncedSearch(keyword);
  };

  const setListSelection = (id: string, checked: boolean) => {
    const nextIds = multiple
      ? checked
        ? Array.from(new Set([...selectedIds, id]))
        : selectedIds.filter((itemId) => itemId !== id)
      : checked
        ? [id]
        : [];
    emitSelection(nextIds);
  };

  const toggleListItem = (id: string) => {
    setListSelection(id, !selectedIds.includes(id));
  };

  const selectableOptions = useMemo(
    () => options.filter((item) => !disabledTableIdSet.has(item.id)),
    [disabledTableIdSet, options]
  );

  const allSelectableSelected = useMemo(
    () =>
      selectableOptions.length > 0 &&
      selectableOptions.every((item) => selectedIds.includes(item.id)),
    [selectableOptions, selectedIds]
  );

  const someSelectableSelected = useMemo(
    () => selectableOptions.some((item) => selectedIds.includes(item.id)),
    [selectableOptions, selectedIds]
  );

  const handleSelectAll = () => {
    if (allSelectableSelected) {
      emitSelection([]);
      return;
    }

    emitSelection(selectableOptions.map((item) => item.id));
  };

  if (variant === 'list') {
    return (
      <div className={styles.listPanel}>
        <div className={styles.search}>
          <Input
            allowClear
            prefix={<IconSearch />}
            placeholder="搜索中文名称"
            value={searchKeyword}
            disabled={readOnly || disabled}
            onChange={handleListSearchChange}
          />
        </div>
        <Spin loading={loading} style={{ width: '100%' }}>
          <div className={styles.list}>
            {showSelectAll && multiple && selectableOptions.length ? (
              <div
                className={`${styles.row} ${styles.selectAll}${
                  allSelectableSelected ? ` ${styles.selected}` : ''
                }`}
                onClick={() => {
                  if (readOnly || disabled) {
                    return;
                  }
                  handleSelectAll();
                }}
              >
                <Checkbox
                  checked={allSelectableSelected}
                  indeterminate={
                    someSelectableSelected && !allSelectableSelected
                  }
                  disabled={readOnly || disabled}
                  onChange={handleSelectAll}
                  onClick={(event) => event.stopPropagation()}
                />
                <span className={styles.label}>全部</span>
              </div>
            ) : null}
            {options.length ? (
              options.map((item) => {
                const checked = selectedIds.includes(item.id);
                const isDisabledOnCanvas = disabledTableIdSet.has(item.id);
                const rowDisabled = readOnly || disabled || isDisabledOnCanvas;
                return (
                  <div
                    key={item.id}
                    className={`${styles.row}${checked ? ` ${styles.selected}` : ''}${
                      isDisabledOnCanvas ? ` ${styles.disabled}` : ''
                    }`}
                    onClick={() => {
                      if (rowDisabled) {
                        return;
                      }
                      toggleListItem(item.id);
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={rowDisabled}
                      onChange={(nextChecked) =>
                        setListSelection(item.id, nextChecked)
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span className={styles.label}>
                      {item.tableComment}（{item.tableName}）
                    </span>
                    {isDisabledOnCanvas ? (
                      <span className={styles.tag}>已在画布中</span>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className={styles.empty}>暂无匹配的数据资源表</div>
            )}
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      placeholder={
        multiple
          ? '请输入关键字搜索并选择数据资源表'
          : '请输入关键字搜索并选择目标数据资源表'
      }
      value={multiple ? selectedIds : selectedIds[0]}
      loading={loading}
      options={selectOptions}
      showSearch
      allowClear
      maxTagCount={multiple ? 4 : undefined}
      disabled={readOnly || disabled}
      filterOption={false}
      onSearch={handleSearch}
      onChange={multiple ? handleSelectChange : handleSingleSelectChange}
      onVisibleChange={(visible) => {
        if (!visible) {
          void loadOptions();
        }
      }}
    />
  );
}
