import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Upload, Message, Radio, TreeSelect } from '@arco-design/web-react';
import {
  IconInfoCircle
} from '@arco-design/web-react/icon';
import { get } from 'lodash';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  selectedCatalog: Record<string, any>;
  submit: () => void;
};

export const ImportDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, submit, selectedCatalog } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [treeData, setTreeData] = useState([])
  const [treeSelectedCatalog, setTreeSelectedCatalog] = useState(selectedCatalog || {})
  const [fileList, setFileList] = useState([])
  const type = Form.useWatch('type', form);

  const uploadFileList = React.useMemo(() => {
    return fileList.map((x) => {
      return x.status === 'error'
        ? {
            ...x,
            response: get(x, 'response.message', '网络错误')
          }
        : x;
    });
  }, [fileList]);

  useEffect(() => {
    const data = [
      {
        title: 'Trunk 0-0',
        key: '0-0',
        children: [
          {
            title: 'Branch 0-0-2',
            key: '0-0-2',
            selectable: false,
          },
        ],
      },
      {
        title: 'Trunk 0-1',
        key: '0-1',
        children: [
          {
            title: 'Branch 0-1-1',
            key: '0-1-1',
          },
        ],
      },
      {
        title: 'Trunk 0-2',
        key: '0-2',
      },
      {
        title: 'Trunk 0-3',
        key: '0-3',
      },
      {
        title: 'Trunk 0-4',
        key: '0-4',
      },
      {
        title: 'Trunk 0-5',
        key: '0-5',
      },
      {
        title: 'Trunk 0-6',
        key: '0-6',
        children: [
          {
            title: 'Branch 0-6-1',
            key: '0-6-1',
          },
          {
            title: 'Branch 0-6-2',
            key: '0-6-2',
          },
          {
            title: 'Branch 0-6-3',
            key: '0-6-3',
          },
          {
            title: 'Branch 0-6-4',
            key: '0-6-4',
          },
        ],
      },
      {
        title: 'Trunk 0-7',
        key: '0-7',
        children: [
          {
            title: 'Branch 0-7-1',
            key: '0-7-1',
          },
          {
            title: 'Branch 0-7-2',
            key: '0-7-2',
          },
          {
            title: 'Branch 0-7-3',
            key: '0-7-3',
          },
          {
            title: 'Branch 0-7-4',
            key: '0-7-4',
          },
        ],
      },
      {
        title: 'Trunk 0-8',
        key: '0-8',
        children: [
          {
            title: 'Branch 0-8-1',
            key: '0-8-1',
          },
          {
            title: 'Branch 0-8-2',
            key: '0-8-2',
          },
          {
            title: 'Branch 0-8-3',
            key: '0-8-3',
          },
          {
            title: 'Branch 0-8-4',
            key: '0-8-4',
          },
        ],
      },
    ]
    setTreeData(data)
  }, [])

  const onChange = (value: any, extra: any) => {
    console.log('onChange', value, extra);
  }

  const onProgress = (file) => {
    setFileList((files) => {
      return files.map((x) => (x.uid === file.uid ? file : x));
    });
  };

  const checkFile = (file, list) => {
    if (uploadFileList.length + list.length > 10) {
      Message.warning(`最多可上传 10 个文件`);
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      Message.warning('每个文件不超过 20 MB');
      return false;
    }
    return true;
  };

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          // await editKnowledge(record.id, formValue);
          Message.success('编辑成功');
          submit && submit();
          setLoading(false);
          setVisible(false);
        } catch (err) {
          return;
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <Drawer
      width={520}
      className="import-file-drawer"
      title="导入文件"
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <Form
        autoComplete="off"
        className="import-file-form"
        layout="vertical"
        form={form}
        initialValues={{catalog: '0-7-1', type: 'local'}}
      >
        <Form.Item
          field="catalog"
          label="数据分类"
          rules={[
            { required: true, message: '数据分类是必选项' },
          ]}
        >
          <TreeSelect treeData={treeData} placeholder="请选择数据分类" onChange={onChange}/>
        </Form.Item>
        <div className="bg-[#F8FAFD] p-[12px] mb-[8px] rounded-[8px]">
          <IconInfoCircle className='size-[12px] mr-[8px]'/>
          <span className='text-[#7F8C9F]'>{treeSelectedCatalog.title}</span>
        </div>
        <Form.Item field="type" required label="接入方式">
          <Radio.Group>
            <Radio value="local">本地上传</Radio>
            <Radio value="minio">MinIO上传</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item field="parsed" required label="是否解析">
          <Radio.Group>
            <Radio value="mysql">暂缓解析</Radio>
            <Radio value="minio">立即解析</Radio>
          </Radio.Group>
        </Form.Item>
        { type === 'local' && 
          <Form.Item field="type" required label="上传文件">
            <Upload
              className="bg-white"
              drag
              disabled={uploadFileList.length >= 10}
              multiple
              accept=".pdf,.docx,.txt,.html,.csv,.xls,.xlsx"
              action="/api/appforge/v1/console/api/files/upload?source=datasets"
              tip="支持 PDF, TXT, DOCX, XLS, XLSX, CSV 和 HTML，最多可上传 10 个文件，每个文件不超过 20 MB"
              onChange={setFileList}
              onProgress={onProgress}
              fileList={uploadFileList}
              beforeUpload={(file, list) => checkFile(file, list)}
            />
          </Form.Item>
        }
      </Form>
    </Drawer>
  );
};
