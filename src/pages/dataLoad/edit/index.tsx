import {
  Button,
  Cascader,
  Form,
  Input,
  Radio,
  Select,
  TreeSelect
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import Styles from './index.module.css';
import EditLoadingForm from './edit-loading-form';
// 单选框实例
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const Edit = (props) => {
  const [form] = Form.useForm();
  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState(props.detailData.task_info.load_type);
  // 切换载入类型的函数
  const handoffLoadFormHan = (val) => {
    if (val === 'once') {
      form.setFieldsValue({
        time: undefined,
        day: undefined,
        weekly: undefined,
        cycle: undefined
      });
    } else {
      form.setFieldsValue({ cron_expr: undefined }); // 如果有需要，可以重置其他字段
    }
    setLoadVal(val);
  };
  const treeData = [
    {
      title: '酒店数据目录',
      value: 'hotel',
      children: [
        { title: '北京市豪华酒店', value: '北京市豪华酒店' },
        { title: '上海市豪华酒店', value: '上海市豪华酒店' }
      ]
    },
    {
      title: '餐厅数据',
      value: 'restaurant',
      children: [
        { title: '广州餐厅', value: '广州餐厅' },
        { title: '深圳餐厅', value: '深圳餐厅' }
      ]
    }
  ];
  // 点击取消按钮的逻辑
  const cancelHan = () => {
    // 点击取消隐藏弹框并且重置表单数据
    props.hideEditModalHan();
  };
  // 点击确定
  const okHan = () => {
    props.hideEditModalHan();
  };
  // 默认数据
  // const [obj, setObj] = useState({})
  // useEffect(() => {
  //     setObj(props.detailData)
  // }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form
        style={{ width: '100%' }}
        autoComplete="off"
        form={form}
        initialValues={{
          dest_path: props.detailData.task_info.dest_path || []
        }}
      >
        <FormItem
          label="任务名称："
          initialValue={props.detailData.task_info.name}
          field="name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
          extra={
            <div style={{ color: '#666', fontSize: 14 }}>
              <div>支持中文，英文，数字，下划线</div>
              <div>名称建议:北京市各区GDP数据_2024</div>
            </div>
          }
        >
          <Input placeholder="请输入任务名称" />
        </FormItem>
        <FormItem
          label="数据源类型："
          field="source_type"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择数据源类型' }]}
          initialValue={props.detailData.task_info.source_type}
        >
          <RadioGroup disabled={true}>
            <Radio value="s3">对象存储</Radio>
            <Radio value="HDFS">HDFS</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="绑定连接器："
          field="connector_name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
          initialValue={props.detailData.task_info.connector.name}
        >
          <Select placeholder="请选择连接器" disabled={true}></Select>
        </FormItem>
        <FormItem
          label="载入形式："
          initialValue={props.detailData.task_info.load_type}
          field="load_type"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <RadioGroup
            onChange={(val) => {
              handoffLoadFormHan(val);
            }}
            disabled={true}
          >
            <Radio value="once">单次载入</Radio>
            <Radio value="cron">周期载入</Radio>
          </RadioGroup>
        </FormItem>
        {loadVal == 'cron' ? <EditLoadingForm form={form} /> : null}
        <FormItem
          label="载入位置："
          field="dest_path"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择载入位置' }]}
          initialValue={props.detailData.task_info.dest_path}
        >
          <Cascader
            placeholder="请输入载入位置"
            style={{ width: '100%' }}
            options={treeData}
            fieldNames={{
              label: 'title',
              value: 'value', // 实际值使用 value
              children: 'children'
            }}
          />
        </FormItem>
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button onClick={cancelHan} style={{ marginRight: '20px' }}>
          取消
        </Button>
        <Button
          onClick={() => {
            okHan();
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};
export default Edit;
