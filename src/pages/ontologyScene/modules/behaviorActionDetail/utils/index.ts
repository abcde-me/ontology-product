import {
  ActionSchema,
  BehaviorActionDetail,
  OntologyActionParam,
  RuleName,
  TYPE2COMP_OPTIONS,
  TYPE2RULE_TYPES,
  ValidateRule
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  InputType,
  OntologyFunctionDetail,
  ParamType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { isNil } from 'lodash-es';

// 动作详情数据转form所需数据
export function buildActionSchema(action: BehaviorActionDetail): ActionSchema {
  const { code, name, description, functionId, objectTypeId } = action;
  return {
    code: code,
    name,
    description,
    functionId,
    objectTypeId,
    ...action.params?.reduce<Partial<ActionSchema>>(
      (p, param) => {
        const { name, code, type, enabledValidation, validationRule, uiType } =
          param;
        p.function_params?.push({
          name,
          code: code ?? name,
          type,
          uiType
        });
        if (
          [ParamType.Float, ParamType.String, ParamType.Integer].includes(type)
        ) {
          p.validationRules?.push({
            enabledValidation: enabledValidation!,
            failMessage: validationRule?.failMessage || '',
            rule_name:
              validationRule?.ruleName || TYPE2RULE_TYPES[type][0].value,
            ruleConfig:
              validationRule?.ruleName === RuleName.EnumRule
                ? param.validationRule?.ruleConfig?.options.toString()
                : param.validationRule?.ruleConfig,
            name,
            type
          });
        }
        return p;
      },
      {
        function_params: [],
        validationRules: []
      }
    )
  };
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
          uiType: TYPE2COMP_OPTIONS[type][0].value
        });
        if (
          [ParamType.Float, ParamType.String, ParamType.Integer].includes(type)
        ) {
          p.validationRules!.push({
            name,
            type,
            enabledValidation: true,
            failMessage: undefined,
            rule_name: TYPE2RULE_TYPES[type][0].value,
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

export function buildActionDetail(action: ActionSchema): BehaviorActionDetail {
  const {
    code,
    name,
    description,
    functionId,
    objectTypeId,
    function_params,
    validationRules = []
  } = action;
  const ruleMap = validationRules.reduce((p, c) => {
    p.set(c.name, c);
    return p;
  }, new Map<string, ValidateRule>());
  return {
    code,
    name,
    description,
    functionId: action.functionId,
    objectTypeId: action.objectTypeId,
    params: function_params?.map((param) => {
      const { type, name, code, uiType } = param;
      const base: Partial<OntologyActionParam> = {
        type,
        name,
        code,
        uiType
      };
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
            rule_name === RuleName.EnumRule
              ? { options: ruleConfig?.split(',') }
              : ruleConfig
        };
      }
      return base as OntologyActionParam;
    })
  };
}
