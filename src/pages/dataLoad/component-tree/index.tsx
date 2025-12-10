import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Input, Tooltip, Message, TreeSelect } from '@arco-design/web-react';
import {
  IconCaretDown,
  IconPlus,
  IconStorage,
  IconArchive
} from '@arco-design/web-react/icon';
import YuanShujuIcon from '@/assets/yuanshuju-icon.svg';
import {
  NodeProps,
  NodeInstance
} from '@arco-design/web-react/es/Tree/interface';
import { CatalogTypeEnum, subLeafKeys } from '../../dataCatalog/consts';
import { validateName } from '@/utils/valiate';
import '../create/index.module.scss';
// 导入类型和工具函数
import { TreeNodeData } from './types';
import { NODE_TYPES, SELECTABLE_NODE_TYPES } from './constants';
import {
  getNodeTypeConfig,
  getInputNodeKey,
  shouldShowDbNode,
  shouldShowMetadataNode,
  shouldShowDatasourceNode,
  isParentNodeType,
  getChildTypeName
} from './utils/nodeTypeUtils';
import {
  normalizeChildren,
  findNodeById,
  convertSelectedKeysToPathKeys,
  deleteNodeRecursively,
  enrichTreeNodeForTreeSelect,
  hasDataBaseNode,
  hasMetadataBound,
  findPathKeyById
} from './utils/dataTransform';
import {
  useInputNodes,
  useEditingState,
  useTreeUIState,
  useApiOperations
} from './hooks';
import classNames from 'classnames';
import styles from './index.module.scss';

interface ComponentTreeProps {
  directoryData: TreeNodeData[];
  onDirectoryDataChange: (data: TreeNodeData[]) => void;
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onPathChange?: (
    path: string,
    nodeId?: string | number,
    nodeData?: TreeNodeData
  ) => void; // 新增：路径变化回调，同时传递节点ID
  showAddTree?: boolean; // 新增：是否显示添加目录按钮
  onAddTree?: () => void; // 新增：添加目录回调
  enableRootAdd?: boolean;
  activeTab?: 'src' | 'dest'; // 新增：当前活动标签，用于确定root_type
  onDataRefresh?: () => Promise<TreeNodeData[]>; // 新增：数据刷新回调
  dataSourceType?: string; // 新增：数据源类型，用于判断是否显示数据卷节点
  tableNameNames?: string; // 新增：表名
  selectedKeys?: string[]; // 新增：选中的节点keys
  // TreeSelect 相关 props
  placeholder?: string; // TreeSelect 占位符
  allowClear?: boolean; // 是否允许清除
  className?: string; // TreeSelect 样式类名
  value?: string; // TreeSelect 的值
  onChange?: (value: string | string[]) => void; // TreeSelect 值变化回调
}

