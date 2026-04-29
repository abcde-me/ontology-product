import React from 'react';
import { Form, Input, Button } from '@arco-design/web-react';
import { IconSearch, IconPlus } from '@arco-design/web-react/icon';
import { FormInstance } from '@arco-design/web-react';

interface SearchFormProps {
  form: FormInstance;
  onSearch: () => void;
  onAdd?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  form,
  onSearch,
  onAdd
}) => {
  return (
    <div className="flex items-center justify-between">
      <Form form={form}>
        <Form.Item noStyle field="keyword">
          <Input.Search
            className="w-[220px]"
            placeholder="请输入数据源名称"
            suffix={<IconSearch />}
            allowClear
            onClear={onSearch}
            onSearch={onSearch}
          />
        </Form.Item>
      </Form>
      {onAdd && (
        <Button type="primary" icon={<IconPlus />} onClick={onAdd}>
          新增
        </Button>
      )}
    </div>
  );
};
