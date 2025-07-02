import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Descriptions,
  Modal,
  Form,
  Input,
  Select,
  Message
} from '@arco-design/web-react';
import { exportFile } from '@/api/dataCatalog';
import { getConnectionList } from '@/api/connectionApi';
const FormItem = Form.Item;
interface FormProps {
  names?: string;
  downloadData?: any;
  onCancel?: () => void;
  visible?: boolean; // 添加visible属性，用于控制弹框显示
  exportdatas?: any;
  exportdataset?:any;
}

const FormComponent: React.FC<FormProps> = ({
  downloadData,
  onCancel,
  visible = false,
  names,
  exportdatas,
  exportdataset
}) => {
  // const [exportNames,setExportNames] = useState([])
  const handleExport = async () => {
    //导出逻辑
    console.log(downloadData,'打印看啊看downloadData');
    console.log(exportdatas,'打印看啊看exportdatas');
    
    const exportNames: Array<string> = [];
    if (exportdatas && exportdatas.length > 0) {
      // 使用扁平数组而不是嵌套数组
      exportdatas.forEach(item => {
        if (item.extras && item.extras.file_name) {
          exportNames.push(item.extras.file_name);
        }
      });
    } else if(downloadData) {
      exportNames.push(downloadData.extras.file_name)
    }else{
      exportNames.push(exportdataset.latest_file_name)
    }
    let full_paths = ''
    if (exportdatas && exportdatas.length > 0) {
      full_paths = exportdatas[0].full_path
    } else if(downloadData) {
      full_paths = downloadData.full_path
    }else{
      full_paths = exportdataset.latest_file_path+'/'+exportdataset.latest_file_name
    }
    const res = await exportFile({
      file_names: exportNames,
      output_path: form.getFieldValue('path'),
      file_path: full_paths,
      connector_id: Number(form.getFieldValue('province'))
    });
    console.log(res);
    try {
      console.log('导出文件名', exportNames);
      await form.validate();
      form.resetFields();
      onCancel && onCancel();
      Message.success('导出成功');
    } catch (e) {
      Message.error('导出失败，请重试');
    }
  };

  const handleCancel = () => {
    // 重置表单
    form.resetFields();
    // 调用父组件的取消回调
    onCancel && onCancel();
  };
  //导出
  // const handExport = () => {
  //   console.log('导出');
  //   onCancel && onCancel();
  // };
  //显示弹窗的状态由外部传入，不再在内部管理
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  };

  const [connectorList, setConnectorList] = useState([]);
  const getConnectorList = async () => {
    try {
      const res = await getConnectionList({});
      if (res && res.data) {
        setConnectorList(res.data.items);
      } else {
        setConnectorList([]);
        Message.error('获取连接器列表失败：数据格式异常');
      }
    } catch (error) {
      console.error('获取连接器列表出错:', error);
      setConnectorList([]);
      Message.error('获取连接器列表失败，请稍后重试');
    }
  };

  // 修改为监听 visible 变化，当弹窗打开时设置表单值
  useEffect(() => {
    if (visible) {
      // 获取连接器列表
      getConnectorList();
      console.log(exportdataset, 'exportdataset888888888888888888888888888888');

    }
  }, [visible, form, names, downloadData,exportdataset]);

  return (
    <Modal
      title="导出设置"
      visible={visible} // 使用外部传入的visible状态
      onOk={handleExport} // 点击确定时调用取消函数关闭弹框
      onCancel={handleCancel} // 点击取消时调用取消函数关闭弹框
      autoFocus={false}
      focusLock={true}
      footer={null} // 不显示默认按钮，使用自定义按钮
      style={{ width: 640 }}
    >
      <Form
        form={form}
        autoComplete="off"
        {...formItemLayout}
        style={{ width: 584 }}
      >
        <Form.Item
          label="选择连接器："
          field="province"
          rules={[{ required: true, message: '请选择' }]}
        >
          <Select
            allowClear
            placeholder="请选择连接器"
            options={connectorList.map((item: any) => ({
              label: item.name,
              value: item.id
            }))}
          ></Select>
        </Form.Item>
        <FormItem
          label="保存路径："
          field="path"
          required
          extra="指定导出文件的保存路径"
          rules={[
            {
              required: true,
              message: '请填写'
            }
          ]}
        >
          <Input placeholder="请输入保存路径" />
        </FormItem>
      </Form>
      <div style={{ marginTop: '20px', textAlign: 'right', marginBottom: 20 }}>
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleExport}>
            确定
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default FormComponent;
