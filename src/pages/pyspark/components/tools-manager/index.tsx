import React, { useState, useMemo } from 'react';
import { Tree, Input, Button } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useToolsManager } from '../../hooks/useToolsManager';
import { OperatorItem } from '@/types/pythonApi';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import './index.scss';
import ModalToolDetail from './ModalToolDetail';

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

const ToolsManager: React.FC = () => {
  const { operatorList, getOperator } = useToolsManager();
  const [searchValue, setSearchValue] = useState<string>('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [toolDetailData, setToolDetailData] = useState<OperatorItem | null>(
    null
  );
  const [toolDetailVisible, setToolDetailVisible] = useState(false);

  const closeToolDetail = () => {
    setToolDetailVisible(false);
  };

  // 获取算子图标
  const getOperatorIcon = (name: string): string => {
    const iconMap: OperatorIconMap = {
      文本解析算子: '📄',
      图片解析算子: '🖼️',
      音频解析算子: '🎵',
      去重处理算子: '🔄',
      数据验证算子: '✅',
      通用场景增强算子: '📈',
      去重算子: '🔄'
    };

    return iconMap[name] || '⚙️';
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

  // 获取算子描述（根据图片中的实际描述）
  const getOperatorDescription = (
    name: string,
    originalDesc: string
  ): string => {
    const descMap: OperatorDescMap = {
      文本解析算子: '解析文本文件,支持OCR和文本...',
      图片解析算子: '解析图片文件,生成图片描述和...',
      音频解析算子: '解析音频文件,进行语音转文本',
      去重处理算子: '删除数据中的重复记录',
      数据验证算子: '验证数据的完整性和格式',
      通用场景增强算子: '生成通用场景的训练数据',
      去重算子: '删除数据中的重复记录'
    };

    return descMap[name] || originalDesc;
  };

  // 处理详情按钮点击
  const handleDetailClick = (item: OperatorItem): void => {
    setToolDetailVisible(true);
    setToolDetailData(item);
  };

  // 处理插入按钮点击
  const handleInsertClick = (item: OperatorItem): void => {
    console.log('插入算子:', item);
    // TODO: 实现插入逻辑
  };

  // 根据搜索值过滤算子
  const filteredOperatorList = useMemo(() => {
    if (!searchValue.trim()) {
      return operatorList;
    }

    return operatorList
      .map((category) => ({
        ...category,
        op_items: category.op_items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(searchValue.toLowerCase())
            )
        )
      }))
      .filter((category) => category.op_items.length > 0);
  }, [operatorList, searchValue]);

  // 构建Tree数据
  const treeData = useMemo(() => {
    return filteredOperatorList.map((category, categoryIndex) => ({
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
              {getOperatorIcon(item.name)}
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
                  value={getOperatorDescription(item.name, item.description)}
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
                >
                  插入
                </Button>
              </div>
            }
          </div>
        ),
        isLeaf: true,
        operator: item
      }))
    }));
  }, [filteredOperatorList, hoveredItem]);

  // 初始化展开所有分类
  React.useEffect(() => {
    const keys = filteredOperatorList.map((_, index) => `category-${index}`);
    setExpandedKeys(keys);
  }, [filteredOperatorList]);

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
          placeholder="搜索当前文件夹"
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      {/* Tree组件 */}
      <div className="tools-manager__content">
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
      </div>

      <ModalToolDetail
        toolDetailData={toolDetailData}
        toolDetailVisible={toolDetailVisible}
        closeToolDetail={closeToolDetail}
      />
    </div>
  );
};

export default ToolsManager;
