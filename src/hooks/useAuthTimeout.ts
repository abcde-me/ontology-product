// src/hooks/useAuthTimeout.ts
import { useEffect, useRef } from 'react';
import { getTokenExpiration, isValidToken } from '../utils/authUtils';
import { renew } from '@/api/user';

const useAuthTimeout = (options: {
  renewBeforeExpire: number; // 分钟 - token过期前多久开始续约（仅在用户有活动时）
  renewEndpoint?: string; // 续约接口（可选，当前直接使用renew函数）
}) => {
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const renewCheckRef = useRef<NodeJS.Timeout>();
  // 防止重复续约
  const isRenewingRef = useRef<boolean>(false);
  // 防止重复登出
  const isLoggingOutRef = useRef<boolean>(false);

  const LAST_ACTIVITY_KEY = 'lastActivityTime';
  const LOGOUT_EVENT_KEY = 'authTimeout_logout';

  const cleanup = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (renewCheckRef.current) clearInterval(renewCheckRef.current);
  };

  const updateLastActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  };

  const getLastActivity = (): number => {
    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  };

  const getTokenRemainingTime = (): number => {
    const rawToken = localStorage.getItem('loginToken');
    if (!rawToken || !isValidToken(rawToken)) {
      return 0;
    }

    const expTime = getTokenExpiration(rawToken);
    if (!expTime) {
      return 0;
    }

    // 计算token的剩余有效时间
    const remaining = expTime - Date.now();
    return Math.max(0, remaining); // 确保不返回负数
  };

  const startTokenManagement = () => {
    // 清除现有计时器
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    const checkTokenStatus = () => {
      // 如果正在续约，跳过本次检查，避免竞态条件
      if (isRenewingRef.current) {
        // console.log('【验证】正在续约中，跳过Token状态检查');
        // 续约期间，每5秒检查一次续约状态
        inactivityTimerRef.current = setTimeout(checkTokenStatus, 5000);
        return;
      }

      const remainingTime = getTokenRemainingTime();

      if (remainingTime <= 0) {
        // console.log('【验证】Token已过期，自动登出');
        handleLogout();
        return;
      }

      const remainingMinutes = Math.floor(remainingTime / (60 * 1000));
      const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

      // console.log(`【验证】Token状态检查: 剩余时间 ${remainingMinutes}分${remainingSeconds}秒`);

      // 检查是否需要续约
      const renewThreshold = options.renewBeforeExpire * 60 * 1000;
      const shouldRenew = remainingTime < renewThreshold;

      // console.log(`【调试】续约检查: 剩余时间=${remainingTime}ms, 续约阈值=${renewThreshold}ms, 需要续约=${shouldRenew}`);

      if (shouldRenew) {
        // 检查用户在当前token生命周期内是否有活动
        const lastActivity = getLastActivity();
        const now = Date.now();
        const inactiveTime = now - lastActivity;

        // 动态计算token的实际有效期
        const rawToken = localStorage.getItem('loginToken');
        if (!rawToken) {
          // console.log('【验证】无法获取token，跳过续约');
          return;
        }
        const expTime = getTokenExpiration(rawToken);
        if (!expTime) {
          // console.log('【验证】无法获取token过期时间，跳过续约');
          return;
        }

        // 计算token创建时间和已存在时间
        const tokenCreatedTime = expTime - remainingTime; // token创建时的时间戳
        const tokenExistTime = now - tokenCreatedTime;

        // 检查用户是否在当前token周期内有过活动
        const hasActivityInCurrentTokenPeriod = lastActivity > tokenCreatedTime;

        // 额外检查：如果用户最近有活动（比如最近10秒内），也认为是活跃的
        const recentActivityThreshold = 10 * 1000; // 10秒内的活动也算活跃
        const hasRecentActivity = inactiveTime < recentActivityThreshold;

        const shouldRenewBasedOnActivity =
          hasActivityInCurrentTokenPeriod || hasRecentActivity;

        if (shouldRenewBasedOnActivity) {
          // console.log('【验证】Token即将过期且用户活跃，执行续约');
          executeTokenRenewal();
          return; // 续约开始后，不再设置下次检查，由续约结果决定
        } else {
          // console.log('【验证】Token即将过期但用户不活跃，不进行续约');
        }
      }

      // 智能设置下次检查时间
      let nextCheckTime: number;
      const renewThresholdMs = options.renewBeforeExpire * 60 * 1000;

      if (remainingTime <= renewThresholdMs) {
        // 在续约阈值内，每5秒检查一次，确保及时响应用户活动
        nextCheckTime = 5000;
      } else if (remainingTime <= renewThresholdMs * 2) {
        // 接近续约阈值，每10秒检查一次
        nextCheckTime = 10000;
      } else if (remainingTime <= 300000) {
        // 剩余5分钟内，每30秒检查一次
        nextCheckTime = 30000;
      } else {
        // 剩余时间较长，每60秒检查一次
        nextCheckTime = 60000;
      }

      inactivityTimerRef.current = setTimeout(checkTokenStatus, nextCheckTime);
    };

    checkTokenStatus();
  };

  const executeTokenRenewal = async () => {
    // 防止重复续约
    if (isRenewingRef.current) {
      return;
    }

    const rawToken = localStorage.getItem('loginToken');
    if (!rawToken || !isValidToken(rawToken)) {
      return;
    }

    try {
      isRenewingRef.current = true;

      // 设置续约超时（30秒）

      // 在发送请求前再次检查token状态
      const preRequestRemainingTime = getTokenRemainingTime();

      const renewalPromise = renew();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('续约请求超时')), 30000);
      });

      const response = await Promise.race([renewalPromise, timeoutPromise]);

      if (!response.success) throw new Error('续约失败');

      const newToken = response.data.renewToken;

      localStorage.setItem('loginToken', newToken);

      // 获取新 token 的过期时间
      const newExpTime = getTokenExpiration(newToken);
      const newExpDate = newExpTime
        ? new Date(newExpTime).toLocaleString()
        : '未知';

      // 续约成功后，重新开始token管理
      startTokenManagement();
    } catch (error) {
      console.error('续约失败:');

      // 续约失败，检查token是否已过期
      const remainingTime = getTokenRemainingTime();
      const remainingSeconds = Math.floor(remainingTime / 1000);

      if (remainingTime <= 0) {
        handleLogout();
      } else {
        // 续约失败后，延长检查间隔，避免频繁失败请求
        const nextCheckDelay =
          remainingTime > 30000 ? 30000 : Math.max(remainingTime - 5000, 5000);
        setTimeout(() => startTokenManagement(), nextCheckDelay);
      }
    } finally {
      isRenewingRef.current = false;
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
      localStorage.removeItem(LAST_ACTIVITY_KEY);

      // 通知其他标签页登出
      localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
      localStorage.removeItem(LOGOUT_EVENT_KEY);

      // 使用replace而不是href，避免浏览器历史记录问题
      window.location.replace('/tenant/compute/appforge/login');
    } catch (error) {
      // console.error('【验证】登出操作失败:', error);
      isLoggingOutRef.current = false;
    }
  };

  const handleUserActivity = () => {
    updateLastActivity();
    // 用户活动不重置token过期计时器，只更新最后活动时间用于续约判断
  };

  useEffect(() => {
    // 检查当前token的过期时间
    const rawToken = localStorage.getItem('loginToken');
    if (rawToken && isValidToken(rawToken)) {
      const expTime = getTokenExpiration(rawToken);
      if (expTime) {
        const expDate = new Date(expTime).toLocaleString();
        const remaining = expTime - Date.now();
        const remainingMinutes = Math.floor(remaining / (60 * 1000));
        const remainingSeconds = Math.floor((remaining % (60 * 1000)) / 1000);
      }
    }

    // 初始化活动时间
    updateLastActivity();

    // 初始化智能token管理（包含过期检查和续约检查）
    startTokenManagement();

    // 监听其他标签页的登出事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOGOUT_EVENT_KEY) {
        // 其他标签页触发了登出，当前标签页也登出
        handleLogout();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 事件监听
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    // 使用节流函数减少事件触发频率
    let lastEventTime = Date.now();
    const throttledUserActivity = () => {
      const now = Date.now();
      if (now - lastEventTime > 5000) {
        // 5秒内只触发一次
        lastEventTime = now;
        handleUserActivity();
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, throttledUserActivity)
    );

    return () => {
      // console.log('【验证】清理 AuthTimeout 钩子');
      cleanup();
      window.removeEventListener('storage', handleStorageChange);
      events.forEach((event) =>
        window.removeEventListener(event, throttledUserActivity)
      );
    };
  }, []);
};

export default useAuthTimeout;
