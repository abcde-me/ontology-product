import AddSvg from '@/assets/add.svg';
import { Button, Input, TreeSelect } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useDebounceFn } from 'ahooks';
import React, { useEffect } from 'react';
import { useMemberEditor } from '../../components/MemberProvider/Context';
import MemberForm from '../MemberForm';

export default function Search() {
  const member = useMemberEditor();
  const { memberStore } = member;
  const { orgData } = memberStore.useGetState(['orgData']);

  const { run: handleSearch } = useDebounceFn(
    (type: string, value: string) => {
      memberStore.fetchData({
        [`${type}`]: value
      });
    },
    {
      wait: 300
    }
  );

  useEffect(() => {
    memberStore.fetchOrgData();
  }, []);


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

        <TreeSelect
          allowClear
          placeholder="选择部门"
          showSearch
          treeData={orgData}
          onChange={(value) => {
            console.log(value);
            handleSearch('organization_id', value);
          }}
        />
      </div>
      <Button
        type="primary"
        className="flex items-center gap-1 px-3"
        onClick={() => {
          memberStore.setCurrentMember(null);
          memberStore.setVisible(true);
        }}
      >
        <AddSvg />
        添加成员
      </Button>
      <MemberForm />
    </div>
  );
}
