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
  Empty,
  Input,
  Menu,
  Message,
  Modal,
  Spin,
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
  IconMore,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import FolderIcon from '@/assets/python/folder.svg';
import FileIcon from '@/assets/python/file.svg';
import AddAfterIcon from '@/assets/python/add-after.svg';
import { PythonItemType, PythonListItem } from '@/types/pythonApi';
import EllipsisPopover from '../ellipsis-popover-com';
import MultiLevelPathNavigation from './MultiLevelPathNavigation';
import './DirectoryTree.scss';
import { PYSPARK_PERMISSIONS, SQL_PERMISSIONS } from '@/config/permissions';
import { now } from 'lodash-es';
import { PermissionWrapper } from '../PermissionGuard';
import { debounce } from 'lodash-es';
import SQLFileIcon from '@/assets/sql/spl-item-icon.svg';
import { useParams } from '@/utils/url';
import { ScriptStatus, ScriptStatusName } from '@/types/sqlDevelopApi';
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
  refresh: () => Promise<void>; // 刷新目录列表
  selectFile: (fileId: string) => void; // 选中指定文件
}

export enum DirectoryTreeFrom {
  SQL = 'sql',
  PYTHON = 'python'
}

export interface DirectoryTreeProps {
  from?: DirectoryTreeFrom;
  data: TreeNodeItem[];
  isCanCreate?: boolean;
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
      isCanCreate,
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
    const activeTab = useParams('activeTab');

