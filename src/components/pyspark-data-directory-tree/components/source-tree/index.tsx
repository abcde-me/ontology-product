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
import { useSourceTree } from '../../hooks/useSourceTree';

const { Title } = Typography;

interface DataSetTreeProps {
  isEditorFocused?: boolean;
  onBack?: () => void;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onInsertContent?: (dataset: DatasetListItem) => void;
}

const SourceTree: React.FC<DataSetTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewDatasetDetail,
  onInsertDataset,
  onInsertContent
}) => {
  const {
    treeDataFiltered,
    handleSearch,
    expandedKeys,
    setExpandedKeys,
    loadMore,
    searchKeyword
  } = useSourceTree();

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
  const handleInsertClick = useCallback((e: any, nodeData: any) => {
    e.stopPropagation();
    console.log('Insert clicked for:', nodeData);
    // 这里可以添加插入逻辑
    onInsertDataset?.(nodeData.data);
  }, []);

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
          <span style={{ color: 'var(--color-primary-light-4)' }}>
            {text.substr(index, keyword.length)}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

  return (
    <div className="dataset-tree">
      {/* 第一部分：标题导航 */}
      <div className="dataset-tree__header">
        <div className="dataset-tree__header-left">
          <IconArrowLeft
            className="dataset-tree__back-icon"
            onClick={handleBack}
          />
          <span className="dataset-tree__title">源数据目录</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="dataset-tree__search">
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            handleSearch('');
          }}
          allowClear
          className="dataset-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div className="dataset-tree__content">
        {treeDataFiltered.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            loadMore={loadMore}
            showLine
            blockNode
            selectable={false}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            treeData={treeDataFiltered}
            className="dataset-tree__content-tree"
            icons={(props) => {
              const nodeType = props.dataRef?.type;
              const isExpandable = [
                'dataset',
                'catalog',
                'volume',
                'volume_item'
              ].includes(nodeType);
              return {
                switcherIcon: isExpandable ? <IconCaretDown /> : null,
                dragIcon: <IconCaretRight />
              };
            }}
            renderTitle={(props) => {
              const nodeData = props.dataRef;
              const isVolumeItem = nodeData?.type === 'volume_item';
              const isFile = nodeData?.type === 'file';

              return (
                <div className="dataset-tree__node">
                  <div className="dataset-tree__node-info">
                    <EllipsisPopover
                      className={`dataset-tree__node-title`}
                      value={highlightSearchKeyword(
                        String(nodeData?.title ?? ''),
                        searchKeyword
                      )}
                    />
                  </div>
                  <div className="dataset-tree__node-actions">
                    {isVolumeItem && (
                      <Button
                        type="text"
                        className="dataset-tree__detail-btn"
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    {(isFile || isVolumeItem) && (
                      <Button
                        type="outline"
                        className="dataset-tree__insert-btn"
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

export default SourceTree;
