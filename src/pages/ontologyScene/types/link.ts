export enum LinkType {
  /** 1:1 一对一 */
  ONE_TO_ONE = '1:1',
  /** 1:N 一对多 */
  ONE_TO_MANY = '1:N',
  /** N:N 多对多 */
  MANY_TO_MANY = 'N:N'
}

/** 链接方向（创建页简化选项） */
export enum LinkDirection {
  /** 单向 */
  UNIDIRECTIONAL = 'unidirectional',
  /** 双向 */
  BIDIRECTIONAL = 'bidirectional'
}
