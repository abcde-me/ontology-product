export type Task = {
  /** 海豚调度生成的id */
  ds_workflow_id: string;
  /** 服务端工作流唯一标识 */
  workflow_uuid: string;
  /** 工作流版本 */
  workflow_version: string;
  /** 工作流名称 */
  workflow_name: string;
  /** 源数据目录 */
  source_path: string;
  /** 目标数据目录 */
  target_path: string;
  /** 运行周期 */
  run_cycle: string;
  /** 创建时间 */
  create_time: number;
  /** 最新修改时间 */
  update_time: string;
  /** 是否上线 0-下线 1-上线 */
  is_online: IsOnline;
  /** 创建人id */
  user_id: string;
  /** 创建人姓名 */
  user_name: string;
};
