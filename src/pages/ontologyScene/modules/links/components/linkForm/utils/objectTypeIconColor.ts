const DEFAULT_ICON_COLOR = '#4672F5';
const DEFAULT_SOURCE_TINT = '#E8F0FF';
const DEFAULT_TARGET_TINT = '#F0EEFF';
const PANEL_COLOR_WEIGHT = 0.22;
const CONNECTOR_COLOR_WEIGHT = 0.18;

/** 与对象类型图标主色一致，用于链接区域背景区分 */
export const OBJECT_TYPE_ICON_COLORS: Record<string, string> = {
  'object-type-1': '#4672F5',
  'object-type-2': '#9D46F5',
  'object-type-3': '#0CBF92',
  'object-type-4': '#733FF5',
  'object-type-5': '#00B7F4',
  'object-type-6': '#FF9326',
  'object-type-fighter': '#F95252',
  'object-type-drone': '#DFB632',
  'object-type-camera-point': '#4672F5',
  'object-type-person': '#9D46F5',
  'object-type-intelligence': '#00B7F4',
  'object-type-civil-aviation': '#19CDCD',
  'object-type-coal-mine': '#7088A1',
  'object-type-warship': '#5FC25F',
  'object-type-building': '#0CBF92',
  'object-type-location': '#4672F5',
  'object-type-office': '#733FF5',
  'attachment-icon': '#528EFF'
};

const parseHexColor = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return null;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { r, g, b };
};

/** 将图标主色混合为浅色背景 */
export const mixIconColorWithWhite = (
  hex: string,
  colorWeight = PANEL_COLOR_WEIGHT
): string => {
  const rgb = parseHexColor(hex);
  if (!rgb) {
    return DEFAULT_SOURCE_TINT;
  }

  const whiteWeight = 1 - colorWeight;
  const r = Math.round(rgb.r * colorWeight + 255 * whiteWeight);
  const g = Math.round(rgb.g * colorWeight + 255 * whiteWeight);
  const b = Math.round(rgb.b * colorWeight + 255 * whiteWeight);

  return `rgb(${r}, ${g}, ${b})`;
};

export const getObjectTypeIconColor = (icon?: string) => {
  if (!icon) {
    return DEFAULT_ICON_COLOR;
  }
  return OBJECT_TYPE_ICON_COLORS[icon] ?? DEFAULT_ICON_COLOR;
};

export const getSourcePanelBackground = (icon?: string) => {
  if (!icon) {
    return DEFAULT_SOURCE_TINT;
  }
  return mixIconColorWithWhite(
    getObjectTypeIconColor(icon),
    PANEL_COLOR_WEIGHT
  );
};

export const getTargetPanelBackground = (icon?: string) => {
  if (!icon) {
    return DEFAULT_TARGET_TINT;
  }
  return mixIconColorWithWhite(
    getObjectTypeIconColor(icon),
    PANEL_COLOR_WEIGHT
  );
};

/** @deprecated 使用 getSourcePanelBackground / getTargetPanelBackground */
export const getObjectTypeIconTint = (icon?: string) =>
  getSourcePanelBackground(icon);

export const buildLinkPairConnectorBackground = (
  sourceIcon?: string,
  targetIcon?: string
) => {
  const sourceTint = sourceIcon
    ? mixIconColorWithWhite(
        getObjectTypeIconColor(sourceIcon),
        CONNECTOR_COLOR_WEIGHT
      )
    : DEFAULT_SOURCE_TINT;
  const targetTint = targetIcon
    ? mixIconColorWithWhite(
        getObjectTypeIconColor(targetIcon),
        CONNECTOR_COLOR_WEIGHT
      )
    : DEFAULT_TARGET_TINT;

  return `linear-gradient(90deg, ${sourceTint} 0%, ${sourceTint} 38%, ${targetTint} 62%, ${targetTint} 100%)`;
};
