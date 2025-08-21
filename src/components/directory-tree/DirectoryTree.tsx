import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Message,
  Modal,
  Tooltip,
  Tree
} from '@arco-design/web-react';
import type {
  NodeInstance,
  NodeProps,
  TreeDataType
} from '@arco-design/web-react/es/Tree/interface';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconCopy,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import FolderIcon from '@/assets/python/folder.svg';
import FileIcon from '@/assets/python/file.svg';
import AddAfterIcon from '@/assets/python/add-after.svg';
import {
  CopyPythonItemRes,
  CreatePythonItemRes,
  PythonItemType,
  PythonListItem,
  RenamePythonItemRes
} from '@/types/pythonApi';
import EllipsisPopover from '../ellipsis-popover-com';
import MultiLevelPathNavigation from './MultiLevelPathNavigation';
import './DirectoryTree.scss';

// 原始数据接口
export type TreeNodeItem = Partial<PythonListItem> & {
  showInput?: boolean;
  isAdd?: boolean;
  children?: TreeNodeItem[];
};

export interface DirectoryTreeProps {
  data: TreeNodeItem[];
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onCreate?: (
    finalName: string,
    node?: NodeProps
  ) => Promise<CreatePythonItemRes | null>;
  onRename?: (
    newName: string,
    node: NodeProps
  ) => Promise<RenamePythonItemRes | null>;
  onCopy?: (
    newName: string,
    node: NodeProps
  ) => Promise<CopyPythonItemRes | null>;
  onDelete?: (node: NodeProps) => Promise<boolean>;
  onFolderClick?: (
    folderId: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onBackToParent?: (
    parentId?: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onSearch?: (
    path_id: string,
    searchValue: string
  ) => Promise<TreeNodeItem[]> | TreeNodeItem[];
  generateDefaultName?: (
    siblings: TreeDataType[],
    isFolder?: boolean
  ) => string;
  placeholder?: string;
  newButtonText?: string;
  // 数据格式化配置
  formatData?: (rawData: unknown[]) => TreeNodeItem[];
  // URL状态同步相关
  onUrlStateChange?: (state: {
    folderId?: string;
    fileId?: string;
    searchValue?: string;
  }) => void;
  initialUrlState?: {
    folderId?: string;
    fileId?: string;
    searchValue?: string;
  };
}

// type InnerNode = TreeDataType & {
//     dataRef?: any;
//     showInput?: boolean;
//     isAdd?: boolean;
// };

// interface NodeMeta {
//     id?: string | number;
//     name?: string;
//     type?: string;
//     [key: string]: any;
// }

// type NodeData = InnerNode & { dataRef?: NodeMeta };

const InputSearch = Input.Search;

function defaultNameGenerator(siblings: TreeDataType[], isFolder = true) {
  const base = isFolder ? '新建文件夹' : '新建PySpark';
  const set = new Set(
    siblings.map((s) => (typeof s.title === 'string' ? s.title : ''))
  );
  let i = siblings.length + 1;
  let name = `${base}${i}`;
  while (set.has(name)) {
    i += 1;
    name = `${base}${i}`;
  }
  return name;
}

export default function DirectoryTree(props: DirectoryTreeProps) {
  const {
    data = [],
    onSelect,
    onCreate,
    onRename,
    onCopy,
    onDelete,
    onFolderClick,
    onBackToParent,
    generateDefaultName = defaultNameGenerator,
    placeholder = '搜索当前文件夹',
    newButtonText = '新建',
    formatData,
    onUrlStateChange,
    initialUrlState
  } = props;

  const [treeData, setTreeData] = useState<TreeNodeItem[]>(data);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  // 下钻相关状态
  const [currentFolderId, setCurrentFolderId] = useState<string>('');
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  const [folderStack, setFolderStack] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // 搜索相关状态
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<TreeNodeItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const inputRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [defaultName, setDefaultName] = useState<string>('');

  // 格式化数据
  const formatTreeData = (inputData: unknown[]): TreeNodeItem[] => {
    if (Array.isArray(inputData) && inputData.length > 0) {
      return formatData ? formatData(inputData) : (inputData as TreeNodeItem[]);
    }
    return inputData as TreeNodeItem[];
  };

  // URL状态同步函数
  const syncUrlState = useCallback(() => {
    if (onUrlStateChange) {
      onUrlStateChange({
        folderId: currentFolderId || undefined,
        fileId: selectedKeys.length > 0 ? selectedKeys[0] : undefined,
        searchValue: searchValue || undefined
      });
    }
  }, [onUrlStateChange, currentFolderId, selectedKeys, searchValue]);

  // 当相关状态变化时同步到URL
  useEffect(() => {
    syncUrlState();
  }, [syncUrlState]);

  // 从URL初始化状态 - 只在组件挂载时执行一次
  useEffect(() => {
    if (initialUrlState && Object.keys(initialUrlState).length > 0) {
      const hasChanges =
        (initialUrlState.folderId &&
          initialUrlState.folderId !== currentFolderId) ||
        (initialUrlState.fileId &&
          !selectedKeys.includes(initialUrlState.fileId)) ||
        (initialUrlState.searchValue &&
          initialUrlState.searchValue !== searchValue);

      if (hasChanges) {
        if (initialUrlState.folderId) {
          setCurrentFolderId(initialUrlState.folderId);
          // 如果有文件夹ID，需要加载该文件夹的内容
          if (onFolderClick) {
            const result = onFolderClick(initialUrlState.folderId);
            if (result instanceof Promise) {
              result
                .then((newData) => {
                  const formattedData = formatTreeData(newData as any[]);
                  setTreeData(formattedData);
                })
                .catch((error) => {
                  console.error('Failed to load folder from URL:', error);
                });
            } else {
              // 直接返回数组的情况
              const formattedData = formatTreeData(result as any[]);
              setTreeData(formattedData);
            }
          }
        }
        if (initialUrlState.fileId) {
          setSelectedKeys([initialUrlState.fileId]);
        }
        if (initialUrlState.searchValue) {
          setSearchValue(initialUrlState.searchValue);
          // 如果有搜索词，触发搜索
          if (initialUrlState.searchValue.trim()) {
            handleSearch(initialUrlState.searchValue);
          }
        }
      }
    }
  }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    const formattedData = formatTreeData(data);
    console.log('formattedData', formattedData);
    setTreeData(formattedData);
  }, [data, formatData]);

  // 处理文件夹点击下钻
  const handleFolderClick = async (node: NodeInstance) => {
    // Arco Tree 会把节点对象挂到 node.props.dataRef，这里优先读 props.dataRef；
    // 如果业务层已将字段打平到节点顶层（如 formatData 中），也兼容直接读取 props
    const meta = node.props.dataRef;
    const hasChildren = Array.isArray(meta?.children) && meta?.children?.length;
    const isFolder = meta?.type === PythonItemType.Directory || hasChildren;

    if (isFolder && onFolderClick) {
      try {
        const np = props as NodeProps;
        const folderId: string = meta?.id
          ? String(meta.id)
          : String(np._key ?? '');
        const folderName: string = meta?.name ?? String(np.title ?? '');

        // 更新文件夹栈 - 只有当当前不在根目录时才添加到栈中
        if (currentFolderId && currentFolderName) {
          const newStack = [
            ...folderStack,
            { id: currentFolderId, name: currentFolderName }
          ];
          setFolderStack(newStack);
        }

        // 设置当前文件夹信息
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);

        // 请求新数据
        const newData = await onFolderClick(folderId);
        const formattedData = formatTreeData(newData as any[]);
        setTreeData(formattedData);

        // 重置选择状态
        setSelectedKeys([]);
        setExpandedKeys([]);
      } catch (error) {
        Message.error('进入文件夹失败');
      }
    }
  };

