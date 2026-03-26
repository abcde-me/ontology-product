import {
  ActionSchema,
  BehaviorActionDetail,
  EnumRule,
  OntologyActionParam,
  RangeRule,
  RuleName,
  TYPE2COMP_OPTIONS,
  TYPE2RULE_TYPES,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  InputType,
  OntologyFunctionDetail,
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { isNil } from 'lodash-es';

// 动作详情数据转form所需数据
export function buildActionSchema(action: BehaviorActionDetail): ActionSchema {
  const {
    code,
    name,
    description,
    functionId,
    objectTypeId,
    functionContent,
    functionCode,
    functionName
  } = action;
  const res: ActionSchema = {
    code: code,
    name,
    description,
    functionId,
    objectTypeId: objectTypeId || -1,
    function_content: functionContent,
    function_code: functionCode,
    function_name: functionName,
    ...action.params?.reduce<Partial<ActionSchema>>(
      (p, param) => {
        const {
          name,
          code,
          type,
          enabledValidation,
          validationRule,
          uiType,
          inputType
        } = param;
        if (inputType === InputType.Input) {
          p.function_params?.push({
            name,
            code: code ?? name,
            type,
            uiType
          });
          if (
            [ParamType.Float, ParamType.String, ParamType.Integer].includes(
              type
            )
          ) {
            p.validationRules?.push(buildParamValidateRule(param));
          }
        }
        return p;
      },
      {
        function_params: [],
        validationRules: []
      }
    )
  };
  return res;
}

export function buildFunctionSchema(
  functionDetail?: OntologyFunctionDetail
): Partial<ActionSchema> {
  if (isNil(functionDetail)) return {};
  const { params = [] } = functionDetail;
  return params.reduce<Partial<ActionSchema>>(
    (p, param) => {
      const { name, code, type, inputType } = param;
      if (inputType === InputType.Input) {
        p.function_params!.push({
          name,
          code: code ?? name,
          type,
          uiType: TYPE2COMP_OPTIONS[type!][0].value
        });
        if (
          [ParamType.Float, ParamType.String, ParamType.Integer].includes(type!)
        ) {
          p.validationRules!.push({
            name,
            type: type!,
            enabledValidation: true,
            failMessage: undefined,
            rule_name: TYPE2RULE_TYPES[type!][0].value,
            ruleConfig: undefined
          });
        }
      }
      return p;
    },
    {
      function_params: [],
      validationRules: []
    }
  );
}

export function getActionParams(config: {
  function_params: Partial<OntologyActionParam>[];
  validationRules: ValidateRule[];
}): OntologyActionParam[] {
  const { function_params, validationRules } = config;
  return function_params?.map((param) => {
    const { type, name, code, uiType } = param;
    const base: Partial<OntologyActionParam> = {
      type,
      name,
      code,
      uiType,
      inputType: InputType.Input
    };
    const ruleMap = validationRules.reduce((p, c) => {
      p.set(c.name, c);
      return p;
    }, new Map<string, ValidateRule>());
    const ruleMsg = ruleMap.get(name!);
    base.enabledValidation = !!ruleMsg?.enabledValidation;
    if (isNil(ruleMsg)) {
      base.validationRule = {};
    } else {
      const { rule_name, ruleConfig, failMessage } = ruleMsg;
      base.validationRule = {
        ruleName: rule_name,
        failMessage,
        ruleConfig:
          rule_name === RuleName.EnumRule && typeof ruleConfig === 'string'
            ? {
                options: ruleConfig
                  ?.split(',')
                  .map((item) =>
                    type === ParamType.Integer
                      ? parseInt(item.trim())
                      : item.trim()
                  )
              }
            : ruleConfig
      };
    }
    return base as OntologyActionParam;
  });
}

export function buildActionDetail(action: ActionSchema): BehaviorActionDetail {
  const {
    code,
    name,
    description,
    functionId,
    objectTypeId,
    function_params = [],
    validationRules = []
  } = action;
  const res = {
    code,
    name,
    description,
    functionId,
    objectTypeId,
    params: getActionParams({ function_params, validationRules })
  };
  return res;
}

export const buildParamValidateRule = (
  param: OntologyActionParam
): ValidateRule => {
  const { name, type, enabledValidation, validationRule } = param;
  return {
    enabledValidation: enabledValidation!,
    failMessage: validationRule?.failMessage || '',
    rule_name: validationRule?.ruleName || TYPE2RULE_TYPES[type][0].value,
    ruleConfig:
      validationRule?.ruleName === RuleName.EnumRule
        ? (param.validationRule?.ruleConfig as EnumRule).options.toString()
        : param.validationRule?.ruleConfig,
    name,
    type
  };
};

export const buildFormFieldValidateRules = (
  param: OntologyActionParam
): Record<string, any> => {
  return [
    {
      validator(value, onError) {
        // 处理 ObjectInstanceSelect 类型的特殊验证（强制必填）
        if (
          param.uiType === UiType.ObjectOne ||
          param.uiType === UiType.ObjectSet
        ) {
          if (!value || !value.objectTypeData) {
            return onError(`请填写${param.name}`);
          }

          // 对于 ObjectOne，objInsID 应该是单个值
          // 对于 ObjectSet，objInsID 应该是数组且不为空
          if (param.uiType === UiType.ObjectOne) {
            if (
              value.objInsID === undefined ||
              value.objInsID === null ||
              value.objInsID === ''
            ) {
              return onError(`请填写${param.name}`);
            }
          } else if (param.uiType === UiType.ObjectSet) {
            if (!Array.isArray(value.objInsID) || value.objInsID.length === 0) {
              return onError(`请填写${param.name}`);
            }
          }
          // ObjectInstanceSelect 类型不需要进一步的规则验证
          return;
        }

        // 处理普通字段的验证（强制必填）
        if (isNil(value)) {
          return onError(`请填写${param.name}`);
        }

        // 如果有值且有验证规则，进行规则验证（只在 enabledValidation 为 true 时）
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          param.validationRule &&
          param.enabledValidation
        ) {
          const { ruleConfig, failMessage, ruleName } = param.validationRule;

          switch (ruleName) {
            case RuleName.RangeRule:
              if (
                value < (ruleConfig as RangeRule).minValue ||
                value > (ruleConfig as RangeRule).maxValue
              ) {
                onError(failMessage);
              }
              break;
            case RuleName.LengthRule:
              const length = String(value).trim().length;
              if (
                length < (ruleConfig as RangeRule).minValue ||
                length > (ruleConfig as RangeRule).maxValue
              ) {
                onError(failMessage);
              }
              break;
            default:
              // 字符串和数字类型的枚举值校验，都处理成字符串进行校验
              if (
                ruleConfig &&
                (ruleConfig as EnumRule).options &&
                !(ruleConfig as EnumRule).options.includes(value)
              ) {
                onError(failMessage);
              }
              break;
          }
        }
      }
    }
  ];
};
