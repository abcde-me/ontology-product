import React, { useEffect, useMemo } from 'react';
import {
  Button,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Space,
  Tag,
  Typography
} from '@arco-design/web-react';
import {
  GRAPH_ALGORITHM_CATEGORY_COLOR,
  GRAPH_ALGORITHM_CATEGORY_LABEL,
  getDefaultAlgorithmParams,
  getGraphAlgorithmOption
} from '../constants';
import type { GraphAlgorithmKey, GraphAlgorithmParams } from '../types';
import styles from '../index.module.scss';

const { Text, Title } = Typography;

interface AlgorithmParamsDrawerProps {
  visible: boolean;
  algorithm: GraphAlgorithmKey;
  params: GraphAlgorithmParams;
  onCancel: () => void;
  onConfirm: (params: GraphAlgorithmParams) => void;
}

export const AlgorithmParamsDrawer: React.FC<AlgorithmParamsDrawerProps> = ({
  visible,
  algorithm,
  params,
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm<GraphAlgorithmParams>();
  const option = useMemo(() => getGraphAlgorithmOption(algorithm), [algorithm]);

  useEffect(() => {
    if (!visible || !option) {
      return;
    }
    form.setFieldsValue({
      ...getDefaultAlgorithmParams(algorithm),
      ...params
    });
  }, [algorithm, form, option, params, visible]);

  if (!option) {
    return null;
  }

  const handleOk = async () => {
    const values = await form.validate();
    onConfirm({
      ...getDefaultAlgorithmParams(algorithm),
      ...values
    });
  };

  const categoryColor = GRAPH_ALGORITHM_CATEGORY_COLOR[option.category];

  return (
    <Drawer
      width={420}
      title={`图算法参数 · ${option.label}`}
      visible={visible}
      placement="right"
      onCancel={onCancel}
      unmountOnExit
      footer={
        <div className={styles['algo-params-footer']}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk}>
            应用算法
          </Button>
        </div>
      }
    >
      <div className={styles['algo-params-meta']}>
        <Space wrap size={8}>
          <Tag bordered>
            <span style={{ color: categoryColor, fontWeight: 600 }}>
              {GRAPH_ALGORITHM_CATEGORY_LABEL[option.category]}
            </span>
          </Tag>
          <Tag color="gray">Nebula: {option.nebulaAlgo}</Tag>
        </Space>
        <Text type="secondary" className={styles['algo-params-desc']}>
          {option.description}
        </Text>
        {option.scenarios.length > 0 ? (
          <div className={styles['algo-params-scenarios']}>
            <Title heading={6} style={{ margin: '8px 0 4px' }}>
              典型场景
            </Title>
            <Space wrap size={6}>
              {option.scenarios.map((scene) => (
                <Tag key={scene} color="green">
                  {scene}
                </Tag>
              ))}
            </Space>
          </div>
        ) : null}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {option.fields.length === 0 ? (
        <Text type="secondary">当前算法使用默认配置，可直接应用。</Text>
      ) : (
        <Form form={form} layout="vertical" requiredSymbol={false}>
          {option.fields.map((field) => (
            <Form.Item
              key={field.key}
              field={field.key}
              label={field.label}
              extra={field.tip}
              rules={
                field.key === 'targetObjectTypeId'
                  ? []
                  : [{ required: true, message: `请填写${field.label}` }]
              }
            >
              <InputNumber
                style={{ width: '100%' }}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                precision={field.precision}
                placeholder={`请输入${field.label}`}
              />
            </Form.Item>
          ))}
        </Form>
      )}
    </Drawer>
  );
};
