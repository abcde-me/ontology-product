import React, { useState, useMemo } from 'react';
import {
  Tree,
  Input,
  Button,
  Empty,
  Message,
  Spin
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useToolsManager } from '../../hooks/useToolsManager';
import { OperatorItem } from '@/types/pythonApi';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import copy from 'copy-to-clipboard';
import './index.scss';
import ModalToolDetail from './ModalToolDetail';
import SuziRead from '@/assets/python/suanzi-read.svg';
import SuziQiePian from '@/assets/python/suanzi-qiepian.svg';
import SuziVideo from '@/assets/python/suanzi-video.svg';
import SuziClean from '@/assets/python/suanzi-clean.svg';
import SuziStrong from '@/assets/python/suanzi-strong.svg';
import SuziVector from '@/assets/python/suanzi-xiangliang.svg';
import SuziSave from '@/assets/python/suanzi-save.svg';
import SuziIcon from '@/assets/python/suanzi-icon.svg';

// 算子图标映射类型
type OperatorIconMap = Record<string, string>;

// 算子颜色映射类型
type OperatorColorMap = Record<string, string>;

// 算子描述映射类型
type OperatorDescMap = Record<string, string>;

// Tree节点数据类型
interface TreeNodeData {
  key: string;
  title: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  operator?: OperatorItem;
}

// 组件Props接口
interface ToolsManagerProps {
  onInsertContent?: (content: string) => void;
  getIsEditorFocused?: () => boolean;
}

enum OperatorCatalogId {
  /** 读取解析 */
  READ_PARSING = 0,
  /** 分片分块 */
  CHUNK_PROCESSING = 1,
  /** 音视频处理 */
  VIDEO_PROCESSING = 2,
  /** 数据清洗 */
  DATA_CLEANING = 3,
  /** 数据增强 */
  DATA_AUGMENTATION = 4,
  /** 向量化 */
  VECTORIZATION = 5,
  /** 数据保存 */
  DATA_SAVING = 6
}

const ICON_MAP = {
  [OperatorCatalogId.READ_PARSING]: <SuziRead></SuziRead>,
  [OperatorCatalogId.CHUNK_PROCESSING]: <SuziQiePian></SuziQiePian>,
  [OperatorCatalogId.VIDEO_PROCESSING]: <SuziVideo></SuziVideo>,
  [OperatorCatalogId.DATA_CLEANING]: <SuziClean></SuziClean>,
  [OperatorCatalogId.DATA_AUGMENTATION]: <SuziStrong></SuziStrong>,
  [OperatorCatalogId.VECTORIZATION]: <SuziVector></SuziVector>,
  [OperatorCatalogId.DATA_SAVING]: <SuziSave></SuziSave>
};

