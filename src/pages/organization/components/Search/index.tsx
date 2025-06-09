import AddSvg from '@/assets/add.svg';
import { Button, Input, Space } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useDebounceFn } from 'ahooks';
import React from 'react';
import { useOrgEditor } from '../../components/OrgProvider/Context';
import MemberForm from '../MemberForm';

export default function Search() {
  const org = useOrgEditor();
  const { orgStore } = org;

  const { run: handleSearch } = useDebounceFn(
    (type: string, value: string) => {
      orgStore.fetchData({
        [`${type}`]: value
      });
    },
    {
      wait: 300
    }
  );

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center space-x-3">
        <Input
          suffix={<IconSearch />}
          placeholder="搜索成员姓名"
          allowClear
          onChange={(value) => {
            handleSearch('name', value);
          }}
          style={{ width: '260px' }}
        />
      </div>
      <Space>
        <Button
          type="primary"
          className="flex items-center gap-1 px-3"
          onClick={() => {
            orgStore.setCurrentMember(null);
            orgStore.setVisible(true);
          }}
        >
          <AddSvg />
          添加成员
        </Button>
      </Space>
      <MemberForm />
    </div>
  );
}
