import React, { useCallback, useMemo, useState } from 'react';
import {
  Tree,
  Input,
  Button,
  Space,
  Typography,
  Empty,
  Spin
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
import { FluffyVolume } from '@/api/dataCatalog';

const { Title } = Typography;

interface SourceTreeProps {
  isEditorFocused?: boolean;
  onBack?: () => void;
  onViewSourceDetail?: (volume: any) => void;
  onInsert?: (data: any) => void;
}

const SourceTree: React.FC<SourceTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewSourceDetail,
  onInsert
}) => {
  const {
    treeDataFiltered,
    handleSearch,
    expandedKeys,
    setExpandedKeys,
    loadMore,
    searchKeyword,
    loading
  } = useSourceTree();

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 处理详情按钮点击
  const handleDetailClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      if (nodeData?.type === 'volume_item' && nodeData?.data) {
        onViewSourceDetail?.(nodeData.data);
      }
    },
    [onViewSourceDetail]
  );

  // 处理插入按钮点击
  const handleInsertClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      onInsert?.(nodeData?.data ?? {});
    },
    [onInsert]
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
    <div className="pyspark-source-tree">
      {/* 第一部分：标题导航 */}
      <div className="pyspark-source-tree__header">
        <div className="pyspark-source-tree__header-left">
          <IconArrowLeft
            className="pyspark-source-tree__back-icon"
            onClick={handleBack}
          />
          <span className="pyspark-source-tree__title">源数据目录</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="pyspark-source-tree__search">
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            setExpandedKeys([]);
            handleSearch('');
          }}
          allowClear
          className="pyspark-source-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div className="pyspark-source-tree__content">
        {loading ? (
          <div className="mt-[110px] flex flex-col items-center">
            <Spin size={26} />
            <div className="text-[rgba(15, 23, 42, 1)] text-[14px]">加载中</div>
          </div>
        ) : treeDataFiltered.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            loadMore={loadMore}
            showLine
            blockNode
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            treeData={treeDataFiltered}
            className="pyspark-source-tree__content-tree"
            icons={(props) => {
              const nodeType = props.dataRef?.type;
              const isExpandable = [
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
                <div className="pyspark-source-tree__node">
                  <div className="pyspark-source-tree__node-info">
                    <EllipsisPopover
                      className={`pyspark-source-tree__node-title pyspark-source-tree__node-title-${nodeData?.type}`}
                      value={highlightSearchKeyword(
                        String(nodeData?.title ?? ''),
                        searchKeyword
                      )}
                    />
                    {(nodeData?.type === 'file' ||
                      nodeData?.type === 'volume_item') && (
                      <EllipsisPopover
                        className={`pyspark-source-tree__node-size pyspark-source-tree__node-size-${nodeData?.type}`}
                        value={
                          nodeData?.type === 'file'
                            ? formatFileSize(Number(nodeData?.file_size ?? 0))
                            : formatFileSize(Number(nodeData?.latest_size ?? 0))
                        }
                      />
                    )}
                  </div>
                  <div className="pyspark-source-tree__node-actions">
                    {isVolumeItem && (
                      <Button
                        type="text"
                        className="pyspark-source-tree__detail-btn"
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    {isFile && (
                      <Button
                        type="outline"
                        className="pyspark-source-tree__insert-btn"
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
