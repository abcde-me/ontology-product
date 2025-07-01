export function filterValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([_, value]) => value !== undefined && value !== ''
    )
  );
}
