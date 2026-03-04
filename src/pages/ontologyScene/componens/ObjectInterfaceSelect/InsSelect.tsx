import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Checkbox, List, Message, Select, Spin } from '@arco-design/web-react';
import { useRequest, useVirtualList } from 'ahooks';
import classNames from 'classnames';
import styles from './index.module.scss';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { isNil } from 'lodash-es';

export interface ObjectInterfaceSelectProps
  extends CustomFormItemCompProps<React.Key | React.Key[] | undefined> {
  placeholder?: string;
  primaryKey?: string;
  objectTypeId?: number;
  mode?: 'single' | 'multiple';
}

type OptionItem = {
  value: number;
  label: string;
};

const dropdownHeight = 400;
const rowHeight = 36;
const mockTotal = 10000;

/** 生成模拟数据 */
const createMockOptions = (total: number): OptionItem[] => {
  const list: OptionItem[] = [];
  for (let i = 1; i <= total; i += 1) {
    list.push({
      value: i,
      label: `实例-${i}`
    });
  }
  return list;
};

/** 构建值与展示文本的映射 */
const buildLabelMap = (list: OptionItem[]) => {
  const map = new Map<string, string>();
  for (const item of list) {
    map.set(String(item.value), item.label);
  }
  return map;
};

/** 获取模拟数据列表 */
const getMockOptionList = () => createMockOptions(mockTotal);

/** 对象实例下拉选择组件 */
export const InterfaceSelect = (props: ObjectInterfaceSelectProps) => {
  const {
    value,
    onChange,
    disabled,
    className,
    mode = 'single',
    placeholder,
    primaryKey,
    objectTypeId
  } = props;

  // 下拉容器与包裹层引用
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scrollLoading, setScrollLoading] = useState<React.ReactNode>(
    <Spin loading={true} />
  );

  // 未过滤时的全部对象实例
  const [allIns, setAllIns] = useState<Record<string, any>[]>([]);

  // 控制下拉显示状态
  const [popupVisible, setPopupVisible] = useState(false);

  const [, set] = useState();

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
      refreshDeps: [objectTypeId],
      manual: true,
      onSuccess(res) {
        setScrollLoading(
          res.data.result?.length >= 200 ? (
            <Spin loading={true} />
          ) : (
            '已加载全部数据'
          )
        );
      }
    }
  );

  // 生成模拟数据
  const optionList = useMemo(getMockOptionList, []);

  /** 获取回显映射 */
  const getLabelMap = useCallback(
    () => buildLabelMap(optionList),
    [optionList]
  );

  // 构建回显映射
  const labelMap = useMemo(getLabelMap, [getLabelMap]);

  useEffect(() => {
    setPopupVisible(!!primaryKey);
    if ([primaryKey, objectTypeId].every((v) => !isNil(v))) {
      runAsync({
        id: objectTypeId!,
        page: 1,
        pageSize: 200
      }).then((res) => {
        setAllIns(res.data?.result || []);
      });
    }
  }, [primaryKey, objectTypeId]);

  // 虚拟滚动列表
  const [virtualList] = useVirtualList(allIns, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: rowHeight,
    overscan: 8
  });

  /** 处理下拉显示状态变化 */
  const handlePopupVisibleChange = useCallback((visible: boolean) => {
    setPopupVisible(visible);
  }, []);

  /** 处理清空或输入变化 */
  const handleValueChange = useCallback(
    (nextValue: string | number) => {
      onChange?.(nextValue);
    },
    [onChange]
  );

  /** 处理点击选项 */
  const handleOptionClick = useCallback(
    (option: OptionItem) => {
      onChange?.(option.value);
      setPopupVisible(false);
    },
    [onChange]
  );

  /** 处理列表行点击事件 */
  const handleRowClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const indexAttr = target.getAttribute('data-index');
      if (!indexAttr) return;
      const index = Number(indexAttr);
      if (Number.isNaN(index)) return;
      const option = optionList[index];
      if (!option) return;
      handleOptionClick(option);
    },
    [handleOptionClick, optionList]
  );

  /** 渲染下拉内容 */
  const renderDropdown = () => {
    return (
      <List
        style={{ width: '100%', maxHeight: 400 }}
        className={styles['ins-list']}
        bordered={false}
        virtualListProps={{
          height: 400,
          itemHeight: 40
        }}
        scrollLoading={scrollLoading}
        onReachBottom={(currentPage) =>
          runAsync({ page: currentPage, pageSize: 200, id: objectTypeId! })
        }
        dataSource={allIns}
        render={(item, index) => (
          <List.Item
            key={index}
            style={{ border: 'none !important' }}
            className={styles['ins-item']}
          >
            <label className={styles['content-container']}>
              <Checkbox
                className={`flex-shrink-0 ${mode === 'multiple' ? '' : 'hidden'}`}
                onChange={(c, e) => {
                  if (mode === 'multiple') {
                    return;
                  }
                  onChange?.(c ? JSON.stringify(item) : undefined);
                }}
              />
              <p>{`${JSON.stringify(item)}_${primaryKey}`}</p>
            </label>
          </List.Item>
        )}
      />
    );
  };

  /** 自定义回显内容 */
  const renderValue = useCallback(
    (_: any, currentValue: string | number) => {
      if (currentValue === undefined || currentValue === null) return null;
      return labelMap.get(String(currentValue)) || String(currentValue);
    },
    [labelMap]
  );

  return (
    <Select
      className={styles['interface']}
      dropdownMenuClassName={styles['list-container']}
      value={value as any}
      disabled={disabled || !objectTypeId || !primaryKey}
      allowClear
      mode={mode === 'multiple' ? 'multiple' : undefined}
      defaultPopupVisible={popupVisible}
      // popupVisible={popupVisible}
      placeholder={placeholder || '请选择'}
      onChange={handleValueChange}
      // onDropdownVisibleChange={handlePopupVisibleChange}
      dropdownRender={renderDropdown}
      // @ts-ignore
      // renderFormat={renderValue}
      // renderFormat={(v) => {
      //
      // }}
    />
  );
};
