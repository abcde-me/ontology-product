import * as React from 'react';
import {
  Form,
  Radio,
  Input,
  Space,
  Upload,
  Grid,
  Select,
  Link,
  Button,
  Divider,
  Message
} from '@arco-design/web-react';
import {
  IconMinusCircle,
  IconPlusCircle,
  IconTranslate,
  IconFolderAdd
} from '@arco-design/web-react/icon';
import { EmptyModal } from '../emptyModal';
import { get } from 'lodash';

Message.config({ maxCount: 1 });

export const StepOne: React.FunctionComponent<any> = ({
  knowledgeId,
  dataSource,
  setDataSource,
  fileList,
  setFileList,
  onlineList,
  setOnlineList,
  setStep,
  cRef
}) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = React.useState(false);
  React.useImperativeHandle(cRef, () => ({
    onStep
  }));

  const dataSourceList = [
    {
      value: 'local',
      title: '本地文档',
      des: '支持 PDF, TXT, DOCX, XLS, XLSX, CSV 和 HTML最多可上传 10 个文件'
    },
    {
      value: 'online',
      title: '在线数据',
      des: '通过URL，获取在线网页内容',
      disable: true
    }
  ];

  const onStep = async () => {
    form
      .validate()
      .then(() => {
        const { onlineList } = form.getFields();
        setOnlineList(onlineList);
        setStep((prev) => (prev += 1));
      })
      .catch((err) => console.log(err));
  };

  const onProgress = (file) => {
    setFileList((files) => {
      return files.map((x) => (x.uid === file.uid ? file : x));
    });
  };

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

  return (
    <>
      <div className="mb-[16px] rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
        <div className="mb-[8px] text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
          选择数据源
        </div>
        <Radio.Group
          name="card-radio-group"
          value={dataSource}
          className="flex w-full"
          onChange={setDataSource}
        >
          {dataSourceList.map((item, index) => {
            return (
              <Radio
                key={item.value}
                value={item.value}
                className={`flex-1 pl-[0] ${index ? '!mr-[0]' : '!mr-[10]'}`}
                disabled={item.disable}
              >
                {({ checked }) => {
                  return (
                    <Space
                      align="start"
                      className={`custom-radio-card  ${item.disable ? 'custom-radio-card-disable' : ''} ${checked ? 'custom-radio-card-checked' : ''}`}
                    >
                      <div className="custom-radio-card-mask">
                        <div className="custom-radio-card-mask-dot"></div>
                      </div>
                      <div>
                        <div className="custom-radio-card-title">
                          {item.title}
                        </div>
                        <div className="custom-radio-card-des">{item.des}</div>
                      </div>
                    </Space>
                  );
                }}
              </Radio>
            );
          })}
        </Radio.Group>
      </div>

      {dataSource === 'local' && (
        <div className="rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
          <div className="mb-[8px] text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
            上传文本文件
          </div>
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
        </div>
      )}

      {dataSource === 'online' && (
        <div className="rounded-[8px] bg-[rgb(var(--primary-1))] px-[36px] py-[16px]">
          <div className="mb-[8px] text-[14px] font-[500] leading-[22px] text-[var(--color-text-1)]">
            输入数据源
          </div>
          <div className="border-[var(--color-border-2))] rounded-[12px] border bg-white">
            <Grid.Row className="border-b-[var(--color-border-2))] border-b px-[16px] py-[8px]">
              <Grid.Col span={10}>网址 URL</Grid.Col>
              <Grid.Col span={10}>更新频率</Grid.Col>
              <Grid.Col span={4}>操作</Grid.Col>
            </Grid.Row>
            <Form
              form={form}
              autoComplete="off"
              className="mt-[12px] px-[16px]"
              initialValues={{
                onlineList
              }}
            >
              <Form.List field="onlineList">
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map((item, index) => {
                        return (
                          <div key={item.key}>
                            <Grid.Row className="mb-[12px]">
                              <Grid.Col span={10}>
                                <Form.Item
                                  field={item.field + '.url'}
                                  rules={[
                                    {
                                      required: true,
                                      message: `请填写网址 URL`
                                    }
                                  ]}
                                >
                                  <Input
                                    placeholder="https://www.example.com"
                                    className="w-full"
                                  />
                                </Form.Item>
                              </Grid.Col>
                              <Grid.Col span={10}>
                                <Form.Item
                                  field={item.field + '.update'}
                                  rules={[
                                    {
                                      required: true,
                                      message: `请选择更新频率`
                                    }
                                  ]}
                                >
                                  <Select
                                    className="w-full"
                                    options={[
                                      {
                                        label: '不自动更新',
                                        value: '不自动更新'
                                      }
                                    ]}
                                  />
                                </Form.Item>
                              </Grid.Col>
                              <Grid.Col span={4}>
                                <Space>
                                  <Link
                                    icon={
                                      <IconMinusCircle className="text-[16px]" />
                                    }
                                    disabled={fields.length === 1}
                                    onClick={() => remove(index)}
                                  ></Link>
                                  <Link
                                    disabled={fields.length >= 10}
                                    icon={
                                      <IconPlusCircle className="text-[16px]" />
                                    }
                                    onClick={() => {
                                      add();
                                    }}
                                  ></Link>
                                </Space>
                              </Grid.Col>
                            </Grid.Row>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              </Form.List>
            </Form>
            <Button
              type="text"
              icon={<IconTranslate className="text-[16px]" />}
            >
              一键解析
            </Button>
          </div>
          <div className="mt-[12px] text-[var(--color-text-5)]">
            注：1、请确保在拥有合法爬取权限的网页上获取内容，您可以在个人网页或者企业网站上使用url内容解析功能；2、单次最多支持10个url解析
          </div>
        </div>
      )}
      {!knowledgeId && (
        <div>
          <Divider />
          <Button
            type="text"
            icon={<IconFolderAdd className="text-[16px]" />}
            onClick={() => setVisible(true)}
          >
            创建一个空知识库
          </Button>
        </div>
      )}

      {visible && <EmptyModal visible={visible} setVisible={setVisible} />}
    </>
  );
};
