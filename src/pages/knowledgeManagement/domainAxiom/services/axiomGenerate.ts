import type { ObjectType } from '@/types/objectType';
import type { DomainAxiomCandidate } from '../types';

const generateKey = () =>
  `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface GenerateFromGraphInput {
  sceneId: number;
  sceneName: string;
  objectTypes: ObjectType[];
  /** 可选额外业务提示 */
  hint?: string;
}

/**
 * 基于本体场景中的对象类型，启发式生成领域公理候选。
 * 当前为本地规则生成，后续可对接大模型环节。
 */
export const generateAxiomsFromOntologyGraph = async (
  input: GenerateFromGraphInput
): Promise<DomainAxiomCandidate[]> => {
  // 模拟大模型推理耗时
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });

  const objectTypes = input.objectTypes.filter(
    (item) => item.name || item.code
  );
  if (!objectTypes.length) {
    return [
      {
        key: generateKey(),
        name: `${input.sceneName}-基础完整性约束`,
        expression: `场景「${input.sceneName}」中的对象实例主键必须唯一且非空`,
        description: '无对象类型时生成的兜底公理',
        domain: '数据完整性'
      }
    ];
  }

  const candidates: DomainAxiomCandidate[] = [];
  const take = objectTypes.slice(0, 6);

  take.forEach((item, index) => {
    const typeName = item.name || item.code || `对象类型${index + 1}`;
    candidates.push({
      key: generateKey(),
      name: `${typeName}-存在性约束`,
      expression: `每个「${typeName}」实例必须具备稳定标识，且所属场景为「${input.sceneName}」`,
      description: '由本体图谱对象类型推断的基础约束',
      domain: '数据完整性'
    });
  });

  if (take.length >= 2) {
    const source = take[0].name || take[0].code || '源对象';
    const target = take[1].name || take[1].code || '目标对象';
    candidates.push({
      key: generateKey(),
      name: `${source}-${target}关联约束`,
      expression: `若「${source}」与「${target}」存在业务关联，则关联两端对象类型必须同时有效且可追溯`,
      description: '由对象类型共现推断的关联公理',
      domain: '关系一致性'
    });
  }

  if (take.length >= 3) {
    const a = take[0].name || take[0].code || '对象A';
    const b = take[1].name || take[1].code || '对象B';
    const c = take[2].name || take[2].code || '对象C';
    candidates.push({
      key: generateKey(),
      name: `${a}传递依赖约束`,
      expression: `若「${a}」依赖「${b}」，且「${b}」关联「${c}」，则推理时可传递得到「${a}」与「${c}」的间接约束`,
      description: '供推理分析正向/逆向推导使用',
      domain: '推理规则'
    });
  }

  const hint = input.hint?.trim();
  if (hint) {
    candidates.unshift({
      key: generateKey(),
      name: `${input.sceneName}-业务提示公理`,
      expression: hint,
      description: '根据用户提示与本体图谱结合生成',
      domain: '业务约束'
    });
  }

  return candidates;
};
