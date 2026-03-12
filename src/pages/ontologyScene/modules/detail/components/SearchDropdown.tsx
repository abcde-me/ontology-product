import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Select, Popover, Tag, Spin } from '@arco-design/web-react';
const { Group: InputGroup } = Input;
import { IconSearch, IconDown, IconFile } from '@arco-design/web-react/icon';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import { debounce } from 'lodash-es';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { getFunctionList } from '@/api/ontologySceneLibrary/ontologyFunction';
import { ObjectType } from '@/types/objectType';
import { LinkInfo, PhysicalProperties } from '@/types/graphApi';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import ObjectTypeTagList from '@/pages/ontologyScene/componens/ObjectTypeTagList';
import ObjectTypeTag, {
  ObjectTypeTagProps
} from '@/pages/ontologyScene/componens/ObjectTypeTag';
import styles from './SearchDropdown.module.scss';
import { useHistory, useParams } from 'react-router-dom';

const { Option } = Select;

type SearchType = 'objectType' | 'attribute' | 'behavior' | 'link' | 'function';

interface SearchDropdownProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
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
  onVisibleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { id: OSId } = useParams<{ id: string }>();
  const [searchType, setSearchType] = useState<SearchType>('objectType');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const history = useHistory();

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
            ontologyModelID: Number(OSId),
            filter: value,
            pageNo: 1,
            pageSize: 200
          });
          if (objectTypeRes.status === 200 && objectTypeRes.data) {
            searchResults = objectTypeRes.data.result || [];
          }
          break;

        case 'attribute':
          const attributeRes = await listOntologyPhysicalProperties({
            ontologyModelID: Number(OSId),
            filter: value,
            pageNo: 1,
            pageSize: 200
          });
          if (attributeRes.status === 200 && attributeRes.data) {
            searchResults = attributeRes.data.result || [];
          }
          break;

        case 'link':
          const linkRes = await listOntologyLinkType({
            ontologyModelID: Number(OSId),
            filter: value,
            pageNo: 1,
            pageSize: 200
          });
          if (linkRes.status === 200 && linkRes.data) {
            searchResults = linkRes.data.result || [];
          }
          break;

        case 'behavior':
          const behaviorRes = await getActionList({
            ontologyModelID: Number(OSId),
            filter: value,
            pageNum: 1,
            pageSize: 200
          });
          // 将 BehaviorActionItem[] 转换为 BehaviorItem[] 格式
          searchResults = (behaviorRes.items || []).map((item) => ({
            id: item.id || 0,
            name: item.name || '',
            objectTypeList:
              item.objectTypeId && item.objectTypeName
                ? [
                    {
                      id: item.objectTypeId,
                      name: item.objectTypeName
                    }
                  ]
                : []
          }));
          break;

        case 'function':
          const functionRes = await getFunctionList({
            ontologyModelID: Number(OSId),
            filter: value,
            pageNum: 1,
            pageSize: 200
          });
          // 将 OntologyFunctionItem[] 转换为 FunctionItem[] 格式
          searchResults = (functionRes.items || []).map((item) => ({
            id: String(item.id || ''),
            name: item.code || '',
            displayName: item.name || ''
          }));
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
    debounce(
      (value: string, type: SearchType) => {
        performSearch(value, type);
      },
      300,
      {
        leading: true
      }
    )
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

  // 高亮显示搜索关键词
  const highlightSearchKeyword = useCallback(
    (text: string, keyword: string) => {
      if (!keyword) return text;

      const index = text.toLowerCase().indexOf(keyword.toLowerCase());

      if (index === -1) return text;

      const prefix = text.substr(0, index);
      const suffix = text.substr(index + keyword.length);
      return (
        <span>
          {prefix}
          <span style={{ color: '#007DFA' }}>
            {text.substr(index, keyword.length)}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

  // 渲染对象类型搜索结果
  const renderObjectTypeResult = (item: ObjectType) => {
    // 根据 icon 字段匹配对应的图标
    const iconOption = item.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === item.icon)
      : null;
    const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;
    const handleObjectTypeResultClick = () => {
      // 跳转到对象类型详情页面
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/list?search=${encodeURIComponent(item?.name ?? '')}`
      );
    };

    return (
      <div
        key={item.id}
        className="flex cursor-pointer items-center gap-[8px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
        onClick={handleObjectTypeResultClick}
      >
        {/* Icon */}
        <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center">
          <IconComponent className="h-[36px] w-[36px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[4px] flex items-center gap-[8px]">
            <EllipsisPopover
              value={highlightSearchKeyword(
                item.name || '-',
                searchValue.trim()
              )}
              wrapperClassName="min-w-0"
              className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
            />
            <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
              (id: {item.id})
            </span>
          </div>
          <EllipsisPopover
            value={item.description || '-'}
            wrapperClassName="min-w-0 flex-1"
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

    const handleLinkResultClick = () => {
      // 跳转到链接详情页面
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/list?search=${encodeURIComponent(item?.name ?? '')}`
      );
    };

    return (
      <div
        key={id}
        className="flex cursor-pointer flex-col items-start gap-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
        onClick={handleLinkResultClick}
      >
        {/* 标题和ID */}
        <div className="flex items-center gap-[8px]">
          <EllipsisPopover
            preferTypography
            value={highlightSearchKeyword(name || '-', searchValue.trim())}
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
          <ObjectTypeTag
            ontologyObjectTypeId={item.sourceObjectTypeID}
            ontologyObjectTypeName={item.sourceObjectTypeName || '-'}
            ontologyObjectTypeIcon={item.sourceObjectTypeIcon}
            className="max-w-[98px]"
          />
          {/* 虚线箭头 */}
          <div className="relative mx-[2px] flex w-[20px] items-center">
            <div className="absolute left-0 top-[50%] h-[1px] w-[20px] translate-y-[-50%] border-t border-dashed border-[var(--color-border-1)]"></div>
            <div className="absolute right-0 top-[50%] h-0 w-0 translate-y-[-50%] border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-[var(--color-border-1)] border-t-transparent"></div>
          </div>
          {/* 目标对象类型 */}
          <ObjectTypeTag
            ontologyObjectTypeId={item.targetObjectTypeID}
            ontologyObjectTypeName={item.targetObjectTypeName || '-'}
            ontologyObjectTypeIcon={item.targetObjectTypeIcon}
            className="max-w-[98px]"
          />
        </div>
      </div>
    );
  };

  // 渲染属性/行为搜索结果
  const renderAttributeLinkResult = (
    item: PhysicalProperties | BehaviorItem,
    type: 'attribute' | 'behavior'
  ) => {
    let name = '';
    let id: number | string = 0;
    let objectTypeTags: ObjectTypeTagProps[] = [];

    if (type === 'attribute') {
      // PhysicalProperties 类型
      const attr = item as PhysicalProperties;
      name = attr.name || '';
      id = attr.id || 0;
      // PhysicalProperties 只有单个对象类型信息，转换为标签格式
      if (attr.ontologyObjectTypeId && attr.ontologyObjectTypeName) {
        objectTypeTags = [
          {
            ontologyObjectTypeId: attr.ontologyObjectTypeId,
            ontologyObjectTypeName: attr.ontologyObjectTypeName,
            ontologyObjectTypeIcon: attr.ontologyObjectTypeIcon
          }
        ];
      }
    } else {
      // behavior
      const behavior = item as BehaviorItem;
      name = behavior.name || '';
      id = behavior.id || 0;
      // 将 behavior 的 objectTypeList 转换为标签格式
      objectTypeTags = (behavior.objectTypeList || []).map((objType) => ({
        ontologyObjectTypeId: objType.id,
        ontologyObjectTypeName: objType.name,
        ontologyObjectTypeIcon: undefined // behavior 的 objectTypeList 没有图标信息
      }));
    }

    const handleAttributeLinkResultClick = () => {
      if (type === 'attribute') {
        // 跳转到属性列表页面
        history.push(
          `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/attributes/list?search=${encodeURIComponent(item?.name ?? '')}`
        );
      } else {
        // 跳转到行为列表页面
        history.push(
          `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/behaviorActions?search=${encodeURIComponent(item?.name ?? '')}`
        );
      }
    };

    return (
      <div
        key={id}
        className="flex cursor-pointer flex-col items-start gap-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]"
        onClick={handleAttributeLinkResultClick}
      >
        <div className="flex items-center gap-[8px]">
          <EllipsisPopover
            preferTypography
            value={highlightSearchKeyword(name || '-', searchValue.trim())}
            className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
          />
          <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
            (id: {id})
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="text-[12px] leading-[18px] text-[var(--color-text-4)]">
            所属对象类型：
          </span>
          <ObjectTypeTagList tags={objectTypeTags} />
        </div>
      </div>
    );
  };

  // 渲染函数搜索结果
  const renderFunctionResult = (item: FunctionItem) => {
    const handleFunctionResultClick = () => {
      // 跳转到函数列表页面
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/functions?search=${encodeURIComponent(item?.name ?? '')}`
      );
    };

    return (
      <div
        key={item.id}
        className="flex cursor-pointer flex-col gap-[4px] rounded-[4px] p-[12px] transition-colors hover:bg-[#F2F8FF]"
        onClick={handleFunctionResultClick}
      >
        <div className="text-[14px] font-medium leading-[22px] text-[var(--color-text-1)]">
          {highlightSearchKeyword(item.name, searchValue.trim())}
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

  return (
    <div
      ref={containerRef}
      className={`relative w-[400px] ${styles['search-dropdown']}`}
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
          getPopupContainer={() =>
            (containerRef.current as HTMLElement) || document.body
          }
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
          placeholder="请输入名称或id"
          style={{ width: '296px' }}
          allowClear
          autoFocus
        />
      </InputGroup>

      {/* 搜索结果区域 */}
      {visible && searchValue.trim() && (
        <div className="absolute right-0 top-full z-50 w-[296px] rounded-[12px] bg-white py-[4px] shadow-[0px_2px_8px_0_rgba(0,0,0,0.08)]">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
