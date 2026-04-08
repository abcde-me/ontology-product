import React, {
  CSSProperties,
  ForwardedRef,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Checkbox, List, Select, Spin } from '@arco-design/web-react';
import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import { GlobalTooltip, NoDataCard } from '@ceai-front/arco-material';
import styles from './index.module.scss';

type KeyOfRecord<T> = Extract<keyof T, string>;

export interface FetchDataSelectProps<T extends Record<string, any>> {
  /**
   * 组件 id，会透传给 Select
   */
  id?: string;
  /**
   * 当前选中值
   */
  value?: React.Key;
  /**
   * 值变更回调
   */
  onChange?: (value: React.Key | undefined, option?: T) => void;
  /**
   * 选择框占位文案
   * 默认：请选择
   */
  placeholder?: string;
  /**
   * 自定义渲染下拉选项
   */
  renderOption?: (option: T) => ReactNode;
  /**
   * 自定义渲染选中值
   */
  renderValue?: (option?: T | null) => ReactNode;
  /**
   * 数据项字段映射
   * 默认：{ label: 'name', value: 'id' }
   */
  fieldNames?: {
    label: KeyOfRecord<T>;
    value: KeyOfRecord<T>;
  };
  /**
   * 兼容 fieldNams 拼写
   */
  fieldNams?: {
    label: KeyOfRecord<T>;
    value: KeyOfRecord<T>;
  };
  /**
   * 包裹层 className
   */
  wrapperClassName?: string;
  /**
   * Select className
   */
  className?: string;
  /**
   * 包裹层样式
   */
  style?: CSSProperties;
  /**
   * 虚拟滚动配置
   * 默认：{ maxHeight: 400, itemHeight: 40 }
   */
  virtualListProps?: {
    maxHeight?: number;
    itemHeight?: number;
  };
  /**
   * 数据获取函数
   * 默认分页参数：pageNo=1, pageSize=20
   */
  fetchData?: (params: {
    search?: string;
    pageNo?: number;
    pageSize?: number;
  }) => Promise<T[]>;
  /**
   * 是否禁用
   * 默认：false
   */
  disabled?: boolean;
  /**
   * 每页大小
   * 默认：20
   */
  pageSize?: number;
  /**
   * 是否允许清空
   * 默认：true
   */
  allowClear?: boolean;
  /**
   * 弹层挂载点
   */
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
}

