import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tree,
  Input,
  Typography,
  Button,
  Space,
  Spin,
  Empty
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconSearch,
  IconFolder,
  IconFile,
  IconStorage
} from '@arco-design/web-react/icon';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import NoDataEmpty from '@/components/NoDataEmpty';
import { useSourceTargetTree } from '../../hooks/useSourceTargetTree';
import {
  CatalogRootType,
  CatalogItemType,
  FluffyVolume,
  Db
} from '@/api/dataCatalog';
import {
  FileData,
  CatalogData,
  DatabaseData,
  DataDirectoryTreeFrom
} from '../../types';
import './index.scss';
import { formatFileSize } from '@/utils/format';

const { Title, Text } = Typography;

interface SourceTargetTreeProps {
  type?: DataDirectoryTreeFrom;
  dataType: 'source' | 'target';
  onBack: () => void;
  onSelectFile?: (file: FileData) => void;
  onVolumeDetail?: (volume: FluffyVolume) => void;
  onVolumeInsert?: (volume: FluffyVolume) => void;
  onDbDetail?: (database: Db, hierarchyData?: any) => void;
  onDbInsert?: (database: Db, hierarchyData?: any) => void;
  isEditorFocused?: boolean;
}

interface TreeNode {
  key: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  data?: any;
}

// 定义当前视图层级
type ViewLevel =
  | 'catalog'
  | 'category'
  | 'volume-db'
  | 'files'
  | 'db-item'
  | 'database-tables'
  | 'table-detail';

