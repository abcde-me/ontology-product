import React from 'react';
import RequirementInfoComponent from './info';
import RequirementInfoProvider from './context';

function RequirementInfo() {
  return (
    <RequirementInfoProvider>
      <RequirementInfoComponent />
    </RequirementInfoProvider>
  );
}
export default RequirementInfo;
