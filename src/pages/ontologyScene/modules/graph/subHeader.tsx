import { useCallback, useState } from 'react';
import { ZoomInOut } from '@ceai-front/workflow';
import { Select, Space, Spin } from '@arco-design/web-react';
import { debounce } from 'lodash-es';
import { useNodes, useReactFlow, useStoreApi } from 'reactflow';
import React from 'react';

export default function CustomSubHeader() {
  return (
    <Space size="large">
      <ZoomInOut />
    </Space>
  );
}
