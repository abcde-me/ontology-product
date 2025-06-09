import Avatar from '@/components/avater';
import React from 'react';
import { appConfigStore } from '../model';
import { observer } from 'mobx-react-lite';

function AvatarField() {
  const { description, title } = appConfigStore.formData || {};
  const avatar = appConfigStore.avatar;
  return (
    <Avatar
      value={avatar}
      onChange={(val) => {
        appConfigStore.setAvatar(val);
      }}
      className="mb-[16px]"
      title={title}
      description={description}
    />
  );
}
export default observer(AvatarField);
