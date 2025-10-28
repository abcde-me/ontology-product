import React from 'react';
import { Input, Select, Checkbox, Button } from '@arco-design/web-react';
// import { Delete } from '@icon-park/react';
import { MetadataField } from './DataAssetFormContainer';

interface FieldRowProps {
  field: MetadataField;
  onUpdate: (updates: Partial<MetadataField>) => void;
  onDelete: () => void;
}

export default function FieldRow({ field, onUpdate, onDelete }: FieldRowProps) {
  return (
    <div className="grid grid-cols-[50px_2fr_2fr_200px_2fr_80px_80px_100px] gap-2 border-b py-2 text-sm">
      {/* 序号 */}
      <div className="flex items-center">{field.sequence}</div>

      {/* 字段中文名称 */}
      <Input
        placeholder="请输入中文名称"
        value={field.chineseName}
        onChange={(value) => onUpdate({ chineseName: value })}
      />

      {/* 字段英文名称 */}
      <Input
        placeholder="请输入英文名称"
        value={field.englishName}
        onChange={(value) => onUpdate({ englishName: value })}
      />

      {/* 字段类型 */}
      <Select
        placeholder="请选择"
        value={field.fieldType}
        onChange={(value) => onUpdate({ fieldType: value })}
      >
        <Select.Option value="string">字符串</Select.Option>
        <Select.Option value="number">数字</Select.Option>
        <Select.Option value="boolean">布尔值</Select.Option>
        <Select.Option value="date">日期</Select.Option>
        <Select.Option value="object">对象</Select.Option>
      </Select>

      {/* 空值默认填充 */}
      <Input
        value={field.defaultValue}
        onChange={(value) => onUpdate({ defaultValue: value })}
      />

      {/* 必填 */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={field.required}
          onChange={(checked) => onUpdate({ required: checked })}
        />
      </div>

      {/* 可修改 */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={field.editable}
          onChange={(checked) => onUpdate({ editable: checked })}
        />
      </div>

      {/* 操作 */}
      <div className="flex items-center">
        <Button
          type="text"
          size="small"
          // icon={<Delete />}
          onClick={onDelete}
          className="cursor-pointer text-red-500"
        >
          删除
        </Button>
      </div>
    </div>
  );
}
