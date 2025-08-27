import React, { useRef, useState, useCallback } from 'react';
import { Tree, Input, Tooltip } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconPlus,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';
import {
  NodeProps,
  TreeDataType,
  NodeInstance
} from '@arco-design/web-react/es/Tree/interface';
import { CatalogTypeEnum, subLeafKeys } from '../../dataCatalog/consts';

const TreeNode = Tree.Node;

interface ComponentTreeProps {
  directoryData: any[];
  onDirectoryDataChange: (data: any[]) => void;
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onPathChange?: (path: string) => void; // 新增：路径变化回调
  showAddTree?: boolean; // 新增：是否显示添加目录按钮
  onAddTree?: () => void; // 新增：添加目录回调
  enableRootAdd?: boolean;
}

const ComponentTree: React.FC<ComponentTreeProps> = ({
  directoryData,
  onDirectoryDataChange,
  onSelect,
  onPathChange,
  showAddTree = false,
  onAddTree,
  enableRootAdd = false
}) => {
  // 状态管理
  const inputRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 聚焦输入框
  const focusAndSelectInput = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.dom?.select();
      }
    }, 100);
  };

  // 生成新的节点名称
  const generateNodeName = (existingNodes: any[], prefix = '新建目录') => {
    const existingNames = new Set(
      existingNodes.map((node) => node.name || node.label)
    );
    let counter = 1;
    let newName = `${prefix}${counter}`;

    while (existingNames.has(newName)) {
      counter++;
      newName = `${prefix}${counter}`;
    }
    return newName;
  };

  // 创建新的输入节点
  const createInputNode = (name: string, parentNode: any) => {
    const newId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: newId,
      key: newId,
      name: name,
      value: newId,
      label: name,
      title: name,
      type_name: parentNode?.type_name === 'volume' ? 'volume_item' : 'db_item',
      level: (parentNode?.level || 0) + 1,
      isExpanded: false,
      hasChildren: false,
      isLastLeaf: true,
      showInput: true,
      isNew: true,
      parentId: parentNode?.id
    };
  };

  // 编辑完成处理
  const onEditFinish = (props: any) => {
    const { dataRef } = props;
    if (!dataRef) return;

    // 递归更新函数，支持嵌套节点的更新
    const updateNodeRecursively = (data: any[]): any[] => {
      return data.map((item) => {
        if (item.id === dataRef.id) {
          if (!inputValue.trim()) {
            return null;
          } else {
            // 更新节点名称并隐藏输入框
            return {
              ...item,
              name: inputValue.trim(),
              label: inputValue.trim(),
              showInput: false,
              isNew: false
            };
          }
        } else if (item.children && Array.isArray(item.children)) {
          // 递归处理子节点
          const updatedChildren = updateNodeRecursively(item.children).filter(
            Boolean
          );
          return {
            ...item,
            children: updatedChildren
          };
        }
        return item;
      });
    };

    if (!inputValue.trim()) {
      // 如果输入为空，删除该节点
      const updatedData = updateNodeRecursively(directoryData).filter(Boolean);
      onDirectoryDataChange(updatedData);
    } else {
      // 更新节点名称
      const updatedData = updateNodeRecursively(directoryData);
      onDirectoryDataChange(updatedData);
    }

    setIsEditing(false);
    setInputValue('');
  };

  // 构建路径的工具函数
  const buildPathFromTreeData = (
    data: any[],
    targetId: string,
    currentPath: string[] = []
  ): string[] | null => {
    for (const item of data) {
      const newPath = [...currentPath, item.name];
      // 如果找到目标节点，返回路径
      if (String(item.id) === String(targetId)) {
        return newPath;
      }
      // 如果有子节点，继续递归查找
      if (item.children && Array.isArray(item.children)) {
        const foundPath = buildPathFromTreeData(
          item.children,
          targetId,
          newPath
        );
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  };

  // 增强的选择处理函数
  const handleEnhancedSelect = (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => {
    // 调用原始的onSelect回调
    if (onSelect) {
      onSelect(selectedKeys, extra);
    }

    // 如果有路径变化回调，构建并传递路径
    if (onPathChange && selectedKeys.length > 0) {
      const selectedNode = extra.node;
      const nodeData = selectedNode.props.dataRef;

      // 构建完整路径
      const pathArray = buildPathFromTreeData(directoryData, selectedKeys[0]);
      const fullPath = pathArray
        ? pathArray.join('/') + '/xxx-aaa'
        : nodeData?.name || '';

      onPathChange(fullPath);
    }
  };

  // 添加根级目录
  const onCatalogAdd = () => {
    const name = '请输入目录名称';
    const newId = `new_${Date.now()}`;
    // 创建新的目录节点
    const newNode = {
      id: newId,
      key: newId,
      name: name,
      value: newId,
      label: name,
      title: name,
      type_name: 'catalog',
      level: 0,
      isExpanded: false,
      hasChildren: false,
      isLastLeaf: false,
      showInput: true, // 显示输入框
      isNew: true // 标记为新建节点
    };
    // 更新目录数据，将新节点添加到开头
    onDirectoryDataChange([newNode, ...directoryData]);

    // 设置输入状态
    setInputValue(name);
    setIsEditing(true);

    // 延迟聚焦，确保DOM更新完成
    setTimeout(() => {
      focusAndSelectInput();
    }, 100);
  };

  // 添加子节点
  const addSubVolume = (node: NodeProps) => {
    const { dataRef } = node;
    console.log('添加子节点:', dataRef);

    // 生成新节点的名称
    const newName = generateNodeName([], '新建目录');

    // 创建新的输入节点
    const newInputNode = createInputNode(newName, dataRef);

    // 递归更新 directoryData，在指定节点下添加新的子节点
    const updateDirectoryData = (data: any[]): any[] => {
      return data.map((item) => {
        if (item.id === dataRef?.id) {
          // 找到目标节点，添加新的子节点
          const updatedItem = { ...item };
          if (!updatedItem.children) {
            updatedItem.children = [];
          }
          // 将新节点添加到子节点数组的开头
          updatedItem.children = [newInputNode, ...updatedItem.children];
          updatedItem.isExpanded = true; // 展开父节点
          return updatedItem;
        } else if (item.children && Array.isArray(item.children)) {
          // 递归处理子节点
          return {
            ...item,
            children: updateDirectoryData(item.children)
          };
        }
        return item;
      });
    };

    // 更新状态
    const updatedData = updateDirectoryData(directoryData);
    onDirectoryDataChange(updatedData);

    // 确保父节点展开 - 添加到expandedKeys中
    const parentKey = dataRef?.id?.toString();
    if (parentKey && !expandedKeys.includes(parentKey)) {
      setExpandedKeys([...expandedKeys, parentKey]);
    }

    // 设置输入状态
    setInputValue(newName);
    setIsEditing(true);

    // 延迟聚焦，确保DOM更新完成
    setTimeout(() => {
      focusAndSelectInput();
    }, 100);
  };

  // 渲染标题文本
  const renderTitleText = (props: NodeProps) => {
    const { dataRef, title } = props;
    const TitleText = title;
    return (
      <Tooltip color="white" content={!subLeafKeys[dataRef?.type] ? title : ''}>
        <div
          className={`overflow-hidden text-ellipsis whitespace-nowrap ${dataRef?.isLastLeaf ? 'last-leaf-text' : ''} ${dataRef?.type === CatalogTypeEnum.table ? 'no-operation' : ''} ${dataRef?.type === CatalogTypeEnum.catalog ? 'catalog-title-text' : ''}`}
          style={{ maxWidth: '150px' }}
        >
          {TitleText}
        </div>
      </Tooltip>
    );
  };

  // 渲染树节点标题
  const renderTitle = (props: NodeProps) => {
    const { dataRef } = props;

    return (
      <div
        className="flex items-center overflow-hidden"
        onMouseEnter={() => setHoverNode(dataRef)}
      >
        {dataRef?.showInput ? (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(value) => {
              setInputValue(value);
            }}
            onBlur={() => {
              onEditFinish(props);
            }}
            onPressEnter={() => {
              onEditFinish(props);
            }}
            maxLength={255}
            className={`h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))] ${dataRef?.isLastLeaf ? 'last-leaf-input' : ''}`}
          />
        ) : (
          renderTitleText(props)
        )}
      </div>
    );
  };

  // 渲染额外操作按钮
  const renderExtra = (node: NodeProps) => {
    const { dataRef } = node;
    let perms: string[] = [];
    perms = dataRef?.perms ? dataRef.perms : perms;
    // 只有当前节点被悬浮时才显示新建按钮
    const isCurrentNodeHovered = hoverNode && hoverNode.id === dataRef?.id;
    return (
      !dataRef?.showInput && (
        <div className={'flex items-center justify-between'} style={{}}>
          {/* 为数据卷和数据库都添加新建按钮，只在悬浮时显示 */}
          {(dataRef?.type_name === 'volume' || dataRef?.type_name === 'db') &&
            isCurrentNodeHovered && (
              <Tooltip color="white" content="新建">
                <div
                  className="flex items-center opacity-100 transition-opacity duration-200"
                  style={{ color: '#2563EB' }}
                  onClick={() => addSubVolume(node)}
                >
                  <IconPlus />
                  <span className="ml-1 text-xs">新建</span>
                </div>
              </Tooltip>
            )}
        </div>
      )
    );
  };

  // 生成树节点
  const generatorTreeNodes = useCallback((treeData: TreeDataType[]) => {
    if (!Array.isArray(treeData)) {
      console.warn('treeData不是数组:', treeData);
      return null;
    }
    return treeData
      ?.map?.((item) => {
        if (!item || !item.id) {
          return null;
        }
        const { children, id, ...rest } = item;
        const hasChildren =
          children && Array.isArray(children) && children.length > 0;
        return (
          <TreeNode key={id} {...rest} dataRef={item} title={item.name}>
            {hasChildren ? generatorTreeNodes(children) : null}
          </TreeNode>
        );
      })
      .filter(Boolean); // 过滤掉null值
  }, []);

  // AddTree组件
  const AddTreeComponent = () => {
    if (!showAddTree) return null;

    const handleAddClick = () => {
      if (onAddTree) {
        onAddTree();
      } else if (enableRootAdd) {
        onCatalogAdd();
      }
    };

    return (
      <div
        style={{
          backgroundColor: '#fff',
          flexShrink: 0
        }}
      >
        <div
          style={{
            padding: '8px 12px 12px 0',
            cursor: 'pointer',
            color: '#1890ff',
            transition: 'background-color 0.2s',
            borderRadius: '0 0 6px 6px',
            backgroundColor: '#fff'
          }}
          onClick={handleAddClick}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              justifyContent: 'flex-start',
              margin: 0
            }}
          >
            <IconPlus style={{ marginRight: '4px' }} />
            新建目录
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: showAddTree ? 300 : 'auto',
        position: 'relative',
        padding: showAddTree ? '12px 12px 0 12px' : '4px 0'
      }}
      onMouseLeave={() => setHoverNode(null)}
    >
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          padding: '4px 0'
        }}
      >
        <Tree
          showLine
          blockNode
          selectable
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          renderTitle={renderTitle}
          icons={(node) => ({
            switcherIcon: !node.dataRef?.isLastLeaf ? <IconCaretDown /> : null
          })}
          onSelect={handleEnhancedSelect}
          renderExtra={renderExtra}
          className="ModelTree"
        >
          {generatorTreeNodes(directoryData)}
        </Tree>
      </div>
      <AddTreeComponent />
    </div>
  );
};

export default ComponentTree;
