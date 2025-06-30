import { useCreation } from 'ahooks';
import React, { useEffect } from 'react';
import { EditorContext } from './Context';
import { OrgEditor } from './Org';

interface MemberProviderProps {
  children: React.ReactNode | React.ReactNode[];
  orgStore?: OrgEditor;
}
const MemberProvider = ({ children, orgStore }: MemberProviderProps) => {
  const org = useCreation(() => {
    if (orgStore) {
      return orgStore;
    }
    return new OrgEditor();
  }, [orgStore]);

  useEffect(() => {
    org.orgStore.fetchOrgData();
    org.orgStore.fetchRoleData();
  }, [org]);

  return (
    <EditorContext.Provider value={org}>{children}</EditorContext.Provider>
  );
};

export default MemberProvider;
