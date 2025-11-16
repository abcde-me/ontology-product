import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Tree, Input, Tooltip, Message } from '@arco-design/web-react';
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
import {
  addCatalog,
  addVolume,
  deleteVolume,
  renameCatalog,
  addDb,
  addMetaData
} from '@/api/dataCatalog';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import {
  CatalogTypeEnum,
  subLeafKeys,
  RootTypeEnum
} from '../../dataCatalog/consts';
import { validateName } from '@/utils/valiate';
import './index.module.scss';

const TreeNode = Tree.Node;

// 树节点数据类型定义
interface TreeNodeData {
  id: string | number;
  key: string;
  name: string;
  value: string;
  label: string;
  title: string;
  type_name?:
    | 'volume'
    | 'db_item'
    | 'volume_item'
    | 'catalog'
    | 'db'
    | 'db_parent'
    | 'datasource_parent'
    | 'datasource_item'
    | 'metadata_parent'
    | 'metadata';
  type?: number;
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isLastLeaf?: boolean;
  showInput?: boolean;
  isNew?: boolean;
  parentId?: string | number;
  children?: TreeNodeData[];
  perms?: string[];
}

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
  selectedKeys = []
}) => {
  // 数据库节点下的输入框状态
  const [dbInputNodes, setDbInputNodes] = useState<Map<string, TreeNodeData>>(
    new Map()
  );

  // 数据卷节点下的输入框状态
  const [datasourceInputNodes, setDatasourceInputNodes] = useState<
    Map<string, TreeNodeData>
  >(new Map());

  // 元数据节点下的输入框状态
  const [metadataInputNodes, setMetadataInputNodes] = useState<
    Map<string, TreeNodeData>
  >(new Map());

  // 处理数据：为每个目录添加"数据库"子节点，为本地文件类型添加"数据卷"子节点
  const processedDirectoryData = React.useMemo(() => {
    return directoryData.map((item) => {
      if (item.type_name === 'catalog') {
        const childNodes: TreeNodeData[] = [];

        // 检查是否已经有"数据库"子节点
        let hasDbNode = false;
        if (item.children) {
          if (Array.isArray(item.children)) {
            hasDbNode = item.children.some(
              (child) => child.name === '数据库' || child.title === '数据库'
            );
          }
        }

        // 为目录节点添加"数据库"子节点
        if (
          !hasDbNode &&
          dataSourceType !== 'local' &&
          dataSourceType !== 'hdfs' &&
          dataSourceType !== 's3'
        ) {
          const dbNodeKey = `${item.id}-db`;
          const dbInputNode = dbInputNodes.get(dbNodeKey);

          // 获取数据库类型的子节点
          let dbNodeChildren: TreeNodeData[] = [];
          if (item.children) {
            // 如果children是数组形式，过滤数据库相关的数据
            if (Array.isArray(item.children)) {
              dbNodeChildren = item.children.filter(
                (child) =>
                  child.type_name === 'db' || child.type_name === 'db_item'
              );
            } else if (
              typeof item.children === 'object' &&
              (item.children as any).db
            ) {
              dbNodeChildren = (item.children as any).db || [];
            }
          }

          // 如果有数据库输入节点，添加到子节点开头
          if (dbInputNode) {
            dbNodeChildren = [dbInputNode, ...dbNodeChildren];
          }

          const dbNode: TreeNodeData = {
            id: Number(`${item.id}`),
            key: dbNodeKey,
            name: '数据库',
            value: dbNodeKey,
            label: '数据库',
            title: '数据库',
            type_name: 'db_parent',
            level: (item.level || 0) + 1,
            isExpanded: dbInputNode ? true : false, // 如果有输入节点，展开数据库节点
            hasChildren: true,
            isLastLeaf: false,
            showInput: false,
            isNew: false,
            parentId: item.id,
            children: dbNodeChildren
          };

          childNodes.push(dbNode);
        }

        // 为数据库类型添加"元数据"子节点
        if (dataSourceType === 'db') {
          let hasMetaDataNode = false;
          if (item.children) {
            if (Array.isArray(item.children)) {
              hasMetaDataNode = item.children.some(
                (child) =>
                  child.name === '元数据' ||
                  child.title === '元数据' ||
                  child.type_name === 'metadata_parent'
              );
            }
          }

          // 不存在元数据父节点时也渲染一个，便于右侧“新建”出现；并合并处于输入状态的元数据子节点
          if (!hasMetaDataNode) {
            let metaDataChildren: TreeNodeData[] = [];
            if (item.children) {
              if (Array.isArray(item.children)) {
                metaDataChildren = item.children
                  .filter(
                    (child) =>
                      child.type_name === 'metadata' ||
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
              } else if (
                typeof item.children === 'object' &&
                (item.children as any).metadata
              ) {
                const metaArray = (item.children as any).metadata;
                if (Array.isArray(metaArray)) {
                  metaDataChildren = metaArray.map((metaItem: any) => ({
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
                    extends: metaItem.extends,
                    isLastLeaf: true,
                    parentId: String(item.id),
                    perms: metaItem.perms
                  }));
                }
              }
            }

            const metaNodeKey = `${item.id}-metadata`;
            const metaInputNode = metadataInputNodes.get(metaNodeKey);
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
              type_name: 'metadata_parent',
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

        // 为本地文件类型添加"数据卷"子节点
        if (
          dataSourceType === 'local' ||
          dataSourceType === 'hdfs' ||
          dataSourceType === 's3'
        ) {
          let hasDataSourceNode = false;
          if (item.children) {
            if (Array.isArray(item.children)) {
              hasDataSourceNode = item.children.some(
                (child) => child.name === '数据卷' || child.title === '数据卷'
              );
            }
          }

          if (!hasDataSourceNode) {
            const datasourceNodeKey = `${item.id}-datasource`;
            const datasourceInputNode =
              datasourceInputNodes.get(datasourceNodeKey);

            // 获取数据卷类型的子节点
            let datasourceNodeChildren: TreeNodeData[] = [];
            if (item.children) {
              // 如果children是数组形式，过滤数据卷相关的数据
              if (Array.isArray(item.children)) {
                datasourceNodeChildren = item.children.filter(
                  (child) =>
                    child.type_name === 'volume' ||
                    child.type_name === 'volume_item'
                );
              }
              // 如果children是对象形式，从children.volume中获取数据
              else if (
                typeof item.children === 'object' &&
                (item.children as any).volume
              ) {
                datasourceNodeChildren = (item.children as any).volume || [];
              }
            }

            // 如果有数据卷输入节点，添加到子节点开头
            if (datasourceInputNode) {
              datasourceNodeChildren = [
                datasourceInputNode,
                ...datasourceNodeChildren
              ];
            }

            const datasourceNode: TreeNodeData = {
              id: Number(`${item.id}000`),
              key: datasourceNodeKey,
              name: '数据卷',
              value: datasourceNodeKey,
              label: '数据卷',
              title: '数据卷',
              type_name: 'datasource_parent',
              level: (item.level || 0) + 1,
              isExpanded: datasourceInputNode ? true : false, // 如果有输入节点，展开数据卷节点
              hasChildren: true,
              isLastLeaf: false,
              showInput: false,
              isNew: false,
              parentId: item.id,
              children: datasourceNodeChildren
            };

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
            hasChildren: item.children && item.children.length > 0
          };
        }
      }

      return item;
    });
  }, [
    directoryData,
    dbInputNodes,
    datasourceInputNodes,
    metadataInputNodes,
    dataSourceType
  ]);
  // 状态管理
  const inputRef = useRef<RefInputType>(null);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hoverNode, setHoverNode] = useState<TreeNodeData | null>(null);
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

  // 编辑完成处理
  const onEditFinish = async (props: NodeProps) => {
    const { dataRef } = props;
    if (!dataRef) return;

    const fileName = inputValue.trim();

    // 检查是否是数据库节点下的输入框
    const isDbInput =
      dataRef.parentId && dbInputNodes.has(`${dataRef.parentId}-db`);

    // 检查是否是数据卷节点下的输入框
    const isDatasourceInput =
      dataRef.parentId &&
      datasourceInputNodes.has(`${dataRef.parentId}-datasource`);

    const isMetadataInput =
      dataRef.parentId &&
      metadataInputNodes.has(`${dataRef.parentId}-metadata`);

    // 如果输入为空，删除该节点
    if (!fileName) {
      if (isDbInput) {
        // 删除数据库输入节点
        const dbNodeKey = `${dataRef.parentId}-db`;
        const newDbInputNodes = new Map(dbInputNodes);
        newDbInputNodes.delete(dbNodeKey);
        setDbInputNodes(newDbInputNodes);
      } else if (isDatasourceInput) {
        // 删除数据卷输入节点
        const datasourceNodeKey = `${dataRef.parentId}-datasource`;
        const newDatasourceInputNodes = new Map(datasourceInputNodes);
        newDatasourceInputNodes.delete(datasourceNodeKey);
        setDatasourceInputNodes(newDatasourceInputNodes);
      } else if (isMetadataInput) {
        // 删除元数据输入节点
        const metadataNodeKey = `${dataRef.parentId}-metadata`;
        const newMetadataInputNodes = new Map(metadataInputNodes);
        newMetadataInputNodes.delete(metadataNodeKey);
        setMetadataInputNodes(newMetadataInputNodes);
      } else {
        const updateNodeRecursively = (
          data: TreeNodeData[]
        ): TreeNodeData[] => {
          return data
            .map((item) => {
              if (item.id === dataRef.id) {
                return null;
              } else if (item.children && Array.isArray(item.children)) {
                const updatedChildren = updateNodeRecursively(
                  item.children
                ).filter((child): child is TreeNodeData => child !== null);
                return {
                  ...item,
                  children: updatedChildren
                };
              }
              return item;
            })
            .filter((item): item is TreeNodeData => item !== null);
        };

        const updatedData = updateNodeRecursively(directoryData);
        onDirectoryDataChange(updatedData);
      }
      setIsEditing(false);
      setInputValue('');
      return;
    }

    // 验证文件名
    const validateResult = validateName(fileName);
    if (!validateResult.isValid && validateResult.errorMessage) {
      Message.error(validateResult.errorMessage);
      return;
    }

    // 刷新数据的函数
    const updateFn = async () => {
      if (onDataRefresh) {
        const newTreeData = await onDataRefresh();
        onDirectoryDataChange(newTreeData);
      }
      setIsEditing(false);
      setInputValue('');
    };

    const root_type = RootTypeEnum[activeTab];
    let res: Partial<ApiRes<any>> = {};

    if (dataRef?.isNew) {
      console.log('看一下新建节点的类型:', dataRef?.type_name);
      // 新建节点
      switch (dataRef?.type_name) {
        case 'catalog':
          res = await addCatalog({ name: fileName, root_type: root_type });
          if (res.status !== 200) {
            Message.error(res?.message ?? '新增目录失败');
            return;
          }
          break;
        case 'db_item':
          const parentId = dataRef.parentId;
          res = await addDb({
            name: fileName,
            parent_id: parentId
          });
          if (res.status !== 200) {
            Message.error(res?.message ?? '新建数据库失败');
            return;
          }

          // 如果是数据库输入框，清理状态
          if (isDbInput) {
            const dbNodeKey = `${dataRef.parentId}-db`;
            const newDbInputNodes = new Map(dbInputNodes);
            newDbInputNodes.delete(dbNodeKey);
            setDbInputNodes(newDbInputNodes);
          }
          break;
        case 'datasource_item':
          const datasourceParentId = dataRef.parentId;
          res = await addVolume({
            name: fileName,
            parent_id: datasourceParentId,
            root_type: root_type
          });
          if (res.status !== 200) {
            Message.error(res?.message ?? '新建数据卷失败');
            return;
          }

          // 如果是数据卷输入框，清理状态
          if (isDatasourceInput) {
            const datasourceNodeKey = `${dataRef.parentId}-datasource`;
            const newDatasourceInputNodes = new Map(datasourceInputNodes);
            newDatasourceInputNodes.delete(datasourceNodeKey);
            setDatasourceInputNodes(newDatasourceInputNodes);
          }
          break;
        case 'metadata':
          const metadataParentId = dataRef.parentId;
          res = await addMetaData({
            name: fileName,
            parent_id: metadataParentId
          });
          if (res.status !== 200) {
            Message.error(res?.message ?? '新建元数据失败');
            return;
          }

          // 如果是元数据输入框，清理状态
          if (isMetadataInput) {
            const metadataNodeKey = `${dataRef.parentId}-metadata`;
            const newMetadataInputNodes = new Map(metadataInputNodes);
            newMetadataInputNodes.delete(metadataNodeKey);
            setMetadataInputNodes(newMetadataInputNodes);
          }
          break;
        default:
          break;
      }
    } else {
      // 编辑现有节点
      if (fileName !== dataRef?.name) {
        res = await renameCatalog(dataRef?.id, {
          new_name: fileName,
          root_type: root_type,
          type: dataRef?.type,
          parent_id: dataRef?.parentId
        });
        if (res.status !== 200) {
          Message.error(res?.message ?? '重命名目录失败');
          return;
        }
      }
    }

    // 数据库输入框和数据卷输入框需要特殊处理刷新逻辑
    if (isDbInput || isDatasourceInput || isMetadataInput) {
      // 对于数据库输入框和数据卷输入框，刷新数据并清理输入状态
      if (onDataRefresh) {
        const newTreeData = await onDataRefresh();
        onDirectoryDataChange(newTreeData);
      }
      setIsEditing(false);
      setInputValue('');
    } else {
      // 普通节点使用原有的刷新逻辑
      await updateFn();
    }
  };

  // 构建路径的工具函数
  const buildPathFromTreeData = (
    data: TreeNodeData[],
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
    const selectedNode = extra.node;
    const nodeData = selectedNode.props.dataRef as TreeNodeData;

    if (
      nodeData?.type_name === 'catalog' ||
      nodeData?.type_name === 'db_parent' ||
      nodeData?.type_name === 'datasource_parent' ||
      nodeData?.type_name === 'metadata_parent'
    ) {
      console.log('数据库节点或数据卷节点或目录节点不可选中');
      return; // 阻止选中数据库节点和数据卷节点或目录节点
    }

    // 调用原始的onSelect回调
    onSelect?.(selectedKeys, extra);

    // 如果有路径变化回调，构建并传递路径和节点ID
    if (onPathChange && selectedKeys.length > 0) {
      // 构建完整路径
      const pathArray = buildPathFromTreeData(
        processedDirectoryData,
        selectedKeys[0]
      );
      const fullPath = pathArray ? pathArray.join('/') : nodeData?.name || '';

      // 传递路径和节点ID
      onPathChange(fullPath, nodeData?.id, nodeData);
    }
  };

  // 生成新的目录名称
  const generateName = useCallback(
    (data: TreeNodeData[], typeText?: string) => {
      const baseName = `${typeText || '目录'}`;
      // const set = new Set(
      //   data.map((item) => item.name || item.label || item.title)
      // );
      // let x = data.length + 1;
      const name = `${baseName}_${Date.now()}`;

      // while (set.has(name)) {
      //   x++;
      //   name = `${baseName}${x}`;
      // }

      return name;
    },
    [activeTab]
  );

  const genereteInputNode = useCallback((name: string, node?: NodeProps) => {
    // 确定新节点的类型
    let nodeTypeName: TreeNodeData['type_name'] = 'catalog';

    if (node?.dataRef) {
      if (node.dataRef.title === '数据库' || node.dataRef.name === '数据库') {
        nodeTypeName = 'db_item';
      } else if (
        node.dataRef.title === '数据卷' ||
        node.dataRef.name === '数据卷'
      ) {
        nodeTypeName = 'datasource_item';
      } else if (
        node.dataRef.title === '元数据' ||
        node.dataRef.name === '元数据'
      ) {
        nodeTypeName = 'metadata';
      } else {
        nodeTypeName = node.dataRef.type_name || 'catalog';
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
    if (node) {
      if (node.dataRef?.type_name === 'db_parent') {
        const key = node.dataRef?.key || node.dataRef?.id;
        if (typeof key === 'string' && key.includes('-db')) {
          newNode.parentId = Number(key.replace('-db', ''));
        } else {
          newNode.parentId = node.dataRef?.id;
        }
      } else if (node.dataRef?.type_name === 'datasource_parent') {
        // 数据卷节点的key格式是 "${item.id}-datasource"，提取纯数字部分
        const key = node.dataRef?.key || node.dataRef?.id;
        if (typeof key === 'string' && key.includes('-datasource')) {
          newNode.parentId = Number(key.replace('-datasource', ''));
        } else {
          newNode.parentId = node.dataRef?.id;
        }
      } else if (node.dataRef?.type_name === 'metadata_parent') {
        // 元数据节点：比较key或者从key中提取的ID
        const key = node.dataRef?.key || node.dataRef?.id;
        if (typeof key === 'string' && key.includes('-metadata')) {
          newNode.parentId = Number(key.replace('-metadata', ''));
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
    // const name = generateName(directoryData);
    const name = `源目录_${Date.now()}`;
    // const name = `源目录${directoryData?.length || '1'}`;
    const newNode = genereteInputNode(name);

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
  const addSubItem = (node: NodeProps) => {
    const { dataRef } = node;
    const existingChildren: TreeNodeData[] = (dataRef?.children || []).map(
      (child) => ({
        id: child.id || child.key || '',
        key: child.key || '',
        name: child.name || child.title || child.label || '',
        value: child.value || child.key || '',
        label: child.label || child.title || child.name || '',
        title: child.title || child.name || child.label || '',
        type_name: child.type_name,
        level: child.level,
        isExpanded: child.isExpanded,
        hasChildren: child.hasChildren,
        isLastLeaf: child.isLastLeaf,
        showInput: child.showInput,
        isNew: child.isNew,
        parentId: child.parentId,
        children: child.children as TreeNodeData[],
        perms: child.perms
      })
    );
    let typeText = '';
    if (dataRef?.title === '数据库' || dataRef?.name === '数据库') {
      typeText = '数据库';
    } else if (dataRef?.title === '数据卷' || dataRef?.name === '数据卷') {
      typeText = '数据卷';
    } else if (dataRef?.title === '元数据' || dataRef?.name === '元数据') {
      typeText = '元数据';
    }
    const newName = generateName(existingChildren, typeText);
    // const newName = '默认名称';

    // 创建新的输入节点
    const newInputNode = genereteInputNode(newName, node);

    // 递归更新 processedDirectoryData，在指定节点下添加新的子节点
    const updateDirectoryData = (data: TreeNodeData[]): TreeNodeData[] => {
      return data.map((item) => {
        // 对于数据库节点和数据卷节点，需要特殊处理ID匹配逻辑
        let isTargetNode = false;
        if (dataRef?.type_name === 'db_parent') {
          // 数据库节点：比较key或者从key中提取的ID
          const targetKey = dataRef?.key || dataRef?.id;
          isTargetNode =
            item.key === targetKey ||
            (typeof targetKey === 'string' &&
              targetKey.includes('-db') &&
              item.id === Number(targetKey.replace('-db', '')));
        } else if (dataRef?.type_name === 'datasource_parent') {
          // 数据卷节点：比较key或者从key中提取的ID
          const targetKey = dataRef?.key || dataRef?.id;
          isTargetNode =
            item.key === targetKey ||
            (typeof targetKey === 'string' &&
              targetKey.includes('-datasource') &&
              item.id === Number(targetKey.replace('-datasource', '')));
        } else if (dataRef?.type_name === 'metadata_parent') {
          // 元数据节点：比较key或者从key中提取的ID
          const targetKey = dataRef?.key || dataRef?.id;
          isTargetNode =
            item.key === targetKey ||
            (typeof targetKey === 'string' &&
              targetKey.includes('-metadata') &&
              item.id === Number(targetKey.replace('-metadata', '')));
        } else {
          // 普通节点：直接比较ID
          isTargetNode = item.id === dataRef?.id;
        }

        if (isTargetNode) {
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

    if (dataRef?.type_name === 'db_parent') {
      // 数据库节点下的添加：添加到dbInputNodes状态中
      const dbNodeKey = dataRef?.key || `${dataRef?.id}-db`;
      const newDbInputNodes = new Map(dbInputNodes);
      newDbInputNodes.set(dbNodeKey, newInputNode);
      setDbInputNodes(newDbInputNodes);

      // 确保数据库节点展开
      console.log('新建的时候展开的节点:', expandedKeys, dbNodeKey);
      setExpandedKeys((prev) =>
        prev.includes(dbNodeKey) ? prev : [...prev, dbNodeKey]
      );

      console.log('数据库节点添加子项，dbNodeKey:', dbNodeKey);
    } else if (dataRef?.type_name === 'datasource_parent') {
      // 数据卷节点下的添加：添加到datasourceInputNodes状态中
      const datasourceNodeKey = dataRef?.key || `${dataRef?.id}-datasource`;
      const newDatasourceInputNodes = new Map(datasourceInputNodes);
      newDatasourceInputNodes.set(datasourceNodeKey, newInputNode);
      setDatasourceInputNodes(newDatasourceInputNodes);

      // 确保数据卷节点展开
      console.log('新建的时候展开的节点:', expandedKeys, datasourceNodeKey);
      setExpandedKeys((prev) =>
        prev.includes(datasourceNodeKey) ? prev : [...prev, datasourceNodeKey]
      );

      console.log('数据卷节点添加子项，datasourceNodeKey:', datasourceNodeKey);
    } else if (dataRef?.type_name === 'metadata_parent') {
      // 元数据节点下的添加：添加到metadataInputNodes状态中
      const metadataNodeKey = dataRef?.key || `${dataRef?.id}-metadata`;
      const newMetadataInputNodes = new Map(metadataInputNodes);
      newMetadataInputNodes.set(metadataNodeKey, newInputNode);
      setMetadataInputNodes(newMetadataInputNodes);

      // 确保元数据节点展开
      setExpandedKeys((prev) =>
        prev.includes(metadataNodeKey) ? prev : [...prev, metadataNodeKey]
      );

      console.log('元数据节点添加子项，metadataNodeKey:', metadataNodeKey);
    } else {
      const updatedData = updateDirectoryData(processedDirectoryData);
      const originalFormatData = updatedData.map((item) => {
        if (
          item.children &&
          item.children.length === 1 &&
          item.children[0].name === '数据库'
        ) {
          return {
            ...item,
            children: item.children[0].children
          };
        }
        return item;
      });
      onDirectoryDataChange(originalFormatData);
    }

    // 确保父节点展开 - 添加到expandedKeys中
    const parentKey = dataRef?.id?.toString();
    if (parentKey) {
      setExpandedKeys((prev) =>
        prev.includes(parentKey) ? prev : [...prev, parentKey]
      );
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
    const getTooltipContent = (node: any, fallbackTitle: any) => {
      if (hasDataBaseNode(node)) {
        return '该目录已存在数据库，请新建或选择其他目录';
      }
      if (hasMetadataBound(node)) {
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
    return (
      <div
        className="flex items-center overflow-hidden"
        onMouseEnter={() => setHoverNode(dataRef as TreeNodeData)}
        // style={{
        //   marginLeft:
        //     dataRef?.type_name === 'db' ||
        //       dataRef?.type_name === 'db_item' ||
        //       dataRef?.type_name === 'metadata' ||
        //       dataRef?.type_name === 'volume' ||
        //       dataRef?.type_name === 'volume_item' ||
        //       dataRef?.type_name === 'datasource_item'
        //       ? '-20px'
        //       : '0px'
        // }}
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
    // 只有标题为"数据库"或"数据卷"的节点才能添加子节点
    const canAddChildren =
      dataRef?.title === '数据库' ||
      dataRef?.name === '数据库' ||
      dataRef?.title === '数据卷' ||
      dataRef?.name === '数据卷' ||
      dataRef?.title === '元数据' ||
      dataRef?.name === '元数据';

    return (
      !dataRef?.showInput && (
        <div className={'flex items-center justify-between'} style={{}}>
          {/* 只在"数据库"或"数据卷"父节点显示新建按钮，只在悬浮时显示 */}
          {canAddChildren && isCurrentNodeHovered && (
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

  // 判断是否应该显示三角标
  const shouldShowSwitcherIcon = (node: any) => {
    const { dataRef } = node;
    // 如果是叶子节点，不显示三角标
    if (dataRef?.isLastLeaf) {
      console.log('Hiding switcher: isLastLeaf = true');
      return false;
    }
    if (
      dataRef?.type_name === 'db' ||
      dataRef?.type_name === 'db_item' ||
      dataRef?.type_name === 'volume' ||
      dataRef?.type_name === 'volume_item' ||
      dataRef?.type_name === 'datasource_item' ||
      dataRef?.type_name === 'metadata'
    ) {
      console.log(
        'Hiding switcher: type_name = db, db_item, volume, volume_item, or datasource_item'
      );
      return false;
    }
    if (
      !dataRef?.hasChildren &&
      (!dataRef?.children || dataRef?.children?.length === 0)
    ) {
      console.log('Hiding switcher: no children');
      return false;
    }
    // 其他情况显示三角标
    return true;
  };

  /**
   * 检查节点是否为数据库节点且包含数据库子项
   * @param item - 树节点数据，可以是 TreeNodeData 或 TreeDataType 类型
   * @returns 如果是包含子项的数据库节点返回 true，否则返回 false
   */
  const hasDataBaseNode = (
    item: TreeNodeData | TreeDataType | null | undefined
  ): boolean => {
    // 空值检查
    if (!item) {
      return false;
    }

    // 类型保护：确保节点有 type_name 属性
    const nodeData = item as TreeNodeData;
    if (nodeData.type_name !== 'db') {
      return false;
    }

    // 获取子节点数据
    const children = (item as any).children;
    if (!children) {
      return false;
    }

    // 检查是否有数据库子项
    // 支持两种数据结构：
    // 1. children.db_item 数组形式
    // 2. children 直接是数组形式
    const hasDbItems = Boolean(children.db_item?.length);
    const hasArrayChildren = Array.isArray(children) && children.length > 0;

    return hasDbItems || hasArrayChildren;
  };

  /**
   * 检查元数据节点是否已绑定元数据（db_name 与 table_name 均不为空）
   */
  const hasMetadataBound = (
    item: TreeNodeData | TreeDataType | null | undefined
  ): boolean => {
    if (!item) return false;
    const nodeData = item as TreeNodeData;
    if (nodeData.type_name !== 'metadata') return false;
    const ext = (nodeData as any)?.extends || (nodeData as any)?.extend;
    const dbName = ext?.db_name;
    const tableName = ext?.table_name;
    return Boolean(dbName) && Boolean(tableName);
  };

  // 生成树节点
  const generatorTreeNodes = (treeData: TreeDataType[]) => {
    if (!Array.isArray(treeData)) {
      console.warn('treeData不是数组:', treeData);
      return null;
    }
    const treeNodes = treeData
      ?.map?.((item) => {
        if (!item || !item.id) {
          return null;
        }
        const { children, id, ...rest } = item;
        const hasChildren =
          children && Array.isArray(children) && children.length > 0;

        return (
          <TreeNode
            key={id}
            {...rest}
            dataRef={item}
            title={item.name}
            disabled={hasDataBaseNode(item) || hasMetadataBound(item)}
            // selectable={!isDbNode}
          >
            {hasChildren ? generatorTreeNodes(children) : null}
          </TreeNode>
        );
      })
      .filter(Boolean); // 过滤掉null值
    return treeNodes;
  };

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
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          renderTitle={renderTitle}
          icons={(node) => ({
            switcherIcon: shouldShowSwitcherIcon(node) ? (
              <IconCaretDown />
            ) : (
              (node as any)?.type_name === 'volume' && (
                <IconStorage style={{ fontSize: '14px' }} />
              )
            )
          })}
          onSelect={handleEnhancedSelect}
          renderExtra={renderExtra}
          className="ModelTree"
        >
          {generatorTreeNodes(processedDirectoryData)}
        </Tree>
      </div>
      <AddTreeComponent />
    </div>
  );
};

export default ComponentTree;
