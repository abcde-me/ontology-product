import React, { useCallback, useMemo } from 'react';
import {
  Tree,
  Input,
  Button,
  Space,
  Typography,
  Empty
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import {
  IconArrowLeft,
  IconCaretDown,
  IconCaretRight
} from '@arco-design/web-react/icon';
import { useDatasetTree } from '../../hooks/useDatasetTree';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { A } from '@svgdotjs/svg.js';
import { formatFileSize } from '@/utils/format';

const { Title } = Typography;

interface DataSetTreeProps {
  isEditorFocused?: boolean;
  onBack?: () => void;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onInsertContent?: (dataset: DatasetListItem) => void;
}

const DataSetTree: React.FC<DataSetTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewDatasetDetail,
  onInsertDataset,
  onInsertContent
}) => {
  // 使用合并后的 hook
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    handleSearch,
    loadMore,
    searchKeyword
  } = useDatasetTree();

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 处理详情按钮点击
  const handleDetailClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      if (nodeData?.type === 'dataset' && nodeData?.data) {
        onViewDatasetDetail?.(nodeData.data);
      }
    },
    [onViewDatasetDetail]
  );

  // 处理插入按钮点击
  const handleInsertClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      // 这里可以添加插入逻辑
      onInsertDataset?.(nodeData.data);
    },
    [onInsertDataset]
  );

  // 高亮显示搜索关键词
  const highlightSearchKeyword = useCallback(
    (text: string, keyword: string) => {
      if (!keyword) return text;

      const index = text.toLowerCase().indexOf(keyword.toLowerCase());

      if (index === -1) return text;

      const prefix = text.substr(0, index);
      const suffix = text.substr(index + keyword.length);
      return (
        <span>
          {prefix}
          <span style={{ color: '#007DFA' }}>
            {text.substr(index, keyword.length)}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

  return (
    <div className="pyspark-dataset-tree">
      {/* 第一部分：标题导航 */}
      <div className="pyspark-dataset-tree__header">
        <div className="pyspark-dataset-tree__header-left">
          <IconArrowLeft
            className="pyspark-dataset-tree__back-icon"
            onClick={handleBack}
          />
          <span className="pyspark-dataset-tree__title">数据集</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="pyspark-dataset-tree__search">
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            // setExpandedKeys([]);
            handleSearch('');
          }}
          allowClear
          className="pyspark-dataset-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div className="pyspark-dataset-tree__content">
        {treeData.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            loadMore={loadMore}
            showLine
            blockNode
            treeData={treeData}
            expandedKeys={expandedKeys}
            className="pyspark-dataset-tree__content-tree"
            onExpand={setExpandedKeys}
            icons={(props) => ({
              switcherIcon:
                props.dataRef?.type === 'dataset' ? <IconCaretDown /> : null,
              dragIcon: <IconCaretRight />
            })}
            renderTitle={(props) => {
              const nodeData = props.dataRef;
              const isDataset = nodeData?.type === 'dataset';
              const isFile = nodeData?.type === 'file';

              return (
                <div className="pyspark-dataset-tree__node">
                  <div className="pyspark-dataset-tree__node-info">
                    <EllipsisPopover
                      className={`pyspark-dataset-tree__node-title ${isDataset ? 'pyspark-dataset-tree__node-title-dataset' : 'pyspark-dataset-tree__node-title-file'}`}
                      value={highlightSearchKeyword(
                        String(nodeData?.title ?? ''),
                        searchKeyword
                      )}
                    />
                    <div className="pyspark-dataset-tree__node-size">
                      {formatFileSize(Number(nodeData?.latest_size ?? 0))}
                    </div>
                  </div>
                  <div className="pyspark-dataset-tree__node-actions">
                    {isDataset && (
                      <Button
                        type="text"
                        className="pyspark-dataset-tree__detail-btn"
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    {isFile && (
                      <Button
                        type="outline"
                        className="pyspark-dataset-tree__insert-btn"
                        onClick={(e) => handleInsertClick(e, nodeData)}
                        onMouseDown={(e) => {
                          // 阻止按钮获得焦点，保持编辑器焦点
                          e.preventDefault();
                        }}
                      >
                        {isEditorFocused ? '插入' : '复制'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DataSetTree;
