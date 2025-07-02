import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Tag,
  TimePicker,
  TreeSelect
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import Styles from './index.module.css';
import CycleLoadingForm from '../list/cycle-loading-form-modal';
import { convertWeekDaysToString } from '../../../utils/conversionArco';
import { WeekDay } from '../../../utils/conversionArco';
import { dataLodaAddForm } from '../type';
import { addLoad, getDirectoryList } from '@/api/loadApi';
import { getConnectionList } from '@/api/connectionApi';
import { directoryData } from '../data/constants';
interface connecort_nameType {
  key: number;
  label: string;
}
// 单选框实例
const RadioGroup = Radio.Group;
// 表单实例
const FormItem = Form.Item;
// 下拉框实例
const Option = Select.Option;
const LoadAddModal = (props: any) => {
  // 存放连接器名称表单的数据
  const [connectName, setConnectName] = useState<connecort_nameType[]>([]);
  // 整体表单实例
  const [form] = Form.useForm();

  // 提交表单时的校验逻辑
  const handleSubmit = async () => {
    try {
      const formValues = await form.validate();
      const { time, day, cycle, ...rest } = formValues;
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
          dest_path: 2,
          creator: 'user123'
        };
        const res = await addLoad(formData);
        console.log(res);
        props.getList();
        console.log(formData);
      } else {
        const formData = {
          task_name: rest.name,
          connector_id: rest.connector_id,
          source_type: rest.source_type,
          run_cycle: {
            type: '0'
          },
          dest_path: rest.dest_path,
          creator: 'userlsc'
        };
        // const res = await addLoad(formData);
        console.log(formData);
      }
      cancelHan();
      props.getList();
    } catch (error) {
      console.error('表单处理失败:', error);
    }
  };

  // 点击取消按钮的逻辑
  const cancelHan = () => {
    // 点击取消隐藏弹框并且重置表单数据
    props.hideModalHan();
  };

  // 载入类型的默认值
  const [loadVal, setLoadVal] = useState('once');
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
  // 获取连接器名称
  const getConnector_name_type = async () => {
    try {
      const res = await getConnectionList({
        page: 1,
        page_size: 1000
      });
      const newres = res.data.items.map((item) => {
        return {
          key: item.id,
          label: item.name
        };
      });
      setConnectName(newres);
    } catch (error) {
      console.error('获取连接器名称失败:', error);
    }
  };
  useEffect(() => {
    getConnector_name_type();
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form style={{ width: '100%' }} autoComplete="off" form={form}>
        <FormItem
          label="任务名称："
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
          initialValue="s3"
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
          initialValue="s3"
        >
          <RadioGroup>
            <Radio value="s3">对象存储</Radio>
            <Radio value="hdfs">HDFS</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="绑定连接器："
          field="connector_id"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Select placeholder="请选择连接器">
            {connectName.map((option, index) => (
              <Option key={option.key} value={option.key}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="载入形式："
          initialValue="once"
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
          >
            <Radio value="once">单次载入</Radio>
            <Radio value="cron">周期载入</Radio>
          </RadioGroup>
        </FormItem>
        {loadVal == 'cron' ? <CycleLoadingForm form={form} /> : null}
        <FormItem
          label="载入位置："
          field="dest_path"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelAlign="right"
          rules={[{ required: true, message: '请选择载入位置' }]}
        >
          <Cascader
            placeholder="请输入载入位置"
            style={{ width: '100%' }}
            options={directoryData}
          />
        </FormItem>
      </Form>
      <div className={Styles.footerBbtnBox}>
        <Button onClick={cancelHan} style={{ marginRight: '12px' }}>
          取消
        </Button>
        <Button onClick={handleSubmit} type="primary">
          确认
        </Button>
      </div>
    </div>
  );
};
export default LoadAddModal;
