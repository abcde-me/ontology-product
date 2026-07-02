import { Spin } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import React from 'react';
import styles from '../index.module.scss';

interface CaptchaImageProps {
  image: string;
  loading: boolean;
  onRefresh: () => void;
}

export function CaptchaImage({ image, loading, onRefresh }: CaptchaImageProps) {
  return (
    <button
      type="button"
      className={styles.captchaImageBtn}
      onClick={onRefresh}
      title="点击刷新验证码"
      aria-label="刷新验证码"
    >
      {loading ? (
        <Spin size={16} />
      ) : image ? (
        <img className={styles.captchaImage} src={image} alt="验证码" />
      ) : (
        <span className={styles.captchaPlaceholder}>
          <IconRefresh />
        </span>
      )}
    </button>
  );
}