  // 处理从多级路径导航跳转到指定文件夹
  const handleNavigateToFolder = async (
    folderId: string,
    folderName: string,
    newStack: Array<{ id: string; name: string }>
  ) => {
    try {
      // 更新文件夹栈
      setFolderStack(newStack);

      // 设置当前文件夹
      setCurrentFolderId(folderId);
      setCurrentFolderName(folderName);

      // 加载该文件夹内容
      if (onFolderClick) {
        const newData = await onFolderClick(folderId);
        const formattedData = formatTreeData(newData as any[]);
        setTreeData(formattedData);
      }

      // 重置选择状态
      setSelectedKeys([]);
      setExpandedKeys([]);
    } catch (error) {
      Message.error('跳转到文件夹失败');
    }
  };

  // 处理返回上级目录
  const handleBackToParent = async () => {
    // 如果当前在某个文件夹中，但栈为空，说明是从根目录直接进入的，应该返回根目录
    if (folderStack.length === 0 && currentFolderId && currentFolderName) {
      setCurrentFolderId('');
      setCurrentFolderName('');
      // 恢复原始数据
      const formattedData = formatTreeData(data);
      setTreeData(formattedData);
      setSelectedKeys([]);
      setExpandedKeys([]);
      return;
    }

    if (folderStack.length === 0) return;

    try {
      const parentFolder = folderStack[folderStack.length - 1];
      const newStack = folderStack.slice(0, -1);

      setFolderStack(newStack);

      // 如果返回的是根目录（id为空），则重置为根目录状态
      if (!parentFolder.id || parentFolder.id === '') {
        setCurrentFolderId('');
        setCurrentFolderName('');
        // 恢复原始数据
        const formattedData = formatTreeData(data);
        setTreeData(formattedData);
      } else {
        setCurrentFolderId(parentFolder.id);
        setCurrentFolderName(parentFolder.name);

        if (onBackToParent) {
          const newData = await onBackToParent(parentFolder.id);
          const formattedData = formatTreeData(newData as any[]);
          setTreeData(formattedData);
        }
      }

      setSelectedKeys([]);
      setExpandedKeys([]);
    } catch (error) {
      Message.error('返回上级目录失败');
    }
  };

