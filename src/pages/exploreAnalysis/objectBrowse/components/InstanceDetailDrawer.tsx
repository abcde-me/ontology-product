import React, { useMemo } from 'react';
import { Descriptions, Drawer } from '@arco-design/web-react';
import type { InstanceQueryRow } from '../types';
import { getInstanceDisplayFields } from '../utils/instanceRow';
import type { FieldCommentMap } from '../utils/fieldDisplayLabel';

interface InstanceDetailDrawerProps {
  visible: boolean;
  record: InstanceQueryRow | null;
  fieldCommentMap?: FieldCommentMap;
  vectorFieldNames?: Set<string>;
  onClose: () => void;
}

export const InstanceDetailDrawer: React.FC<InstanceDetailDrawerProps> = ({
  visible,
  record,
  fieldCommentMap,
  vectorFieldNames,
  onClose
}) => {
  const fields = useMemo(
    () =>
      record
        ? getInstanceDisplayFields(record, fieldCommentMap, vectorFieldNames)
        : [],
    [fieldCommentMap, record, vectorFieldNames]
  );

  return (
    <Drawer
      width={560}
      title="实例明细"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {fields.length > 0 ? (
        <Descriptions
          column={1}
          border
          data={fields.map((item) => ({
            label: item.label,
            value: item.value
          }))}
        />
      ) : (
        <div>暂无明细数据</div>
      )}
    </Drawer>
  );
};
