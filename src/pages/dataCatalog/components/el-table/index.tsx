import React from 'react';
import { useState } from 'react';
import {
  Tabs,
  Typography,
  Select,
  DatePicker,
  Button
} from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import {
  IconPlus,
  IconDown,
  IconDragArrow,
  IconCaretDown,
  IconCaretRight,
  IconDelete,
  IconDownload
} from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import SourceTable from '../source-table';
import TargetTable from '../target-table';
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
export default function Eltable(props) {
  const { active, selectedNode } = props;
  return (
    <div style={{ flex: 1, overflowX: 'auto' }}>
      {active == 'source' ? (
        <SourceTable selectedNode={selectedNode} />
      ) : (
        <TargetTable selectedNode={selectedNode} />
      )}
    </div>
  );
}
