import React from 'react';
import type { FC } from 'react';
import type { Model, ModelProvider } from '@/utils/type';
import OpenaiViolet from './OpenaiViolet';
import { IconFileImage } from '@arco-design/web-react/icon';

type ModelIconProps = {
  provider?: Model | ModelProvider;
  modelName?: string;
  className?: string;
};
const ModelIcon: FC<ModelIconProps> = ({ provider, className, modelName }) => {
  if (provider?.provider === 'openai' && modelName?.startsWith('gpt-4'))
    return <OpenaiViolet className={`h-4 w-4 ${className}`} />;

  if (provider?.icon_small) {
    return (
      <img
        alt="model-icon"
        src={`${provider.icon_small.zh_Hans || provider.icon_small.en_US}?_token=${localStorage.getItem('console_token')}`}
        className={`h-4 w-4 ${className}`}
      />
    );
  }

  return (
    <div
      className={`
      flex h-6 w-6 items-center justify-center rounded border-[0.5px] border-black/5 bg-gray-50
      ${className}
    `}
    >
      <IconFileImage />
    </div>
  );
};

export default ModelIcon;
