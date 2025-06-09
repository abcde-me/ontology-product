import type { TComputed, TWatch } from '../type';

interface IComputedConfig<TState extends Record<string, any>> {
  prevState: TState;
  nextState: TState;
  computed?: TComputed<TState>;
}

export function calcDiffKeys(
  obj1: object,
  obj2: object,
  keys: (string | number | symbol)[],
) {
  const diffKeysMap: Record<string | number | symbol, boolean> = {};
  let diff = false;
  keys.forEach((key) => {
    if (!Object.is(obj1[key], obj2[key])) {
      diffKeysMap[key] = true;
      diff = true;
    }
  });
  return {
    diffKeysMap,
    diff,
  };
}

export function calcComputedState<TState extends Record<string, any>>({
  prevState,
  nextState,
  computed,
}: IComputedConfig<TState>) {
  if (computed) {
    computed.reduce((currentNextState, computedItem) => {
      let partialState;
      if (typeof computedItem === 'function') {
        partialState = computedItem(currentNextState, prevState);
      } else {
        const { diffKeysMap, diff } = calcDiffKeys(
          prevState,
          currentNextState,
          computedItem.keys,
        );
        if (diff) {
          partialState = computedItem.hander(currentNextState, diffKeysMap, prevState);
        }
      }

      if (partialState) {
        Object.assign(currentNextState, partialState);
      }
      return currentNextState;
    }, nextState);
  }
  return nextState;
}


interface IWatchConfig<TState extends Record<string, any>> {
  prevState: TState;
  nextState: TState;
  watch?: TWatch<TState>;
}
export function execWatchHandler<TState extends Record<string, any>>({
  prevState,
  nextState,
  watch,
}: IWatchConfig<TState>) {
  if (watch) {
    watch.forEach((watchItem) => {
      if (watchItem.keys) {
        const { diffKeysMap, diff } = calcDiffKeys(
          prevState,
          nextState,
          watchItem.keys,
        );
        if (diff) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          watchItem.hander && watchItem.hander(nextState, diffKeysMap, prevState);
        }
      }
    });
  }
}
// 数组转对象
export function arrayToMap<
  T = any,
  GetValue extends (item: T) => any = () => T,
>(arr: T[], getKey?: (item: T) => string, getValue?: GetValue) {
  const map: Record<string, ReturnType<GetValue>> = {};
  const _getValue = getValue || ((item: T) => item);
  const _getKey = getKey || ((item) => item);
  if (!arr) return map;
  arr.forEach((item) => {
    map[_getKey(item) as string] = _getValue(item);
  });
  return map;
}

export function isSameObject(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  keys?: string[],
) {
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  const compareKeys = keys || keys1;
  for (let i = 0; i < compareKeys.length; i++) {
    const key1 = compareKeys[i];
    const key2 = compareKeys[i];
    if (key1 !== key2 || obj1[key1] !== obj2[key2]) return false;
  }
  return true;
}

export function shallowEqualKeys(obj1: object, obj2: object, keys?: string[]) {
  if (!obj1 || !obj2) return false;
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    return isSameObject(obj1, obj2, keys);
  }
  return false;
}


function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
export function uuid() {
  return S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4();
}

type IFunction = (...args: any) => void;

export class EventEmitter<TEventName extends string = string> {
  _listeners = {} as Record<TEventName, IFunction[] | undefined>;
  on(type: TEventName, fn: IFunction) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type]!.push(fn);
    return () => {
      this.off(type, fn);
    };
  }
  once(type: TEventName, fn: IFunction) {
    const off = this.on(type, (...args) => {
      fn(...args);
      off();
    });
  }
  emit(type: TEventName, ...args: any) {
    const listeners = this._listeners[type];
    if (!listeners || !listeners.length) return false;
    listeners.forEach((fn) => {
      fn(...args);
    });
    return true;
  }
  off(type: TEventName, fn: IFunction) {
    const listeners = this._listeners[type];
    if (!listeners || !listeners.length) return;
    if (!fn) {
      this._listeners[type] = undefined;
      return;
    }
    this._listeners[type] = listeners.filter((f) => f !== fn);
  }
  offAllListeners() {
    this._listeners = {} as Record<TEventName, IFunction[] | undefined>;
  }
}

// export class EventEmitter2<
//   Listeners extends Record<string, IFunction[]> = Record<string, IFunction[]>,
// > extends EventEmitter {
//   // @ts-ignore
//   declare _listeners: Listeners;
//   declare on: <Type extends keyof Listeners>(
//     type: Type,
//     fn: Listeners[Type][0],
//   ) => any;
//   declare emit: <Type extends keyof Listeners>(
//     type: Type,
//     ...args: Parameters<Listeners[Type][0]>
//   ) => boolean;
// }


