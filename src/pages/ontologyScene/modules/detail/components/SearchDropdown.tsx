import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Select, Popover, Tag, Spin } from '@arco-design/web-react';
const { Group: InputGroup } = Input;
import { IconSearch, IconDown, IconFile } from '@arco-design/web-react/icon';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import { debounce } from 'lodash-es';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { ObjectType } from '@/types/objectType';
import { PublicProperty } from '@/types/attributes';
import { LinkInfo } from '@/types/graphApi';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import styles from './SearchDropdown.module.scss';

const { Option } = Select;

type SearchType = 'objectType' | 'attribute' | 'behavior' | 'link' | 'function';

interface SearchDropdownProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// 函数类型（待定接口，使用 mock 数据）
interface FunctionItem {
  id: string;
  name: string;
  displayName: string;
}

// 行为类型（待定接口，使用 mock 数据）
interface BehaviorItem {
  id: number;
  name: string;
  objectTypeList: { id: number; name: string }[];
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  visible,
  onVisibleChange,
  onMouseEnter,
  onMouseLeave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('objectType');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // 搜索类型选项
  const searchTypeOptions = [
    { value: 'objectType', label: '对象类型' },
    { value: 'attribute', label: '属性' },
    { value: 'behavior', label: '行为' },
    { value: 'link', label: '链接' },
    { value: 'function', label: '函数' }
  ];

