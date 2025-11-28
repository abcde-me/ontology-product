import React from 'react';
import RequirementConfig from './config';
import RequirementConfigProvider from './context';

function RequirementDetail() {
  return (
    <RequirementConfigProvider>
      <RequirementConfig />
    </RequirementConfigProvider>
  );
}
export default RequirementDetail;