const ComponentTree: React.FC<ComponentTreeProps> = ({
  directoryData,
  onDirectoryDataChange,
  onSelect,
  onPathChange,
  showAddTree = false,
  onAddTree,
  enableRootAdd = false,
  activeTab = 'src',
  onDataRefresh,
  dataSourceType,
  tableNameNames,
  selectedKeys = [],
  placeholder = '请选择载入位置',
  allowClear = true,
  className = 'db-tree-select',
  value,
  onChange
}) => {
  // 使用自定义Hook管理输入节点状态
  const {
    inputNodes,
    getInputNode,
    setInputNode,
    deleteInputNode,
    getInputNodeType,
    cleanupInputNode
  } = useInputNodes();

  // 创建父节点的辅助函数
  const createParentNode = useCallback(
    (
      item: TreeNodeData,
      normalizedChildren: TreeNodeData[],
      parentType: string,
      filterFn: (child: TreeNodeData) => boolean
    ): TreeNodeData | null => {
      const config = getNodeTypeConfig(parentType);
      if (!config) return null;

      const nodeKey = getInputNodeKey(item.id, parentType);
      if (!nodeKey) return null;

      // 检查是否已经存在该类型的父节点
      const hasParentNode = normalizedChildren.some(
        (child) => child.type_name === parentType
      );
      if (hasParentNode) return null;

      const inputNode = getInputNode(config.key, nodeKey);
      const filteredChildren = normalizedChildren.filter(filterFn);

      // 如果有输入节点，添加到子节点开头
      const children = inputNode
        ? [inputNode, ...filteredChildren]
        : filteredChildren;

      return {
        id: nodeKey,
        key: nodeKey,
        name: config.label,
        value: config.label,
        label: config.label,
        title: config.label,
        type_name: parentType as any,
        level: (item.level || 0) + 1,
        isExpanded: Boolean(inputNode),
        hasChildren: true,
        isLastLeaf: false,
        showInput: false,
        isNew: false,
        parentId: item.id,
        children
      };
    },
    [getInputNode, directoryData]
  );

  // 使用 useCallback 包装 enrichTreeNodeForTreeSelect，传入 selectedKeys 和 SELECTABLE_NODE_TYPES
  const enrichTreeNodeForTreeSelectWithContext = useCallback(
    (node: TreeNodeData) => {
      return enrichTreeNodeForTreeSelect(
        node,
        SELECTABLE_NODE_TYPES,
        selectedKeys
      );
    },
    [selectedKeys]
  );

  const processedDirectoryData = React.useMemo(() => {
    if (directoryData.length === 0) {
      return [];
    }

    const processedData = directoryData
      .filter((item) => {
        // 如果 showInput 是 true，但 inputNodes.catalog 中不存在此 id，则过滤掉，主要处理根目录的输入节点
        if (item.showInput === true) {
          const itemId = String(item.id);
          return inputNodes?.catalog?.has(itemId);
        }
        // 其他情况保留
        return true;
      })
      .map((item) => {
        // 先规范化 children，确保是数组形式
        const normalizedChildren = normalizeChildren(item.children);

        if (item.type_name === NODE_TYPES.CATALOG) {
          const childNodes: TreeNodeData[] = [];

          // 为目录节点添加"数据库"子节点
          if (shouldShowDbNode(dataSourceType)) {
            const dbNode = createParentNode(
              item,
              normalizedChildren,
              NODE_TYPES.DB_PARENT,
              (child) =>
                child.type_name === NODE_TYPES.DB ||
                child.type_name === NODE_TYPES.DB_ITEM
            );
            if (dbNode) {
              childNodes.push(dbNode);
            }
          }

          // 为数据库类型添加"元数据"子节点
          if (shouldShowMetadataNode(dataSourceType)) {
            const hasMetaDataNode = normalizedChildren.some(
              (child) => child.type_name === NODE_TYPES.METADATA_PARENT
            );

            if (!hasMetaDataNode) {
              let metaDataChildren: TreeNodeData[] = [];
              if (normalizedChildren.length > 0) {
                metaDataChildren = normalizedChildren
                  .filter(
                    (child) =>
                      child.type_name === NODE_TYPES.METADATA ||
                      child.type === CatalogTypeEnum.metadata
                  )
                  .map((metaItem) => ({
                    id: metaItem.id,
                    key: String(metaItem.id),
                    name: metaItem.name,
                    value: String(metaItem.id),
                    label: metaItem.name || `未命名_${metaItem.id}`,
                    title: metaItem.name || `未命名_${metaItem.id}`,
                    type_name: 'metadata' as const,
                    level: (item.level || 0) + 2,
                    isExpanded: false,
                    hasChildren: false,
                    isLastLeaf: true,
                    parentId: String(item.id),
                    perms: metaItem.perms
                  }));
              }

              const metaNodeKey = getInputNodeKey(
                item.id,
                NODE_TYPES.METADATA_PARENT
              );
              if (metaNodeKey) {
                const metaInputNode = getInputNode('metadata', metaNodeKey);
                if (metaInputNode) {
                  metaDataChildren = [metaInputNode, ...metaDataChildren];
                }

                const metaNode: TreeNodeData = {
                  id: metaNodeKey,
                  key: metaNodeKey,
                  name: '元数据',
                  value: metaNodeKey,
                  label: '元数据',
                  title: '元数据',
                  type_name: NODE_TYPES.METADATA_PARENT,
                  level: (item.level || 0) + 1,
                  isExpanded: Boolean(metaInputNode),
                  hasChildren: true,
                  isLastLeaf: false,
                  showInput: false,
                  isNew: false,
                  parentId: item.id,
                  children: metaDataChildren
                };

                childNodes.push(metaNode);
              }
            }
          }

          // 为本地文件类型添加"数据卷"子节点
          if (shouldShowDatasourceNode(dataSourceType)) {
            const datasourceNode = createParentNode(
              item,
              normalizedChildren,
              NODE_TYPES.DATASOURCE_PARENT,
              (child) =>
                child.type_name === NODE_TYPES.VOLUME ||
                child.type_name === NODE_TYPES.VOLUME_ITEM
            );
            if (datasourceNode) {
              childNodes.push(datasourceNode);
            }
          }

          if (childNodes.length > 0) {
            return {
              ...item,
              children: childNodes,
              hasChildren: true
            };
          } else {
            return {
              ...item,
              children: normalizedChildren,
              hasChildren: normalizedChildren.length > 0
            };
          }
        }

        // 对于非 catalog 类型的节点，也要确保 children 是数组形式
        return {
          ...item,
          children: normalizedChildren,
          hasChildren: normalizedChildren.length > 0
        };
      });

    // 在初始化时就为每个节点添加 TreeSelect 需要的属性
    const treeData = processedData
      .map((item) => enrichTreeNodeForTreeSelectWithContext(item))
      .filter(
        (
          item
        ): item is NonNullable<
          ReturnType<typeof enrichTreeNodeForTreeSelectWithContext>
        > => item !== null
      );

    return treeData;
  }, [
    directoryData,
    inputNodes,
    dataSourceType,
    createParentNode,
    getInputNode,
    enrichTreeNodeForTreeSelectWithContext
  ]);
  // 使用自定义Hook管理编辑状态
  const {
    inputRef,
    inputValue,
    setInputValue,
    resetEditingState,
    startEditing,
    clearInputState
  } = useEditingState({
    getInputNodeType,
    deleteInputNode,
    directoryData,
    onDirectoryDataChange
  });

  // 使用自定义Hook管理UI状态
  const {
    hoverNode,
    expandedKeys,
    dropdownVisible,
    setHoverNode,
    setExpandedKeys,
    addExpandedKey,
    setDropdownVisible
  } = useTreeUIState();

  // 使用 API 操作 Hook
  const { handleCreateNode, handleUpdateNode, refreshData } = useApiOperations({
    activeTab,
    onDataRefresh,
    onDirectoryDataChange,
    cleanupInputNode,
    resetEditingState,
    clearInputState
  });

  // 编辑完成处理
  const onEditFinish = async (props: NodeProps) => {
    const { dataRef } = props;
    if (!dataRef) return;

    const fileName = inputValue.trim();
    const inputType = getInputNodeType(dataRef);

    // 如果输入为空，删除该节点
    if (!fileName) {
      Message.error('文件名不能为空');
      clearInputState(dataRef);
      return;
    }

    // 验证文件名
    const validateResult = validateName(fileName);
    if (!validateResult.isValid && validateResult.errorMessage) {
      Message.error(validateResult.errorMessage);
      return;
    }

    if (dataRef?.isNew) {
      // 新建节点
      const success = await handleCreateNode(
        dataRef.type_name || '',
        fileName,
        dataRef,
        inputType
      );
      if (!success) {
        return;
      }
    } else {
      // 编辑现有节点
      const success = await handleUpdateNode(fileName, dataRef);
      if (!success) {
        return;
      }
    }

    // 输入节点需要特殊处理刷新逻辑
    if (inputType) {
      // 对于输入节点，刷新数据并清理输入状态
      await refreshData();
    } else {
      // 普通节点使用原有的刷新逻辑
      await refreshData();
    }
  };

  // 生成新的目录名称
  const generateName = useCallback(
    (typeText?: string) => {
      const baseName = `${typeText || '目录'}`;
      const name = `${baseName}_${Date.now()}`;
      return name;
    },
    [activeTab]
  );

  const genereteInputNode = useCallback((name: string, node?: NodeProps) => {
    // 确定新节点的类型
    let nodeTypeName: TreeNodeData['type_name'] = NODE_TYPES.CATALOG;

    if (node?.dataRef) {
      const childType = getChildTypeName(node.dataRef.type_name);
      if (childType) {
        nodeTypeName = childType as TreeNodeData['type_name'];
      } else {
        nodeTypeName = node.dataRef.type_name || NODE_TYPES.CATALOG;
      }
    }

    const newNode: TreeNodeData = {
      id: `${nodeTypeName}-${Date.now()}`,
      key: `${nodeTypeName}-${Date.now()}`,
      name: name,
      value: `${nodeTypeName}-${Date.now()}`,
      label: name,
      title: name,
      type_name: nodeTypeName,
      level: node ? (node.dataRef?.level || 0) + 1 : 0,
      isExpanded: false,
      hasChildren: false,
      isLastLeaf: node ? true : false,
      showInput: true,
      isNew: true
    };
    if (node && node.dataRef) {
      const config = getNodeTypeConfig(node.dataRef.type_name || '');
      if (config) {
        // 从key中提取父节点ID
        const key = node.dataRef?.key || node.dataRef?.id;
        if (typeof key === 'string' && key.includes(config.suffix)) {
          newNode.parentId = Number(key.replace(config.suffix, ''));
        } else {
          newNode.parentId = node.dataRef?.id;
        }
      } else {
        newNode.parentId = node.dataRef?.id;
      }
    } else {
      newNode.children = [];
    }
    return newNode;
  }, []);

  // 添加根级目录
  const onCatalogAdd = () => {
    const name = `源目录_${Date.now()}`;
    const newNode = genereteInputNode(name);
    setInputNode('catalog', newNode.key, newNode);

    // 更新目录数据，将新节点添加到开头
    onDirectoryDataChange([newNode, ...directoryData]);

    // 设置输入状态并开始编辑
    startEditing(name);
  };

  // 添加子节点
  const addSubItem = (node: NodeProps) => {
    const { dataRef } = node;
    if (!dataRef) return;

    // 获取父节点类型配置
    const parentType = dataRef.type_name || '';
    const parentConfig = getNodeTypeConfig(parentType);

    // 生成新节点名称
    const newName = generateName(parentConfig?.label || '目录');

    // 创建新的输入节点
    const newInputNode = genereteInputNode(newName, node);

    // 判断是否为输入节点类型（db_parent, datasource_parent, metadata_parent）
    const isInputNodeType = Boolean(parentConfig);

    if (isInputNodeType) {
      setInputNode(parentConfig.key, dataRef.id, newInputNode);
    } else {
      // 普通节点（catalog）：需要更新 directoryData
      const updateDirectoryData = (data: TreeNodeData[]): TreeNodeData[] => {
        return data.map((item) => {
          // 通过 ID 匹配目标节点
          if (String(item.id) === String(dataRef.id)) {
            return {
              ...item,
              children: [newInputNode, ...(item.children || [])],
              isExpanded: true
            };
          }
          // 递归处理子节点
          if (item.children && Array.isArray(item.children)) {
            return {
              ...item,
              children: updateDirectoryData(item.children)
            };
          }
          return item;
        });
      };
      const updatedData = updateDirectoryData(directoryData);
      onDirectoryDataChange(updatedData);
    }

    // 获取父节点在树中的路径 key（用于展开）
    // 优先从 node 中获取 TreeSelect 生成的路径 key，如果没有则通过 findPathKeyById 查找
    // node.key 是 TreeSelect 内部使用的路径形式的 key（如 "123/db_parent-123"）
    // dataRef.key 可能是原始 key（如 "db_parent-123"），不匹配 TreeSelect 的路径 key
    const parentPathKey =
      (node as any)?.key || findPathKeyById(processedDirectoryData, dataRef.id);
    if (parentPathKey) {
      addExpandedKey(String(parentPathKey));
    }

    // 延迟开始编辑，确保 DOM 更新完成
    setTimeout(() => {
      startEditing(newName);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.dom?.select();
      }
    }, 200);
  };

  // 渲染标题文本
  const renderTitleText = (props: NodeProps) => {
    const { dataRef, title } = props;
    const TitleText = title;
    const getTooltipContent = (node: any, fallbackTitle: any) => {
      const nodeData = node?.dataRef || node;
      if (hasDataBaseNode(nodeData, selectedKeys)) {
        return '该目录已存在数据库，请新建或选择其他目录';
      }
      if (hasMetadataBound(nodeData, selectedKeys)) {
        return '该目录已存在元数据，请新建或选择其他目录';
      }
      if (!subLeafKeys[node?.type]) {
        return fallbackTitle;
      }
      return '';
    };
    return (
      <Tooltip color="white" content={getTooltipContent(dataRef, title)}>
        <div
          className={`overflow-hidden  text-ellipsis whitespace-nowrap ${dataRef?.isLastLeaf ? 'last-leaf-text' : ''} ${dataRef?.type === CatalogTypeEnum.table ? 'no-operation' : ''} ${dataRef?.type === CatalogTypeEnum.catalog ? 'catalog-title-text' : ''}`}
          // style={{ maxWidth: '150px' }}
        >
          {TitleText}
        </div>
      </Tooltip>
    );
  };

  // 渲染树节点标题
  const renderTitle = (props: NodeProps) => {
    const { dataRef } = props;

    // 判断是否有子节点：优先使用 hasChildren 属性，否则检查 children 数组
    const hasChildren =
      dataRef &&
      (dataRef.hasChildren === true ||
        (Array.isArray(dataRef.children) && dataRef.children.length > 0));

    // 动态图标：有子节点不显示图标（使用默认文件夹图标），否则根据类型显示对应图标
    let icon: React.ReactNode = null;
    if (!hasChildren && !dataRef?.showInput) {
      const typeName = dataRef?.type_name;
      if (
        typeName === NODE_TYPES.VOLUME ||
        typeName === NODE_TYPES.VOLUME_ITEM
      ) {
        icon = (
          <IconStorage style={{ marginRight: 8, width: 18, height: 18 }} />
        );
      } else if (typeName === NODE_TYPES.METADATA) {
        icon = (
          <YuanShujuIcon style={{ marginRight: 4, width: 24, height: 24 }} />
        );
      } else if (
        typeName === NODE_TYPES.DB ||
        typeName === NODE_TYPES.DB_ITEM ||
        typeName === NODE_TYPES.DATASOURCE_ITEM
      ) {
        icon = (
          <IconArchive style={{ marginRight: 8, width: 18, height: 18 }} />
        );
      }
    }

    return (
      <div
        className="flex items-center overflow-hidden"
        onMouseEnter={() => setHoverNode(dataRef as TreeNodeData)}
        onClick={(e) => {
          // 如果正在显示输入框，阻止事件冒泡，防止触发树节点的选择事件
          if (dataRef?.showInput) {
            e.stopPropagation();
          }
        }}
      >
        {dataRef?.showInput ? (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(value) => {
              setInputValue(value);
            }}
            onClick={(e) => {
              // 阻止事件冒泡，防止触发树节点的选择事件
              e.stopPropagation();
            }}
            onFocus={(e) => {
              // 阻止事件冒泡，防止触发树节点的选择事件
              e.stopPropagation();
            }}
            onBlur={() => {
              onEditFinish(props);
            }}
            onPressEnter={() => {
              onEditFinish(props);
            }}
            autoFocus={dataRef?.isNew}
            maxLength={255}
            className={`h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))] ${dataRef?.isLastLeaf ? 'last-leaf-input' : ''}`}
          />
        ) : (
          <div className="flex items-center">
            {icon}
            {renderTitleText(props)}
          </div>
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
    // 只有父节点类型才能添加子节点
    const canAddChildren = isParentNodeType(dataRef?.type_name);

    return (
      !dataRef?.showInput &&
      isCurrentNodeHovered && (
        <div
          className={'flex h-[35px] items-center justify-between'}
          style={{}}
        >
          {/* 只在"数据库"或"数据卷"父节点显示新建按钮，只在悬浮时显示 */}
          {canAddChildren && (
            <Tooltip color="white" content="新建">
              <div
                className="flex items-center opacity-100 transition-opacity duration-200"
                style={{ color: '#2563EB' }}
                onClick={() => addSubItem(node)}
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

  // processedDirectoryData 已经包含了 TreeSelect 需要的所有属性，直接使用
  const treeData = processedDirectoryData;

  // 获取节点标题的统一函数
  const getNodeTitle = useCallback((node: any): string => {
    return (
      node.props?.title ||
      node.title ||
      node.dataRef?.name ||
      node.dataRef?.title ||
      ''
    );
  }, []);

  // TreeSelect 的过滤函数
  const filterTreeNode = useCallback(
    (inputText: string, node: any) => {
      if (!inputText) return true;

      const searchValue = inputText.toLowerCase();
      const nodeTitle = getNodeTitle(node);

      // 如果节点标题匹配，返回 true
      if (nodeTitle.toLowerCase().includes(searchValue)) {
        return true;
      }

      // 递归检查子节点是否匹配
      const checkChildren = (children: any[]): boolean => {
        if (!children || !Array.isArray(children)) return false;

        return children.some((child: any) => {
          const childTitle = getNodeTitle(child);
          if (childTitle.toLowerCase().includes(searchValue)) {
            return true;
          }
          // 递归检查子节点的子节点
          if (child.children && Array.isArray(child.children)) {
            return checkChildren(child.children);
          }
          return false;
        });
      };

      // 检查子节点
      if (node.children && Array.isArray(node.children)) {
        return checkChildren(node.children);
      }

      return false;
    },
    [getNodeTitle]
  );

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

  // 处理 TreeSelect 的选择变化
  const handleTreeSelectChange = (val: string | string[], extra: any) => {
    if (onChange) {
      onChange(val);
    }

    if (!val) {
      // 清空时也清空选择
      onSelect?.([], {
        selected: false,
        selectedNodes: [],
        node: {} as NodeInstance,
        e: {} as Event
      });
      onPathChange?.('', undefined, undefined);
    } else {
      const nodeData = extra?.trigger;

      if (nodeData) {
        // 调用回调，传递原始的 id
        onSelect?.([nodeData.id], {
          selected: true,
          selectedNodes: [],
          node: {} as NodeInstance,
          e: {} as Event
        });
        onPathChange?.(nodeData.label, nodeData.id, nodeData);
      }
    }
  };

  // 将基于 id 的 selectedKeys 转换为路径形式的 key（用于 TreeSelect 内部）
  const selectedPathKeys = useMemo(() => {
    if (!selectedKeys || selectedKeys.length === 0) {
      return [];
    }

    return convertSelectedKeysToPathKeys(selectedKeys, treeData);
  }, [selectedKeys, treeData]);

  // 从路径 key 中提取所有父路径
  // 例如: "a/b/c" -> ["a", "a/b", "a/b/c"]
  const getAllParentPaths = useCallback((pathKey: string): string[] => {
    if (!pathKey) return [];
    const parts = pathKey.split('/');
    const paths: string[] = [];
    for (let i = 1; i <= parts.length; i++) {
      paths.push(parts.slice(0, i).join('/'));
    }
    return paths;
  }, []);

  // 使用 ref 跟踪下拉框的打开状态，只在首次打开时自动展开
  const prevDropdownVisibleRef = useRef(false);

  // 当下拉框打开时，自动展开选中节点的所有父节点（仅在首次打开时）
  useEffect(() => {
    // 只在从关闭状态变为打开状态时执行自动展开
    if (
      dropdownVisible &&
      !prevDropdownVisibleRef.current &&
      selectedPathKeys.length > 0
    ) {
      // 获取所有需要展开的路径（包括选中节点及其所有父节点）
      const pathsToExpand = selectedPathKeys.reduce(
        (acc: string[], pathKey) => {
          const parentPaths = getAllParentPaths(pathKey);
          return [...acc, ...parentPaths];
        },
        []
      );

      // 去重并更新展开的 keys
      const uniquePaths = Array.from(new Set(pathsToExpand));
      setExpandedKeys((prev) => {
        const merged = [...prev, ...uniquePaths];
        return Array.from(new Set(merged));
      });
    }
    // 更新 ref 的值
    prevDropdownVisibleRef.current = dropdownVisible;
  }, [dropdownVisible, selectedPathKeys, getAllParentPaths, setExpandedKeys]);

  // 使用 TreeSelect
  return (
    <TreeSelect
      className={classNames(styles['component-tree'], className)}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      filterTreeNode={filterTreeNode}
      treeData={treeData}
      value={value}
      onChange={handleTreeSelectChange}
      popupVisible={dropdownVisible}
      onVisibleChange={(visible) => {
        setDropdownVisible(visible);
      }}
      dropdownMenuStyle={{
        maxHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '12px 12px 0 12px'
      }}
      // 定制回显完整路径
      renderFormat={(nodeProps: any, _value: any) => {
        return nodeProps?.label ?? '';
      }}
      treeProps={{
        showLine: true,
        blockNode: true,
        selectedKeys: selectedPathKeys, // 使用转换后的路径 key
        expandedKeys: expandedKeys,
        onExpand: (keys) => setExpandedKeys(keys),
        renderTitle: renderTitle,
        icons: (node) => {
          return {
            switcherIcon:
              (node as any)?.iconType === 'switcher' ? <IconCaretDown /> : null
          };
        },
        // onSelect: handleEnhancedSelect,
        renderExtra: renderExtra,
        className: 'ModelTree'
      }}
      dropdownRender={(menu) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 300,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              minHeight: 0
            }}
          >
            {menu}
          </div>
          {showAddTree && <AddTreeComponent />}
        </div>
      )}
    />
  );
};

export default ComponentTree;
