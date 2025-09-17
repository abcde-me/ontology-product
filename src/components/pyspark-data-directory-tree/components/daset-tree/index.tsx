import React, { useCallback, useMemo } from 'react';
import { Tree, Input, Button, Space, Typography } from '@arco-design/web-react';
import { IconLeft, IconSearch } from '@arco-design/web-react/icon';
import { useDasetTree } from '../../hooks/useDasetTree';
import { useDatasetTreeState } from '../../hooks/useDatasetTreeState';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';

const { Title } = Typography;

interface DataSetTreeProps {
  onBack?: () => void;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
}

const DataSetTree: React.FC<DataSetTreeProps> = ({
  onBack,
  onViewDatasetDetail
}) => {
  const {
    dasetList,
    searchKeyword,
    setSearchKeyword,
    getDasetList,
    getDasetVersionFile
  } = useDasetTree();

  // 加载数据集文件的函数
  const loadDatasetFiles = useCallback(
    async (dataset: DatasetListItem) => {
      return await getDasetVersionFile(dataset.id, dataset.latest_version);
    },
    [getDasetVersionFile]
  );

  // 使用自定义 hook 管理树状态
  const {
    expandedKeys,
    selectedKeys,
    handleExpand,
    handleSelect,
    buildTreeData
  } = useDatasetTreeState({
    onViewDatasetDetail,
    onLoadDatasetFiles: loadDatasetFiles
  });

  // 处理搜索
  const handleSearch = useCallback(
    (value: string) => {
      setSearchKeyword(value);
      getDasetList(value);
    },
    [setSearchKeyword, getDasetList]
  );

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 构建树数据
  const treeData = useMemo(() => {
    return buildTreeData(dasetList);
  }, [dasetList, buildTreeData]);

  return (
    <div className="dataset-tree-container">
      {/* 标题部分 */}
      <div className="dataset-tree-header">
        <Space align="center">
          <Button
            type="text"
            icon={<IconLeft />}
            onClick={handleBack}
            className="back-button"
          >
            返回
          </Button>
          <Title heading={4} className="dataset-title">
            数据集
          </Title>
        </Space>
      </div>

      {/* 搜索框部分 */}
      <div className="dataset-tree-search">
        <Input
          placeholder="输入关键词搜索"
          value={searchKeyword}
          onChange={handleSearch}
          prefix={<IconSearch />}
          allowClear
          className="search-input"
        />
      </div>

      {/* 树形结构部分 */}
      <div className="dataset-tree-content">
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={handleExpand}
          onSelect={handleSelect}
          showLine
          blockNode
          selectable
          className="dataset-tree"
        />
      </div>
    </div>
  );
};

export default DataSetTree;
