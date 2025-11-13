/**
 * 判断两个数组是否相同（长度相等且对应索引上的元素使用 === 全等）。
 * 如果任一参数不是数组（包括 null / undefined）则返回 false。
 *
 * @template T
 * @param {T[] | null | undefined} arr1 - 第一个数组
 * @param {T[] | null | undefined} arr2 - 第二个数组
 * @returns {boolean} 两个数组完全相同则返回 true，否则返回 false
 */
export function isSameArray<T>(
  arr1: T[] | null | undefined,
  arr2: T[] | null | undefined
): boolean {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * 返回去重后的新数组（保留原始顺序，基于 === 比较）。
 */
export function unique<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const res: T[] = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      res.push(item);
    }
  }
  return res;
}

/**
 * 移除数组中的假值（false, 0, '', null, undefined, NaN）。
 */
export function compact<T>(
  arr: (T | null | undefined | false | 0 | '')[]
): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * 展平数组，depth 表示展平深度，默认 1；depth = Infinity 时完全展平。
 */
export function flatten(arr: any[], depth = 1): any[] {
  if (depth < 1) return arr.slice();
  const res: any[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      res.push(
        ...(depth === Infinity
          ? flatten(item, Infinity)
          : flatten(item, depth - 1))
      );
    } else {
      res.push(item);
    }
  }
  return res;
}

/**
 * 将数组按指定大小切分为多个块
 */
export function chunk<T>(arr: T[], size = 1): T[][] {
  if (size <= 0) throw new Error('size must be > 0');
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

/**
 * 生成数值范围。用法：
 * range(n) => [0,1,...,n-1]
 * range(start, end, step?)
 */
export function range(start: number, end?: number, step = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (step === 0) throw new Error('step must not be 0');
  const res: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) res.push(i);
  } else {
    for (let i = start; i > end; i += step) res.push(i);
  }
  return res;
}

/**
 * 返回数组最后一个元素或 undefined
 */
export function last<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}

/**
 * 返回在 a 中但不在 b 中的元素（基于 === 比较）
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
}

/**
 * 返回 a 与 b 的交集
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return unique(a.filter((item) => setB.has(item)));
}

/**
 * Fisher-Yates 随机打乱，返回新数组（不修改原数组）
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 根据回调将数组分组。返回键 -> 元素数组的映射（键为字符串）。
 */
export function groupBy<T>(
  arr: T[],
  fn: (item: T) => string | number | symbol
): Record<string, T[]> {
  const res: Record<string, T[]> = {};
  for (const item of arr) {
    const key = String(fn(item));
    res[key] = res[key] || [];
    res[key].push(item);
  }
  return res;
}

/**
 * 随机返回数组中的一个元素，空数组返回 undefined
 */
export function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 将任意值包装为数组：null/undefined -> []，非数组 -> [value]
 */
export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
