import EllipsisPopover from '@/components/ellipsis-popover-com';
import { formatFileSize } from '@/utils/format';
import { Button, Empty, Input, Tree, Spin } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCaretDown,
  IconCaretRight
} from '@arco-design/web-react/icon';
import React, { useCallback } from 'react';
import { useSourceTree } from '../../hooks/useSourceTree';
import './index.scss';

interface SourceTreeProps {
  isEditorFocused?: boolean;
  onBack?: () => void;
  onViewDbDetail?: (nodeData: any) => void;
  onDbInsert?: (data: any) => void;
}

const SourceTree: React.FC<SourceTreeProps> = ({
  isEditorFocused = false,
  onBack,
  onViewDbDetail,
  onDbInsert
}) => {
  const {
    treeDataFiltered,
    handleSearch,
    expandedKeys,
    setExpandedKeys,
    loadMore,
    searchKeyword,
    treeDataLoading
  } = useSourceTree();

  // 处理返回
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // 处理详情按钮点击
  const handleDetailClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      onViewDbDetail?.(nodeData);
    },
    [onViewDbDetail]
  );

  // 处理插入按钮点击
  const handleInsertClick = useCallback(
    (e: any, nodeData: any) => {
      e.stopPropagation();
      onDbInsert?.(nodeData?.data ?? {});
    },
    [onDbInsert]
  );

  // 高亮显示搜索关键词
  const highlightSearchKeyword = useCallback(
    (text: string, keyword: string) => {
      if (!keyword.trim()) return text;

      const lowerText = text.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      const index = lowerText.indexOf(lowerKeyword);

      if (index === -1) return text;

      const prefix = text.substring(0, index);
      const matchedText = text.substring(index, index + keyword.length);
      const suffix = text.substring(index + keyword.length);

      return (
        <span>
          {prefix}
          <span
            style={{
              color: '#007DFA'
            }}
          >
            {matchedText}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

  return (
    <div className="sql-source-tree">
      {/* 第一部分：标题导航 */}
      <div className="sql-source-tree__header">
        <div className="sql-source-tree__header-left">
          <IconArrowLeft
            className="sql-source-tree__back-icon"
            onClick={handleBack}
          />
          <span className="sql-source-tree__title">源数据目录</span>
        </div>
      </div>

      {/* 第二部分：搜索框 */}
      <div className="sql-source-tree__search">
        <Input.Search
          placeholder={'搜索当前文件夹'}
          onSearch={(value) => {
            handleSearch(value);
          }}
          onClear={() => {
            handleSearch('');
          }}
          allowClear
          className="sql-source-tree__search-input"
        />
      </div>

      {/* 第三部分：列表 */}
      <div
        className={`sql-source-tree__content ${treeDataLoading ? 'sql-source-tree__content--loading' : ''}`}
      >
        {treeDataLoading ? (
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
            className="sql-source-tree__content-tree"
            icons={(props) => {
              const nodeType = props.dataRef?.type;
              const isExpandable = [
                'catalog',
                'db_group',
                'db',
                'db_item',
                'table'
              ].includes(nodeType);
              return {
                switcherIcon: isExpandable ? <IconCaretDown /> : null,
                dragIcon: <IconCaretRight />
              };
            }}
            renderTitle={(props) => {
              const nodeData = props.dataRef;
              const showDetailBtn = ['db_item', 'table'].includes(
                nodeData?.type
              );
              const showInsertBtn = ['db_item', 'table', 'column'].includes(
                nodeData?.type
              );

              return (
                <div className="sql-source-tree__node">
                  <EllipsisPopover
                    className={`sql-source-tree__node-title sql-source-tree__node-title-${nodeData?.type}`}
                    value={highlightSearchKeyword(
                      String(nodeData?.title ?? ''),
                      searchKeyword
                    )}
                  />
                  <div className="sql-source-tree__node-actions">
                    {showDetailBtn && (
                      <Button
                        style={{ fontWeight: 600, margin: '0 2px', padding: 0 }}
                        type="text"
                        className="sql-source-tree__detail-btn"
                        onClick={(e) => handleDetailClick(e, nodeData)}
                      >
                        详情
                      </Button>
                    )}
                    {showInsertBtn && (
                      <Button
                        type="outline"
                        className="sql-source-tree__insert-btn"
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
