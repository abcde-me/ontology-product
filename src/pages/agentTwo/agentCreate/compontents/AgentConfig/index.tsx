import React, { useEffect } from 'react';
import Header from './Header';
import Left from './Left';
import Ability from './Ability';
import { getDatasetsList } from '@/api/datasetsV2';
function AgentConfig(props) {
  useEffect(() => {
    getDatasetsList({ page: 1, limit: 10 }).then((res) => {
      console.log('zhinengti', res);
    });
  }, []);

  return (
    <div className="h-full">
      <Header />
      <div className="flex h-[calc(100%-60px)]">
        <div className="h-full min-w-0 flex-1">
          <Left />
        </div>
        <div className="mx-4 w-px bg-gray-200" />
        <div className="h-full min-w-0 flex-1 overflow-y-auto">
          <Ability />
        </div>
      </div>
    </div>
  );
}
export default AgentConfig;
