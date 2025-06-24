import React from 'react';
import { Button, Empty } from '@arco-design/web-react';
import emptyList from '@/assets/empty-list.png';
import './index.css';

export default function noDataElement(props: {
  description: any;
  btnText?: any;
  handleBtn?;
}) {
  const { description, btnText, handleBtn } = props;
  return (
    <Empty
      imgSrc={emptyList}
      description={
        btnText ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="description-text">{description}</span>
            <Button
              type="primary"
              style={{ marginTop: '10px' }}
              onClick={handleBtn}
            >
              {btnText}
            </Button>
          </div>
        ) : (
          <span className="description-text">{description}</span>
        )
      }
    />
  );
}
