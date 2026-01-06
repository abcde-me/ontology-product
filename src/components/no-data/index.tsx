import React, { ReactNode } from 'react';
import { Button } from '@arco-design/web-react';
import './index.css';
import { PermissionWrapper } from '../PermissionGuard';
import { NoDataCard } from '@ceai-front/arco-material';

export default function noDataElement(props: {
  description: string | ReactNode;
  btnText?: string | ReactNode;
  perms?: string;
  handleBtn?: ((e: Event) => void) | undefined;
}) {
  const { description, btnText, perms, handleBtn } = props;
  return (
    <NoDataCard
      title={typeof description === 'string' ? description : undefined}
      primaryBtn={
        !btnText ? null : typeof btnText === 'string' ? (
          <PermissionWrapper permission={perms}>
            <Button
              type="primary"
              style={{ marginTop: '10px' }}
              onClick={handleBtn}
            >
              {btnText}
            </Button>
          </PermissionWrapper>
        ) : (
          btnText
        )
      }
    />
  );
}
