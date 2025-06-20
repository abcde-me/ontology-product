import React from 'react';
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button } from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import { IconPlus, IconDown, IconDragArrow, IconCaretDown, IconCaretRight, IconDelete, IconDownload } from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/index'
import SourceTable from '../sourceTable';
import TargetTable from '../targetTable';
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
export default function Eltable(props) {
    const {active}=props
    return (
        <div style={{ width: '100%' }}>
            {active=='1'?<SourceTable/>:<TargetTable/>}
        </div>
    )
}