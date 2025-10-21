import React from 'react';
import { memo } from 'react';

type UpdateDSLModalProps = {
  onCancel: () => void;
  onBackup: () => void;
  onImport?: () => void;
};

const UpdateDSLModal = ({
  onCancel,
  onBackup,
  onImport
}: UpdateDSLModalProps) => {
  return <>upload dsl modal</>;
};

export default memo(UpdateDSLModal);
