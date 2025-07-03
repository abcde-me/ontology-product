import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select,
  TreeSelect
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import Styles from './index.module.css';
import EditLoadingForm from './edit-loading-form';
import { convertWeekDaysToString, WeekDay } from '@/utils/conversionArco';
import { editLoad } from '@/api/loadApi';
import { directoryData } from '../data/constants';
// 单选框实例
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const Edit = (props) => {
  const form = props.editForm;
  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState(props.detailData.load_type);
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
  const okHan = async () => {
    try {
      const formValues = await form.validate();
      const { time, day, cycle, ...rest } = formValues;
      const pathId = rest.dest_path.at(-1);
      if (loadVal !== 'once') {
        const [hour, minute] = time.split(':');
        await form.validate();
        props.hideModalHan();

        const isLastDayOfMonth =
          day?.findIndex((item) => item === '每月最后一天') !== -1;

        // 转换星期为数字字符串
        let dataValue: string;
        switch (cycle) {
          case '每日':
            dataValue = '*';
            break;
          case '每周':
            dataValue = convertWeekDaysToString(day as WeekDay[]); // 转换为'1,2,3'格式
            break;
          case '每月':
            dataValue = isLastDayOfMonth ? 'L' : day?.join(',') || ''; // 每月日期直接用逗号连接
            break;
          default:
            dataValue = '*';
        }
        const formData = {
          task_name: rest.name,
          connector_id: rest.connector_id,
          source_type: rest.source_type,
          run_cycle: {
            type: loadVal == 'once' ? 0 : 1,
            cycle_text: {
              minute,
              hour,
              date: dataValue,
              month: cycle == '每月' ? '*' : '',
              week: cycle === '每周' ? rest.week?.join(',') || '*' : '' // 如果week也需要转换
            }
          },
          dest_path_id: pathId,
          creator: 'user123'
        };
        const res = await editLoad({
          task_id: rest.task_id,
          formData
        });
      } else {
        const formData = {
          task_name: rest.name,
          connector_id: 15,
          source_type: rest.source_type,
          run_cycle: {
            type: 0,
            cycle_text: {
              minute: '0',
              hour: '0',
              date: '*',
              month: '*',
              week: ''
            }
          },
          dest_path_id: pathId,
          creator: 'user123'
        };
        console.log(formData);
        const res = await editLoad({
          task_id: props.loadId,
          formData
        });
      }
      cancelHan();
      props.getDetailList();
    } catch (error) {
      console.error('表单处理失败:', error);
    }
  };
  // 默认数据
  // const [obj, setObj] = useState({})
  useEffect(() => {
    // setObj(props.detailData)
    console.log(props.detailData);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form
        style={{ width: '100%' }}
        autoComplete="off"
        form={form}
        initialValues={{
          dest_path: props.detailData.data_path_name || []
        }}
      >
        <FormItem
          label="任务名称："
          initialValue={props.detailData.name}
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
          initialValue={props.detailData.source_type}
        >
          <RadioGroup disabled={true}>
            <Radio value="s3">对象存储</Radio>
            <Radio value="hdfs">HDFS</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="绑定连接器："
          field="connector_name"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
          initialValue={props.detailData.connector_name}
        >
          <Select placeholder="请选择连接器" disabled={true}></Select>
        </FormItem>
        <FormItem
          label="载入形式："
          initialValue={props.detailData.load_type}
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
          initialValue={props.detailData.data_path_name}
        >
          <Cascader
            placeholder="请输入载入位置"
            style={{ width: '100%' }}
            options={directoryData}
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
