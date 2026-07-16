import type { Edge, Node } from 'reactflow';
import type { SourceTableField } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { DataTaskNodeType } from '@/pages/dataTask/types';
import { normalizeOutputFields } from '../nodes/_shared/nodeIoUtils';

function normalizeFieldName(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const text = String(value).trim();
  return text || undefined;
}

/**
 * 从当前画布中，收集直连上游节点的输出字段，供本体对象类型映射使用。
 */
export function extractUpstreamOutputFields(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): SourceTableField[] {
  const upstreamNodeIds = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);

  if (!upstreamNodeIds.length) {
    return [];
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const fields: SourceTableField[] = [];
  const seen = new Set<string>();

  const appendField = (field: SourceTableField) => {
    if (!field.fieldId || seen.has(field.fieldId)) {
      return;
    }
    seen.add(field.fieldId);
    fields.push(field);
  };

  upstreamNodeIds.forEach((upstreamId) => {
    const node = nodeMap.get(upstreamId);
    if (!node) {
      return;
    }

    const data = (node.data || {}) as Record<string, unknown>;
    normalizeOutputFields(data.outputs).forEach((output) => {
      appendField({
        fieldId: output.variable,
        fieldComment: output.des || output.variable,
        fieldType: output.type || 'string'
      });
    });

    const nodeType = String(data.type ?? node.type ?? '');
    if (nodeType === DataTaskNodeType.JSON_PARSE) {
      const outputField = normalizeFieldName(data.outputField);
      if (outputField) {
        appendField({
          fieldId: outputField,
          fieldComment: outputField,
          fieldType: 'varchar'
        });
      }
    }
  });

  return fields;
}
