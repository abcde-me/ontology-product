import React from 'react';
import { Tabs, Tag, Table } from '@arco-design/web-react';
import { OsDrawer } from '@/pages/ontologyScene/componens/OSDrawer';
import { BehaviorItem } from '../../types';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';

const TabPane = Tabs.TabPane;

export const BehaviorDetailDrawer: React.FC = () => {
  const behaviorDetailVisible = useUIStore(
    (state) => state.behaviorDetailVisible
  );
  const setBehaviorDetailVisible = useUIStore(
    (state) => state.setBehaviorDetailVisible
  );
  const currentBehaviorDetail = useBusinessStore(
    (state) => state.currentBehaviorDetail
  );

  const handleClose = () => {
    setBehaviorDetailVisible(false);
  };

  const handleEdit = () => {
    // TODO: 跳转到行为编辑页面
    console.log('编辑行为:', currentBehaviorDetail?.id);
  };

  if (!currentBehaviorDetail) return null;

  const behavior = currentBehaviorDetail;

  // 参数配置表格列
  const paramColumns = [
    {
      title: '参数显示名称',
      dataIndex: 'label',
      width: 150
    },
    {
      title: 'ID',
      dataIndex: 'name',
      width: 120
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 100
    },
    {
      title: '界面控件',
      dataIndex: 'widget',
      width: 120
    }
  ];

  // 校验规则表格列
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      flex: 1
    },
    {
      title: '表达式',
      dataIndex: 'expression',
      width: 200,
      render: (text: string) => (
        <code className="rounded bg-[#f7f8fa] px-2 py-1 text-xs">{text}</code>
      )
    }
  ];

  return (
    <OsDrawer
      visible={behaviorDetailVisible}
      title="行为详情"
      onCancel={handleClose}
      onEdit={handleEdit}
      width={720}
      placement="right"
    >
      <div className="flex h-full flex-col">
        {/* 基本信息 */}
        <div className="flex-shrink-0 space-y-4 border-b border-[#e5e6eb] px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-[#4e5969]">
              行为名称:
            </span>
            <span className="flex-1 text-sm text-[#1d2129]">
              {behavior.name}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-[#4e5969]">
              所属对象类型:
            </span>
            <Tag color="purple" size="small">
              {behavior.objectType}
            </Tag>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-[#4e5969]">
              描述说明:
            </span>
            <span className="flex-1 text-sm text-[#1d2129]">
              {behavior.description}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-[#4e5969]">
              函数:
            </span>
            <span className="flex-1 text-sm text-[#1d2129]">
              {behavior.functionName}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-24 flex-shrink-0 text-sm text-[#4e5969]">
              ID:
            </span>
            <span className="flex-1 font-mono text-sm text-[#1d2129]">
              {behavior.identifier}
            </span>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultActiveTab="params" className="h-full">
            <TabPane
              title={`参数配置 (${behavior.configSchema?.fields.length || 0})`}
              key="params"
            >
              <div className="h-full overflow-y-auto px-6 py-4">
                <Table
                  columns={paramColumns}
                  data={behavior.configSchema?.fields || []}
                  pagination={false}
                  border={{
                    wrapper: true,
                    cell: true
                  }}
                  size="small"
                />
              </div>
            </TabPane>
            <TabPane
              title={`校验规则 (${behavior.validationRules?.length || 0})`}
              key="validation"
            >
              <div className="h-full overflow-y-auto px-6 py-4">
                <Table
                  columns={ruleColumns}
                  data={behavior.validationRules || []}
                  pagination={false}
                  border={{
                    wrapper: true,
                    cell: true
                  }}
                  size="small"
                />
              </div>
            </TabPane>
            <TabPane title="函数" key="function">
              <div className="h-full overflow-y-auto px-6 py-4">
                <pre className="rounded-lg border border-[#e5e6eb] bg-[#f7f8fa] p-4 text-xs">
                  <code>{behavior.functionCode || '// 暂无函数代码'}</code>
                </pre>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </OsDrawer>
  );
};
