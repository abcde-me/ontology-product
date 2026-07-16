import React from 'react';
import { Button, Form, Input, Message, Select } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import type { DataTaskDetail } from '../../types';
import { ScheduleType } from '../../types';
import styles from './EditorHeader.module.scss';

const scheduleTypeOptions = [
  { label: '立即执行', value: ScheduleType.IMMEDIATE },
  { label: '单次调度', value: ScheduleType.ONCE },
  { label: '周期调度', value: ScheduleType.PERIODIC }
];

interface EditorHeaderProps {
  task: DataTaskDetail | null;
  saving: boolean;
  onBack: () => void;
  onSave: (values: {
    name: string;
    description?: string;
    scheduleType: ScheduleType;
    cron?: string;
  }) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  task,
  saving,
  onBack,
  onSave
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (task) {
      form.setFieldsValue({
        name: task.name,
        description: task.description,
        scheduleType: task.scheduleType,
        cron: task.cron
      });
    }
  }, [form, task]);

  const handleSave = async () => {
    try {
      const values = await form.validate();
      onSave(values);
    } catch {
      Message.warning('请完善任务基础信息');
    }
  };

  return (
    <div className={styles.header}>
      <Button
        type="text"
        className={styles['back-btn']}
        icon={<IconLeft />}
        onClick={onBack}
      >
        返回
      </Button>

      <Form form={form} layout="inline" className={styles.form}>
        <Form.Item
          field="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input
            className={styles['name-input']}
            placeholder="请输入任务名称"
            allowClear
          />
        </Form.Item>
        <Form.Item field="scheduleType">
          <Select
            className={styles['schedule-select']}
            options={scheduleTypeOptions}
            placeholder="调度方式"
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, next) => prev.scheduleType !== next.scheduleType}
        >
          {(values) =>
            values.scheduleType === ScheduleType.PERIODIC ? (
              <Form.Item field="cron">
                <Input
                  className={styles['cron-input']}
                  placeholder="Cron 表达式"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item field="description" className={styles['description-item']}>
          <Input
            className={styles['description-input']}
            placeholder="任务描述（可选）"
            allowClear
          />
        </Form.Item>
      </Form>

      <Button
        type="primary"
        className={styles['save-btn']}
        loading={saving}
        onClick={handleSave}
      >
        保存
      </Button>
    </div>
  );
};
