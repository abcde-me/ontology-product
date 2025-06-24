// src/hooks/useAuthTimeout.ts
import { useEffect, useRef } from 'react';
import { getTokenExpiration, isValidToken } from '../utils/authUtils';
import { renew } from '@/api/user';

const useAuthTimeout = (options: {
  logoutTimeout: number; // 分钟
  renewBeforeExpire: number; // 分钟
  renewEndpoint: string;
}) => {
  const timerRef = useRef<NodeJS.Timeout>();
  const renewCheckRef = useRef<NodeJS.Timeout>();
  // 防止重复续约
  const isRenewingRef = useRef<boolean>(false);
  // 防止重复登出
  const isLoggingOutRef = useRef<boolean>(false);

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (renewCheckRef.current) clearInterval(renewCheckRef.current);
  };

  const startLogoutTimer = () => {
    // 清除现有计时器
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(
      () => {
        // console.log('【验证】自动登出计时器触发');
        handleLogout();
      },
      options.logoutTimeout * 60 * 1000
    );
    // console.log(`【验证】登出计时器已设置，将在${options.logoutTimeout}分钟后触发`);
  };

  const handleRenewToken = async () => {
    // 防止重复续约
    if (isRenewingRef.current) {
      // console.log('【验证】已有续约请求正在进行，跳过');
      return;
    }

    const rawToken = localStorage.getItem('loginToken');
    if (!rawToken) {
      // console.log('【验证】Token 不存在，跳过续约检查');
      return;
    }

    if (!isValidToken(rawToken)) {
      // console.log('【验证】Token 格式无效，跳过续约');
      return;
    }

    const expTime = getTokenExpiration(rawToken);
    if (!expTime) {
      // console.log('【验证】无法获取 Token 过期时间，跳过续约');
      return;
    }

    // 计算剩余时间（毫秒）
    const remaining = expTime - Date.now();
    const remainingMinutes = Math.floor(remaining / (60 * 1000));
    const remainingSeconds = Math.floor((remaining % (60 * 1000)) / 1000);

    // console.log(
    //   `【验证】Token 检查: 剩余时间 ${remainingMinutes}分${remainingSeconds}秒, ` +
    //   `续约阈值: ${options.renewBeforeExpire}分钟`
    // );

    const shouldRenew = remaining < options.renewBeforeExpire * 60 * 1000;

    if (shouldRenew) {
      // console.log('【验证】Token 即将过期，开始续约...');
      try {
        isRenewingRef.current = true;
        const response = await renew();

        if (!response.success) throw new Error('续约失败');

        // 直接使用response中的数据，不需要再调用.json()
        const newToken = response.data.renewToken;

        // 打印旧token和新token的前10个字符进行对比
        // console.log(`【验证】Token续约: 旧=${rawToken.substring(0, 10)}... 新=${newToken.substring(0, 10)}...`);

        localStorage.setItem('loginToken', newToken);

        // 获取新 token 的过期时间
        const newExpTime = getTokenExpiration(newToken);
        const newExpDate = newExpTime
          ? new Date(newExpTime).toLocaleString()
          : '未知';
        // console.log(`【验证】Token 续约成功! 新的过期时间: ${newExpDate}`);

        // 续约成功后重置登出计时器
        startLogoutTimer();
      } catch (error) {
        console.error('【验证】Token 续约失败:', error);
        // 续约失败不要自动登出，可能是网络问题
      } finally {
        isRenewingRef.current = false;
      }
    } else {
      // console.log('【验证】Token 还未达到续约时间，无需续约');
    }
  };

  const handleLogout = () => {
    // 防止重复登出
    if (isLoggingOutRef.current) return;

    try {
      isLoggingOutRef.current = true;
      // console.log('【验证】执行自动登出操作');
      cleanup();
      localStorage.removeItem('loginToken');
      // 使用replace而不是href，避免浏览器历史记录问题
      window.location.replace('/tenant/compute/appforge/login');
    } catch (error) {
      // console.error('【验证】登出操作失败:', error);
      isLoggingOutRef.current = false;
    }
  };

  const handleUserActivity = () => {
    // console.log('【验证】检测到用户活动，重置登出计时器');
    startLogoutTimer();
  };

  useEffect(() => {
    // console.log('【验证】初始化 AuthTimeout 钩子');
    // console.log(`【验证】配置: 登出超时=${options.logoutTimeout}分钟, 续约阈值=${options.renewBeforeExpire}分钟`);

    // 检查当前token的过期时间
    const rawToken = localStorage.getItem('loginToken');
    if (rawToken && isValidToken(rawToken)) {
      const expTime = getTokenExpiration(rawToken);
      if (expTime) {
        const expDate = new Date(expTime).toLocaleString();
        const remaining = expTime - Date.now();
        const remainingMinutes = Math.floor(remaining / (60 * 1000));
        const remainingSeconds = Math.floor((remaining % (60 * 1000)) / 1000);
        // console.log(`【验证】当前Token过期时间: ${expDate}, 剩余: ${remainingMinutes}分${remainingSeconds}秒`);
      }
    }

    // 初始化定时器
    startLogoutTimer();

    // 设置定期检查（每30秒检查一次）
    renewCheckRef.current = setInterval(() => {
      handleRenewToken();
    }, 30 * 1000);

    // 事件监听
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    // 使用节流函数减少事件触发频率
    let lastActivityTime = Date.now();
    const throttledUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 5000) {
        // 5秒内只触发一次
        lastActivityTime = now;
        handleUserActivity();
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, throttledUserActivity)
    );

    return () => {
      // console.log('【验证】清理 AuthTimeout 钩子');
      cleanup();
      events.forEach((event) =>
        window.removeEventListener(event, throttledUserActivity)
      );
    };
  }, []);
};

export default useAuthTimeout;
