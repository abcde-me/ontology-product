import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Message,
  Card
} from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';

const FormItem = Form.Item;

interface DataAssetFormProps {
  isEditMode?: boolean;
  id?: string;
}

export default function DataAssetForm({
  isEditMode = false,
  id
}: DataAssetFormProps) {
  const history = useHistory();
  const [form] = Form.useForm();

  // 页面标题
  const pageTitle = isEditMode ? '编辑数据资产' : '新建数据资产';

  useEffect(() => {
    if (isEditMode && id) {
      // TODO: 根据id加载数据资产详情
      console.log('加载数据资产详情, id:', id);
    }
  }, [id, isEditMode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (isEditMode && id) {
        console.log('更新数据资产:', values, 'id:', id);
        // TODO: 调用更新API
        Message.success('更新成功');
      } else {
        console.log('创建数据资产:', values);
        // TODO: 调用创建API
        Message.success('创建成功');
      }
      history.push('/tenant/compute/modaforge/dataAsset/list');
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleCancel = () => {
    history.push('/tenant/compute/modaforge/dataAsset/list');
  };

  return (
    <div className="h-full w-full py-5 pr-5">
      <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
        <div className="mb-4 h-[30px] w-full leading-[30px]">
          <p className="text-xl font-bold">{pageTitle}</p>
        </div>

        <div className="w-full">
          <Card>
            <Form form={form} layout="vertical" autoComplete="off">
              <FormItem
                label="资产名称"
                field="name"
                rules={[{ required: true, message: '请输入资产名称' }]}
              >
                <Input placeholder="请输入资产名称" />
              </FormItem>

              <FormItem
                label="资产类型"
                field="type"
                rules={[{ required: true, message: '请选择资产类型' }]}
              >
                <Select placeholder="请选择资产类型">
                  <Select.Option value="dataset">数据集</Select.Option>
                  <Select.Option value="table">表</Select.Option>
                  <Select.Option value="file">文件</Select.Option>
                </Select>
              </FormItem>

              <FormItem label="描述" field="description">
                <Input.TextArea
                  placeholder="请输入描述"
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
              </FormItem>

              <FormItem>
                <div className="flex justify-end gap-4">
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="primary" onClick={handleSubmit}>
                    提交
                  </Button>
                </div>
              </FormItem>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
