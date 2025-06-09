import { publishTool, updateTool } from '@/api/tools';
import { newSchema } from '@/utils/openApiSchema';
import { useCollectionDetail, useToolsProviders } from '@/utils/swr';
import { goParams, useParams } from '@/utils/url';
import {
  Button,
  Divider,
  Input,
  Link,
  Message,
  Modal,
  Space,
  Spin,
  Tag
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CreateDrawer, { TOOL_POP_KEY } from '../toolList/drawer';
import { SchemaModel } from './schemaModel';
import Avatar from '@/components/avater';
import DefaultToolIcon from '@/assets/default-tool-icon.svg';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import { Table } from '@ccf2e/arco-material';

export default function ToolDetail() {
  const providerName = useParams('name');
  const history = useHistory();
  const [visible, setVisible] = useState(false);

  const {
    data: collection,
    mutate,
    isLoading
  } = useCollectionDetail(providerName);
  const schemaUtil = newSchema(collection?.schema);
  const [searchText, setSearchText] = useState('');
  const tools = (collection ? schemaUtil.getTools() : []).filter((i) =>
    i.name.includes(searchText)
  );
  const [loading, setLoading] = useState(false);

  const [showSchemaModel, setShowSchemaModel] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOOL_POP_KEY) === 'true') {
      setShowSchemaModel(true);
      localStorage.setItem(TOOL_POP_KEY, 'false');
    }
  }, []);
  const update = (schema: string) => {
    return updateTool({
      ...collection,
      schema,
      original_provider: collection.provider
    }).then(() => {
      mutate();
    });
  };

  const [publishing, setPublishing] = useState(false);
  const { data: publicPlugins, mutate: muatePublicPlugins } =
    useToolsProviders();
  const isPublic = (publicPlugins || []).some((i) => i.name === providerName);

  return (
    <div className="h-full overflow-auto py-[20px] pr-[20px]">
      <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
        <Spin block loading={isLoading || loading}>
          <div className=" flex items-center pb-[20px]">
            <Avatar
              readonly
              size={32}
              value={collection?.icon.content}
              className="mr-[12px]"
              defaultIcon={<DefaultToolIcon className="size-[32px]" />}
            />
            <span className="mr-auto text-[20px] leading-[32px] text-[var(--color-text-1)]">
              {collection?.name}
            </span>
            <Button
              className="mr-[8px]"
              type="secondary"
              onClick={() => setShowSchemaModel(true)}
            >
              代码
            </Button>
            <Button
              className="mr-[8px]"
              type="secondary"
              onClick={() => setVisible(true)}
            >
              设置
            </Button>
            <Button
              className="mr-[8px]"
              type="secondary"
              onClick={() =>
                history.push(
                  '/tenant/compute/appforge/toolCreate?provider=' + providerName
                )
              }
            >
              添加工具
            </Button>
            <Button
              className="mr-[8px]"
              type="secondary"
              loading={publishing}
              onClick={() => {
                setPublishing(true);
                publishTool(providerName)
                  .then(() => {
                    Message.success('发布成功');
                    muatePublicPlugins();
                  })
                  .catch((err) => {
                    console.error(err);
                  })
                  .finally(() => {
                    setPublishing(false);
                  });
              }}
            >
              发布
            </Button>
          </div>
          <div className=" h-[40px] text-[14px] leading-[40px] text-[var(--color-text-1)]">
            基本信息
          </div>
          <div className=" mb-[16px]">
            <div className="flex h-[44px] rounded-[6px] border border-[var(--color-border-2)] px-[24px]">
              <div className="flex flex-1 items-center px-[24px]">
                状态：
                <IconExclamationCircle className="mr-[4px] text-[16px] text-[var(--color-text-6)]" />
                {isPublic ? '已发布' : '未发布'}
              </div>
              <Divider className="mx-0 h-full" type="vertical" />
              <div className="flex flex-1 items-center px-[24px]">
                包含工具：{tools?.length}
              </div>
              <Divider className="mx-0 h-full" type="vertical" />
              <div className="flex flex-1 items-center px-[24px]">
                可见范围：自己可见
              </div>
            </div>
          </div>
          <Input.Search
            className="mb-[12px] w-[300px]"
            placeholder="搜索工具名称"
            value={searchText}
            onChange={(val) => setSearchText(val)}
          />
          <Table
            pagination={false}
            data={tools || []}
            columns={[
              {
                title: '工具名称/ID',
                dataIndex: 'name',
                width: 150
              },
              {
                title: '输入参数',
                dataIndex: 'params',
                render(val) {
                  return (
                    <Space>
                      {val.map((i) => {
                        return <Tag key={i}>{i}</Tag>;
                      })}
                    </Space>
                  );
                },
                width: 300
              },
              {
                title: '操作',
                dataIndex: '',
                width: 150,
                render(_, row) {
                  return (
                    <Space>
                      <Link
                        onClick={() =>
                          history.push(
                            `/tenant/compute/appforge/toolCreate?provider=${providerName}&toolPath=${row.path}&toolMethod=${row.method}`
                          )
                        }
                      >
                        编辑
                      </Link>
                      <Link
                        onClick={() => {
                          history.push(
                            `/tenant/compute/appforge/toolCreate?provider=${providerName}&toolPath=${row.path}&toolMethod=${row.method}&step=4`
                          );
                        }}
                      >
                        测试
                      </Link>
                      <Link
                        onClick={() => {
                          Modal.confirm({
                            title: '提示',
                            content: '确定删除这个工具吗?',
                            onOk() {
                              const schema = schemaUtil.deleteTool(
                                row.path,
                                row.method
                              );
                              setLoading(true);
                              update(JSON.stringify(schema))
                                .then(() => {
                                  Message.success('操作成功');
                                  mutate();
                                })
                                .finally(() => {
                                  setLoading(false);
                                });
                            }
                          });
                        }}
                      >
                        删除
                      </Link>
                    </Space>
                  );
                }
              }
            ]}
          />
        </Spin>
      </div>

      <SchemaModel
        onCancel={() => setShowSchemaModel(false)}
        onSubmit={(schema) => {
          return updateTool({
            ...collection,
            schema,
            original_provider: collection.provider
          }).then(() => {
            mutate();
          });
        }}
        visible={showSchemaModel}
        schema={collection?.schema}
      />
      <CreateDrawer
        collection={collection}
        visible={visible}
        onCancel={() => setVisible(false)}
        onSuccess={(newProvider) => {
          setVisible(false);
          if (newProvider) {
            goParams(history, { name: newProvider });
          } else {
            mutate();
          }
        }}
      />
    </div>
  );
}
