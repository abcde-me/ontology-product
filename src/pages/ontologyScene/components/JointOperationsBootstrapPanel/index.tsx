import React, { useState } from 'react';
import {
  Alert,
  Button,
  Collapse,
  Message,
  Space,
  Table,
  Typography
} from '@arco-design/web-react';
import {
  JOINT_OPERATIONS_LINK_TYPES,
  JOINT_OPERATIONS_OBJECT_TYPES
} from '@/data/jointOperationsOntologySeed';
import {
  bootstrapJointOperationsOntology,
  type BootstrapResult
} from '@/services/jointOperationsOntologyBootstrap';

const { Text } = Typography;

export interface JointOperationsBootstrapPanelProps {
  ontologyModelID: number;
  ontologyName?: string;
  /** 生成成功后回调（用于刷新列表） */
  onSuccess?: () => void;
  /** 紧凑模式：仅提示条 + 按钮 */
  compact?: boolean;
}

const objectPreviewColumns = [
  { title: '编码', dataIndex: 'code', width: 180 },
  { title: '名称', dataIndex: 'name', width: 120 }
];

const linkPreviewColumns = [
  { title: '编码', dataIndex: 'code', width: 200 },
  { title: '名称', dataIndex: 'name', width: 140 },
  {
    title: '源 → 目标',
    render: (_: unknown, row: (typeof JOINT_OPERATIONS_LINK_TYPES)[0]) =>
      `${row.sourceCode} → ${row.targetCode}`
  }
];

export default function JointOperationsBootstrapPanel({
  ontologyModelID,
  ontologyName = '联合作战',
  onSuccess,
  compact = false
}: JointOperationsBootstrapPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BootstrapResult | null>(null);

  const handleBootstrap = async () => {
    setLoading(true);
    setResult(null);

    try {
      const bootstrapResult = await bootstrapJointOperationsOntology(
        ontologyModelID,
        ontologyName
      );
      setResult(bootstrapResult);

      const created =
        bootstrapResult.createdObjectTypes.length +
        bootstrapResult.createdLinks.length;

      if (created > 0 && !bootstrapResult.errors.length) {
        Message.success(
          `已生成 ${bootstrapResult.createdObjectTypes.length} 个对象类型、${bootstrapResult.createdLinks.length} 条链接`
        );
        onSuccess?.();
      } else if (created > 0) {
        Message.warning('部分已生成，请展开查看错误');
        onSuccess?.();
      } else if (!bootstrapResult.errors.length) {
        Message.info('对象类型与链接已存在');
        onSuccess?.();
      } else {
        Message.error('生成失败，请查看详情');
      }
    } catch (error) {
      Message.error('生成失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openObjectTypeList = () => {
    window.open(
      `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/list`,
      '_blank'
    );
  };

  if (compact) {
    return (
      <div
        className="mt-2 rounded border border-dashed border-[rgb(var(--primary-6))] bg-[rgba(var(--primary-1),0.4)] px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-[12px] text-[var(--color-text-2)]">
            可根据 docs/联合作战.txt 一键生成 7 类对象、11 条链接
          </Text>
          <Button
            type="primary"
            size="mini"
            loading={loading}
            onClick={handleBootstrap}
          >
            一键生成
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Alert
      className="mb-4"
      type="info"
      title={`「${ontologyName}」本体模型尚未导入文档定义`}
      content={
        <Space direction="vertical" className="w-full" size="medium">
          <Text>
            数据来自项目 <Text bold>docs/联合作战.txt</Text>
            （军事行动、平台、武器、单位、地理位置及链接关系）。点击下方按钮写入当前场景库，完成后卡片上的对象/链接数量会更新。
          </Text>
          <Space wrap>
            <Button type="primary" loading={loading} onClick={handleBootstrap}>
              生成并修复对象类型、链接与实例
            </Button>
            <Button onClick={openObjectTypeList}>查看对象类型列表</Button>
          </Space>

          {result && (
            <div className="text-[13px] text-[var(--color-text-2)]">
              <div>
                新建对象：{result.createdObjectTypes.join('、') || '无'}；跳过：
                {result.skippedObjectTypes.join('、') || '无'}
              </div>
              <div>
                新建链接：{result.createdLinks.join('、') || '无'}；跳过：
                {result.skippedLinks.join('、') || '无'}
              </div>
              <div>
                已修复属性/实例：{result.repairedObjectTypes.join('、') || '无'}
              </div>
              <div>
                已修复链接端点：{result.repairedLinks.join('、') || '无'}
              </div>
              {result.errors.map((err) => (
                <div key={err} className="text-[rgb(var(--danger-6))]">
                  {err}
                </div>
              ))}
            </div>
          )}

          <Collapse bordered={false} defaultActiveKey={[]}>
            <Collapse.Item header="预览将生成的对象类型与链接" name="preview">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <Table
                  size="mini"
                  pagination={false}
                  rowKey="code"
                  columns={objectPreviewColumns}
                  data={JOINT_OPERATIONS_OBJECT_TYPES}
                  scroll={{ y: 200 }}
                />
                <Table
                  size="mini"
                  pagination={false}
                  rowKey="code"
                  columns={linkPreviewColumns}
                  data={JOINT_OPERATIONS_LINK_TYPES}
                  scroll={{ y: 200 }}
                />
              </div>
            </Collapse.Item>
          </Collapse>
        </Space>
      }
    />
  );
}
