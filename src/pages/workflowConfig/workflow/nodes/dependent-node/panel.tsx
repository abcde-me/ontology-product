import { Form, Typography, Divider } from '@arco-design/web-react';
import React, { useEffect } from 'react';
import { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import useConfig from './use-config';
import {
  NodeRunSetting,
  PrevNodes
} from '@/pages/workflowConfig/workflow/nodes/components';
import { DependentTaskList } from './components';
import { DependentNodeConfig } from './types';

const { Item: FormItem, useForm } = Form;

export default React.memo(function DependentPanel(
  props: NodePanelProps<DependentNodeConfig>
) {
  const { readOnly, onValuesChange, inputs } = useConfig(props.id, props.data);
  const [form] = useForm();

  useEffect(() => {
    const { relation, depend_item_list, ...other } = inputs;
    const formData = {
      ...other,
      depend_item_list: {
        relation,
        list: depend_item_list
      }
    };
    form.setFieldsValue(formData);
  }, [inputs]);

  return (
    <div className="panel-container wk-node-panel-content code-panel-content date-cleaning-panel mt-4">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        disabled={readOnly || props.readonly}
        layout="vertical"
        onValuesChange={(changedValues, v: any) => {
          if (Object.keys(changedValues).length > 1) return;
          const {
            depend_item_list: { relation, list: depend_item_list },
            ...otherValue
          } = v;
          onValuesChange({
            ...inputs,
            ...otherValue,
            relation,
            depend_item_list
          });
        }}
      >
        <FormItem
          label={
            <div
              className={
                'font-PingFangSc text-[14px] font-[600] leading-[22px] text-default'
              }
            >
              外部前置任务
            </div>
          }
          tooltip={'可在此处配置依赖的外部工作流或者任务节点并设置逻辑关系'}
          field={'depend_item_list'}
        >
          <DependentTaskList disabled={readOnly || props.readonly} />
        </FormItem>
        <Divider className={'mb-3 mt-3'} />
        <NodeRunSetting />
      </Form>
      <PrevNodes node={props.id} />
    </div>
  );
});
