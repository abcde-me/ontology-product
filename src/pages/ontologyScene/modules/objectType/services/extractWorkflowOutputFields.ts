import type { WorkflowDraft } from '@/pages/dataTask/types';
import { DataTaskNodeType } from '@/pages/dataTask/types';
import type { SourceTableField } from '../components/ObjectTypeFormUtils/types';

interface WorkflowGraphNode {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
}

function normalizeOutputFieldName(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const text = String(value).trim();
  return text || undefined;
}

function collectFieldsFromOutputs(outputs: unknown): SourceTableField[] {
  if (!Array.isArray(outputs)) {
    return [];
  }

  const fields: SourceTableField[] = [];
  const seen = new Set<string>();

  outputs.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const record = item as Record<string, unknown>;
    const fieldId =
      normalizeOutputFieldName(record.name) ||
      normalizeOutputFieldName(record.variable) ||
      normalizeOutputFieldName(record.key) ||
      normalizeOutputFieldName(record.field);
    if (!fieldId || seen.has(fieldId)) {
      return;
    }
    seen.add(fieldId);
    fields.push({
      fieldId,
      fieldComment:
        normalizeOutputFieldName(record.label) ||
        normalizeOutputFieldName(record.comment) ||
        fieldId,
      fieldType: normalizeOutputFieldName(record.type) || 'varchar'
    });
  });

  return fields;
}

export function extractWorkflowOutputFields(
  draft?: WorkflowDraft | null
): SourceTableField[] {
  const nodes = (draft?.graph?.nodes || []) as WorkflowGraphNode[];
  if (!nodes.length) {
    return [];
  }

  const fields: SourceTableField[] = [];
  const seen = new Set<string>();

  const appendField = (field: SourceTableField) => {
    if (!field.fieldId || seen.has(field.fieldId)) {
      return;
    }
    seen.add(field.fieldId);
    fields.push(field);
  };

  nodes.forEach((node) => {
    const data = node.data || {};
    collectFieldsFromOutputs(data.outputs).forEach(appendField);

    const nodeType = String(data.type ?? node.type ?? '');
    if (nodeType === DataTaskNodeType.JSON_PARSE) {
      const outputField = normalizeOutputFieldName(data.outputField);
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
