import React, { useRef, useState } from 'react';
import { Input, Button } from '@arco-design/web-react';
import { IconRefresh, IconPlus } from '@arco-design/web-react/icon';
// import './index.css';
type CommonModalProps = {
  placeholder: string;
  rightname: string;
  onButtonClick?;
  onChildQuery?;
  onChildReset?;
};
const Header: React.FC<CommonModalProps> = (props) => {
  const { placeholder, rightname, onButtonClick, onChildQuery, onChildReset } =
    props;
  const InputSearch = Input.Search;
  const [value, setValue] = useState('');
  const handleCreateClick = () => {
    onButtonClick();
  };
  const handleSearch = (value) => {
    onChildQuery(value);
  };
  const resetButton = () => {
    setValue('');
    onChildReset();
  };
  return (
    <div className="modaforge-header mb-4 flex">
      <div className="header-left flex-1 items-center ">
        <InputSearch
          value={value}
          allowClear
          placeholder={placeholder}
          onChange={(value: string, e) => setValue(value)}
          className="h-[32px] w-[240px]"
          onSearch={handleSearch}
        />
        <Button
          type="outline"
          icon={<IconRefresh />}
          className="ml-[8px]"
          onClick={resetButton}
        />
      </div>
      <div className="header-right flex flex-1 flex-row-reverse">
        <Button type="primary" icon={<IconPlus />} onClick={handleCreateClick}>
          {rightname}
        </Button>
      </div>
    </div>
  );
};

export default Header;
