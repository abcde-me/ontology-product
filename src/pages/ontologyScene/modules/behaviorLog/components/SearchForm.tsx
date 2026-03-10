import React from 'react';
import { Form, Input } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { FormInstance } from '@arco-design/web-react';

interface SearchFormProps {
  form: FormInstance;
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ form, onSearch }) => {
  return (
    <Form form={form}>
      <Form.Item noStyle field="keyword">
        <Input.Search
          className="w-[220px]"
          placeholder="请输入名称"
          suffix={<IconSearch />}
          allowClear
          onClear={onSearch}
          onSearch={onSearch}
        />
      </Form.Item>
    </Form>
  );
};
