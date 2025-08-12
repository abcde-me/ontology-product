import React from 'react';
import { Button, Empty } from '@arco-design/web-react';
import emptyList from '@/assets/empty-list.png';
import './index.css';
import { PermissionWrapper } from '../PermissionGuard';

export default function noDataElement(props: {
  description: string;
  btnText?: string;
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
            <span className="description-text">{description}</span>
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
        ) : (
          <span className="description-text">{description}</span>
        )
      }
    />
  );
}
