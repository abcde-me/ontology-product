/**
 * GetOntologyFunctionResponse
 *
 * OntologyFunction，函数对象
 */
export interface OntologyFunctionDetail {
  /**
   * 本体
   */
  ontologyModelID?: number;
  /**
   * 函数唯一编码
   */
  code: string;
  /**
   * 函数代码内容
   */
  content: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 函数描述
   */
  description?: string;
  /**
   * 函数ID
   */
  id?: number;
  /**
   * 函数名称
   */
  name: string;
  /**
   * 所属本体场景模型ID
   */
  ontologyModelId?: number;
  /**
   * 函数参数列表
   */
  params?: OntologyFunctionParam[];
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
 * OntologyFunctionParam，函数参数对象
 */
export interface OntologyFunctionParam {
  /**
   * 参数唯一标识
   */
  code?: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 所属函数ID
   */
  functionId?: number;
  /**
   * 参数ID
   */
  id?: number;
  /**
   * 参数方向 出、入参
   */
  inputType?: InputType;
  /**
   * 参数名称
   */
  name: string;
  /**
   * 参数类型
   */
  type?: ParamType;
  /**
   * 控件类型
   */
  uiType?: string;
  uiTypeAndValue?: {
    uiType?: string;
    paramValue?: any;
  };
  /**
   * 更新时间
   */
  updatedAt?: Date;
  /**
   * 参数值
   */
  value?: any;
  /**
   * 参数序号
   */
  idx?: number;
}

/**
 * 参数方向
 */
export enum InputType {
  Input = 'input',
  Output = 'output'
}

/**
 * 参数类型
 * String
 * Integer
 * Double
 * Boolean
 * Date
 * Timestamp
 * Geopoint
 * Object (One)
 * Object (Set)
 * Attachment
 * void (仅出参)
 */
export enum ParamType {
  String = 'String',
  Integer = 'Integer',
  Float = 'Float',
  Boolean = 'Boolean',
  Date = 'Date',
  Timestamp = 'Timestamp',
  Geopoint = 'Geopoint',
  ObjectOne = 'ObjectRef',
  Attachment = 'Attachment',
  ObjectSet = 'ObjectSet'
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

export const InputTypeOptions = Object.values(ParamType).map((value) => ({
  label: value,
  value
}));

export const OutputTypeOptions = [
  ...InputTypeOptions,
  {
    label: 'Void',
    value: 'Void'
  }
];

export const TYPE_MAP: Record<string, string> = {
  [ParamType.String]: 'str',
  [ParamType.Integer]: 'int',
  [ParamType.Float]: 'float',
  [ParamType.Boolean]: 'bool',
  [ParamType.Date]: 'date',
  [ParamType.Timestamp]: 'datetime',
  [ParamType.ObjectOne]: 'ObjectRef',
  [ParamType.ObjectSet]: 'ObjectSet',
  [ParamType.Geopoint]: 'GeoPoint',
  [ParamType.Attachment]: 'Attachment',
  Void: 'None'
};
export const DEFAULT_FUNCTION_CONTENT = `# 请先修改函数名称
# 修改左侧的输入参数、输出参数，编辑区变量会自动修改
# 在右侧sdk开发指南中查看代码示例，编写函数逻辑
# 在参数值中通过控件输入数据
# 点击运行可以在下方日志区看到运行结果

def my_function(arg1: str) -> dict: # 只读
    # 在此编写函数逻辑
    var_1 = 1.0
    var_2 = 1.0
    return {"var_1":var_1,"var_2":var_2} #只读`;

export const DEFAULT_FUNCTION_SCHEMA: OntologyFunctionSchema = {
  content: DEFAULT_FUNCTION_CONTENT,
  input: [
    {
      name: 'arg1',
      uiTypeAndValue: { uiType: `${ParamType.String}_${UiType.Input}` }
    }
  ],
  output: [
    { name: 'var_1', type: ParamType.Float },
    { name: 'var_2', type: ParamType.Float }
  ],
  code: 'my_function'
};

/**
 * OntologyFunction，函数对象
 */
export interface OntologyFunctionItem {
  /**
   * 函数唯一编码
   */
  code?: string;
  /**
   * 函数代码内容
   */
  content?: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 函数描述
   */
  description?: string;
  /**
   * 函数ID
   */
  id?: number;
  /**
   * 函数名称
   */
  name?: string;
  /**
   * 所属本体场景模型ID
   */
  ontologyModelId?: number;
  /**
   * 函数参数列表
   */
  params?: OntologyFunctionParam[];
  /**
   * 更新时间
   */
  updatedAt?: Date;
  /**
   * 更新人
   */
  updateUser?: string;
}

export interface OntologyFunctionSchema {
  code?: string;
  name?: string;
  description?: string;
  input?: OntologyFunctionParam[];
  output?: OntologyFunctionParam[];
  content?: string;
}

export interface TestFunctionItem {
  arguments: Argument[];
  code: string;
  content: string;
  description?: string;
  logic_function: string[];
  name: string;
  object_name?: string;
  params: OntologyFunctionParam[];
  pk?: number;
  object_id?: number;
}

export interface TestFunction {
  id?: number;
  run_type: 'action' | 'function';
  run_action_with_validate: boolean;
  target: string[];
  list_data: TestFunctionItem[];
}

export interface Argument {
  name?: string;
  value: string;
}

export interface FunctionListQuery {
  /**
   * 搜索关键字，支持按函数名称、编码模糊搜索
   */
  filter?: string;
  /**
   * 本体场景ID
   */
  ontologyModelID: number;
  /**
   * 排序方向
   */
  order?: 'asc' | 'desc';
  /**
   * 排序字段
   */
  orderBy?: string;
  /**
   * 页码，从1开始
   */
  pageNum?: number;
  /**
   * 每页数量
   */
  pageSize?: number;
}