function FetchDataSelectInner<T extends Record<string, any>>(
  props: FetchDataSelectProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    id,
    value,
    onChange,
    placeholder = '请选择',
    renderOption,
    renderValue,
    fieldNames,
    fieldNams,
    wrapperClassName,
    className,
    style,
    virtualListProps,
    fetchData,
    disabled = false,
    pageSize = 20,
    allowClear = true,
    getPopupContainer
  } = props;

  const mergedFieldNames = fieldNames ||
    fieldNams || {
      label: 'name' as KeyOfRecord<T>,
      value: 'id' as KeyOfRecord<T>
    };

  const mergedVirtualListProps = {
    maxHeight: 400,
    itemHeight: 40,
    ...virtualListProps
  };

  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const selectWrapper = useRef<HTMLDivElement>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  const latestPageRef = useRef(1);

  const loadOptions = useCallback(
    async (pageNo = 1, search?: string) => {
      if (!fetchData) {
        setOptions([]);
        setHasMore(false);
        return;
      }

      setLoading(true);
      try {
        const nextOptions =
          (await fetchData({
            search,
            pageNo,
            pageSize
          })) || [];

        setHasMore(nextOptions.length >= pageSize);
        setOptions((prevState) =>
          pageNo === 1 ? nextOptions : [...prevState, ...nextOptions]
        );
        latestPageRef.current = pageNo;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, pageSize]
  );

  useEffect(() => {
    if (!popupVisible) return;
    loadOptions(1, searchText);
  }, [popupVisible, searchText, loadOptions]);

  useEffect(() => {
    if (value === undefined || value === null) {
      setSelectedOption(null);
      return;
    }
    if (!options.length) return;
    const currentOption =
      options.find((item) => item[mergedFieldNames.value] === value) || null;
    if (currentOption) {
      setSelectedOption(currentOption);
    }
  }, [mergedFieldNames.value, options, value]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const popupNode = popupRef.current;
      const triggerNode = selectWrapper.current;
      if (
        !popupNode ||
        popupNode.contains(target) ||
        triggerNode?.contains(target)
      ) {
        return;
      }
      setPopupVisible(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [id]);

  const { run: handleSearch } = useDebounceFn(
    (nextSearch?: string) => {
      setSearchText(nextSearch);
    },
    { wait: 300 }
  );

  const handleSelectChange = useCallback(
    (nextValue: string | number | undefined) => {
      if (nextValue === undefined || nextValue === null) {
        setSelectedOption(null);
      }
      onChange?.(nextValue, undefined);
    },
    [onChange]
  );

  const handleReachBottom = useCallback(() => {
    if (loading || !hasMore) return;
    loadOptions(latestPageRef.current + 1, searchText);
  }, [hasMore, loadOptions, loading, searchText]);

  const scrollLoading = useMemo(() => {
    if (!loading || !hasMore) return null;
    return <Spin loading />;
  }, [hasMore, loading]);

  const renderDropdown = () => {
    if (!fetchData) {
      return <NoDataCard type={'block'} title={'暂无可选数据'} />;
    }

    if (!options.length && !loading) {
      return <NoDataCard type={'block'} title={'暂无可选数据'} />;
    }

    return (
      <div
        ref={popupRef}
        className={styles['dropdown-panel']}
        onClick={(event) => event.stopPropagation()}
      >
        <List
          className={styles['option-list']}
          bordered={false}
          dataSource={options}
          scrollLoading={scrollLoading}
          onReachBottom={handleReachBottom}
          virtualListProps={{
            height: mergedVirtualListProps.maxHeight,
            itemHeight: mergedVirtualListProps.itemHeight
          }}
          render={(item) => {
            const optionValue = item[mergedFieldNames.value] as React.Key;
            const checked = optionValue === value;

            return (
              <List.Item
                key={String(optionValue)}
                className={classNames(
                  styles['option-item'],
                  {
                    [styles['option-item-selected']]: checked
                  },
                  `h-[${virtualListProps?.itemHeight || 40}px]`
                )}
                onClick={() => {
                  setSelectedOption(item);
                  setPopupVisible(false);
                  onChange?.(optionValue, item);
                }}
              >
                <label className={styles['option-content']}>
                  <Checkbox checked={checked} className={'hidden'} />
                  {renderOption ? (
                    renderOption(item)
                  ) : (
                    <GlobalTooltip.Ellipsis
                      text={String(item[mergedFieldNames.label] ?? '-')}
                    />
                  )}
                </label>
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={selectWrapper}
      className={classNames(
        styles['fetch-data-select-wrapper'],
        wrapperClassName
      )}
      style={style}
    >
      <Select
        className={classNames(styles['fetch-data-select'], className)}
        value={value as any}
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        popupVisible={popupVisible}
        placeholder={placeholder}
        showSearch
        triggerProps={{
          updateOnScroll: true
        }}
        getPopupContainer={getPopupContainer}
        onClick={() => setPopupVisible(true)}
        onVisibleChange={setPopupVisible}
        onSearch={handleSearch}
        onChange={handleSelectChange}
        dropdownRender={renderDropdown}
        renderFormat={() => {
          if (renderValue) {
            return renderValue(selectedOption);
          }

          return (
            <GlobalTooltip.Ellipsis
              text={
                selectedOption
                  ? String(selectedOption[mergedFieldNames.label] ?? '-')
                  : '-'
              }
            />
          );
        }}
      />
    </div>
  );
}

export const FetchDataSelect = forwardRef(FetchDataSelectInner) as <
  T extends Record<string, any>
>(
  props: FetchDataSelectProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
