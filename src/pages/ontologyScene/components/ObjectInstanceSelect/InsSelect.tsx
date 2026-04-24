import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Checkbox,
  List,
  Message,
  Select,
  SelectProps,
  Spin,
  Tooltip
} from '@arco-design/web-react';
import { useDebounce, useDebounceFn, useRequest, useVirtualList } from 'ahooks';
import classNames from 'classnames';
import styles from './index.module.scss';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { isNil } from 'lodash-es';
import { NoDataCard } from '@ceai-front/arco-material';

export interface ObjectInterfaceSelectProps
  extends CustomFormItemCompProps<React.Key | React.Key[] | undefined> {
  placeholder?: string;
  primaryKey?: string;
  objectTypeId?: number;
  mode?: 'single' | 'multiple';
  searchKey: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  maxTagCount?: number | 'responsive';
}

type OptionItem = {
  value: number;
  label: string;
};

/** 对象实例下拉选择组件 */
export const InstanceSelect = (props: ObjectInterfaceSelectProps) => {
  const {
    value,
    onChange,
    disabled,
    className,
    mode = 'single',
    placeholder,
    primaryKey,
    objectTypeId,
    searchKey: string
  } = props;

  const [scrollLoading, setScrollLoading] = useState<React.ReactNode>(
    <Spin loading={true} />
  );

  const selectWrapper = useRef<HTMLDivElement>(null);

  const popupRef = useRef<HTMLDivElement>(null);

  // 当前展示的全部对象实例
  const [currentInsList, setCurrentInsList] = useState<Record<string, any>[]>(
    []
  );

  // 控制下拉显示状态
  const [popupVisible, setPopupVisible] = useState(false);

  // 搜索文本
  const [searchText, setSearchText] = useState<string>();

  const { runAsync, loading } = useRequest(
    (params: {
      id: number;
      page: number;
      pageSize: number;
      fieldList?: {
        fieldName?: string;
        fieldValue?: string;
        fieldValueList?: string[];
      }[];
    }) => {
      return listOntologyObjectTypeData(params);
    },
    {
      refreshDeps: [objectTypeId, searchText, primaryKey],
      manual: true
    }
  );

  const { run: searchIns } = useDebounceFn(
    (text?: string) => {
      setSearchText(text);
      runAsync({
        page: 1,
        pageSize: 20,
        fieldList: [{ fieldName: primaryKey, fieldValue: text }],
        id: objectTypeId!
      }).then((res) => {
        setCurrentInsList(res.data.result || []);
        setScrollLoading(null);
      });
    },
    { wait: 500 }
  );

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
  }, []);

  useEffect(() => {
    // setPopupVisible(!!primaryKey);
    if ([primaryKey, objectTypeId].every((v) => !isNil(v))) {
      runAsync({
        id: objectTypeId!,
        page: 1,
        pageSize: 20
      }).then((res) => {
        setCurrentInsList(res.data?.result || []);
        setScrollLoading(null);
      });
    }
  }, [primaryKey, objectTypeId]);

  /** 处理清空或输入变化 */
  const handleValueChange = useCallback(
    (nextValue: string | number) => {
      onChange?.(nextValue);
    },
    [onChange]
  );

  const loadMore = useCallback(
    (page = 1) => {
      runAsync({
        page: page,
        pageSize: 20,
        id: objectTypeId!,
        fieldList: [
          {
            fieldName: primaryKey,
            fieldValue: searchText || ''
          }
        ]
      }).then((res) => {
        setScrollLoading(
          res.data.result?.length >= 20 ? <Spin loading={true} /> : null
        );
        setCurrentInsList((prevState) => {
          if (page === 1) {
            return res.data.result || [];
          }
          return [...prevState, ...(res.data.result || [])];
        });
      });
    },
    [objectTypeId, runAsync, searchText]
  );

  /** 渲染下拉内容 */
  const renderDropdown = () => {
    if (!primaryKey) return <NoDataCard type={'block'} />;
    return (
      <div className={'w-full max-w-full'} ref={popupRef}>
        <List
          style={{ width: '100%', maxHeight: 400 }}
          className={styles['ins-list']}
          bordered={false}
          virtualListProps={{
            height: 400,
            itemHeight: 40
          }}
          scrollLoading={scrollLoading}
          onReachBottom={loadMore}
          dataSource={currentInsList}
          render={(item, index) => (
            <List.Item
              key={item[primaryKey]}
              style={{ border: 'none !important' }}
              className={classNames({
                [styles['ins-item']]: true,
                [styles['ins-selected']]:
                  item[primaryKey] === value ||
                  (Array.isArray(value) && value.includes(item[primaryKey])),
                'arco-select-option-selected':
                  item[primaryKey] === value ||
                  (Array.isArray(value) && value.includes(item[primaryKey]))
              })}
            >
              <label className={styles['content-container']}>
                <Checkbox
                  className={`flex-shrink-0 ${mode === 'multiple' ? '' : 'hidden'}`}
                  checked={
                    item[primaryKey] === value ||
                    (value as any[])?.includes?.(item[primaryKey])
                  }
                  onChange={(c, e) => {
                    if (mode === 'multiple') {
                      if (c) {
                        const instances = [
                          ...((value as any) ?? []),
                          item[primaryKey]
                        ];
                        onChange?.(instances);
                        return;
                      }
                      onChange?.(
                        (value as any).filter(
                          (v: any) => v !== item[primaryKey]
                        )
                      );
                      return;
                    }
                    onChange?.(item[primaryKey]);
                    setPopupVisible(false);
                  }}
                />
                <Tooltip
                  content={item[primaryKey] || null}
                  getPopupContainer={props.getPopupContainer}
                >
                  <p className={'primary-text'}>{item[primaryKey]}</p>
                </Tooltip>
              </label>
            </List.Item>
          )}
        />
      </div>
    );
  };

  const readonly = disabled || !objectTypeId || !primaryKey;
  return (
    <div
      className={classNames([className, styles['ins-sel-wrapper']])}
      ref={selectWrapper}
    >
      <Select
        className={classNames([
          styles['instance'],
          readonly ? `${styles['ins-select-disabled']} ins-select-disabled` : ''
        ])}
        onClick={() => setPopupVisible(true)}
        dropdownMenuClassName={styles['list-container']}
        value={value as any}
        disabled={readonly}
        allowClear
        loading={loading}
        mode={mode === 'multiple' ? 'multiple' : undefined}
        popupVisible={popupVisible}
        placeholder={placeholder || '请选择'}
        onChange={handleValueChange}
        dropdownRender={renderDropdown}
        showSearch
        onSearch={searchIns}
        maxTagCount={{
          count: props.maxTagCount || 0,
          showPopover: {
            className: styles['tag-popover'],
            getPopupContainer(node) {
              return props.getPopupContainer?.(node) || document.body;
            }
          }
        }}
        getPopupContainer={
          props.getPopupContainer ||
          ((node) => {
            return node.parentElement || document.body;
          })
        }
        dropdownMenuStyle={{ width: 400, maxHeight: 400 }}
        triggerProps={{
          updateOnScroll: true,
          autoAlignPopupWidth: false,
          position: 'bl',
          style: {
            width: 400,
            maxHeight: 400
          }
        }}
      />
    </div>
  );
};
