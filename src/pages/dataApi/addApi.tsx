import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Steps,
  Tree
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import CodeMirror from '@uiw/react-codemirror';
import createTheme from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { sql } from '@codemirror/lang-sql';
import styles from './addApi.module.scss';
import { IconCaretRight } from '@arco-design/web-react/icon';

export default function AddApi() {
  const Step = Steps.Step;
  const TextArea = Input.TextArea;

  const history = useHistory();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(2);
  const [apiScenePath, setApiScenePath] = useState('');
  const [value, setValue] = useState('');
  const [treeData, setTreeData] = React.useState([
    {
      title: '数据湖',
      key: '0-0',
      children: [
        {
          title: '数据目录',
          key: '0-0-1'
        }
      ]
    },
    {
      title: '在线分析库',
      key: '0-1',
      children: [
        {
          title: 'Branch 0-1-1',
          key: '0-1-1'
        }
      ]
    },
    {
      title: '对象存储',
      key: '0-2',
      children: [
        {
          title: 'Branch 0-2-1',
          key: '0-2-1'
        }
      ]
    },
    {
      title: '向量数据库',
      key: '0-3',
      children: [
        {
          title: 'Branch 0-3-1',
          key: '0-3-1'
        }
      ]
    }
  ]);

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      background: '#ffffff',
      backgroundImage: '',
      foreground: '#75baff',
      caret: '#5d00ff',
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      lineHighlight: '#8a91991a',
      gutterBackground: '#fff',
      gutterForeground: '#8a919966'
    },
    styles: [
      { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },
      { tag: t.keyword, color: '#9a42a7', fontWeight: 'bold' },
      { tag: t.definition(t.typeName), color: '#194a7b' },
      { tag: t.typeName, color: '#194a7b' },
      { tag: t.tagName, color: '#008a02' },
      { tag: t.variableName, color: '#1a00db' },
      { tag: t.string, color: '#047013' },
      { tag: t.number, color: '#29a0aa' },
      { tag: t.bool, color: '#2d2aee' }
    ]
  });

  // 模拟调用接口获取子节点数据
  const loadMore = (treeNode) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        treeNode.props.dataRef.children = [
          {
            title: `leaf`,
            key: `${treeNode.props._key}-1`,
            isLeaf: true
          }
        ];
        setTreeData([...treeData]);
        resolve();
      }, 1000);
    });
  };

  const handleSubmit = () => {
    form.validate().then((values) => {
      console.log(values, apiScenePath);
      setCurrent(current + 1);
    });
  };

  return (
    <div className={styles.addApi}>
      <h1 className="text-xl font-medium leading-[30px]">创建API</h1>
      <div className={styles.addApiContent}>
        <div style={{ height: '100%' }}>
          <Steps
            current={current}
            style={{
              maxWidth: 400,
              margin: '20px auto 0',
              justifyContent: 'center'
            }}
          >
            <Step title="基础信息" />
            <Step title="参数配置" />
          </Steps>
          {current === 1 && (
            <Form
              form={form}
              layout="horizontal"
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 10 }}
              className="mt-6"
              onSubmit={handleSubmit}
            >
              <Form.Item
                label="API名称"
                field="apiName"
                required
                rules={[{ required: true, message: '请输入API名称' }]}
              >
                <Input placeholder="输入API名称" />
              </Form.Item>
              <Form.Item
                label="API路径"
                field="apiPath"
                required
                rules={[{ required: true, message: '请输入API路径' }]}
              >
                <Input
                  className={styles.apiPath}
                  placeholder="请输入端路径，以“/”开始"
                  addBefore={
                    <Input
                      placeholder="请输入环境路径"
                      value={apiScenePath}
                      onChange={(value) => setApiScenePath(value)}
                    />
                  }
                />
              </Form.Item>
              <Form.Item
                label="请求方式"
                field="apiRequestMethod"
                required
                rules={[{ required: true, message: '请选择API请求方式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求方式"
                />
              </Form.Item>
              <Form.Item
                label="请求格式"
                field="apiRequestFormat"
                required
                rules={[{ required: true, message: '请选择API请求格式' }]}
              >
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择请求格式"
                />
              </Form.Item>
              <Form.Item
                label="方法名"
                field="apiMethodName"
                required
                rules={[{ required: true, message: '请输入方法名' }]}
              >
                <Input placeholder="请输入方法名" />
              </Form.Item>
              <Form.Item label="缓存方法" field="apiCacheMethod">
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                  ]}
                  placeholder="请选择缓存方法"
                />
              </Form.Item>
              <Form.Item
                label="缓存过期时长"
                field="apiCacheExpire"
                initialValue={60}
              >
                <InputNumber mode="button" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item label="API描述" field="apiDescription">
                <TextArea
                  placeholder="请输入API描述"
                  style={{ minHeight: 80 }}
                />
              </Form.Item>
            </Form>
          )}
          {current === 2 && (
            <div className={styles.addApiParam}>
              <div className={styles.lfetBox}>
                <div className="align-center flex">
                  <div className="text-sm font-semibold leading-[32px]">
                    数据源
                  </div>
                  <Input.Search
                    placeholder="请输入搜索数据源"
                    className="ml-2 w-[165px]"
                  />
                </div>
                <Tree
                  className="mt-2"
                  defaultSelectedKeys={['0-0']}
                  loadMore={loadMore}
                  treeData={treeData}
                  actionOnClick={['expand', 'select']}
                ></Tree>
              </div>
              <div className={styles.rightBox}>
                <div className="align-center flex h-12 justify-between border-b border-[#e2e8f0] p-3">
                  <div className="text-sm font-semibold leading-6">
                    SQL编辑器
                  </div>
                  <Button className="h-6" icon={<IconCaretRight />}>
                    测试代码和参数
                  </Button>
                </div>
                <div className="h-[calc(100vh-350px)] w-full px-3 py-2">
                  <CodeMirror
                    value={value}
                    theme={myTheme}
                    placeholder="这里是您的SQL开发工作区，请编写SQL创建API，注意符合相关语法规范"
                    extensions={[sql()]}
                    onChange={(value) => setValue(value)}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: false
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className={styles.stepFooter}>
            <Button
              disabled={current >= 2}
              onClick={() => form.submit()}
              type="primary"
            >
              下一步
            </Button>
            {current === 2 && (
              <Button
                type="secondary"
                disabled={current <= 1}
                onClick={() => setCurrent(current - 1)}
              >
                上一步
              </Button>
            )}
            <Button type="secondary" onClick={() => history.goBack()}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
