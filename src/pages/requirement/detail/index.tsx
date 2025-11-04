import React from 'react';
import Detail from './detail';
import RequirementDetailProvider from './context';

function RequirementDetail() {
  return (
    <RequirementDetailProvider>
      <Detail />
    </RequirementDetailProvider>
  );
}
export default RequirementDetail;
