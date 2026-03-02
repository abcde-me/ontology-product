import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import { ObjectTypeSelect } from '../../componens';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { isNil } from 'lodash-es';
import { useRequest, useVirtualList } from 'ahooks';
import { Spin } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';

export interface ObjInsValue {
  objectTypeID?: number;
  objInsID?: React.Key[];
}

// Page size for backend pagination
const PAGE_SIZE = 20;
// Row height used by the virtual list
const ITEM_HEIGHT = 36;
// Dropdown panel height
const DROPDOWN_HEIGHT = 240;
// Scroll threshold to trigger loading the next page
const LOAD_MORE_THRESHOLD = 40;

type ObjectInstance = Record<string, unknown> & {
  id?: React.Key;
  name?: string;
  code?: string;
};

type InstanceOption = {
  value: React.Key;
  label: string;
  raw?: ObjectInstance;
};

// Normalize any value into a stable string key
const normalizeKey = (value: React.Key) => String(value);

// Build a display label with best-effort fields
const getInstanceLabel = (item: ObjectInstance) => {
  const candidate = item.name ?? item.code ?? item.id;
  return isNil(candidate) ? '-' : String(candidate);
};

// Normalize instance data to ensure a usable id exists
const normalizeInstance = (
  item: ObjectInstance,
  index: number,
  page: number
) => {
  const rawId = item.id ?? item.code ?? item.name;
  const safeId = isNil(rawId) ? `${page}-${index}` : rawId;
  return { ...item, id: safeId };
};

