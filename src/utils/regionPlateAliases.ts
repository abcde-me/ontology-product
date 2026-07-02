/** 省份 / 直辖市 → 中国车牌简称（单字） */
export const REGION_PLATE_ALIASES: Record<string, string[]> = {
  北京: ['京'],
  上海: ['沪'],
  天津: ['津'],
  重庆: ['渝'],
  河北: ['冀'],
  山西: ['晋'],
  内蒙古: ['蒙'],
  辽宁: ['辽'],
  吉林: ['吉'],
  黑龙江: ['黑'],
  江苏: ['苏'],
  浙江: ['浙'],
  安徽: ['皖'],
  福建: ['闽'],
  江西: ['赣'],
  山东: ['鲁'],
  河南: ['豫'],
  湖北: ['鄂'],
  湖南: ['湘'],
  广东: ['粤'],
  广西: ['桂'],
  海南: ['琼'],
  四川: ['川'],
  贵州: ['贵'],
  云南: ['云'],
  西藏: ['藏'],
  陕西: ['陕'],
  甘肃: ['甘'],
  青海: ['青'],
  宁夏: ['宁'],
  新疆: ['新']
};

export const PLATE_QUERY_PATTERN = /车牌|牌照|号牌|牌号|省市简称|plate/i;

export const resolveMatchedRegions = (query: string): string[] =>
  Object.keys(REGION_PLATE_ALIASES).filter((region) => query.includes(region));

export const resolvePlatePrefixTokens = (query: string): string[] => {
  const prefixes = new Set<string>();

  resolveMatchedRegions(query).forEach((region) => {
    REGION_PLATE_ALIASES[region].forEach((alias) => prefixes.add(alias));
  });

  return [...prefixes];
};

export const resolvePlatePrefixForRegion = (
  regionOrValue: string
): string | null => {
  const trimmed = regionOrValue.trim();
  if (!trimmed) {
    return null;
  }

  const directAliases = REGION_PLATE_ALIASES[trimmed];
  if (directAliases?.length) {
    return directAliases[0];
  }

  for (const [region, aliases] of Object.entries(REGION_PLATE_ALIASES)) {
    if (trimmed.includes(region)) {
      return aliases[0];
    }
  }

  return null;
};

export const isPlateQueryIntent = (query: string): boolean => {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }

  return (
    PLATE_QUERY_PATTERN.test(trimmed) ||
    resolveMatchedRegions(trimmed).length > 0
  );
};
