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
import { useTargetTree } from '../../hooks/useTargetTree';
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
  onViewTargetDetail?: (volume: any) => void;
  onInsert?: (data: any) => void;
}

const SourceTree: React.FC<SourceTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewTargetDetail,
  onInsert
}) => {
  const {
    treeDataFiltered,
    handleSearch,
    expandedKeys,
    setExpandedKeys,
    loadMore,
    searchKeyword
  } = useTargetTree();

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 处理详情按钮点击
  const handleDetailClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      if (nodeData?.type === 'volume_item' && nodeData?.data) {
        onViewTargetDetail?.(nodeData.data);
      }
    },
    [onViewTargetDetail]
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
    <div className="target-tree">
      {/* 第一部分：标题导航 */}
      <div className="target-tree__header">
        <div className="target-tree__header-left">
          <IconArrowLeft
            className="target-tree__back-icon"
            onClick={handleBack}
          />
          <span className="target-tree__title">目标数据目录</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="target-tree__search">
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            handleSearch('');
          }}
          allowClear
          className="target-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div className="target-tree__content">
        {treeDataFiltered.length === 0 ? (
          <Empty />
        ) : (
          <Tree
            loadMore={loadMore}
            showLine
            blockNode
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            treeData={treeDataFiltered}
            className="target-tree__content-tree"
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
                <div className="target-tree__node">
                  <div className="target-tree__node-info">
                    <EllipsisPopover
                      className={`target-tree__node-title target-tree__node-title-${nodeData?.type}`}
                      value={highlightSearchKeyword(
                        String(nodeData?.title ?? ''),
                        searchKeyword
                      )}
                    />
                    {/* {(nodeData?.type === 'file' ||
                      nodeData?.type === 'volume_item') && (
                        <EllipsisPopover
                          className={`target-tree__node-size target-tree__node-size-${nodeData?.type}`}
                          value={
                            nodeData?.type === 'file'
                              ? formatFileSize(Number(nodeData?.file_size ?? 0))
                              : formatFileSize(Number(nodeData?.latest_size ?? 0))
                          }
                        />
                      )} */}
                  </div>
                  <div className="target-tree__node-actions">
                    {isVolumeItem && (
                      <Button
                        type="text"
                        className="target-tree__detail-btn"
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    {isFile && (
                      <Button
                        type="outline"
                        className="target-tree__insert-btn"
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