export const ObjectInterfaceSelect = (
  props: CustomFormItemCompProps<ObjInsValue>
) => {
  const { value, onChange, disabled, className } = props;
  const { objectTypeID, objInsID } = value || {};

  // Cache object instances for the selected object type
  const [instanceList, setInstanceList] = useState<ObjectInstance[]>([]);
  // Pagination state for server-side paging
  const [pageInfo, setPageInfo] = useState({
    current: 1,
    total: 0
  });
  // Track dropdown visibility to trigger initial loading
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Dropdown container and wrapper refs used by useVirtualList
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Normalize selected values into an array
  const selectedValues = useMemo<React.Key[]>(
    () => (Array.isArray(objInsID) ? objInsID : []),
    [objInsID]
  );

  // Selected set for fast lookup during rendering and toggling
  const selectedValueSet = useMemo(() => {
    return new Set(selectedValues.map(normalizeKey));
  }, [selectedValues]);

  // Fetch object instances with server-side pagination
  const { runAsync, loading } = useRequest(
    async (params: { id: number; page: number; pageSize: number }) => {
      const res = await listOntologyObjectTypeData(params);
      return res;
    },
    { manual: true }
  );

  // Load a specific page and merge into the list
  const loadPage = useCallback(
    async (page: number) => {
      if (isNil(objectTypeID)) return;
      try {
        const res = await runAsync({
          id: objectTypeID,
          page,
          pageSize: PAGE_SIZE
        });
        const result = (res.data?.result || []) as ObjectInstance[];
        const totalCount = Number(res.data?.totalCount) || 0;
        const normalized = result.map((item, index) =>
          normalizeInstance(item, index, page)
        );

        setInstanceList((prev) => {
          if (page === 1) return normalized;
          // De-duplicate by id when merging pages
          const map = new Map<string, ObjectInstance>();
          prev.forEach((item) => {
            if (!isNil(item.id)) map.set(normalizeKey(item.id), item);
          });
          normalized.forEach((item) => {
            if (!isNil(item.id)) map.set(normalizeKey(item.id), item);
          });
          return Array.from(map.values());
        });

        setPageInfo({
          current: page,
          total: totalCount
        });
      } catch (error) {
        console.error('加载对象实例失败:', error);
      }
    },
    [objectTypeID, runAsync]
  );

  // Reset list when the object type changes
  useEffect(() => {
    setInstanceList([]);
    setPageInfo({
      current: 1,
      total: 0
    });

    if (dropdownVisible && !isNil(objectTypeID)) {
      loadPage(1);
    }
  }, [objectTypeID, dropdownVisible, loadPage]);

  // Listen to dropdown scroll to load more pages
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    const hasMore = pageInfo.current * PAGE_SIZE < pageInfo.total;

    if (hasMore && distanceToBottom <= LOAD_MORE_THRESHOLD) {
      loadPage(pageInfo.current + 1);
    }
  }, [loading, loadPage, pageInfo.current, pageInfo.total]);

  // Build Select options, including echo values that are not loaded yet
  const selectOptions = useMemo<InstanceOption[]>(() => {
    const map = new Map<string, InstanceOption>();

    instanceList.forEach((item) => {
      if (isNil(item.id)) return;
      const option: InstanceOption = {
        value: item.id,
        label: getInstanceLabel(item),
        raw: item
      };
      map.set(normalizeKey(item.id), option);
    });

    selectedValues.forEach((value) => {
      const key = normalizeKey(value);
      if (!map.has(key)) {
        map.set(key, {
          value,
          label: String(value)
        });
      }
    });

    return Array.from(map.values());
  }, [instanceList, selectedValues]);

  // Build the list used by the virtual list
  const displayList = useMemo(() => {
    return selectOptions.map((option) => ({
      ...option,
      label: option.label || '-'
    }));
  }, [selectOptions]);

  // Virtualized list data from ahooks
  const [virtualList] = useVirtualList(displayList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: ITEM_HEIGHT,
    overscan: 8
  });

  // Handle object type change by clearing selected instances
  const handleObjectTypeChange = useCallback(
    (nextId?: number) => {
      onChange?.({
        objectTypeID: nextId,
        objInsID: []
      });
    },
    [onChange]
  );

  // Handle Select value changes (tag remove / clear)
  const handleValueChange = useCallback(
    (nextValue: React.Key[] | React.Key) => {
      const nextValues = Array.isArray(nextValue)
        ? nextValue
        : isNil(nextValue)
          ? []
          : [nextValue];
      onChange?.({
        objectTypeID,
        objInsID: nextValues
      });
    },
    [objectTypeID, onChange]
  );

  // Toggle selection when clicking a virtual list row
  const toggleSelect = useCallback(
    (option: InstanceOption) => {
      if (disabled || isNil(objectTypeID)) return;
      const key = normalizeKey(option.value);
      const exists = selectedValueSet.has(key);
      const nextValues = exists
        ? selectedValues.filter(
            (value) => normalizeKey(value) !== normalizeKey(option.value)
          )
        : [...selectedValues, option.value];

      onChange?.({
        objectTypeID,
        objInsID: nextValues
      });
    },
    [disabled, objectTypeID, onChange, selectedValueSet, selectedValues]
  );

  // Trigger initial loading when dropdown opens
  const handleDropdownVisibleChange = useCallback(
    (visible: boolean) => {
      setDropdownVisible(visible);
      if (visible && !isNil(objectTypeID) && instanceList.length === 0) {
        loadPage(1);
      }
    },
    [objectTypeID, instanceList.length, loadPage]
  );

  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <ObjectTypeSelect
        className={styles['obj-one']}
        value={objectTypeID}
        onChange={handleObjectTypeChange}
        disabled={disabled}
      />
      <SelectWithNoData
        className={styles['interface']}
        mode="multiple"
        value={selectedValues}
        // options={selectOptions.map((item) => ({
        //   label: item.label,
        //   value: item.value
        // }))}
        placeholder={
          isNil(objectTypeID) ? '请先选择对象类型' : '请选择对象实例'
        }
        disabled={disabled || isNil(objectTypeID)}
        loading={loading && instanceList.length === 0}
        onChange={handleValueChange}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        dropdownRender={() => {
          // debugger;
          // If no object type is selected, show a simple hint
          if (isNil(objectTypeID)) {
            return (
              <div
                style={{
                  padding: '12px',
                  color: 'var(--color-text-3)'
                }}
              >
                请先选择对象类型
              </div>
            );
          }

          return (
            <div
              ref={containerRef}
              style={{
                maxHeight: DROPDOWN_HEIGHT,
                overflow: 'auto',
                padding: '4px 0'
              }}
              onScroll={handleScroll}
            >
              {/* Loading placeholder for the first page */}
              {loading && instanceList.length === 0 && (
                <div className="flex h-[120px] items-center justify-center">
                  <Spin size={20} />
                </div>
              )}

              {/* Empty state */}
              {!loading && displayList.length === 0 && (
                <div className="flex h-[120px] items-center justify-center">
                  <NoDataCard type="block" />
                </div>
              )}

              {/* Virtualized list */}
              <div ref={wrapperRef}>
                {virtualList.map((item) => {
                  const option = item.data;
                  const isSelected = selectedValueSet.has(
                    normalizeKey(option.value)
                  );

                  return (
                    <div
                      key={normalizeKey(option.value)}
                      style={{
                        height: ITEM_HEIGHT,
                        lineHeight: `${ITEM_HEIGHT}px`,
                        padding: '0 12px',
                        cursor: 'pointer',
                        background: isSelected ? '#F2F8FF' : 'transparent'
                      }}
                      onClick={() => toggleSelect(option)}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>

              {/* Bottom loading indicator for pagination */}
              {loading && instanceList.length > 0 && (
                <div className="flex h-[32px] items-center justify-center">
                  <Spin size={16} />
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};
