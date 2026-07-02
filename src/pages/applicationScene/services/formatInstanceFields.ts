export const resolveFieldDisplayName = (
  fieldName: string,
  fieldLabels?: Record<string, string>
) => {
  const label = fieldLabels?.[fieldName]?.trim();
  return label || fieldName;
};

export const formatInstanceFieldLines = (
  instance: Record<string, unknown>,
  fieldLabels?: Record<string, string>
) =>
  Object.entries(instance)
    .map(
      ([key, value]) =>
        `${resolveFieldDisplayName(key, fieldLabels)}: ${String(value ?? '')}`
    )
    .join('\n');

export const formatInstanceFieldBlock = (
  instance: Record<string, unknown>,
  fieldLabels?: Record<string, string>
) =>
  Object.entries(instance)
    .map(
      ([key, value]) =>
        `    ${resolveFieldDisplayName(key, fieldLabels)}: ${String(value ?? '')}`
    )
    .join('\n');