    // 下钻相关状态
    const [currentFolderId, setCurrentFolderId] = useState<string>('');
    const [currentFolderName, setCurrentFolderName] = useState<string>('');
    const [folderStack, setFolderStack] = useState<
      Array<{ id: string; name: string }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(false);
    }, [data]);

    useEffect(() => {
      setLoading(true);
    }, []);

    // 刷新当前目录
    const refreshCurrentDirectory = useCallback(async () => {
      setLoading(true);
      try {
        if (currentFolderId && onFolderClick) {
          const newData = await onFolderClick(currentFolderId);
          const formattedData = formatTreeData(newData as any[]);
          setTreeData(formattedData);
        } else if (onBackToParent) {
          // 如果在根目录，使用 onBackToParent 刷新
          const newData = await onBackToParent('0');
          const formattedData = formatTreeData(newData as any[]);
          setTreeData(formattedData);
        }
      } catch (error) {
        console.error('刷新目录失败:', error);
      } finally {
        setLoading(false);
      }
    }, [currentFolderId, onFolderClick, onBackToParent, formatTreeData]);

    // 选中指定文件
    const selectFileById = useCallback((fileId: string) => {
      setSelectedKeys([fileId]);
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        startRootCreate: (isFolder = true) => {
          startRootCreate(isFolder);
        },
        refresh: refreshCurrentDirectory,
        selectFile: selectFileById
      }),
      [refreshCurrentDirectory, selectFileById]
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
        setLoading(true);
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
        } finally {
          setLoading(false);
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
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    // 处理返回上级目录
    const handleBackToParent = async () => {
      handleSearchClear();
      setLoading(true);
      try {
        // 如果当前在某个文件夹中，但栈为空，说明是从根目录直接进入的，应该返回根目录
        if (folderStack.length === 0 && currentFolderId && currentFolderName) {
          setCurrentFolderId('');
          setCurrentFolderName('');
          // 重新请求根目录数据
          if (onBackToParent) {
            const newData = await onBackToParent('0');
            const formattedData = formatTreeData(newData as any[]);
            setTreeData(formattedData);
          }
          setSelectedKeys([]);
          setExpandedKeys([]);
          return;
        }

        if (folderStack.length === 0) return;

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
      } finally {
        setLoading(false);
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

    // 使用防抖处理输入事件
    const debouncedSearch = useCallback(debounce(handleSearch, 500), [
      handleSearch
    ]);

    // 输入变化时触发搜索
    const handleInputChange = (value: string) => {
      setSearchValue(value);
      debouncedSearch(value);
    };

    // 处理搜索框清空
    const handleSearchClear = () => {
      setSearchValue('');
      setIsSearchMode(false);
      setSearchResults([]);
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

    useEffect(() => {
      if (activeTab === 'file') {
        startRootCreate(false);
      }
    }, [activeTab]);

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
      if (node.dataRef?.isAdd) {
        const finalName = inputValue.trim() || defaultName;
        try {
          const created = await onCreate?.(finalName, node);

          if (!created) {
            // 创建失败，移除临时添加的节点
            const newTreeData = treeData.filter(
              (item) =>
                !item.isAdd &&
                !item.showInput &&
                !item.dataRef?.isAdd &&
                !item.dataRef?.showInput
            );
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
          const newTreeData = treeData.filter(
            (item) =>
              !item.isAdd &&
              !item.showInput &&
              !item.dataRef.isAdd &&
              !item.dataRef.showInput
          );
          setTreeData(newTreeData);
        }
      } else {
        const finalName = inputValue.trim();
        if (finalName === '') {
          Message.error('重命名名称不能为空');
          // 重命名失败，重置输入框状态
          const newTreeData = treeData.map((item) => {
            if (String(item?.id) === String(node.dataRef?.id)) {
              return {
                ...item,
                showInput: false,
                isAdd: false,
                dataRef: { ...item.dataRef, showInput: false, isAdd: false }
              };
            }
            return item;
          });
          setTreeData(newTreeData);
          setInputValue('');
          setDefaultName('');
          return;
        }

        try {
          const rename = await onRename?.(finalName, node);

          if (!rename) {
            // 重命名失败，重置输入框状态
            const newTreeData = treeData.map((item) => {
              if (String(item?.id) === String(node.dataRef?.id)) {
                return {
                  ...item,
                  showInput: false,
                  isAdd: false,
                  dataRef: { ...item.dataRef, showInput: false, isAdd: false }
                };
              }
              return item;
            });
            setTreeData(newTreeData);
            setInputValue('');
            setDefaultName('');
            return;
          }
        } catch (e) {
          Message.error('重命名失败');
          // 重命名失败，重置输入框状态
          const newTreeData = treeData.map((item) => {
            if (String(item?.id) === String(node.dataRef?.id)) {
              return {
                ...item,
                showInput: false,
                isAdd: false,
                dataRef: { ...item.dataRef, showInput: false, isAdd: false }
              };
            }
            return item;
          });
          setTreeData(newTreeData);
          setInputValue('');
          setDefaultName('');
        }
      }

      setInputValue('');
      setDefaultName('');
    };

    const handleCopy = (node: NodeProps) => {
      try {
        onCopy?.(`${node.dataRef?.name}_copy_${now()}`, node);
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
            // 删除成功后重新加载文件列表
            // handleSearchClear();
          } catch (e) {
            Message.error('删除失败');
            return false;
          }
        }
      });
    };

    const iconClassMap: Partial<Record<ScriptStatus, string>> = {
      [ScriptStatus.Released]: 'released-icon',
      [ScriptStatus.Scheduling]: 'scheduled-icon',
      [ScriptStatus.Editing]: 'unreleased-icon',
      [ScriptStatus.EditCompleted]: 'unreleased-icon'
    };

    const getVersionType = (status: ScriptStatus) => {
      const iconClass = iconClassMap[status] ?? 'unreleased-icon';

      return (
        <div className="flex items-center">
          <span className={iconClass} />
          <div className="text-[12px] leading-[22px] text-[var(--color-text-1)]">
            {ScriptStatusName[status]}
          </div>
        </div>
      );
    };
    return (
      <div
        className="directory-tree-container"
        style={
          currentFolderName
            ? ({
                ['--directory-nav-height' as any]: '69px'
              } as React.CSSProperties)
            : undefined
        }
      >
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
            onChange={(value) => setSearchValue(value)}
            onSearch={handleSearchEnter}
            onClear={() => {
              handleSearchClear();
              refreshCurrentDirectory();
            }}
            allowClear
            style={{ height: '32px' }}
          />
          {from === DirectoryTreeFrom.SQL ? (
            <PermissionWrapper permission={SQL_PERMISSIONS.CREATE}>
              <div
                className="ml-1 flex w-16 cursor-pointer items-center justify-center text-xs text-[#2563EB]"
                onClick={() => startRootCreate(false)}
              >
                <IconPlus className="mr-1" />
                新建
              </div>
            </PermissionWrapper>
          ) : (
            <PermissionWrapper permission={PYSPARK_PERMISSIONS.CREATE}>
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
                    <Menu.Item key="file">新建PySpark</Menu.Item>
                    <Menu.Item key="folder">新建文件夹</Menu.Item>
                  </Menu>
                }
              >
                {isCanCreate && (
                  <Button type="text" size="small" icon={<IconPlus />}>
                    {newButtonText}
                  </Button>
                )}
              </Dropdown>
            </PermissionWrapper>
          )}
        </div>

        {loading ? (
          <div className="mt-[110px] flex flex-col items-center">
            <Spin size={26} />
            <div className="text-[rgba(15, 23, 42, 1)] text-[14px]">加载中</div>
          </div>
        ) : treeData.length === 0 ? (
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
              const nowPermissions =
                from === DirectoryTreeFrom.SQL
                  ? SQL_PERMISSIONS
                  : PYSPARK_PERMISSIONS;

              if (isEditing) return null;

              const isReleased = node.dataRef?.status === ScriptStatus.Released;
              const isScheduling =
                node.dataRef?.status === ScriptStatus.Scheduling;

              return (
                <div className="directory-tree-extra ml-[8px] h-[36px]">
                  <Dropdown
                    position="br"
                    trigger={['click', 'hover']}
                    droplist={
                      <Menu>
                        {!isReleased && (
                          <PermissionWrapper permission={nowPermissions.MODIFY}>
                            <Menu.Item
                              onClick={() => {
                                handleEdit(node);
                              }}
                              key="1"
                            >
                              <IconEdit className="mr-1" />
                              重命名
                            </Menu.Item>
                          </PermissionWrapper>
                        )}
                        {isReleased && (
                          <PermissionWrapper permission={nowPermissions.CREATE}>
                            <Menu.Item
                              onClick={() => {
                                handleCopy(node);
                              }}
                              key="2"
                            >
                              <IconCopy className="mr-1" />
                              <span className="mr-[4px]">复制为新版本</span>
                              <Tooltip
                                position="right"
                                content="以此脚本为基础迭代新版本"
                              >
                                <IconQuestionCircle />
                              </Tooltip>
                            </Menu.Item>
                          </PermissionWrapper>
                        )}
                        <PermissionWrapper permission={nowPermissions.CREATE}>
                          <Menu.Item
                            onClick={() => {
                              handleCopy(node);
                            }}
                            key="2"
                          >
                            <IconCopy className="mr-1" />
                            <span className="mr-[4px]">复制为新脚本</span>
                            <Tooltip
                              position="right"
                              content="以此脚本为基础新建脚本"
                            >
                              <IconQuestionCircle />
                            </Tooltip>
                          </Menu.Item>
                        </PermissionWrapper>
                        <PermissionWrapper permission={nowPermissions.DELETE}>
                          <Menu.Item
                            disabled={isScheduling}
                            onClick={() => {
                              if (isScheduling) return;
                              handleDelete(node);
                            }}
                            key="3"
                          >
                            <Tooltip
                              disabled={!isScheduling}
                              content="调度中的脚本不可删除"
                              position="right"
                            >
                              <div className="flex items-center">
                                <IconDelete className="mr-1" />
                                删除
                              </div>
                            </Tooltip>
                          </Menu.Item>
                        </PermissionWrapper>
                      </Menu>
                    }
                  >
                    <IconMore className="h-full" />
                  </Dropdown>
                </div>
              );
            }}
            renderTitle={(props: NodeProps) => {
              const isInput = Boolean(props?.dataRef?.showInput);
              const isFolder =
                props?.dataRef?.type === PythonItemType.Directory;

              // 根据节点类型选择图标
              const icon = isFolder ? (
                <FolderIcon className="mr-2 h-[16px] w-[16px]" />
              ) : from === DirectoryTreeFrom.SQL ? (
                <SQLFileIcon className="mr-2 h-[16px] w-[16px]" />
              ) : (
                <FileIcon className="mr-2 h-[16px] w-[16px]" />
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
                    <div className="file-name leading-[22px]">
                      <EllipsisPopover value={titleText} />
                    </div>
                    {/* 只在搜索结果中显示路径 */}
                    {/* {isSearchMode &&
                      from !== DirectoryTreeFrom.SQL &&
                      props.dataRef?.path && (
                        <div className="search-result-path">
                          <EllipsisPopover value={props.dataRef.path} />
                        </div>
                      )} */}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${iconClassMap[props.dataRef?.status] ?? 'unreleased-icon'} status-dot ml-auto`}
                    ></span>
                    <div className="version-status-container">
                      {getVersionType(props.dataRef?.status)}
                    </div>
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
