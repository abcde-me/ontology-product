import React, { useState } from 'react';
import { Input } from '@arco-design/web-react';
import { IconCloseCircle, IconSearch } from '@arco-design/web-react/icon';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function SearchInput(props: Props) {
  const [value, setValue] = useState(props.value || '');
  const [isHover, setIsHover] = useState(false);

  const onMouseEnter = () => {
    setIsHover(true);
  };

  const onMouseLeave = () => {
    setIsHover(false);
  };

  return (
    <div>
      <Input
        value={value}
        className={'h-8 w-[130px]'}
        onChange={(value) => {
          setValue(value);
        }}
        placeholder="输入搜索目录"
        suffix={
          value && isHover ? (
            <IconCloseCircle
              style={{ cursor: 'pointer' }}
              onClick={() => setValue('')}
            />
          ) : (
            <IconSearch />
          )
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}
