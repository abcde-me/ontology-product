import { ParamType } from './ontologyFunction';

/**
 * OntologyAction，行为对象
 */
export interface BehaviorActionItem {
  /**
   * 行为唯一编码
   */
  code?: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 行为描述说明
   */
  description: string;
  /**
   * 关联的函数ID
   */
  functionId?: number;
  /**
   * 关联的函数名称
   */
  functionName?: string;
  /**
   * 行为ID
   */
  id?: number;
  /**
   * 行为名称
   */
  name: string;
  /**
   * 绑定的对象类型ID
   */
  objectTypeId?: number;
  /**
   * 绑定的对象类型名称
   */
  objectTypeName?: string;
  /**
   * 所属本体场景模型ID
   */
  ontologyModelId?: number;
  /**
   * 参数数量
   */
  paramCount?: number;
  /**
   * 参数配置列表
   */
  params?: OntologyActionParam[];
  /**
   * 更新时间
   */
  updatedAt?: Date;
  /**
   * 更新人
   */
  updateUser?: string;
  objectType?: string;
}

/**
 * CreateOntologyActionRequest
 */
export interface BehaviorActionDetail {
  /**
   * 行为唯一编码
   */
  code?: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 行为描述说明
   */
  description?: string;
  /**
   * 关联的函数ID
   */
  functionId?: number;
  /**
   * 关联的函数名称
   */
  functionName?: string;
  /**
   * 行为ID
   */
  id?: number;
  /**
   * 行为名称
   */
  name?: string;
  /**
   * 绑定的对象类型ID
   */
  objectTypeId?: number;
  /**
   * 绑定的对象类型名称
   */
  objectTypeName?: string;
  /**
   * 所属本体场景模型ID
   */
  ontologyModelId?: number;
  /**
   * 参数数量
   */
  paramCount?: number;
  /**
   * 参数配置列表
   */
  params?: OntologyActionParam[];
  /**
   * 更新时间
   */
  updatedAt?: Date;
  /**
   * 更新人
   */
  updateUser?: string;
}

/**
 * CreateOntologyActionParamRequest
 */
export interface OntologyActionParam {
  /**
   * 参数唯一标识
   */
  code: string;
  /**
   * 是否启用校验
   */
  enabledValidation?: boolean;
  /**
   * 参数显示名称
   */
  name: string;
  /**
   * 参数数据类型
   */
  type: ParamType;
  /**
   * UI组件类型
   */
  uiType: UiType;
  validationRule?: ValidationRule;
}

/**
 * ValidationRule，参数校验规则
 */
export interface ValidationRule {
  /**
   * 校验失败提示信息
   */
  failMessage?: string;
  /**
   * 规则配置对象，根据 ruleName 不同包含不同字段：
   *
   * - **range_rule**: 范围规则配置
   * ```json
   * {
   * "minValue": 1,
   * "maxValue": 100
   * }
   * ```
   * - minValue: number - 最小值
   * - maxValue: number - 最大值
   *
   * - **length_rule**: 长度规则配置
   * ```json
   * {
   * "minLength": 2,
   * "maxLength": 50
   * }
   * ```
   * - minLength: integer - 最小长度
   * - maxLength: integer - 最大长度
   *
   * - **enum_rule**: 枚举规则配置
   * ```json
   * {
   * "options": ["选项1", "选项2", "选项3"]
   * }
   * ```
   * - options: array<string> - 可选值列表
   */
  ruleConfig?: Record<string, any>;
  /**
   * 规则类型：
   * - range_rule: 范围规则
   * - length_rule: 长度规则
   * - enum_rule: 枚举规则
   */
  ruleName?: RuleName;
}

/**
 * 规则类型：
 * - range_rule: 范围规则
 * - length_rule: 长度规则
 * - enum_rule: 枚举规则
 */
export enum RuleName {
  EnumRule = 'enum_rule',
  LengthRule = 'length_rule',
  RangeRule = 'range_rule'
}

export interface ValidateRule {
  rule_name: RuleName;
  ruleConfig?: any;
  failMessage?: string;
  enabledValidation: boolean;
  name: string;
  type: ParamType;
}

export interface ActionSchema {
  code?: string;
  name?: string;
  description?: string;
  objectTypeId?: number;
  functionId?: number;
  function_params?: Partial<OntologyActionParam>[];
  validationRules?: ValidateRule[];
}

// 函数参数界面控件 类型
export enum UiType {
  Input = 'input',
  TextArea = 'textArea',
  InputNumber = 'inputNumber',
  InputNumberFloat = 'inputNumberFloat',
  Switch = 'switch',
  Date = 'date',
  Timestamp = 'dateTime',
  Geopoint = 'geopoint',
  ObjectOne = 'objectOne',
  ObjectSet = 'objectSet',
  Uploader = 'upload'
}

export const TYPE2COMP_OPTIONS = {
  [ParamType.String]: [
    { label: '单行文本框', value: UiType.Input },
    { label: '文本域', value: UiType.TextArea }
  ],
  [ParamType.Integer]: [{ label: '数字步进器', value: UiType.InputNumber }],
  [ParamType.Float]: [
    { label: '高精度数字输入框', value: UiType.InputNumberFloat }
  ],
  [ParamType.Boolean]: [{ label: '切换开关', value: UiType.Switch }],
  [ParamType.Date]: [{ label: '日期选择器', value: UiType.Date }],
  [ParamType.Timestamp]: [{ label: '日期时间选择器', value: UiType.Timestamp }],
  [ParamType.Geopoint]: [{ label: '地图选择器', value: UiType.Geopoint }],
  [ParamType.ObjectOne]: [{ label: '对象搜索选择器', value: UiType.ObjectOne }],
  [ParamType.ObjectSet]: [{ label: '对象集选择器', value: UiType.ObjectSet }],
  [ParamType.Attachment]: [{ label: '文件上传', value: UiType.Uploader }]
};

export const TYPE2RULE_TYPES = {
  [ParamType.String]: [
    { label: '枚举值', value: RuleName.EnumRule },
    { label: '字符长度', value: RuleName.LengthRule }
  ],
  [ParamType.Float]: [{ label: '数值范围', value: RuleName.RangeRule }],
  [ParamType.Integer]: [
    { label: '数值范围', value: RuleName.RangeRule },
    { label: '枚举值', value: RuleName.EnumRule }
  ]
};
