import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { EndNodeType } from './types';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import { Form, Select } from '@arco-design/web-react';
import { getWorkflowTargetPath } from '@/api/workflow';
import './end.scss';

const Panel: FC<NodePanelProps<EndNodeType>> = ({ id, data }) => {
  const { readOnly, inputs, updateInputs } = useConfig(id, data);
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;

  const [dataSource, setDataSource]: Array<any> = useState([]);

  const fetchData = async () => {
    const res = await getWorkflowTargetPath(0, '');
    if (res.status === 200) {
      setDataSource(res?.data?.dst);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const onValuesChange = (_, values) => {
    updateInputs({ ...values, dataSource: dataSource });
  };
  return (
    <div className="wk-node-panel-content end-panel-content mt-[16px]">
      <Form
        layout="vertical"
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={onValuesChange}
        initialValues={{
          target_path_id: inputs?.target_path_id
        }}
      >
        <FormItem
          label="目标数据目录"
          field="target_path_id"
          rules={[{ required: true, message: '目标数据目录不可为空' }]}
          style={{ margin: 0 }}
        >
          <Select
            allowCreate
            placeholder="请输入或选择目标数据目录"
            allowClear
            style={{ width: '100%' }}
          >
            {dataSource.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        <div className="content-tips-text">
          选择工作流需处理数据的源数据目录，目录变更时将会同步下游节点更新。
        </div>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