const SourceTargetTree: React.FC<SourceTargetTreeProps> = ({
  type = DataDirectoryTreeFrom.PYTHON,
  dataType,
  onBack,
  onSelectFile,
  onVolumeDetail,
  onVolumeInsert,
  onDbDetail,
  onDbInsert,
  isEditorFocused = false
}) => {
  const {
    targetCatalogList,
    sourceCatalogList,
    getCatalogList,
    sourceCatalogFileList,
    targetCatalogFileList,
    getCatalogFileList,
    currentPage,
    getNodeHierarchyInfo,
    findFullPathById,
    getSourceCatalogTableList,
    sourceCatalogTableList,
    setSourceCatalogTableList,
    getSourceCatalogTableDetail,
    sourceCatalogTableDetail
  } = useSourceTargetTree(dataType);

  const [searchValue, setSearchValue] = useState('');
  const [currentViewLevel, setCurrentViewLevel] =
    useState<ViewLevel>('catalog');
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogData | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVolumeOrDb, setSelectedVolumeOrDb] = useState<
    FluffyVolume | Db | null
  >(null);
  const [selectedDb, setSelectedDb] = useState<Db | null>(null);
  const [selectedDbItem, setSelectedDbItem] = useState<any | null>(null);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);
  // 处理数据卷详情按钮点击
  const handleVolumeDetail = useCallback(
    (volume: FluffyVolume, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发数据卷选择
      if (onVolumeDetail) {
        onVolumeDetail(volume);
      }
    },
    [onVolumeDetail]
  );

  // 处理数据卷插入按钮点击
  const handleVolumeInsert = useCallback(
    (volume: FluffyVolume, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发数据卷选择

      onVolumeInsert?.(volume);
    },
    [onVolumeInsert, isEditorFocused]
  );

  // 处理数据库详情按钮点击
  const handleDbDetail = useCallback(
    (database: Db, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发数据库选择
      if (onDbDetail) {
        // 构建层级选择的数据对象
        const hierarchyData = {
          selectedCatalog,
          selectedCategory,
          selectedVolumeOrDb,
          selectedDb,
          selectedDbItem,
          selectedTable,
          currentViewLevel,
          breadcrumbPath
        };
        onDbDetail(database, hierarchyData);
      }
    },
    [
      onDbDetail,
      selectedCatalog,
      selectedCategory,
      selectedVolumeOrDb,
      selectedDb,
      selectedDbItem,
      selectedTable,
      currentViewLevel,
      breadcrumbPath
    ]
  );

  // 处理数据库插入按钮点击
  const handleDbInsert = useCallback(
    (database: Db, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发数据库选择
      // 构建层级选择的数据对象
      const hierarchyData = {
        selectedCatalog,
        selectedCategory,
        selectedVolumeOrDb,
        selectedDb,
        selectedDbItem,
        selectedTable,
        currentViewLevel,
        breadcrumbPath
      };

      // 编辑器聚焦时插入内容
      onDbInsert?.(database, hierarchyData);
    },
    [
      onDbInsert,
      isEditorFocused,
      selectedCatalog,
      selectedCategory,
      selectedVolumeOrDb,
      selectedDb,
      selectedDbItem,
      selectedTable,
      currentViewLevel,
      breadcrumbPath
    ]
  );

  // 获取当前目录列表
  const currentCatalogList = useMemo(() => {
    return dataType === 'source' ? sourceCatalogList : targetCatalogList;
  }, [dataType, sourceCatalogList, targetCatalogList]);

  // 获取当前文件列表
  const currentFileList = useMemo(() => {
    return dataType === 'source'
      ? sourceCatalogFileList
      : targetCatalogFileList;
  }, [dataType, sourceCatalogFileList, targetCatalogFileList]);

  // 生成第一层目录树形数据
  const generateCatalogTreeData = useMemo((): TreeNode[] => {
    if (!currentCatalogList || currentCatalogList.length === 0) {
      return [];
    }

    return currentCatalogList.map((item) => ({
      key: `catalog-${item.id}`,
      title: (
        <div className="source-target-tree__catalog-item-left">
          <IconFolder className="source-target-tree__catalog-icon" />
          <EllipsisPopover
            className="source-target-tree__catalog-name"
            value={item.name}
          ></EllipsisPopover>
        </div>
      ),
      icon: null, // 不使用默认图标，在title中自定义
      isLeaf: false,
      data: { ...item, type: 'catalog' }
    }));
  }, [currentCatalogList]);

  // 生成第三层数据卷和数据库列表
  const generateVolumeDbList = useMemo((): Array<{
    key: string;
    title: React.ReactNode;
    data: any;
  }> => {
    if (!selectedCatalog || !selectedCategory) return [];

    const items: Array<{
      key: string;
      title: React.ReactNode;
      data: any;
    }> = [];

    // 根据选中的分类过滤数据
    if (selectedCategory === '数据卷') {
      // 只显示数据卷
      if (
        selectedCatalog.children?.volume &&
        selectedCatalog.children.volume.length > 0
      ) {
        items.push(
          ...selectedCatalog.children.volume.map((volume: any) => ({
            key: `volume-${volume.id}`,
            title: (
              <div className="list-item-content">
                <IconStorage className="list-item-content-icon" />
                <div className="list-item-content-info">
                  <EllipsisPopover
                    className="list-item-content-info-name"
                    value={volume.name}
                    preferTypography
                  ></EllipsisPopover>
                </div>
                <div className="list-item-actions">
                  {/* 详情按钮 */}
                  <Button
                    type="text"
                    onClick={(e: Event) => handleVolumeDetail(volume, e)}
                  >
                    详情
                  </Button>
                  {/* 插入按钮: 临时注释掉，9.30不支持目录插入 */}
                  {/* <Button
                    type="outline"
                    onClick={(e: Event) => handleVolumeInsert(volume, e)}
                  >
                    {isEditorFocused ? '插入' : '复制'}
                  </Button> */}
                </div>
              </div>
            ),
            data: { ...volume, type: 'volume', parentCatalog: selectedCatalog }
          }))
        );
      }
    } else if (selectedCategory === '数据库') {
      // 只显示数据库
      if (
        selectedCatalog.children?.db &&
        selectedCatalog.children.db.length > 0
      ) {
        items.push(
          ...selectedCatalog.children.db.map((db: any) => ({
            key: `db-${db.id}`,
            title: (
              <div className="list-item-content">
                <IconStorage className="list-item-content-icon" />
                <div className="list-item-content-info">
                  <EllipsisPopover
                    className="list-item-content-info-name"
                    value={db.name}
                    preferTypography
                  ></EllipsisPopover>
                </div>
                {/* <div className="source-target-tree__volume-db-actions"> */}
                {/* 详情按钮 */}
                {/* <Button
                    type="text"
                    size="small"
                    onClick={(e: Event) => handleDbDetail(db, e)}
                  >
                    详情
                  </Button> */}
                {/* 插入按钮，9.30不支持目录插入 */}
                {/* <Button
                    type="outline"
                    size="small"
                    onClick={(e: Event) => handleDbInsert(db, e)}
                  >
                    {isEditorFocused ? '插入' : '复制'}
                  </Button> */}
                {/* </div> */}
              </div>
            ),
            data: { ...db, type: 'database', parentCatalog: selectedCatalog }
          }))
        );
      }
    }

    return items;
  }, [selectedCatalog, selectedCategory, handleVolumeDetail, handleDbDetail]);

  // 处理目录点击（第一层）
  const handleCatalogClick = (catalog: any) => {
    setSelectedCatalog(catalog);
    setCurrentViewLevel('category');
    setBreadcrumbPath([catalog.name]);
  };

  // 处理分类点击（第二层）
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentViewLevel('volume-db');
    setBreadcrumbPath([selectedCatalog?.name || '', category]);
  };

  // 处理数据卷或数据库点击（第三层）
  const handleVolumeDbClick = async (item: any) => {
    console.log('执行到这里了吗？');
    if (!selectedCatalog) return;

    setSelectedVolumeOrDb(item);

    // 根据item类型决定下一步操作
    if (item.type === 'volume') {
      // 数据卷：直接显示文件列表
      setCurrentViewLevel('files');
      setBreadcrumbPath([selectedCatalog.name, selectedCategory, item.name]);

      // 调用接口获取文件列表
      setIsLoading(true);
      try {
        const rootType =
          dataType === 'source'
            ? CatalogRootType.Source
            : CatalogRootType.Target;

        const params =
          dataType === 'source'
            ? {
                page: 1,
                page_size: 100,
                data_path_id: Number(item.id),
                file_name: '',
                sort: 'desc' as 'asc' | 'desc'
              }
            : {
                page: 1,
                limit: 100,
                full_path: item.full_path || '',
                sort_field: item.sort_field || '',
                sort_order: 'desc' as 'asc' | 'desc',
                path_id: item.id.toString()
              };

        await getCatalogFileList(rootType, params);
      } catch (error) {
        console.error('获取文件列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (item.type === 'database') {
      // 数据库：先显示db_item列表
      setSelectedDb(item);
      setCurrentViewLevel('db-item');
      setBreadcrumbPath([selectedCatalog.name, selectedCategory, item.name]);
    }
  };

  // 处理文件点击（第三层）
  const handleFileClick = (file: any) => {
    if (currentViewLevel === 'database-tables') {
      // 在数据库表列表中点击表，显示表字段列表
      handleTableClick(file);
    } else if (onSelectFile) {
      // 其他情况调用原有的文件选择逻辑
      onSelectFile(file);
    }
  };

  // 处理表点击，显示表字段列表
  const handleTableClick = async (table: any) => {
    if (!selectedDb) return;

    setSelectedTable(table);
    setCurrentViewLevel('table-detail');
    setBreadcrumbPath([
      selectedCatalog?.name || '',
      selectedCategory,
      selectedDb.name,
      table.table_name || table.name
    ]);

    // 调用接口获取表字段列表
    setIsLoading(true);
    try {
      const params = {
        detail_type: 'sample', // 获取示例信息
        database: selectedDbItem.name ?? '',
        table: table.table_name ?? '',
        path_id: Number(selectedDb.id),
        table_id: Number(table.table_id)
      };

      await getSourceCatalogTableDetail(params);
    } catch (error) {
      console.error('获取表字段列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理db_item点击
  const handleDbItemClick = async (dbItem: any) => {
    if (!selectedDb) return;

    setCurrentViewLevel('database-tables');
    setSelectedDbItem(dbItem);
    setBreadcrumbPath([
      selectedCatalog?.name || '',
      selectedCategory,
      selectedDb.name,
      dbItem.name
    ]);

    // 如果没有children.db_item数据，则调用接口获取
    setIsLoading(true);
    try {
      const params = {
        path_id: Number(selectedDb.id),
        search: '',
        page: 1,
        limit: 100,
        database: dbItem.name || ''
      };

      await getSourceCatalogTableList(params);
    } catch (error) {
      console.error('获取数据库表列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 返回上级目录
  const handleBack = () => {
    if (currentViewLevel === 'files') {
      // 从文件列表返回到数据卷/数据库列表
      if (selectedCatalog) {
        setCurrentViewLevel('volume-db');
        setBreadcrumbPath([selectedCatalog.name, selectedCategory]);
      }
    } else if (currentViewLevel === 'table-detail') {
      // 从表字段列表返回到数据库表列表
      setCurrentViewLevel('database-tables');
      setBreadcrumbPath([
        selectedCatalog?.name || '',
        selectedCategory,
        selectedDb?.name || ''
      ]);
      setSelectedTable(null);
    } else if (currentViewLevel === 'database-tables') {
      // 从数据库表列表返回到db_item列表
      setCurrentViewLevel('db-item');
      setBreadcrumbPath([
        selectedCatalog?.name || '',
        selectedCategory,
        selectedDb?.name || ''
      ]);
    } else if (currentViewLevel === 'db-item') {
      // 从db_item列表返回到数据卷/数据库列表
      if (selectedCatalog) {
        setCurrentViewLevel('volume-db');
        setBreadcrumbPath([selectedCatalog.name, selectedCategory]);
        setSelectedDb(null);
      }
    } else if (currentViewLevel === 'volume-db') {
      // 从数据卷/数据库列表返回到分类列表
      setCurrentViewLevel('category');
      setSelectedVolumeOrDb(null);
      setBreadcrumbPath([selectedCatalog?.name || '']);
    } else if (currentViewLevel === 'category') {
      // 从分类列表返回到目录列表
      setCurrentViewLevel('catalog');
      setSelectedCatalog(null);
      setSelectedCategory('');
      setBreadcrumbPath([]);
    } else {
      // 从目录列表返回上级
      if (onBack) {
        onBack();
      }
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    // 这里可以添加搜索逻辑
  };

  // 渲染标题部分
  const renderHeader = () => {
    let title = '';
    let showBreadcrumb = false;

    if (currentViewLevel === 'catalog') {
      // 第一层：显示标题
      title = dataType === 'source' ? '源数据目录' : '目标数据目录';
      showBreadcrumb = false;
    } else if (currentViewLevel === 'category') {
      // 第二层：显示面包屑路径
      title = selectedCatalog?.name || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'volume-db') {
      // 第三层：显示面包屑路径
      title = selectedCategory || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'files') {
      // 第四层：显示面包屑路径
      title = selectedVolumeOrDb?.name || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'db-item') {
      // 第四层：显示面包屑路径（db_item列表）
      title = selectedDb?.name || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'database-tables') {
      // 第五层：显示面包屑路径（数据库表列表）
      title = selectedDbItem?.name || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'table-detail') {
      // 第六层：显示面包屑路径（表字段列表）
      title = selectedTable?.table_name || selectedTable?.name || '';
      showBreadcrumb = true;
    }

    return (
      <div className="source-target-tree__header">
        <div className="source-target-tree__header-left">
          <IconArrowLeft
            className="source-target-tree__back-icon"
            onClick={handleBack}
          />
          <div className="source-target-tree__title">
            {showBreadcrumb ? (
              <div className="source-target-tree__breadcrumb-path">
                <Text type="secondary">
                  <EllipsisPopover value={`.../${title}`}></EllipsisPopover>
                </Text>
              </div>
            ) : (
              <div className="source-target-tree__title">
                <EllipsisPopover value={title}></EllipsisPopover>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染搜索框
  const renderSearchBox = () => (
    <div className="source-target-tree__search">
      <Input.Search
        placeholder="输入关键词搜索"
        value={searchValue}
        onChange={handleSearch}
        allowClear
        className="source-target-tree__search-input"
      />
    </div>
  );

  // 渲染第一层：目录列表
  const renderCatalogList = () => {
    if (generateCatalogTreeData.length === 0) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    return (
      <div className="source-target-tree__catalog-list max-h-full overflow-y-auto">
        {generateCatalogTreeData.map((item) => (
          <div
            key={item.key}
            className="source-target-tree__catalog-item"
            onClick={() => handleCatalogClick(item.data)}
          >
            {item.title}
          </div>
        ))}
      </div>
    );
  };

  // 渲染第二层：分类列表
  const renderCategoryList = () => {
    const categories =
      type === DataDirectoryTreeFrom.PYTHON
        ? [
            {
              key: 'volume',
              title: '数据卷',
              icon: <IconFolder className="source-target-tree-icon" />
            }
          ]
        : [
            {
              key: 'database',
              title: '数据库',
              icon: <IconFolder className="source-target-tree-icon" />
            }
          ];

    return (
      <div className="list">
        {categories.map((category) => (
          <div
            key={category.key}
            className="list-item"
            onClick={() => handleCategoryClick(category.title)}
          >
            <div className="list-item-content">
              {category.icon}
              <span className="list-item-content-info-name">
                {category.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染第三层：数据卷和数据库列表
  const renderVolumeDbList = () => {
    if (generateVolumeDbList.length === 0) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    return (
      <div className="list max-h-full overflow-y-auto">
        {generateVolumeDbList.map((item) => (
          <div
            className="list-item"
            key={item.key}
            onClick={() => handleVolumeDbClick(item.data)}
          >
            {item.title}
          </div>
        ))}
      </div>
    );
  };

  // 渲染第三层：文件列表
  const renderFileList = () => {
    if (isLoading) {
      return (
        <div className="source-target-tree__loading-container">
          <Spin size={24} />
          <Text type="secondary">加载中...</Text>
        </div>
      );
    }

    if (currentFileList.length === 0) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    return (
      <div className="list max-h-full overflow-y-auto">
        {currentFileList.map((file: any) => (
          <div
            key={file.id}
            className="list-item"
            onClick={() => handleFileClick(file)}
          >
            <div className="list-item-content">
              <IconFile className="list-item-content-icon" />
              <div className="list-item-content-info">
                <EllipsisPopover
                  className="list-item-content-info-name"
                  value={file.file_name || file.name}
                ></EllipsisPopover>
                <EllipsisPopover
                  className="list-item-content-info-size"
                  value={formatFileSize(file.file_size || file.size)}
                ></EllipsisPopover>
              </div>
            </div>
            <div className="list-item-actions">
              <Button
                type="outline"
                size="small"
                onClick={(e: Event) => {
                  if (type === DataDirectoryTreeFrom.SQL) {
                    handleDbInsert(file, e);
                  } else {
                    handleVolumeInsert(file, e);
                  }
                }}
                onMouseDown={(e) => {
                  // 阻止按钮获得焦点，保持编辑器焦点
                  e.preventDefault();
                }}
              >
                {isEditorFocused ? '插入' : '复制'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染数据库表列表
  const renderDbItemList = () => {
    if (!selectedDb?.children?.db_item?.length) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    const dbItems = selectedDb.children.db_item;

    return (
      <div className="list max-h-full overflow-y-auto">
        {dbItems.map((dbItem: any) => (
          <div
            key={dbItem.id}
            className="list-item"
            onClick={() => handleDbItemClick(dbItem)}
          >
            <div className="list-item-content">
              <IconFile className="list-item-content-icon" />
              <div className="list-item-content-info">
                <EllipsisPopover
                  className="list-item-content-info-name"
                  value={dbItem.name}
                  preferTypography
                ></EllipsisPopover>
                <EllipsisPopover
                  className="list-item-content-info-size"
                  value={formatFileSize(dbItem.file_size ?? 0)}
                ></EllipsisPopover>
              </div>
            </div>
            <div className="list-item-actions">
              {/* 详情按钮 */}
              <Button
                type="text"
                onClick={(e: Event) => handleDbDetail(dbItem, e)}
              >
                详情
              </Button>
              {/* 插入按钮 */}
              <Button
                type="outline"
                onClick={(e: Event) => {
                  handleDbInsert(dbItem, e);
                }}
                onMouseDown={(e) => {
                  // 阻止按钮获得焦点，保持编辑器焦点
                  e.preventDefault();
                }}
              >
                {isEditorFocused ? '插入' : '复制'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染数据库表列表
  const renderDatabaseTableList = () => {
    if (isLoading) {
      return (
        <div className="source-target-tree__loading-container">
          <Spin size={24} />
          <Text type="secondary">加载中...</Text>
        </div>
      );
    }

    if (!sourceCatalogTableList?.length) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    return (
      <div className="list max-h-full overflow-y-auto">
        {sourceCatalogTableList.map((table: any) => (
          <div
            key={table.id}
            className="list-item"
            onClick={() => handleFileClick(table)}
          >
            <div className="list-item-content">
              <IconFile className="list-item-content-icon" />
              <div className="list-item-content-info">
                <EllipsisPopover
                  className="list-item-content-info-name"
                  value={table.table_name ?? ''}
                  preferTypography
                ></EllipsisPopover>
                <EllipsisPopover
                  className="list-item-content-info-size"
                  value={formatFileSize(table.file_size ?? table.size ?? 0)}
                ></EllipsisPopover>
              </div>
            </div>
            <div className="list-item-actions">
              {/* 详情按钮 */}
              <Button
                type="text"
                onClick={(e: Event) => handleDbDetail(table, e)}
              >
                详情
              </Button>
              {/* 插入按钮 */}
              <Button
                type="outline"
                onClick={(e: Event) => {
                  handleDbInsert(table, e);
                }}
                onMouseDown={(e) => {
                  // 阻止按钮获得焦点，保持编辑器焦点
                  e.preventDefault();
                }}
              >
                {isEditorFocused ? '插入' : '复制'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染表字段列表
  const renderTableDetailList = () => {
    if (isLoading) {
      return (
        <div className="source-target-tree__loading-container">
          <Spin size={24} />
          <Text type="secondary">加载中...</Text>
        </div>
      );
    }

    if (!sourceCatalogTableDetail?.sample?.columns?.length) {
      return (
        <div className="source-target-tree__empty-container">
          <Empty />
        </div>
      );
    }

    const fields = sourceCatalogTableDetail.sample.columns;

    return (
      <div className="list max-h-full overflow-y-auto">
        {fields.map((fileld: string) => (
          <div key={fileld} className="list-item">
            <div className="list-item-content">
              <IconFile className="list-item-content-icon" />
              <div className="list-item-content-info">
                <EllipsisPopover
                  className="list-item-content-info-name"
                  value={fileld ?? ''}
                  preferTypography
                ></EllipsisPopover>
              </div>
            </div>
            <div className="list-item-actions">
              {/* 插入按钮 */}
              <Button
                type="outline"
                onClick={(e: Event) => {
                  handleDbInsert({ name: fileld }, e);
                }}
                onMouseDown={(e) => {
                  // 阻止按钮获得焦点，保持编辑器焦点
                  e.preventDefault();
                }}
              >
                {isEditorFocused ? '插入' : '复制'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染主要内容
  const renderMainContent = () => {
    console.log('让我瞅瞅这是第几层', currentViewLevel);
    switch (currentViewLevel) {
      case 'catalog':
        return renderCatalogList();
      case 'category':
        return renderCategoryList();
      case 'volume-db':
        return renderVolumeDbList();
      case 'files':
        return renderFileList();
      case 'db-item':
        return renderDbItemList();
      case 'database-tables':
        return renderDatabaseTableList();
      case 'table-detail':
        return renderTableDetailList();
      default:
        return renderCatalogList();
    }
  };

  return (
    <div className="source-target-tree">
      {renderHeader()}
      {renderSearchBox()}
      <div className="source-target-tree__content max-h-[calc(100vh-65px)] overflow-y-auto">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default SourceTargetTree;
