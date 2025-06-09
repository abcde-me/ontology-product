import React, { useMemo } from 'react';
import JsonView, { ReactJsonViewProps } from 'react-json-view';
import { parseJson, copyCode } from '@/utils/json';
import TwoCopy from '@/assets/chat/chat-copy.svg';

interface PreviewJsonProps extends Omit<ReactJsonViewProps, 'src'> {
  json: string;
  errorFallback?: React.ReactNode;
}

const PreviewJson: React.FC<PreviewJsonProps> = ({
  json,
  errorFallback = 'JSON解析失败',
  ...rest
}) => {
  const parsedJson = useMemo(() => {
    try {
      return parseJson(json);
    } catch (error) {
      return null;
    }
  }, [json]);

  const defaultProps = {
    style: {
      backgroundColor: 'white',
      padding: '20px 10px 10px',
      borderRadius: '5px'
    },
    displayDataTypes: false,
    enableClipboard: false,
    displayObjectSize: false,
    collapsed: false
  };

  const handleCopy = () => {
    copyCode(json);
  };

  return parsedJson ? (
    <div className="relative">
      <TwoCopy
        className="absolute right-1 top-1 z-10 w-[16px] cursor-pointer hover:opacity-80"
        onClick={handleCopy}
      />
      <JsonView src={parsedJson} {...defaultProps} {...rest} />
    </div>
  ) : (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-red-500">
      {errorFallback}
    </div>
  );
};

export default React.memo(PreviewJson);
