import React from 'react';
import { Tabs } from '@arco-design/web-react';
import BasicDemo from './BasicDemo';
import ControlledDemo from './ControlledDemo';
import LoadingDemo from './LoadingDemo';
import CustomIconDemo from './CustomIconDemo';
import CustomStyleDemo from './CustomStyleDemo';
import DisabledDemo from './DisabledDemo';

const TabPane = Tabs.TabPane;

/**
 * CollapsibleSection 组件所有示例的集合页面
 *
 * 可以在开发环境中访问此页面查看所有示例
 */
export default function AllDemos() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-bold">
            CollapsibleSection 组件示例
          </h1>
          <p className="text-gray-600">
            可折叠展开的内容区域组件，支持受控和非受控两种模式
          </p>
        </div>

        <div className="rounded-lg bg-white shadow">
          <Tabs defaultActiveTab="basic" type="card-gutter">
            <TabPane key="basic" title="基础用法">
              <BasicDemo />
            </TabPane>
            <TabPane key="controlled" title="受控模式">
              <ControlledDemo />
            </TabPane>
            <TabPane key="loading" title="加载状态">
              <LoadingDemo />
            </TabPane>
            <TabPane key="icon" title="自定义图标">
              <CustomIconDemo />
            </TabPane>
            <TabPane key="style" title="自定义样式">
              <CustomStyleDemo />
            </TabPane>
            <TabPane key="disabled" title="禁用状态">
              <DisabledDemo />
            </TabPane>
          </Tabs>
        </div>

        {/* 快速链接 */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-bold">快速链接</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="https://github.com/your-repo/CollapsibleSection"
              className="rounded border border-gray-300 p-3 hover:border-blue-500 hover:bg-blue-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="font-semibold">📦 GitHub</div>
              <div className="text-sm text-gray-600">查看源代码</div>
            </a>
            <a
              href="./README.md"
              className="rounded border border-gray-300 p-3 hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="font-semibold">📖 文档</div>
              <div className="text-sm text-gray-600">查看完整文档</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
