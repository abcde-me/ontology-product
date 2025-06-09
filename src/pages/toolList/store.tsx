import { useToolsProviders } from '@/utils/swr';
import { Message } from '@arco-design/web-react';
import React, { useEffect } from 'react';
import ToolList from './list';

export default function StoreToolList() {
  const { data, isLoading, isValidating, error, mutate } = useToolsProviders();

  useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  return (
    <ToolList
      isStore={true}
      list={data}
      loading={isLoading || isValidating}
      refresh={mutate}
    />
  );
}
