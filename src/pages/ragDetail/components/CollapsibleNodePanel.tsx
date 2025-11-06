/**
 * Collapsible Node Panel Component
 * 可折叠的节点详情面板
 */

import React, { useState } from 'react';
import { Message, Tooltip } from '@arco-design/web-react';
import { NodeDetail } from '../utils/traceLogMockData';
import UpCollapseIconSvg from '@/assets/rag/up-collapse.svg';
import DownCollapseIconSvg from '@/assets/rag/down-collapse.svg';
import CopyNormalIconSvg from '@/assets/rag/copy-normal.svg';
import CopyHighIconSvg from '@/assets/rag/copy-high.svg';

interface CollapsibleNodePanelProps {
  node: NodeDetail;
}

const CollapsibleNodePanel: React.FC<CollapsibleNodePanelProps> = ({
  node
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCopyButton, setHoveredCopyButton] = useState<
    'input' | 'output' | null
  >(null);
  const [hoveredSection, setHoveredSection] = useState<
    'input' | 'output' | null
  >(null);
  const [inputScrolled, setInputScrolled] = useState(false);
  const [outputScrolled, setOutputScrolled] = useState(false);

  const handleCopy = (data: any, section: 'input' | 'output') => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      Message.success(`已复制${section === 'input' ? '输入' : '输出'}数据`);
    });
  };

  const handleScroll = (
    e: React.UIEvent<HTMLDivElement>,
    section: 'input' | 'output'
  ) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (section === 'input') {
      setInputScrolled(scrollTop > 0);
    } else {
      setOutputScrolled(scrollTop > 0);
    }
  };

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left side: Index, Name, Status */}
        <div className="flex items-center">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-[#E8F2FF] text-xs font-medium text-[#2563EB]">
            {node.index}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">
            {node.name}
          </span>
          <div className="ml-2 flex items-center">
            {node.status === 'success' ? (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-green-600">处理成功</span>
              </>
            ) : (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                <span className="ml-2 text-sm text-red-600">处理失败</span>
              </>
            )}
          </div>
        </div>

        {/* Right side: Duration, Start Time, Expand/Collapse Text and Icon */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6E7B8D]">
            处理时长: <span className="text-[#0F172A]">{node.duration}</span>
          </span>
          <span className="text-sm text-[#6E7B8D]">
            开始时间: <span className="text-[#0F172A]">{node.startTime}</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[#165DFF]">
              {isExpanded ? '收起' : '展开'}
            </span>
            {isExpanded ? (
              <UpCollapseIconSvg className="h-3.5 w-3.5" />
            ) : (
              <DownCollapseIconSvg className="h-3.5 w-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex gap-4">
            {/* Input Section */}
            <div
              className="w-1/2 min-w-0 overflow-hidden rounded bg-[#F8FAFD]"
              onMouseEnter={() => setHoveredSection('input')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className="flex items-center justify-between px-3 pt-3 transition-shadow"
                style={{
                  boxShadow: inputScrolled
                    ? '0 2px 8px 0 rgba(0, 0, 0, 0.08)'
                    : 'none',
                  paddingBottom: '12px'
                }}
              >
                <span className="text-sm font-medium text-gray-700">输入</span>
                {hoveredSection === 'input' && (
                  <Tooltip content="复制">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(node.input, 'input');
                      }}
                      onMouseEnter={() => setHoveredCopyButton('input')}
                      onMouseLeave={() => setHoveredCopyButton(null)}
                      className="flex h-4 w-4 items-center justify-center"
                    >
                      {hoveredCopyButton === 'input' ? (
                        <CopyHighIconSvg className="h-4 w-4" />
                      ) : (
                        <CopyNormalIconSvg className="h-4 w-4" />
                      )}
                    </button>
                  </Tooltip>
                )}
              </div>
              <div
                className="scrollbar-hide max-h-[400px] overflow-auto px-3 pb-3"
                onScroll={(e) => handleScroll(e, 'input')}
              >
                <pre className="whitespace-pre-wrap break-words text-xs text-gray-800">
                  {JSON.stringify(node.input, null, 2)}
                </pre>
              </div>
            </div>

            {/* Output Section */}
            <div
              className="w-1/2 min-w-0 overflow-hidden rounded bg-[#F8FAFD]"
              onMouseEnter={() => setHoveredSection('output')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className="flex items-center justify-between px-3 pt-3 transition-shadow"
                style={{
                  boxShadow: outputScrolled
                    ? '0 2px 8px 0 rgba(0, 0, 0, 0.08)'
                    : 'none',
                  paddingBottom: '12px'
                }}
              >
                <span className="text-sm font-medium text-gray-700">输出</span>
                {hoveredSection === 'output' && (
                  <Tooltip content="复制">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(node.output, 'output');
                      }}
                      onMouseEnter={() => setHoveredCopyButton('output')}
                      onMouseLeave={() => setHoveredCopyButton(null)}
                      className="flex h-4 w-4 items-center justify-center"
                    >
                      {hoveredCopyButton === 'output' ? (
                        <CopyHighIconSvg className="h-4 w-4" />
                      ) : (
                        <CopyNormalIconSvg className="h-4 w-4" />
                      )}
                    </button>
                  </Tooltip>
                )}
              </div>
              <div
                className="scrollbar-hide max-h-[400px] overflow-auto px-3 pb-3"
                onScroll={(e) => handleScroll(e, 'output')}
              >
                <pre className="whitespace-pre-wrap break-words text-xs text-gray-800">
                  {JSON.stringify(node.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleNodePanel;
