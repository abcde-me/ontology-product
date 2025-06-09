import { Button, Drawer, Input, Spin } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { appConfigStore } from '../model';
import { useKnowledgeList } from '@/utils/swr';
import { formatNumber } from '@/utils/format';
import Avatar from '@/components/avater';
import DefaultKnowledgeIcon from '@/assets/default-knowledge-icon.svg';
import { useHistory } from 'react-router-dom';

export default function AddKnowledges(props: {
  visible: boolean;
  onClose: () => void;
}) {
  const { visible, onClose } = props;

  const { isLoading, data } = useKnowledgeList();

  const [searchName, setSearchName] = useState('');
  const installedKnowledges = appConfigStore.knowledges;
  const history = useHistory();

  return (
    <Drawer
      width={520}
      title={<span>添加知识库</span>}
      visible={visible}
      onOk={() => {
        onClose();
      }}
      onCancel={() => {
        onClose();
      }}
    >
      <Spin loading={isLoading} block>
        <div className="mb-[16px] flex">
          <Input.Search
            allowClear
            placeholder="搜索知识库名称"
            className="w-[300px]"
            value={searchName}
            onChange={(val) => {
              setSearchName(val);
            }}
          />
          <Button
            type="primary"
            className="ml-auto"
            icon={<IconPlus />}
            onClick={() => {
              history.push('/tenant/compute/appforge/knowledgeCreate');
            }}
          >
            新建知识库
          </Button>
        </div>
        {(data?.data || [])
          .filter((item) => item.name.includes(searchName))
          .map((item) => {
            const installed = installedKnowledges.some((i) => i.id === item.id);
            const detailItems = [
              { title: '文件数', value: item.document_count || 0 },
              {
                title: '知识库大小',
                value: item.word_count
                  ? item.word_count > 1000
                    ? `${formatNumber((item.word_count / 1000).toFixed(1))}k`
                    : item.word_count
                  : 0
              },
              { title: '关联应用', value: item.app_count || 0 }
            ];
            return (
              <div
                key={item.id}
                className="group mb-[16px] rounded-[4px] border border-[rgb(var(--primary-3))] bg-[linear-gradient(180deg,rgba(226,239,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] p-[16px] hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]"
              >
                <div className="mb-[8px] flex">
                  <Avatar
                    readonly
                    value=""
                    defaultIcon={
                      <DefaultKnowledgeIcon className="size-[44px]" />
                    }
                    size={44}
                    className="mr-[8px]"
                  />
                  <div>
                    <div className="mb-[2px] text-[16px] font-[600] text-[rgb(var(--primary-5))]">
                      {item.name}
                    </div>
                    <div>
                      {item.created_at
                        ? dayjs(item.created_at * 1000).format(
                            'YYYY-MM-DD  HH:mm:ss'
                          )
                        : '--'}
                    </div>
                  </div>
                  <Button
                    icon={installed ? null : <IconPlus />}
                    type={installed ? 'primary' : 'outline'}
                    size="mini"
                    className="ml-auto"
                    onClick={() => {
                      appConfigStore.addKnowledge(item);
                    }}
                    disabled={installed}
                  >
                    {installed ? '已添加' : '添加知识库'}
                  </Button>
                </div>
                <div className="mb-[8px]">
                  <span className="font-[600]">描述: </span>
                  <span>{item.description}</span>
                </div>
                <div className="flex">
                  {detailItems.map((item) => {
                    return (
                      <div
                        key={item.title}
                        className="mr-[12px] h-[52px] flex-1 rounded-[8px] bg-[rgb(var(--primary-1))] px-[10px] py-[6px] last-of-type:mr-0 group-hover:bg-white"
                      >
                        <div className="text-[var(--color-text-4)]">
                          {item.title}
                        </div>
                        <div className="text-[14px] font-[600] text-[#163370]">
                          {item.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </Spin>
    </Drawer>
  );
}
