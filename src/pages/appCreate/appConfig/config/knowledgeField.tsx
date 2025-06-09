import { useKnowledgeList } from '@/utils/swr';
import { Divider, Empty, Space, Switch } from '@arco-design/web-react';
import { IconMinusCircle } from '@arco-design/web-react/icon';
import React from 'react';
import { appConfigStore } from '../model';
import { observer } from 'mobx-react-lite';
import AddKnowledge from './knowledgeDrawer';
import DefaultKnowledgeIcon from '@/assets/default-knowledge-icon.svg';
import Avatar from '@/components/avater';
function KnowledgeField() {
  const { data } = useKnowledgeList();
  const knowledgeUsed = appConfigStore.knowledges;
  const list = knowledgeUsed.map((item, index) => {
    const knowledgeDetail = (data?.data || []).find((i) => i.id === item.id);
    return (
      <div
        key={item.id}
        className="group mb-[8px] flex items-center rounded-[8px] border bg-[var(--color-bg-4)] px-[16px] py-[7px] hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-2))]"
      >
        <Avatar
          readonly
          value=""
          defaultIcon={<DefaultKnowledgeIcon className="size-[24px]" />}
          size={24}
          className="mr-[8px]"
        />
        <span className="mr-auto font-[600]">{knowledgeDetail?.name}</span>
        <Space>
          <IconMinusCircle
            onClick={() => appConfigStore.removeKnowledge(index)}
            className="block cursor-pointer text-[16px] hover:text-[rgb(var(--primary-6))]"
          />
          <Divider
            type="vertical"
            className="group-hover:border-l-[rgb(var(--primary-6))]"
          />
          <Switch
            checked={item.enabled}
            onChange={() => {
              appConfigStore.toggleKnowledge(item.id);
            }}
          />
        </Space>
      </div>
    );
  });
  return (
    <>
      {knowledgeUsed.length === 0 ? (
        <div>
          <div className="mb-[24px] pl-[16px] text-[var(--color-text-5)]">
            您可以导入知识库作为上下文
          </div>
          <Empty className="appcreate-empty" />
        </div>
      ) : (
        <div>{list}</div>
      )}

      <AddKnowledge
        visible={appConfigStore.showKnowledgeDrawer}
        onClose={() => appConfigStore.toggleKnowledgeDrawer()}
      />
    </>
  );
}

export default observer(KnowledgeField);
