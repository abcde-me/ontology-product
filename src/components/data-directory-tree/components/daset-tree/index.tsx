import React, { useState, useEffect } from 'react';
import { Button, Input, Empty, Spin } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconSearch,
  IconFile,
  IconFolder
} from '@arco-design/web-react/icon';
import { useDasetTree } from '../../hooks/useDasetTree';
import {
  DatasetListItem,
  DatasetVersionFileItem,
  Scheam
} from '@/types/datasetManagement';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import './index.scss';
import { formatFileSize } from '@/utils/format';
import { PYSPARK_PERMISSIONS } from '@/config/permissions';

interface DataSetTreeProps {
  type: 'sql' | 'python';
  onBack?: () => void;
  onSelectFile?: (file: DatasetVersionFileItem | Scheam) => void;
  onInsertFile?: (file: DatasetVersionFileItem | Scheam) => void;
  onSelectDataset?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertContent?: (content: string) => void;
  isEditorFocused?: boolean;
}

const DataSetTree: React.FC<DataSetTreeProps> = ({
  type,
  onBack,
  onSelectFile,
  onInsertFile,
  onSelectDataset,
  onInsertDataset,
  onViewDatasetDetail,
  onInsertContent,
  isEditorFocused = false
}) => {
  const {
    dasetList,
    dasetFileList,
    scheamList,
    currentPage,
    getDasetList,
    getDasetVersionFile,
    getScheamList
  } = useDasetTree(type);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFile, setSelectedFile] = useState<
    DatasetVersionFileItem | Scheam | null
  >(null);
  const [selectedDataset, setSelectedDataset] =
    useState<DatasetListItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isFileView, setIsFileView] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<DatasetListItem | null>(
    null
  );

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    // TODO: 实现搜索功能
    getDasetList();
  };

  // 处理返回
  const handleBack = () => {
    if (isFileView) {
      setIsFileView(false);
      setCurrentDataset(null);
      setCurrentPath('');
      setSelectedFile(null);
    } else if (onBack) {
      onBack();
    }
  };

  // 处理点击数据集
  const handleDatasetClick = async (dataset: DatasetListItem) => {
    setCurrentDataset(dataset);
    // setSelectedDataset(dataset);
    setIsFileView(true);
    setCurrentPath(`.../${dataset.name}`);

    // 根据类型使用不同的API请求
    if (type === 'sql') {
      // SQL类型使用getScheamList
      getScheamList(dataset.id);
    } else {
      // Python类型使用getDasetVersionFile
      await getDasetVersionFile(dataset.id, dataset.latest_version, 1, 50);
    }
  };

  // 处理数据集选择
  const handleDatasetSelect = (dataset: DatasetListItem) => {
    // setSelectedDataset(dataset);
    onSelectDataset?.(dataset);
  };

  // 处理数据集插入
  const handleDatasetInsert = (
    dataset: DatasetListItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    onInsertDataset?.(dataset);
  };

  // 处理查看数据集详情
  const handleViewDatasetDetail = (
    dataset: DatasetListItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    onViewDatasetDetail?.(dataset);
  };

  // 处理文件选择
  const handleFileSelect = (file: DatasetVersionFileItem | Scheam) => {
    setSelectedFile(file);
    onSelectFile?.(file);
  };

  // 根据类型获取当前文件列表
  const getCurrentFileList = () => {
    if (type === 'sql') {
      return scheamList;
    } else {
      return dasetFileList;
    }
  };

  // 获取文件显示名称
  const getFileDisplayName = (file: DatasetVersionFileItem | Scheam) => {
    if ('file_name' in file) {
      return file.file_name;
    }
    if ('name' in file) {
      return file.name || '未命名字段';
    }
    return '未知';
  };

  // 获取文件大小显示
  const getFileSizeDisplay = (file: DatasetVersionFileItem) => {
    return formatFileSize(Number(file?.file_size ?? 0));
  };

  // 检查文件是否被选中
  const isFileSelected = (file: DatasetVersionFileItem | Scheam) => {
    if (!selectedFile) return false;

    if ('file_name' in file && 'file_name' in selectedFile) {
      return file.file_name === selectedFile.file_name;
    }
    if ('name' in file && 'name' in selectedFile) {
      return file.name === selectedFile.name;
    }
    return false;
  };

  return (
    <div className="dataset-tree">
      {/* 第一部分：标题导航 */}
      <div className="dataset-tree__header">
        <div className="dataset-tree__header-left">
          <IconArrowLeft
            className="dataset-tree__back-icon"
            onClick={handleBack}
          />
          <span className="dataset-tree__title">
            {isFileView ? currentPath : '数据集'}
          </span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="dataset-tree__search">
        <Input.Search
          placeholder={isFileView ? '搜索当前文件夹' : '输入关键词搜索'}
          value={searchKeyword}
          onChange={setSearchKeyword}
          onSearch={handleSearch}
          allowClear
          className="dataset-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div className="dataset-tree__content">
        {isFileView ? (
          // 文件列表视图
          <div className="dataset-tree__file-list">
            {getCurrentFileList().length > 0 ? (
              getCurrentFileList().map((file, index) => {
                const isSelected = isFileSelected(file);

                return (
                  <div
                    key={index}
                    className={`dataset-tree__file-item ${isSelected ? 'dataset-tree__file-item--selected' : ''}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="dataset-tree__file-item-left">
                      <IconFile className="dataset-tree__file-icon" />
                      <div className="dataset-tree__file-info">
                        <div className="dataset-tree__file-name">
                          {getFileDisplayName(file)}
                        </div>
                        {file.file_size && (
                          <div className="dataset-tree__file-size">
                            {getFileSizeDisplay(file)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="dataset-tree__file-actions">
                      <Button
                        type="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDatasetInsert(
                            file,
                            e as unknown as React.MouseEvent<
                              Element,
                              MouseEvent
                            >
                          );
                        }}
                      >
                        {isEditorFocused ? '插入' : '复制'}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty description="暂无数据" />
            )}
          </div>
        ) : (
          // 数据集列表视图
          <div className="dataset-tree__dataset-list">
            {dasetList.length > 0 ? (
              dasetList.map(
                (dataset) =>
                  dataset?.perms?.includes(
                    PYSPARK_PERMISSIONS.CAN_DATASETS_SEARCH
                  ) && (
                    <div
                      key={dataset.id}
                      className={`dataset-tree__dataset-item ${selectedDataset?.id === dataset.id ? 'dataset-tree__dataset-item--selected' : ''}`}
                      onClick={() => handleDatasetClick(dataset)}
                    >
                      <div className="dataset-tree__dataset-item-left">
                        <IconFolder className="dataset-tree__dataset-icon" />
                        <div className="dataset-tree__dataset-info">
                          <EllipsisPopover
                            value={dataset.name}
                            className="dataset-tree__dataset-name"
                          />
                          <div className="dataset-tree__dataset-size">
                            {formatFileSize(Number(dataset.latest_size ?? 0))}
                          </div>
                        </div>
                      </div>
                      <div className="dataset-tree__dataset-actions">
                        <Button
                          type="text"
                          onClick={(e) =>
                            handleViewDatasetDetail(
                              dataset,
                              e as unknown as React.MouseEvent<
                                Element,
                                MouseEvent
                              >
                            )
                          }
                        >
                          详情
                        </Button>
                        {/* 插入按钮，数据集目录不支持插入 */}
                        {/* <Button
                      type="outline"
                      onClick={(e) =>
                        handleDatasetInsert(
                          dataset,
                          e as unknown as React.MouseEvent<Element, MouseEvent>
                        )
                      }
                    >
                      {isEditorFocused ? '插入' : '复制'}
                    </Button> */}
                      </div>
                    </div>
                  )
              )
            ) : (
              <Empty description="暂无数据" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default DataSetTree;
