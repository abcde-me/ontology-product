import React from 'react';
import type { FC } from 'react';
import classNames from 'classnames';

import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import style from './style.module.css';

init({ data });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export type AppIconProps = {
  size?: 'xs' | 'tiny' | 'small' | 'medium' | 'large';
  rounded?: boolean;
  icon?: string;
  background?: string;
  className?: string;
  innerIcon?: React.ReactNode;
  onClick?: () => void;
};

const AppIcon: FC<AppIconProps> = ({
  size = 'medium',
  rounded = false,
  icon,
  background,
  className,
  innerIcon,
  onClick,
}) => {
  return (
    <span
      className={classNames(
        style.appIcon,
        size !== 'medium' && style[size],
        rounded && style.rounded,
        className ?? '',
      )}
      style={{
        background,
      }}
      onClick={onClick}
    >
      {innerIcon ||
        (icon && icon !== '' ? <em-emoji id={icon} /> : <em-emoji id="🤖" />)}
    </span>
  );
};

export default AppIcon;