const ToolsManager: React.FC<ToolsManagerProps> = ({
  onInsertContent,
  getIsEditorFocused
}) => {
  const {
    searchKey,
    setSearchKey,
    operatorList,
    getOperator,
    handleSearch,
    loading
  } = useToolsManager();
  // const [searchKey, setSearchValue] = useState<string>('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [toolDetailData, setToolDetailData] = useState<OperatorItem | null>(
    null
  );
  const [toolDetailVisible, setToolDetailVisible] = useState(false);

  const closeToolDetail = () => {
    setToolDetailVisible(false);
  };

  // 获取算子图标背景色
  const getOperatorIconBgColor = (name: string): string => {
    const colorMap: OperatorColorMap = {
      文本解析算子: '#4CAF50',
      图片解析算子: '#2196F3',
      音频解析算子: '#FF9800',
      去重处理算子: '#F44336',
      数据验证算子: '#3F51B5',
      通用场景增强算子: '#9C27B0',
      去重算子: '#F44336'
    };

    return colorMap[name] || '#607D8B';
  };

  // 处理详情按钮点击
  const handleDetailClick = (item: OperatorItem): void => {
    setToolDetailVisible(true);
    setToolDetailData(item);
  };

  // 处理插入按钮点击
  const handleInsertClick = (item: OperatorItem): void => {
    const isEditorFocusedNow = getIsEditorFocused?.() ?? false;
    console.log('插入算子:', item);

    if (isEditorFocusedNow && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(item.sample_code);
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(item.sample_code);
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  // 检查是否有数据
  const hasData = useMemo(() => {
    return (
      operatorList.length > 0 &&
      operatorList.some((category) => category.op_items.length > 0)
    );
  }, [operatorList]);

  // 构建Tree数据
  const treeData = useMemo(() => {
    return operatorList.map((category, categoryIndex) => ({
      key: `category-${categoryIndex}`,
      title: (
        <div className="tools-manager__category-header">
          <span className="tools-manager__category-title">
            {category.catalog}
          </span>
        </div>
      ),
      children: category.op_items.map((item, itemIndex) => ({
        key: `operator-${categoryIndex}-${itemIndex}`,
        title: (
          <div
            className={`tools-manager__operator ${hoveredItem === `operator-${categoryIndex}-${itemIndex}` ? 'tools-manager__operator--hovered' : ''}`}
            onMouseEnter={() =>
              setHoveredItem(`operator-${categoryIndex}-${itemIndex}`)
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* 算子图标 */}

            <div
              className="tools-manager__operator-icon"
              style={{ backgroundColor: getOperatorIconBgColor(item.name) }}
            >
              {ICON_MAP[category.catalog_id] || <SuziIcon />}
            </div>

            {/* 算子信息 */}
            <div className="tools-manager__operator-info">
              <div className="tools-manager__operator-title">
                <EllipsisPopover
                  value={item.name}
                  className="tools-manager__operator-name"
                  ellipsis={{
                    rows: 1,
                    cssEllipsis: true
                  }}
                />
              </div>
              <div className="tools-manager__operator-description">
                <EllipsisPopover
                  value={item.description}
                  className="tools-manager__operator-desc"
                  ellipsis={{
                    rows: 1,
                    cssEllipsis: true
                  }}
                />
              </div>
            </div>

            {/* 操作按钮 - 仅在hover时显示 */}
            {
              <div className="tools-manager__operator-actions">
                <Button
                  type="text"
                  size="small"
                  className="tools-manager__action-btn tools-manager__action-btn--detail"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetailClick(item);
                  }}
                >
                  详情
                </Button>
                <Button
                  type="outline"
                  size="small"
                  className="tools-manager__action-btn tools-manager__action-btn--insert"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertClick(item);
                  }}
                  onMouseDown={(e) => {
                    // 阻止按钮获得焦点，保持编辑器焦点
                    e.preventDefault();
                  }}
                >
                  {getIsEditorFocused?.() ? '插入' : '复制'}
                </Button>
              </div>
            }
          </div>
        ),
        isLeaf: true,
        operator: item
      }))
    }));
  }, [operatorList, hoveredItem]);

  // 初始化展开所有分类
  React.useEffect(() => {
    const keys = operatorList.map((_, index) => `category-${index}`);
    setExpandedKeys(keys);
  }, [operatorList]);

  // 处理Tree展开/折叠
  const handleExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 处理Tree选择
  const handleSelect = (selectedKeys: string[]) => {
    // 可以在这里处理算子选择逻辑
    console.log('选中的算子:', selectedKeys);
  };

  return (
    <div className="tools-manager sider-container">
      {/* 标题 */}
      <div className="sider-title">算子库</div>

      {/* 搜索框 */}
      <div className="mb-2">
        <Input.Search
          placeholder="输入搜索算子"
          value={searchKey}
          allowClear
          onSearch={() => handleSearch(searchKey)}
          onClear={() => handleSearch('')}
          onChange={(value) => setSearchKey(value)}
        />
      </div>

      {/* Tree组件 */}
      <div className="tools-manager__content">
        {loading ? (
          <div className="mt-[110px] flex flex-col items-center">
            <Spin size={26} />
            <div className="text-[rgba(15, 23, 42, 1)] text-[14px]">加载中</div>
          </div>
        ) : hasData ? (
          <Tree
            treeData={treeData}
            expandedKeys={expandedKeys}
            selectedKeys={[]}
            onExpand={handleExpand}
            onSelect={handleSelect}
            showLine={false}
            blockNode={true}
            className="tools-manager__tree"
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>

      {toolDetailVisible && (
        <ModalToolDetail
          toolDetailData={toolDetailData}
          toolDetailVisible={toolDetailVisible}
          closeToolDetail={closeToolDetail}
        />
      )}
    </div>
  );
};

export default ToolsManager;
