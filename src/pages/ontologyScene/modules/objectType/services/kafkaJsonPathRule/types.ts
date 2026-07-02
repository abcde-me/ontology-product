/** 单字段 JSONPath 映射（兼容 yaml-jsonpath 语法） */
export interface KafkaFieldMappingRule {
  jsonpath: string;
  /** 字段注释，用于实例同步映射展示 */
  comment?: string;
  need_deserialize?: boolean;
  inner_jsonpath?: string;
  default_value?: unknown;
}

/** Kafka AI 解析规则（入库 JSON 结构） */
export interface KafkaJsonPathParseRule {
  /** 字段名 → JSONPath 映射 */
  field_mapping: Record<string, KafkaFieldMappingRule>;
  /** Canal CDC 等场景：遍历数组的路径，如 $.data */
  array_iterate_path?: string;
  /** 规则引擎：yaml-jsonpath（Go: github.com/vmware-labs/yaml-jsonpath） */
  engine?: 'yaml-jsonpath';
}

export interface ApplyKafkaJsonPathRuleOptions {
  arrayHandleMode?: string;
}

export interface ApplyKafkaJsonPathRuleResult {
  records: Record<string, unknown>[];
  errors: string[];
}
