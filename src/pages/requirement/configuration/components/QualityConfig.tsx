import React from 'react';
import { Form, Radio } from '@arco-design/web-react';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const QualityConfig = ({ form, type }) => {
  return (
    <>
      <FormItem
        label="质检轮次:"
        field="qualityInspectionRounds"
        rules={[{ required: true, message: '请选择质检轮次' }]}
        initialValue={1}
        disabled={type === 'edit'}
      >
        <RadioGroup>
          <Radio value={0}>无质检</Radio>
          <Radio value={1}>1轮</Radio>
          <Radio value={2}>2轮</Radio>
          <Radio value={3}>3轮</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="质检修改标注:"
        field="qualityInspectionModification"
        rules={[{ required: true, message: '请选择质检修改标注' }]}
        initialValue={0}
      >
        <RadioGroup>
          <Radio value={1}>启用</Radio>
          <Radio value={0}>禁用</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="驳回至:"
        field="rejectTo"
        rules={[{ required: true, message: '请选择驳回至' }]}
        initialValue={1}
      >
        <RadioGroup>
          <Radio value={1}>标注员</Radio>
          <Radio value={2}>标注公池</Radio>
        </RadioGroup>
      </FormItem>
    </>
  );
};
export default QualityConfig;
