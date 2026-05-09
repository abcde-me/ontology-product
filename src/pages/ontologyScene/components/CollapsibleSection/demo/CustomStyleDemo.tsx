import React from 'react';
import { CollapsibleSection } from '../index';

/**
 * 自定义样式示例
 *
 * 自定义标题、容器和内容区域的样式
 */
export default function CustomStyleDemo() {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">自定义样式</h2>

      {/* 自定义标题样式 */}
      <CollapsibleSection
        title="自定义标题样式"
        titleClassName="text-lg font-bold text-blue-600"
        defaultExpanded={true}
      >
        <div className="rounded bg-gray-50 p-4">
          <p>使用 titleClassName 自定义标题样式</p>
          <p>这里的标题是蓝色、加粗、大号字体</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 自定义容器样式 */}
      <CollapsibleSection
        title="自定义容器样式"
        className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4"
        defaultExpanded={true}
      >
        <div className="rounded bg-white p-4">
          <p>使用 className 自定义容器样式</p>
          <p>这里添加了紫色边框和背景色</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 自定义内容区域样式 */}
      <CollapsibleSection
        title="自定义内容区域样式"
        contentClassName="rounded-lg border-2 border-green-300 bg-green-50 p-4"
        defaultExpanded={true}
      >
        <div>
          <p>使用 contentClassName 自定义内容区域样式</p>
          <p>这里添加了绿色边框和背景色</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 组合使用 */}
      <CollapsibleSection
        title="组合使用多种样式"
        className="rounded-xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 shadow-lg"
        titleClassName="text-xl font-extrabold text-orange-600"
        contentClassName="mt-2 rounded-lg bg-white p-4 shadow-inner"
        defaultExpanded={true}
      >
        <div className="space-y-2">
          <p className="font-semibold">✨ 这是一个精心设计的卡片</p>
          <p>• 渐变背景色</p>
          <p>• 阴影效果</p>
          <p>• 圆角边框</p>
          <p>• 自定义标题样式</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 深色主题 */}
      <CollapsibleSection
        title="深色主题"
        className="rounded-lg bg-gray-800 p-4"
        titleClassName="text-lg font-bold text-white"
        contentClassName="mt-2 rounded bg-gray-700 p-4"
        defaultExpanded={true}
      >
        <div className="space-y-2 text-gray-200">
          <p>深色主题示例</p>
          <p>适合暗色模式界面</p>
        </div>
      </CollapsibleSection>

      {/* 说明 */}
      <div className="mt-4 rounded bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">💡 样式定制选项：</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>className</strong>: 自定义整个容器的样式
          </li>
          <li>
            <strong>titleClassName</strong>: 自定义标题文字的样式
          </li>
          <li>
            <strong>contentClassName</strong>: 自定义内容区域的样式
          </li>
        </ul>
      </div>
    </div>
  );
}
