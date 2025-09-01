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
import { useSourceTargetTree } from '../../hooks/useSourceTargetTree';
import { CatalogRootType, CatalogItemType } from '@/api/dataCatalog';
import './index.scss';

const { Title, Text } = Typography;

interface SourceTargetTreeProps {
  type: 'python' | 'sql';
  dataType: 'source' | 'target';
  onBack: () => void;
  onSelectFile?: (file: any) => void;
  onFileDetail?: (file: any) => void;
  onFileInsert?: (file: any) => void;
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
type ViewLevel = 'catalog' | 'volume-db' | 'files';

const SourceTargetTree: React.FC<SourceTargetTreeProps> = ({
  type,
  dataType,
  onBack,
  onSelectFile,
  onFileDetail,
  onFileInsert
}) => {
  const {
    targetCatalogList,
    sourceCatalogList,
    getCatalogList,
    sourceCatalogFileList,
    targetCatalogFileList,
    getCatalogFileList,
    currentPage
  } = useSourceTargetTree();

  const [searchValue, setSearchValue] = useState('');
  const [currentViewLevel, setCurrentViewLevel] =
    useState<ViewLevel>('catalog');
  const [selectedCatalog, setSelectedCatalog] = useState<any>(null);
  const [selectedVolumeOrDb, setSelectedVolumeOrDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  // 处理文件详情按钮点击
  const handleFileDetail = useCallback(
    (file: any, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发文件选择
      if (onFileDetail) {
        onFileDetail(file);
      }
    },
    [onFileDetail]
  );

  // 处理文件插入按钮点击
  const handleFileInsert = useCallback(
    (file: any, event: Event) => {
      event.stopPropagation(); // 阻止事件冒泡，避免触发文件选择
      if (onFileInsert) {
        onFileInsert(file);
      }
    },
    [onFileInsert]
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
          <span className="source-target-tree__catalog-name">{item.name}</span>
        </div>
      ),
      icon: null, // 不使用默认图标，在title中自定义
      isLeaf: false,
      data: { ...item, type: 'catalog' }
    }));
  }, [currentCatalogList]);

  // 生成第二层数据卷和数据库列表
  const generateVolumeDbList = useMemo((): Array<{
    key: string;
    title: React.ReactNode;
    data: any;
  }> => {
    if (!selectedCatalog) return [];

    const items: Array<{
      key: string;
      title: React.ReactNode;
      data: any;
    }> = [];

    // 添加数据卷
    if (
      selectedCatalog.children?.volume &&
      selectedCatalog.children.volume.length > 0
    ) {
      items.push(
        ...selectedCatalog.children.volume.map((volume: any) => ({
          key: `volume-${volume.id}`,
          title: (
            <div className="source-target-tree__volume-db-item">
              <IconStorage className="source-target-tree__volume-db-icon" />
              <div className="source-target-tree__volume-db-info">
                <span className="source-target-tree__volume-db-name">
                  {volume.name}
                </span>
              </div>
            </div>
          ),
          data: { ...volume, type: 'volume', parentCatalog: selectedCatalog }
        }))
      );
    }

    // 添加数据库
    if (
      selectedCatalog.children?.db &&
      selectedCatalog.children.db.length > 0
    ) {
      items.push(
        ...selectedCatalog.children.db.map((db: any) => ({
          key: `db-${db.id}`,
          title: (
            <div className="source-target-tree__volume-db-item">
              <IconStorage className="source-target-tree__volume-db-icon" />
              <div className="source-target-tree__volume-db-info">
                <span className="source-target-tree__volume-db-name">
                  {db.name}
                </span>
              </div>
            </div>
          ),
          data: { ...db, type: 'database', parentCatalog: selectedCatalog }
        }))
      );
    }

    return items;
  }, [selectedCatalog]);

  // 处理目录点击（第一层）
  const handleCatalogClick = (catalog: any) => {
    setSelectedCatalog(catalog);
    setCurrentViewLevel('volume-db');
    setBreadcrumbPath([catalog.name]);
  };

  // 处理数据卷或数据库点击（第二层）
  const handleVolumeDbClick = async (item: any) => {
    setSelectedVolumeOrDb(item);
    setCurrentViewLevel('files');
    setBreadcrumbPath([selectedCatalog.name, item.name]);

    // 调用接口获取文件列表
    setIsLoading(true);
    try {
      const rootType =
        dataType === 'source' ? CatalogRootType.Source : CatalogRootType.Target;
      const params = {
        path_id: item.id.toString(),
        page: 1,
        limit: 100,
        full_path: item.base_dir || '',
        sort_field: 'created_at',
        sort_order: 'desc'
      };

      await getCatalogFileList(rootType, params);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件点击（第三层）
  const handleFileClick = (file: any) => {
    if (onSelectFile) {
      onSelectFile(file);
    }
  };

  // 返回上级目录
  const handleBack = () => {
    if (currentViewLevel === 'files') {
      // 从文件列表返回到数据卷/数据库列表
      setCurrentViewLevel('volume-db');
      setBreadcrumbPath([selectedCatalog.name]);
    } else if (currentViewLevel === 'volume-db') {
      // 从数据卷/数据库列表返回到目录列表
      setCurrentViewLevel('catalog');
      setSelectedCatalog(null);
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
    } else if (currentViewLevel === 'volume-db') {
      // 第二层：显示面包屑路径
      title = selectedCatalog?.name || '';
      showBreadcrumb = true;
    } else if (currentViewLevel === 'files') {
      // 第三层：显示面包屑路径
      title = selectedVolumeOrDb?.name || '';
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
                <Text type="secondary">.../{title}</Text>
              </div>
            ) : (
              <div className="source-target-tree__title">{title}</div>
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
  const renderCatalogList = () => (
    <div className="source-target-tree__catalog-list">
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

  // 渲染第二层：数据卷和数据库列表
  const renderVolumeDbList = () => (
    <div className="source-target-tree__volume-db-list">
      {generateVolumeDbList.map((item) => (
        <div
          key={item.key}
          className="source-target-tree__volume-db-item"
          onClick={() => handleVolumeDbClick(item.data)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );

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
          <Empty description="暂无文件" />
        </div>
      );
    }

    return (
      <div className="source-target-tree__file-list">
        {currentFileList.map((file: any) => (
          <div
            key={file.id}
            className="source-target-tree__file-item"
            onClick={() => handleFileClick(file)}
          >
            <div className="source-target-tree__file-item-left">
              <IconFile className="source-target-tree__file-icon" />
              <div className="source-target-tree__file-info">
                <span className="source-target-tree__file-name">
                  {file.file_name || file.name}
                </span>
                <span className="source-target-tree__file-size">
                  {file.file_size || file.size || '未知大小'}
                </span>
              </div>
            </div>
            <div className="source-target-tree__file-actions">
              <Button
                type="text"
                size="small"
                onClick={(e: Event) => handleFileDetail(file, e)}
              >
                详情
              </Button>
              <Button
                type="outline"
                size="small"
                onClick={(e: Event) => handleFileInsert(file, e)}
              >
                插入
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染主要内容
  const renderMainContent = () => {
    switch (currentViewLevel) {
      case 'catalog':
        return renderCatalogList();
      case 'volume-db':
        return renderVolumeDbList();
      case 'files':
        return renderFileList();
      default:
        return renderCatalogList();
    }
  };

  return (
    <div className="source-target-tree">
      {renderHeader()}
      {renderSearchBox()}
      <div className="source-target-tree__content">{renderMainContent()}</div>
    </div>
  );
};

export default SourceTargetTree;
