import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import Form from './configCredentialsForm';
import { Collection } from '@/utils/type';
import { getToolCredentialSchema } from '@/api/tools';
import { toolCredentialToFormSchemas } from '@/utils/toFormSchema';
import { IconLink } from '@arco-design/web-react/icon';
import { Button, Link, Modal, Spin } from '@arco-design/web-react';

type Props = {
  collection: Collection;
  onCancel: () => void;
  onSaved: (value: Record<string, any>) => void;
  onRemove: () => void;
  visible: boolean;
};

const ConfigCredential: FC<Props> = ({
  collection,
  onCancel,
  onSaved,
  onRemove,
  visible
}) => {
  const [credentialSchema, setCredentialSchema] = useState<any>(null);
  const { team_credentials: credentialValue, name: collectionName } =
    collection;
  useEffect(() => {
    getToolCredentialSchema(collectionName).then((res) => {
      setCredentialSchema(toolCredentialToFormSchemas(res));
    });
  }, [collectionName]);
  const [tempCredential, setTempCredential] =
    React.useState<any>(credentialValue);

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title="设置授权"
      onOk={() => onSaved(tempCredential)}
    >
      <div>
        配置凭据后，工作区中的所有成员都可以在编排应用程序时使用此工具。
      </div>
      {!credentialSchema ? (
        <Spin loading />
      ) : (
        <>
          <Form
            value={tempCredential}
            onChange={(v) => {
              setTempCredential(v);
            }}
            formSchemas={credentialSchema}
            isEditMode={true}
            showOnVariableMap={{}}
            validating={false}
            inputClassName="!bg-gray-50"
            fieldMoreInfo={(item) =>
              item.url ? (
                <Link
                  rel="noopener noreferrer"
                  target="_blank"
                  href={item.url}
                  className="mt-[5px]"
                >
                  如何获取
                  <IconLink />
                </Link>
              ) : null
            }
          />
          <div
            className={cn(
              collection.is_team_authorization
                ? 'justify-between'
                : 'justify-end',
              'mt-2 flex '
            )}
          >
            {collection.is_team_authorization && (
              <Button type="outline" onClick={onRemove}>
                移除
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};
export default React.memo(ConfigCredential);
