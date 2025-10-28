import React, { ReactNode } from 'react';
import { Button, Empty } from '@arco-design/web-react';
import emptyList from '@/assets/empty-list.png';
import './index.css';
import { PermissionWrapper } from '../PermissionGuard';

export default function noDataElement(props: {
  description: string | ReactNode;
  btnText?: string | ReactNode;
  perms?: string;
  handleBtn?: ((e: Event) => void) | undefined;
}) {
  const { description, btnText, perms, handleBtn } = props;
  return (
    <Empty
      className="no-data-container"
      imgSrc={emptyList}
      description={
        btnText ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {typeof description === 'string' ? (
              <span className="description-text">{description}</span>
            ) : (
              description
            )}
            <PermissionWrapper permission={perms}>
              <Button
                type="primary"
                style={{ marginTop: '10px' }}
                onClick={handleBtn}
              >
                {btnText}
              </Button>
            </PermissionWrapper>
          </div>
        ) : typeof description === 'string' ? (
          <span className="description-text">{description}</span>
        ) : (
          description
        )
      }
    />
  );
}