  // 搜索函数
  const performSearch = useCallback(async (value: string, type: SearchType) => {
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let searchResults: any[] = [];

      switch (type) {
        case 'objectType':
          const objectTypeRes = await listOntologyObjectType({
            filter: value,
            pageNo: 1,
            pageSize: 10
          });
          if (objectTypeRes.status === 200 && objectTypeRes.data) {
            searchResults = objectTypeRes.data.result || [];
          }
          break;

        case 'attribute':
          const attributeRes = await listOntologyPublicProperties({
            filter: value,
            pageNo: 1,
            pageSize: 10
          });
          if (attributeRes.status === 200 && attributeRes.data) {
            searchResults = attributeRes.data.result || [];
          }
          break;

        case 'link':
          const linkRes = await listOntologyLinkType({
            filter: value,
            pageNo: 1,
            pageSize: 10
          });
          if (linkRes.status === 200 && linkRes.data) {
            searchResults = linkRes.data.result || [];
          }
          break;

        case 'behavior':
          // TODO: 待定接口，使用 mock 数据
          searchResults = [
            {
              id: 1,
              name: '飞行行为',
              objectTypeList: [
                { id: 1, name: '飞机' },
                { id: 2, name: '飞行器' }
              ]
            },
            {
              id: 2,
              name: '攻击行为',
              objectTypeList: [{ id: 3, name: '作战单元' }]
            }
          ].filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
          );
          break;

        case 'function':
          // TODO: 待定接口，使用 mock 数据
          searchResults = [
            {
              id: 'identity_and_extract',
              name: 'identity_and_extract',
              displayName: '视觉特征提取'
            },
            {
              id: 'infer_affiliation',
              name: 'infer_affiliation',
              displayName: '关键推理'
            },
            {
              id: 'asses_threat_zone',
              name: 'asses_threat_zone',
              displayName: '关键推理'
            }
          ].filter(
            (item) =>
              item.name.toLowerCase().includes(value.toLowerCase()) ||
              item.displayName.toLowerCase().includes(value.toLowerCase())
          );
          break;
      }

      setResults(searchResults);
    } catch (error) {
      console.error('搜索失败:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 使用 lodash-es 的 debounce 创建防抖搜索函数
  const debouncedSearchRef = useRef(
    debounce((value: string, type: SearchType) => {
      performSearch(value, type);
    }, 300)
  );

  // 搜索值变化时触发搜索
  useEffect(() => {
    if (visible && searchValue) {
      debouncedSearchRef.current(searchValue, searchType);
    } else {
      setResults([]);
    }
  }, [searchValue, searchType, visible]);

  // 组件卸载时取消防抖
  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  // 渲染对象类型搜索结果
  const renderObjectTypeResult = (item: ObjectType) => {
    // 根据 icon 字段匹配对应的图标
    const iconOption = item.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === item.icon)
      : null;
    const IconComponent = iconOption?.icon;

    return (
      <div
        key={item.id}
        className="flex cursor-pointer items-center gap-[8px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
      >
        {/* Icon */}
        <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center">
          {IconComponent ? (
            <IconComponent className="h-[36px] w-[36px]" />
          ) : (
            <IconFile className="h-[36px] w-[36px] text-[var(--color-text-3)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[4px] flex items-center gap-[8px]">
            <EllipsisPopover
              preferTypography
              value={item.name || '-'}
              className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
            />
            <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
              (id: {item.id})
            </span>
          </div>
          <EllipsisPopover
            preferTypography
            value={item.description || '描述说明文案'}
            className="text-[12px] leading-[18px] text-[var(--color-text-4)]"
          />
        </div>
      </div>
    );
  };

  // 渲染链接搜索结果（特殊样式）
  const renderLinkResult = (item: LinkInfo) => {
    const name = item.name || '';
    const id = item.id || 0;
    const sourceIcon = item.sourceObjectTypeIcon;
    const targetIcon = item.targetObjectTypeIcon;
    const sourceName = item.sourceObjectTypeName || '-';
    const targetName = item.targetObjectTypeName || '-';

    // 获取源对象类型图标
    const sourceIconOption = sourceIcon
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === sourceIcon)
      : null;
    const SourceIconComponent = sourceIconOption?.icon;

    // 获取目标对象类型图标
    const targetIconOption = targetIcon
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === targetIcon)
      : null;
    const TargetIconComponent = targetIconOption?.icon;

    // 根据图标类型确定颜色
    const getIconColor = (icon?: string) => {
      if (!icon) return '#165dff';
      // 根据图标值映射到不同颜色
      // 可以根据实际业务需求调整颜色映射
      const colorMap: Record<string, string> = {
        'object-type-1': '#FF6B35', // 橙色
        'object-type-2': '#722ED1', // 紫色
        'object-type-3': '#00b42a', // 绿色
        'object-type-4': '#FF6B35', // 橙色
        'object-type-5': '#722ED1', // 紫色
        'object-type-6': '#00b42a' // 绿色
      };
      return colorMap[icon] || '#165dff';
    };

    const sourceColor = getIconColor(sourceIcon);
    const targetColor = getIconColor(targetIcon);

    return (
      <div
        key={id}
        className="flex cursor-pointer flex-col items-start gap-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
      >
        {/* 标题和ID */}
        <div className="flex items-center gap-[8px]">
          <EllipsisPopover
            preferTypography
            value={name || '-'}
            className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
          />
          <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
            (id: {id})
          </span>
        </div>
        {/* 链接对 */}
        <div className="flex items-center">
          <span className="mr-[4px] text-[12px] leading-[18px] text-[var(--color-text-4)]">
            链接对:
          </span>
          {/* 源对象类型 */}
          <div className="max-w-[98px]] flex items-center gap-[4px] rounded-[4px] border border-[##EBEEF5] bg-[#F5F7FC] px-[4px]">
            <div className="flex h-[12px] w-[12px] flex-shrink-0 items-center justify-center">
              {SourceIconComponent ? (
                <SourceIconComponent className="h-[12px] w-[12px] text-white" />
              ) : (
                <IconFile className="h-[12px] w-[12px] text-white" />
              )}
            </div>
            <span className="text-[12px] leading-[18px] text-[var(--color-text-1)]">
              <EllipsisPopover
                preferTypography
                value={sourceName || '-'}
                className="text-[12px] leading-[18px] text-[var(--color-text-1)]"
              />
            </span>
          </div>
          {/* 虚线箭头 */}
          <div className="mx-[2px] mx-[4px] flex items-center">
            <div className="h-[1px] w-[20px] border-t border-dashed border-[var(--color-border-1)]"></div>
            <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-[var(--color-border-1)] border-t-transparent"></div>
          </div>
          {/* 目标对象类型 */}
          <div className="flex max-w-[98px] items-center gap-[4px] rounded-[4px] border border-[##EBEEF5] bg-[#F5F7FC] px-[4px]">
            <div className="flex h-[12px] w-[12px] flex-shrink-0 items-center justify-center">
              {TargetIconComponent ? (
                <TargetIconComponent className="h-[12px] w-[12px] text-white" />
              ) : (
                <IconFile className="h-[12px] w-[12px] text-white" />
              )}
            </div>
            <span className="text-[12px] leading-[18px] text-[var(--color-text-1)]">
              <EllipsisPopover
                preferTypography
                value={targetName || '-'}
                className="text-[12px] leading-[18px] text-[var(--color-text-1)]"
              />
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染属性/行为搜索结果
  const renderAttributeLinkResult = (
    item: PublicProperty | BehaviorItem,
    type: 'attribute' | 'behavior'
  ) => {
    let name = '';
    let id: number | string = 0;
    let objectTypeList: { id: number; name: string }[] = [];

    if (type === 'attribute') {
      const attr = item as PublicProperty;
      name = attr.name || '';
      id = attr.id || 0;
      objectTypeList =
        attr.ontologyObjectTypeList?.map((item) => ({
          id: item.id || 0,
          name: item.name || ''
        })) || [];
    } else {
      // behavior
      const behavior = item as BehaviorItem;
      name = behavior.name;
      id = behavior.id;
      objectTypeList = behavior.objectTypeList || [];
    }

    // 限制显示的 tag 数量，超过 2 个显示 +n
    const maxVisibleTags = 2;
    const visibleTags = objectTypeList.slice(0, maxVisibleTags);
    const hiddenCount = objectTypeList.length - maxVisibleTags;

    return (
      <div
        key={id}
        className="flex cursor-pointer flex-col items-start gap-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
      >
        <div className="flex items-center gap-[8px]">
          <EllipsisPopover
            preferTypography
            value={name || '-'}
            className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
          />
          <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
            (id: {id})
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="text-[12px] leading-[18px] text-[var(--color-text-4)]">
            所属对象类型
          </span>
          {visibleTags.map((objType) => (
            <Tag color="#EBEEF5" key={objType.id} size="small">
              {objType.name}
            </Tag>
          ))}
          {hiddenCount > 0 && (
            <Popover
              content={
                <div className="flex max-w-[300px] flex-wrap gap-[8px]">
                  {objectTypeList.slice(maxVisibleTags).map((objType) => (
                    <Tag key={objType.id} color="#EBEEF5" size="small">
                      {objType.name}
                    </Tag>
                  ))}
                </div>
              }
              position="bottom"
            >
              <Tag
                color="#EBEEF5"
                size="small"
                className="cursor-pointer"
                style={{ margin: 0 }}
              >
                +{hiddenCount}
              </Tag>
            </Popover>
          )}
        </div>
      </div>
    );
  };

  // 渲染函数搜索结果
  const renderFunctionResult = (item: FunctionItem) => {
    return (
      <div
        key={item.id}
        className="flex cursor-pointer flex-col gap-[4px] rounded-[4px] p-[12px] transition-colors hover:bg-[var(--color-fill-2)]"
      >
        <div className="text-[14px] font-medium leading-[22px] text-[var(--color-text-1)]">
          {item.name}
        </div>
        <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
          显示名称: {item.displayName}
        </div>
      </div>
    );
  };

  // 渲染搜索结果列表
  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-[40px]">
          <Spin />
        </div>
      );
    }

    if (!searchValue.trim()) {
      return (
        <div className="py-[40px]">
          <NoDataCard type="block" />
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="py-[40px]">
          <NoDataCard type="block" />
        </div>
      );
    }

    return (
      <div className="max-h-[400px] overflow-y-auto">
        {results.map((item) => {
          switch (searchType) {
            case 'objectType':
              return renderObjectTypeResult(item);
            case 'attribute':
              return renderAttributeLinkResult(item, 'attribute');
            case 'link':
              return renderLinkResult(item);
            case 'behavior':
              return renderAttributeLinkResult(item, 'behavior');
            case 'function':
              return renderFunctionResult(item);
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // 处理鼠标离开
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      // 清除之前的定时器
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }

      // 检查 relatedTarget 是否仍在容器内（包括子元素，如 Select 下拉框）
      const relatedTarget = e.relatedTarget as Node;
      if (
        containerRef.current &&
        relatedTarget &&
        (containerRef.current === relatedTarget ||
          containerRef.current.contains(relatedTarget))
      ) {
        // 鼠标移到了子元素（如 Select 下拉框），不隐藏
        return;
      }

      // 延迟检查，给鼠标移动到子元素的时间
      leaveTimerRef.current = setTimeout(() => {
        if (!containerRef.current) {
          onVisibleChange(false);
          onMouseLeave?.();
          return;
        }

        // 再次检查鼠标当前位置是否仍在容器内
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const isInContainer = elements.some((el) =>
          containerRef.current?.contains(el)
        );

        if (!isInContainer) {
          // 鼠标真正离开了，隐藏
          onVisibleChange(false);
          onMouseLeave?.();
        }
      }, 100);
    },
    [onVisibleChange, onMouseLeave]
  );

  // 处理鼠标进入
  const handleMouseEnter = useCallback(() => {
    // 清除离开定时器
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    onVisibleChange(true);
    onMouseEnter?.();
  }, [onVisibleChange, onMouseEnter]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-[400px] ${styles['search-dropdown']}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 搜索框区域 */}
      <InputGroup compact>
        <Select
          value={searchType}
          onChange={(value) => {
            setSearchType(value);
            setSearchValue('');
            setResults([]);
          }}
          style={{ width: '104px' }}
          suffixIcon={<IconDown />}
        >
          {searchTypeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        <Input
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          placeholder="请输入搜索内容"
          style={{ width: '296px' }}
          allowClear
          autoFocus
        />
      </InputGroup>

      {/* 搜索结果区域 */}
      {visible && searchValue.trim() && (
        <div className="shadow-[0px 4px 16px 0px rgba(0, 0, 0, 0.08)] absolute right-0 top-full z-50 w-[296px] rounded-[12px] bg-white py-[4px]">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
