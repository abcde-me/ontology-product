import { useMyToolsProviders } from '@/utils/swr';
import { Message } from '@arco-design/web-react';
import React, { useEffect } from 'react';
import ToolList from './list';

export default function MyToolList() {
  const { data, isLoading, isValidating, error, mutate } =
    useMyToolsProviders();

  useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  return (
    <ToolList
      isStore={false}
      list={data}
      loading={isLoading || isValidating}
      refresh={mutate}
    />
  );
}
