import { useCreation } from 'ahooks';
import React, { useEffect } from 'react';
import { EditorContext } from './Context';
import { MemberEditor } from './Member';

interface MemberProviderProps {
  children: React.ReactNode | React.ReactNode[];
  memberStore?: MemberEditor;
}
const MemberProvider = ({ children, memberStore }: MemberProviderProps) => {
  const member = useCreation(() => {
    if (memberStore) {
      return memberStore;
    }
    return new MemberEditor();
  }, [memberStore]);

  useEffect(() => {
    member.memberStore.fetchRoleData();
  }, []);

  return (
    <EditorContext.Provider value={member}>{children}</EditorContext.Provider>
  );
};

export default MemberProvider;
