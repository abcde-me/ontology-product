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
  from: 'datasetManagement' | 'dataCatalog';
  downloadData?: any;
  names?: string;
  onCancel?: () => void;
  visible?: boolean; // 添加visible属性，用于控制弹框显示
  exportdatas?: any;
  exportdataset?: any;
  selectedPath?: string;
  onExportSuccess?: () => void; // 添加导出成功回调
  resetSelectedData?: () => void; // 添加重置选中状态的回调函数
  handlClear?: () => void; // 添加清除选中状态的回调函数
}

const FormComponent: React.FC<FormProps> = ({
  downloadData,
  names,
  onCancel,
  visible = false,
  from,
  exportdatas,
  exportdataset,
  selectedPath,
  onExportSuccess,
  resetSelectedData,
  handlClear
}) => {
  const handleExport = async () => {
    //导出逻辑
    try {
      const isValid = await form.validate();

      if (!isValid) {
        return;
      }

      const filesArray: string[] = [];
      if (downloadData && downloadData.data_path_id) {
        filesArray.push(
          downloadData.abs_data_path + '/' + downloadData.file_name
        );
      } else if (downloadData && downloadData.extras) {
        filesArray.push(
          downloadData.full_path + '/' + downloadData.extras.file_name
        );
      } else if (exportdataset && exportdataset.latest_file_path) {
        filesArray.push(
          exportdataset.latest_file_path + '/' + exportdataset.latest_file_name
        );
      }
      if (!exportdataset && exportdatas && exportdatas.length > 0) {
        if (exportdatas[0].data_path_id) {
          exportdatas.forEach((item: any) => {
            filesArray.push(item.abs_data_path + '/' + item.file_name);
          });
        } else if (exportdatas[0].extras) {
          exportdatas.forEach((item: any) => {
            filesArray.push(item.full_path + '/' + item.extras.file_name);
          });
        } else if (exportdatas[0].latest_file_path) {
          exportdatas.forEach((item: any) => {
            filesArray.push(
              item.latest_file_path + '/' + item.latest_file_name
            );
          });
        }
      }

      const params = {
        output_path: form.getFieldValue('path'),
        connector_id: Number(form.getFieldValue('province')),
        files: filesArray
      };

      // 数据集管理请求体特殊处理
      if (from === 'datasetManagement') {
        let fileNames: string[] = [];
        if (exportdataset) {
          fileNames = [exportdataset.name];
        } else if (exportdatas?.length) {
          fileNames = exportdatas.map((item) => item.name);
        }
        params['file_names'] = fileNames;
      }

      const res = await exportFile(params);
      console.log('这是导出返回的结果', res);
      if (res.status === 200) {
        form.resetFields();
        Message.success('导出成功');
        handlClear && handlClear();
        if (onExportSuccess) {
          onExportSuccess();
        }
        if (resetSelectedData) {
          resetSelectedData();
        } else {
          console.log('回调未提供');
        }
        onCancel && onCancel();
      } else {
        Message.error('导出失败，请稍后重试');
        form.resetFields();
        onCancel && onCancel();
      }
    } catch (e) {
      // 处理验证失败或导出失败的情况
      console.error('导出失败:', e);
      Message.error('导出失败，请稍后重试');
    }
  };
  const handleCancel = () => {
    // 重置表单
    form.resetFields();
    // 调用父组件的取消回调
    onCancel && onCancel();
  };
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

  // 添加处理连接器选择变化的函数
  const handleConnectorChange = (value, option) => {
    const selectedConnector = connectorList.find(
      (item: any) => item.id === value
    );
  };

  // 修改为监听 visible 变化，当弹窗打开时设置表单值
  useEffect(() => {
    if (visible) {
      // 获取连接器列表
      getConnectorList();
    }
  }, [visible, form, names, downloadData, exportdataset]);

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
            onChange={handleConnectorChange}
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
            },
            {
              match: /^[\u4e00-\u9fa5a-zA-Z0-9\/_]+$/,
              message: '只能包含中文、英文、数字、斜杠"/"和下划线"_"'
            },
            {
              maxLength: 256,
              message: '长度不能超过256个字符'
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
