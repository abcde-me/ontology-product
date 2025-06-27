import React, { useState } from 'react';
import { Input, InputProps } from '@arco-design/web-react';
import { IconCloseCircle, IconSearch } from '@arco-design/web-react/icon';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
} & Omit<InputProps, 'value' | 'onChange'>;

export default function SearchInput(props: Props) {
  const [value, setValue] = useState(props.value || '');
  const [isHover, setIsHover] = useState(false);

  const onMouseEnter = () => {
    setIsHover(true);
  };

  const onMouseLeave = () => {
    setIsHover(false);
  };

  const onChange = (value: string) => {
    setValue(value);
    props?.onChange?.(value);
  };

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Input
        {...props}
        value={value}
        onChange={onChange}
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
      />
    </div>
  );
}
