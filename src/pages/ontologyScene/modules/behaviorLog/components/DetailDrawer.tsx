import React, { useState } from 'react';
import { Tabs, Tag, Button, Message } from '@arco-design/web-react';
import { IconCopy, IconFullscreen } from '@arco-design/web-react/icon';
import { OsDrawer } from '@/pages/ontologyScene/componens/OSDrawer';
import { BehaviorLogItem, STATUS_CONFIG } from '../types';

const TabPane = Tabs.TabPane;

interface DetailDrawerProps {
  visible: boolean;
  data: BehaviorLogItem | null;
  onClose: () => void;
}

// 格式化耗时
const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

// Mock 入参数据
const getMockInputParams = (record: BehaviorLogItem) => {
  return JSON.stringify(
    {
      media_id: 'IMG_RECON_001',
      location: '19.2, 122.5',
      confidence_threshold: 0.85,
      enable_cache: true
    },
    null,
    2
  );
};

// Mock 执行详情（SQL）
const getMockExecutionDetail = (record: BehaviorLogItem) => {
  return `-- 从公司信息表中抽取符合条件的数据
-- 假设表结构：company_id(公司ID), company_name(公司名称), industry(行业), establish_year(成立年份),
--           employee_count(员工数量), annual_revenue(年收入, 单位：万元), city(所在城市)

SELECT
    company_id,
    company_name,
    industry,
    establish_year,
    employee_count,
    annual_revenue,
    city
FROM
    company_info
WHERE
    -- 筛选行业为科技或金融
    industry IN ('科技', '金融')
    -- 成立年份在2010年及以后
    AND establish_year >= 2010
    -- 员工数量超过500人
    AND employee_count > 500
    -- 年收入超过1亿元
    AND annual_revenue > 10000
    -- 所在城市为一线城市
    AND city IN ('北京', '上海', '广州', '深圳')
ORDER BY
    annual_revenue DESC
LIMIT 100;`;
};

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  visible,
  data,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('input');

  if (!data) return null;

  const statusConfig = STATUS_CONFIG[data.status];

  // 复制到剪贴板
  const handleCopy = () => {
    const content =
      activeTab === 'input'
        ? getMockInputParams(data)
        : getMockExecutionDetail(data);
    navigator.clipboard.writeText(content);
    Message.success('已复制到剪贴板');
  };

  return (
    <OsDrawer
      visible={visible}
      title="执行记录详情"
      onCancel={onClose}
      width={720}
      placement="right"
    >
      <div className="flex h-full flex-col">
        {/* 基本信息 */}
        <div className="flex-shrink-0 border-b border-[#e5e6eb] px-6 py-4">
          <div className="mb-3 text-sm font-medium text-[#1d2129]">
            基本信息
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-20 flex-shrink-0 text-sm text-[#86909c]">
                行为名称:
              </span>
              <span className="flex-1 text-sm text-[#1d2129]">{data.type}</span>
              <span className="w-16 flex-shrink-0 text-right text-sm text-[#86909c]">
                状态:
              </span>
              <Tag
                color={statusConfig.color}
                style={{
                  backgroundColor: statusConfig.bgColor,
                  border: 'none'
                }}
              >
                {statusConfig.text}
              </Tag>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-20 flex-shrink-0 text-sm text-[#86909c]">
                描述说明:
              </span>
              <span className="flex-1 text-sm text-[#1d2129]">
                分布在边界区域的实时气象采集设备信息流映射
              </span>
              <span className="w-16 flex-shrink-0 text-right text-sm text-[#86909c]">
                id:
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm text-[#1d2129]">Action</span>
                <IconCopy className="cursor-pointer text-sm text-[#86909c] hover:text-[#165dff]" />
              </div>
            </div>
          </div>
        </div>

        {/* 执行信息 */}
        <div className="flex-shrink-0 border-b border-[#e5e6eb] px-6 py-4">
          <div className="mb-3 text-sm font-medium text-[#1d2129]">
            执行信息
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-20 flex-shrink-0 text-sm text-[#86909c]">
                触发时间:
              </span>
              <span className="flex-1 text-sm text-[#1d2129]">
                {data.startTime}
              </span>
              <span className="w-20 flex-shrink-0 text-right text-sm text-[#86909c]">
                执行耗时:
              </span>
              <span className="text-sm text-[#1d2129]">
                {data.status === 'running'
                  ? '-'
                  : formatDuration(data.duration)}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-20 flex-shrink-0 text-sm text-[#86909c]">
                完成时间:
              </span>
              <span className="flex-1 text-sm text-[#1d2129]">
                {data.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 切换 + 代码编辑器 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e5e6eb] px-6">
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              type="line"
              className="flex-1"
            >
              <TabPane title="入参详情" key="input" />
              <TabPane title="执行详情" key="execution" />
            </Tabs>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                icon={<IconCopy />}
                onClick={handleCopy}
              >
                复制
              </Button>
              <Button type="text" size="small" icon={<IconFullscreen />}>
                全屏
              </Button>
            </div>
          </div>

          {/* 代码编辑器 */}
          <div className="flex-1 overflow-auto bg-[#f7f8fa] p-4">
            <pre className="m-0 text-[13px] leading-[20px] text-[#1d2129]">
              <code>
                {activeTab === 'input'
                  ? getMockInputParams(data)
                  : getMockExecutionDetail(data)}
              </code>
            </pre>
          </div>
        </div>

        {/* 错误信息（失败时显示） */}
        {data.status === 'failed' && data.errorMessage && (
          <div className="flex-shrink-0 border-t border-[#f53f3f] bg-[#ffece8] px-6 py-3">
            <div className="text-sm font-medium text-[#f53f3f]">错误信息</div>
            <div className="mt-1 text-sm text-[#f53f3f]">
              {data.errorMessage}
            </div>
          </div>
        )}
      </div>
    </OsDrawer>
  );
};
