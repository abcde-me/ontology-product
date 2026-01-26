import React from 'react';
import { Button } from '@arco-design/web-react';
import { useHistory } from 'react-router';

export default function OntologySceneList() {
  const history = useHistory();

  return (
    <div className="flex h-full items-center justify-center">
      <Button
        type="primary"
        onClick={() => {
          history.push('/tenant/compute/modaforge/ontologyScene/detail/1');
        }}
      >
        点击跳转到本体场景详情
      </Button>
    </div>
  );
}
