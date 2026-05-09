import React from 'react';
import { CollapsibleSection } from '../index';

/**
 * 基础用法示例
 *
 * 非受控模式，组件内部管理展开/收起状态
 */
export default function BasicDemo() {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">基础用法</h2>

      {/* 默认收起 */}
      <CollapsibleSection title="默认收起的区域">
        <div className="rounded bg-gray-50 p-4">
          <p>这是默认收起的内容区域</p>
          <p>点击标题可以展开/收起</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 默认展开 */}
      <CollapsibleSection title="默认展开的区域" defaultExpanded={true}>
        <div className="rounded bg-blue-50 p-4">
          <p>这是默认展开的内容区域</p>
          <p>设置 defaultExpanded={true} 即可默认展开</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 多个区域 */}
      <CollapsibleSection title="基本信息" defaultExpanded={true}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-gray-500">名称：</span>
            <span>张三</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">年龄：</span>
            <span>25</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">邮箱：</span>
            <span>zhangsan@example.com</span>
          </div>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      <CollapsibleSection title="详细信息">
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-gray-500">地址：</span>
            <span>北京市朝阳区</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">电话：</span>
            <span>138****8888</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
