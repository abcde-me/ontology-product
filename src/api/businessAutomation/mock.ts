import { AutoRuleDetail, AutoRuleItem } from '@/pages/ruleManagement/types';
import { AutoExecLogDetail, AutoExecLogItem } from '@/pages/ruleRunLog/types';

export const AUTO_RULES: AutoRuleItem[] = [
  {
    id: 1,
    name: '设备温度超限告警',
    description: '监控设备温度变化，超过阈值时触发告警行为',
    modelId: 101,
    projectId: 'project-1',
    status: 1,
    triggerType: 2,
    createdAt: '2026-03-01 09:00:00',
    createdBy: 'admin',
    updatedAt: '2026-03-28 10:20:00',
    updatedBy: 'admin'
  },
  {
    id: 2,
    name: '每日巡检结果汇总',
    description: '每天定时汇总巡检结果并生成统计信息',
    modelId: 102,
    projectId: 'project-1',
    status: 2,
    triggerType: 1,
    createdAt: '2026-03-03 11:30:00',
    createdBy: 'operator',
    updatedAt: '2026-03-27 18:10:00',
    updatedBy: 'operator'
  },
  {
    id: 3,
    name: '关键属性变更同步',
    description: '对象关键属性发生变化时同步执行补偿动作',
    modelId: 103,
    projectId: 'project-2',
    status: 0,
    triggerType: 2,
    createdAt: '2026-03-06 14:15:00',
    createdBy: 'developer',
    updatedAt: '2026-03-29 09:45:00',
    updatedBy: 'developer'
  }
];

export const AUTO_RULE_DETAILS: AutoRuleDetail[] = [
  {
    ...AUTO_RULES[0],
    actionConfig: {
      actionId: 1001,
      actionCode: 'send_temperature_alarm',
      parameters: {
        // @ts-ignore
        level: 'high',
        receivers: ['ops-group']
      }
    },
    changeConfig: {
      objectTypeId: 2001,
      instanceScope: 'all',
      // @ts-ignore
      monitorPropertyIds: [3001],
      conditionType: 'meet_condition',
      conditionOperator: '>',
      conditionValue: '80'
    },
    gateConfig: {
      enabled: true,
      functionId: 4001,
      functionCode: 'check_device_online'
    },
    scheduleConfig: {
      enabled: false,
      // @ts-ignore
      cronExpr: ''
    }
  },
  {
    ...AUTO_RULES[1],
    actionConfig: {
      actionId: 1002,
      actionCode: 'daily_inspection_summary',
      parameters: {
        // @ts-ignore
        notifyChannel: 'email',
        template: 'inspection_daily'
      }
    },
    changeConfig: {
      objectTypeId: 2002,
      instanceScope: 'specific',
      instanceIds: [5001, 5002],
      // @ts-ignore

      monitorPropertyIds: [3002, 3003],
      conditionType: 'any_change'
    },
    gateConfig: {
      enabled: false,
      functionId: 0,
      functionCode: ''
    },
    scheduleConfig: {
      enabled: true,
      // @ts-ignore

      cronExpr: '0 0 9 * * ?'
    }
  },
  {
    ...AUTO_RULES[2],
    actionConfig: {
      actionId: 1003,
      actionCode: 'sync_core_property_change',
      parameters: {
        // @ts-ignore

        retryTimes: 3,
        targetSystem: 'asset-center'
      }
    },
    changeConfig: {
      objectTypeId: 2003,
      instanceScope: 'all',
      // @ts-ignore

      monitorPropertyIds: [3004, 3005],
      conditionType: 'meet_condition',
      conditionOperator: '!=',
      conditionValue: 'null'
    },
    gateConfig: {
      enabled: true,
      functionId: 4003,
      functionCode: 'validate_change_payload'
    },
    scheduleConfig: {
      enabled: false,
      // @ts-ignore

      cronExpr: ''
    }
  }
];

export const EXEC_LOGS: AutoExecLogItem[] = [
  {
    id: 1,
    logId: 'exec-log-1',
    ruleId: 1,
    ruleName: '设备温度超限告警',
    actionName: '实体识别',
    actionCode: 'identify_entity',
    actionId: 22,
    projectId: 'project-1',
    status: 0,
    triggerType: 2,
    triggerTime: '2026-03-30 09:12:10',
    createTime: '2026-03-30 09:12:12',
    durationMs: 842,
    gateResult: 1
  },
  {
    id: 2,
    logId: 'exec-log-2',
    ruleId: 2,
    ruleName: '每日巡检结果汇总',
    actionName: '关联分析与印证',
    actionCode: 'link_verify',
    actionId: 1002,
    projectId: 'project-1',
    status: 1,
    triggerType: 1,
    triggerTime: '2026-03-30 09:00:00',
    createTime: '2026-03-30 09:00:05',
    durationMs: 1530,
    gateResult: 1,
    errorMessage: '下游通知服务调用超时'
  },
  {
    id: 3,
    logId: 'exec-log-3',
    ruleId: 3,
    ruleName: '关键属性变更同步',
    actionName: '威胁研判',
    actionCode: 'threat_evaluate',
    actionId: 1003,
    projectId: 'project-2',
    status: 2,
    triggerType: 3,
    triggerTime: '2026-03-30 11:26:43',
    createTime: '2026-03-30 11:26:44',
    durationMs: 967,
    gateResult: 0,
    errorMessage: '门控校验未通过，未执行后续动作'
  }
];

export const EXEC_LOG_DETAILS: AutoExecLogDetail[] = [
  {
    ...EXEC_LOGS[0],
    actionLogId: 7001,
    gateActionLogId: 7101,
    detailLog: '检测到温度值 86，门控通过，已发送高优先级告警。',
    ruleSnapshot: {
      ...AUTO_RULE_DETAILS[0]
    }
  },
  {
    ...EXEC_LOGS[1],
    actionLogId: 7002,
    gateActionLogId: 7102,
    detailLog: '定时任务触发成功，汇总完成，但邮件通知阶段请求超时。',
    ruleSnapshot: {
      ...AUTO_RULE_DETAILS[1]
    }
  },
  {
    ...EXEC_LOGS[2],
    actionLogId: 7003,
    gateActionLogId: 7103,
    detailLog: '检测到关键属性变更，但门控函数校验失败，动作未执行。',
    ruleSnapshot: {
      ...AUTO_RULE_DETAILS[2]
    }
  }
];
