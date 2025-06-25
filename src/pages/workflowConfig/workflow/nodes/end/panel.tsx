import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useConfig from './use-config'
import type { EndNodeType } from './types'
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import { Form, AutoComplete } from '@arco-design/web-react'
import './end.scss';

const Panel: FC<NodePanelProps<EndNodeType>> = ({
  id,
  data,
}) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  // 测试数据
  const [dataSource, setDataSource]: Array<any> = useState([]);

  const handleSearch = (inputValue: string) => {
    setDataSource(inputValue ? new Array(5).fill(null).map((_, index) => `${inputValue}_${index}`) : []);
  };
  const {
    readOnly,
    inputs,
    updateInputs,
  } = useConfig(id, data)

  const onValuesChange = (_, values) => {
    // form.setFieldsValue(values)
    console.log(values, 'values')
    updateInputs(values)
  };
  return (
    <div className='mt-[16px] wk-node-panel-content end-panel-content'>
      <Form layout='vertical' form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={onValuesChange}
        initialValues={{
          target_path: inputs?.target_path,
        }}
      >
        <FormItem label="目标数据目录" field="target_path" rules={[{ required: true, message: '目标数据目录不可为空' }]}>
          <AutoComplete
            placeholder='请输入或选择目标数据目录'
            onSearch={handleSearch}
            data={dataSource}
            style={{ width: '100%' }}
          />
        </FormItem>
      </Form>
    </div>
  )
}

export default React.memo(Panel)
