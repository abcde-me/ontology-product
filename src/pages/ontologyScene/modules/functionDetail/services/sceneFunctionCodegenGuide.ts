import type { SceneOntologyRefs } from './fetchSceneOntologyContext';

export const MAX_SCENE_CONTEXT_CHARS = 18000;

/** 基于场景库的运行时编写约定（不引用外部 SDK 文档） */
export const ONTOLOGY_RUNTIME_API_GUIDE = `【基于场景库的运行时编写约定（唯一依据）】
1. 查询/列表/统计/筛选：必须用 client.service.query_objects，禁止 ObjectRef.Type()（会触发 metadata-service 报错）
   前提：目标对象类型须已在场景库完成「实例同步」，否则 dataset 无法解析物理表（SQL 在 FROM 后为空）
   payload 必须包含 select 字段列表，否则 dataset 会生成无效 SQL（SELECT  FROM）
   示例：
   _query_payload = {
       "ontology_object_type_code": "场景白名单 code",
       "select": [
           {"type": "column", "name": "属性英文名1"},
           {"type": "column", "name": "属性英文名2"},
       ],
   }
   _res = client.service.query_objects(payload=_query_payload)
   _data = getattr(_res, "data", None) or {}
   rows = _data.get("results") or _data.get("result") or _data.get("items") or []
   遍历 rows 时用 row.get("propertyName") 读取字段，propertyName 来自场景库属性英文名
   服务端 where 仅支持：{"op":"=","left":{"type":"column","name":"字段"},"right":{"type":"value","value":"值"}}
   禁止 where 使用 type/or/conditions/operator/column 写法（会导致 dataset HTTP 500）
   模糊匹配、LIKE、多字段 OR：payload 不带 where，全量 query 后在 Python 过滤行字典，例如：
   keyword = "解放"
   rows = [r for r in rows if keyword in str(r.get("plate_number") or "") or keyword in str(r.get("brand_model") or "")]
2. 处理单个已知/传入实例：ObjectRef 入参，vehicle.properties.xxx
3. ObjectSet 无 Type 方法；ObjectSet 仅用于入参或 ObjectSet([{"object_type":"code","pk":"id"}])
4. 禁止 .query()；禁止 ObjectRef.Type()；禁止 ObjectSet.Type()`;

export const SCENE_CODEGEN_GUIDE = `【基于当前场景库的 Python 编写约定（唯一依据）】
1. 查询类任务：client.service.query_objects + 行字典处理
2. 给定实例任务：ObjectRef/ObjectSet 入参
3. 属性名必须使用场景库 propertyName（英文名）`;

export const QUERY_STRATEGY_GUIDE = `【根据场景库选择查询方式（生成前必须先决策）】
1. 查询/列表/统计/筛选 → client.service.query_objects，payload 含 ontology_object_type_code 与 select（场景库属性英文名）；禁止 ObjectRef.Type
2. 处理给定/传入实例 → ObjectRef/ObjectSet 入参
3. 主键精确 → ObjectRef(object_type="code", pk=某入参)
4. 禁止 ObjectSet.Type、ObjectRef.Type、.query()`;

export const truncateSceneContext = (
  text: string,
  maxChars: number = MAX_SCENE_CONTEXT_CHARS,
  hint = '场景本体信息已截断，请以已给出的白名单与属性为准'
): string => {
  const normalized = text.trim() || '（当前场景暂无本体结构）';
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}\n\n...(${hint})`;
};

const SINGLE_OBJECT_HINT_PATTERN =
  /单个|指定|传入|给定|该对象|该车辆|该实体|此对象|此车辆|这批|已选/;
const BATCH_QUERY_HINT_PATTERN =
  /查询|列表|批量|所有|遍历|多个|全部|统计|汇总|筛选|找出|获取.*列表/;
const LINK_QUERY_HINT_PATTERN = /关联|链接|关系|所属|连接|联动/;

export const buildSceneQueryStrategyHints = (
  sceneRefs: SceneOntologyRefs,
  description: string
): string => {
  const lines = ['【结合当前场景与描述推荐的查询策略】'];
  const desc = description.trim();
  const isGivenInstance = SINGLE_OBJECT_HINT_PATTERN.test(desc);
  const isBatchQuery = BATCH_QUERY_HINT_PATTERN.test(desc) && !isGivenInstance;

  if (sceneRefs.objectTypes.length) {
    lines.push('场景对象类型 code 白名单：');
    sceneRefs.objectTypes.forEach((objectType) => {
      lines.push(`- ${objectType.code}（${objectType.name}）`);
    });
  }

  if (isBatchQuery) {
    lines.push(
      '- 描述是查询/列表/统计 → 使用 client.service.query_objects，payload 须含 select 字段列表；禁止 ObjectRef.Type'
    );
  }

  if (isGivenInstance) {
    lines.push('- 描述是处理给定实例 → ObjectRef/ObjectSet 入参');
  }

  if (LINK_QUERY_HINT_PATTERN.test(desc) && sceneRefs.links.length) {
    lines.push('场景链接：');
    sceneRefs.links.forEach((link) => {
      lines.push(`- ${link.name}（code: ${link.code}）`);
    });
  }

  if (!isGivenInstance && sceneRefs.objectTypes.length === 1) {
    lines.push(
      `- 默认查询：client.service.query_objects，ontology_object_type_code="${sceneRefs.objectTypes[0].code}"，select 使用该类型场景库属性英文名`
    );
  }

  return lines.join('\n');
};
