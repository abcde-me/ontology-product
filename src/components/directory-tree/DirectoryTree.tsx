import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
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
  Tree,
  Empty
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
import timeFormattig from '@/utils/timeFormatting';
import { now } from 'lodash-es';

// 原始数据接口
export type TreeNodeItem = Partial<PythonListItem> & {
  dataRef?: any;
  showInput?: boolean;
  isAdd?: boolean;
  children?: TreeNodeItem[];
};

// 暴露给父组件的方法接口
export interface DirectoryTreeRef {
  startRootCreate: (isFolder?: boolean) => void;
}

export enum DirectoryTreeFrom {
  SQL = 'sql',
  PYTHON = 'python'
}

export interface DirectoryTreeProps {
  from?: DirectoryTreeFrom;
  data: TreeNodeItem[];
  selectedKeys?: string[]; // 添加外部控制的选中状态
  onSelect?: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: NodeInstance[];
      node: NodeInstance;
      e: Event;
    }
  ) => void;
  onCreate?: (finalName: string, node?: NodeProps) => Promise<any>;
  onRename?: (newName: string, node: NodeProps) => Promise<any>;
  onCopy?: (newName: string, node: NodeProps) => Promise<any>;
  onDelete?: (node: NodeProps) => Promise<boolean>;
  onFolderClick?: (
    folderId: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onBackToParent?: (
    parentId?: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onSearch?: (path_id: string, searchValue: string) => Promise<any>;
  generateDefaultName?: (
    siblings: TreeDataType[],
    isFolder?: boolean
  ) => string;
  placeholder?: string;
  newButtonText?: string;
  // 数据格式化配置
  formatData?: (rawData: any) => TreeNodeItem[];
}

const InputSearch = Input.Search;

function defaultNameGenerator(siblings: TreeDataType[], isFolder = true) {
  return isFolder ? `新建文件夹_${now()}` : `新建PySpark_${now()}`;
}

export default React.forwardRef<DirectoryTreeRef, DirectoryTreeProps>(
  function DirectoryTree(props, ref) {
    const {
      from = DirectoryTreeFrom.PYTHON,
      data,
      selectedKeys: externalSelectedKeys,
      onSelect,
      onCreate,
      onRename,
      onCopy,
      onDelete,
      onFolderClick,
      onBackToParent,
      onSearch,
      generateDefaultName = defaultNameGenerator,
      placeholder = '搜索文件或文件夹',
      newButtonText = '新建'
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

    // 同步外部传入的选中状态
    useEffect(() => {
      if (externalSelectedKeys && externalSelectedKeys.length > 0) {
        setSelectedKeys(externalSelectedKeys);
      }
    }, [externalSelectedKeys]);

    const [searchResults, setSearchResults] = useState<TreeNodeItem[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const inputRef = useRef<any>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [defaultName, setDefaultName] = useState<string>('');

    // 格式化数据
    const formatTreeData = (inputData: unknown[]): TreeNodeItem[] => {
      if (typeof props.formatData === 'function') {
        return props.formatData(inputData);
      }
      return inputData as TreeNodeItem[];
    };

    useEffect(() => {
      const formattedData = formatTreeData(data);
      setTreeData(formattedData);
    }, [data]);

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        startRootCreate: (isFolder = true) => {
          startRootCreate(isFolder);
        }
      }),
      []
    );

    // 处理文件夹点击下钻
    const handleFolderClick = async (node: NodeInstance) => {
      // Arco Tree 会把节点对象挂到 node.props.dataRef，这里优先读 props.dataRef；
      // 如果业务层已将字段打平到节点顶层（如 formatData 中），也兼容直接读取 props
      handleSearchClear();
      const meta = node.props.dataRef;
      const hasChildren =
        Array.isArray(meta?.children) && meta?.children?.length;
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
      handleSearchClear();
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
      handleSearchClear();
      // 如果当前在某个文件夹中，但栈为空，说明是从根目录直接进入的，应该返回根目录
      if (folderStack.length === 0 && currentFolderId && currentFolderName) {
        setCurrentFolderId('');
        setCurrentFolderName('');
        // 重新请求根目录数据
        if (onBackToParent) {
          try {
            const newData = await onBackToParent('0');
            const formattedData = formatTreeData(newData as any[]);
            setTreeData(formattedData);
          } catch (error) {
            Message.error('返回根目录失败');
            return;
          }
        }
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
          // 重新请求根目录数据
          if (onBackToParent) {
            const newData = await onBackToParent('');
            const formattedData = formatTreeData(newData as any[]);
            setTreeData(formattedData);
          }
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
      const newTree = treeData.map((n) => {
        if (String(n?.id) === String(node.dataRef?.id)) {
          return { ...n, dataRef: { ...n.dataRef, showInput: true } };
        }
        return n;
      });
      setTreeData(newTree);
      setInputValue(currentName);
      setDefaultName(currentName);
      focusAndSelect();
    };

    const updateNodeTitle = (
      nodes: NodeProps[],
      key: string,
      title: string
    ) => {
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
            // 创建失败，移除临时添加的节点
            const newTreeData = treeData.filter((item) => !item.isAdd);
            setTreeData(newTreeData);
            setInputValue('');
            setDefaultName('');
            return;
          }

          // 如果是自动创建的文件且是Python文件，调用回调打开文件
          if (node.dataRef?.type === PythonItemType.Notebook && created?.id) {
            console.log('自动创建文件成功:', created.name);
          }
        } catch (e) {
          Message.error('创建失败');
          // 创建失败，移除临时添加的节点
          const newTreeData = treeData.filter((item) => !item.isAdd);
          setTreeData(newTreeData);
        }
      } else {
        try {
          const rename = await onRename?.(finalName, node);

          if (!rename) {
            // 创建失败，移除临时添加的节点
            const newTreeData = treeData.filter((item) => !item.isAdd);
            setTreeData(newTreeData);
            setInputValue('');
            setDefaultName('');
            return;
          }
        } catch (e) {
          Message.error('重命名失败');
          // 创建失败，移除临时添加的节点
          const newTreeData = treeData.filter((item) => !item.isAdd);
          setTreeData(newTreeData);
        }
      }

      setInputValue('');
      setDefaultName('');
    };

    const handleCopy = (node: NodeProps) => {
      try {
        onCopy?.(`${node.dataRef?.name}_副本_${now()}`, node);
      } catch (e) {
        Message.error('复制失败');
      }
    };

    const handleDelete = (node: NodeProps) => {
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
            const result = await onDelete?.(node);
            // 如果删除失败，不关闭对话框
            if (result === false) {
              return false;
            }
          } catch (e) {
            Message.error('删除失败');
            return false;
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
            className="directory-tree-header-search"
            placeholder={placeholder}
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearchEnter}
            onClear={handleSearchClear}
            allowClear
            loading={isSearching}
            style={{ height: '32px' }}
          />
          {from === DirectoryTreeFrom.SQL ? (
            <Button
              type="text"
              size="small"
              icon={<IconPlus />}
              onClick={() => startRootCreate(false)}
            >
              新建
            </Button>
          ) : (
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
          )}
        </div>

        {treeData.length === 0 ? (
          <Empty />
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
              const isFolder =
                props?.dataRef?.type === PythonItemType.Directory;

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
              return (
                <div className="flex items-center overflow-hidden">
                  {icon}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="file-name">
                      <EllipsisPopover value={titleText} />
                    </div>
                    {/* 只在搜索结果中显示路径 */}
                    {isSearchMode &&
                      from !== DirectoryTreeFrom.SQL &&
                      props.dataRef?.path && (
                        <div className="search-result-path">
                          <EllipsisPopover value={props.dataRef.path} />
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
);