  const focusAndSelect = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.dom?.select?.();
    }, 0);
  };

  // 处理搜索
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      // 恢复原始树数据
      const formattedData = formatTreeData(data);
      setTreeData(formattedData);
      return;
    }

    if (!props.onSearch) {
      Message.error('搜索功能未实现');
      return;
    }

    setIsSearching(true);
    try {
      const results = await props.onSearch(currentFolderId, value);
      setSearchResults(results);
      setIsSearchMode(true);

      // 将搜索结果转换为树形数据
      const formattedResults = formatTreeData(results);
      setTreeData(formattedResults);
    } catch (error) {
      Message.error('搜索失败');
    } finally {
      setIsSearching(false);
    }
  };

  // 处理搜索框回车
  const handleSearchEnter = (value: string) => {
    handleSearch(value);
  };

  // 处理搜索框清空
  const handleSearchClear = () => {
    setSearchValue('');
    setIsSearchMode(false);
    setSearchResults([]);
    // 恢复原始树数据
    const formattedData = formatTreeData(data);
    setTreeData(formattedData);
  };

  const startRootCreate = (isFolder = true) => {
    const name = generateDefaultName(treeData, isFolder);
    setDefaultName(name);
    setInputValue(name);
    setTreeData([
      {
        name,
        showInput: true,
        isAdd: true,
        type: isFolder ? PythonItemType.Directory : PythonItemType.Notebook,
        children: [],
        id: 0,
        path: '',
        created: '',
        last_modified: ''
      },
      ...treeData
    ]);
    focusAndSelect();
  };

  const handleEdit = (node: NodeProps) => {
    const currentName = node.dataRef?.name;
    console.log('node', node);
    console.log('treeData', treeData);
    const newTree = treeData.map((n) => {
      if (String(n.id) === String(node.dataRef?.id)) {
        return { ...n, showInput: true };
      }
      return n;
    });
    setTreeData(newTree);
    setInputValue(currentName);
    setDefaultName(currentName);
    focusAndSelect();
  };

  const updateNodeTitle = (nodes: NodeProps[], key: string, title: string) => {
    return nodes.map((n) => {
      if (String(n._key) === key) {
        const dataRef = n.dataRef ? { ...n.dataRef, name: title } : n.dataRef;
        return { ...n, title, showInput: false, isAdd: false, dataRef };
      }
      if (n.dataRef?.children) {
        return {
          ...n,
          children: updateNodeTitle(n.dataRef?.children, key, title)
        };
      }
      return n;
    });
  };

  const removeNodeByKey = (nodes: NodeProps[], key: string): NodeProps[] => {
    return nodes
      .filter((n) => n._key !== key)
      .map((n) =>
        n.dataRef?.children
          ? { ...n, children: removeNodeByKey(n.dataRef?.children, key) }
          : n
      );
  };

  const handleEditFinish = async (node) => {
    const finalName = inputValue.trim() || defaultName;

    if (node.dataRef?.isAdd) {
      try {
        const created = await onCreate?.(finalName, node);

        if (!created) {
          Message.error('创建失败');
          return;
        }

        Message.success('创建成功');
      } catch (e) {
        Message.error('创建失败');
      }
    } else {
      try {
        const rename = await onRename?.(finalName, node);

        if (!rename) {
          Message.error('重命名失败');
          return;
        }

        Message.success('重命名成功');
      } catch (e) {
        Message.error('重命名失败');
      }
    }

    setInputValue('');
    setDefaultName('');
    // 重新获取当前文件夹数据
    const newData = await onFolderClick?.(currentFolderId);
    const formattedData = formatTreeData(newData ?? []);
    setTreeData(formattedData);
  };

  const handleCopy = async (node: NodeProps) => {
    try {
      const copyRes = await onCopy?.(`${node.dataRef?.name}_副本`, node);

      if (!copyRes) {
        Message.error('复制失败');
        return;
      }

      Message.success('复制成功');

      const newData = await onFolderClick?.(currentFolderId);
      const formattedData = formatTreeData(newData ?? []);
      setTreeData(formattedData);
    } catch (e) {
      Message.error('复制失败');
    }
  };

  const handleDelete = (node: NodeProps) => {
    const nodeName = node.dataRef?.name || '项目';
    const nodeType =
      node.dataRef?.type === PythonItemType.Directory ? '文件夹' : '文件';

    Modal.confirm({
      title: `确定删除${nodeType}?`,
      content:
        node.dataRef?.type === PythonItemType.Directory
          ? `删除后，该文件夹下所有内容将被删除，不可恢复`
          : `删除后，该文件不可恢复`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const deleteRes = await onDelete?.(node);

          if (!deleteRes) {
            Message.error('删除失败');
            return;
          }

          Message.success('删除成功');

          const newData = await onFolderClick?.(currentFolderId);
          const formattedData = formatTreeData(newData ?? []);
          setTreeData(formattedData);
        } catch (e) {
          Message.error('删除失败');
        }
      }
    });
  };

  return (
    <div className="directory-tree-container">
      {/* 导航栏 - 当有当前文件夹名称时显示（包括从根目录进入的第一个文件夹） */}
      {currentFolderName && (
        <div className="directory-tree-nav flex items-center">
          <AddAfterIcon
            className="mr-2 h-4 w-4 cursor-pointer"
            onClick={handleBackToParent}
          />

          {/* 多级路径导航 */}
          <MultiLevelPathNavigation
            folderStack={folderStack}
            currentFolderName={currentFolderName}
            onFolderClick={onFolderClick}
            onNavigateToFolder={handleNavigateToFolder}
          />

          {/* 如果没有多级路径，只显示当前目录名 */}
          {folderStack.length === 0 && (
            <span className="text-[14px] font-[500] text-[#334155]">
              {currentFolderName}
            </span>
          )}
        </div>
      )}

      <div className="directory-tree-header mb-2 flex items-center justify-between">
        <InputSearch
          placeholder={placeholder}
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearchEnter}
          onClear={handleSearchClear}
          allowClear
          loading={isSearching}
          style={{ height: '32px' }}
        />
        <Dropdown
          trigger="click"
          position="bl"
          droplist={
            <Menu
              onClickMenuItem={(key) => {
                if (key === 'folder') {
                  startRootCreate(true);
                } else if (key === 'file') {
                  startRootCreate(false);
                }
              }}
            >
              <Menu.Item key="folder">新建文件夹</Menu.Item>
              <Menu.Item key="file">新建PySpark</Menu.Item>
            </Menu>
          }
        >
          <Button type="text" size="small" icon={<IconPlus />}>
            {newButtonText}
          </Button>
        </Dropdown>
      </div>

      {treeData.length === 0 ? (
        <div className="directory-tree-empty">暂无数据</div>
      ) : (
        <Tree
          className="directory-tree"
          blockNode
          treeData={treeData}
          selectable
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={setExpandedKeys}
          onSelect={(keys, extra) => {
            setSelectedKeys(keys);
            onSelect?.(keys, extra);

            const dataRef = extra?.node?.props?.dataRef ?? null;

            // 如果是文件夹并且非编辑态，触发下钻逻辑
            if (
              !dataRef?.showInput &&
              dataRef?.type === PythonItemType.Directory &&
              onFolderClick
            ) {
              handleFolderClick(extra.node);
            }
          }}
          renderExtra={(node) => {
            const isEditing = node.dataRef?.showInput;

            if (isEditing) return null;

            return (
              <div className="directory-tree-extra">
                <Tooltip color="white" content="重命名">
                  <IconEdit
                    className="mr-1 hover:text-[rgb(var(--primary-6))]"
                    onClick={() => handleEdit(node)}
                  />
                </Tooltip>
                {node.dataRef?.type !== PythonItemType.Directory && (
                  <Tooltip color="white" content="复制">
                    <IconCopy
                      className="mr-1 hover:text-[rgb(var(--primary-6))]"
                      onClick={() => handleCopy(node as unknown as NodeProps)}
                    />
                  </Tooltip>
                )}
                <Tooltip color="white" content="删除">
                  <IconDelete
                    className="hover:text-[rgb(var(--primary-6))]"
                    onClick={() => handleDelete(node as unknown as NodeProps)}
                  />
                </Tooltip>
              </div>
            );
          }}
          renderTitle={(props: NodeProps) => {
            const isInput = Boolean(props?.dataRef?.showInput);
            const isFolder = props?.dataRef?.type === PythonItemType.Directory;

            // 根据节点类型选择图标
            const icon = isFolder ? (
              <FolderIcon className="mr-2 h-4 w-4" />
            ) : (
              <FileIcon className="mr-2 h-4 w-4" />
            );

            if (isInput) {
              return (
                <div className="flex items-center">
                  {icon}
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onBlur={() => handleEditFinish(props)}
                    onPressEnter={() => handleEditFinish(props)}
                    maxLength={255}
                    className="h-8 px-[6px] py-[2px] focus:border-[rgb(var(--primary-6))]"
                  />
                </div>
              );
            }

            const titleText = props.dataRef?.name;
            let display: React.ReactNode = titleText;
            if (searchValue && typeof titleText === 'string') {
              const idx = titleText
                .toLowerCase()
                .indexOf(searchValue.toLowerCase());
              if (idx !== -1) {
                const pre = titleText.slice(0, idx);
                const suf = titleText.slice(idx + searchValue.length);
                display = (
                  <>
                    {pre}
                    <span className="text-[rgb(var(--primary-6))]">
                      {searchValue}
                    </span>
                    {suf}
                  </>
                );
              }
            }
            return (
              <div className="flex items-center overflow-hidden">
                {icon}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {display}
                  </div>
                  {/* 只在搜索结果中显示路径 */}
                  {isSearchMode && props.dataRef?.path && (
                    <div className="search-result-path">
                      <EllipsisPopover
                        value={props.dataRef.path}
                        className="text-gray-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
