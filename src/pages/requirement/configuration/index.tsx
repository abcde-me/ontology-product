import React from 'react';
import RequirementConfig from './configuration';
import RequirementConfigProvider from './context';

function RequirementDetail() {
  return (
    <RequirementConfigProvider>
      <RequirementConfig />
    </RequirementConfigProvider>
  );
}
export default RequirementDetail;
