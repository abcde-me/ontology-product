/** 将名称数组格式化为展示文案 */
export const formatNameList = (names?: string[]) => {
  if (!names || names.length === 0) {
    return '-';
  }
  return names.join('、');
};

export interface InferenceResultSection {
  title: string;
  body: string;
  /** 章节正文拆成的条目，用于分条渲染 */
  items: string[];
  /** 结论类章节，视觉上重点强调 */
  emphasis?: boolean;
}

/** 按长度降序，避免短词抢先匹配（如「结论」抢「最终结论」） */
const SECTION_LABELS = [
  '推理依据与过程',
  '推理路径摘要',
  '关联节点结论',
  '推理过程详述',
  '局限与建议',
  '知识依据',
  '推理依据',
  '推理过程',
  '推理目标',
  '推理类型',
  '最终结论',
  '核心结论',
  '推理结论',
  '行动建议',
  '结论'
].sort((a, b) => b.length - a.length);

const SECTION_LABEL_ALT = SECTION_LABELS.join('|');

const KEYWORD_EMPHASIS = /结论|最终结论|推理结论|核心结论|总结|结果|行动建议/;

/** 中文序号标题：一、推理目标 */
const CN_SECTION_HEADER =
  /^(?:#{1,3}\s+|【)?(?:[一二三四五六七八九十]+[、.．]|第[一二三四五六七八九十\d]+[章节部份]?[：:.、\s]?)\s*(.+?)(?:】)?$/;

const INLINE_LABEL_PATTERN = new RegExp(
  `(?:^|[。！？；\\n])\\s*(?:【)?(${SECTION_LABEL_ALT})(?:】)?[：:．.]\\s*`,
  'g'
);

const matchKnownLabel = (text: string): string | null => {
  const trimmed = text.trim();
  for (const label of SECTION_LABELS) {
    if (
      trimmed === label ||
      trimmed.startsWith(`${label}：`) ||
      trimmed.startsWith(`${label}:`) ||
      trimmed.startsWith(`${label}．`) ||
      trimmed.startsWith(`${label}.`)
    ) {
      return label;
    }
  }
  return null;
};

const isSectionHeader = (line: string): string | null => {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const cnMatched = trimmed.match(CN_SECTION_HEADER);
  if (cnMatched?.[1]) {
    return matchKnownLabel(cnMatched[1]) || cnMatched[1].trim();
  }

  // 阿拉伯数字序号：仅当标题为已知章节名时才分节（避免误切路径步骤）
  const numMatched = trimmed.match(
    /^(?:#{1,3}\s+|【)?\d+[、.．]\s*(.+?)(?:】)?$/
  );
  if (numMatched?.[1]) {
    return matchKnownLabel(numMatched[1]);
  }

  return matchKnownLabel(trimmed);
};

const cleanItemText = (value: string) =>
  value
    .trim()
    .replace(/^[，,、；;]+|[。.!！？；;]+$/g, '')
    .trim();

/** 展开「包括：A、B、C」或「：A、B、C」为多条 */
const expandEnumeration = (sentence: string): string[] | null => {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return null;
  }

  const includeMatch = trimmed.match(/^(.*?)(包括|如下|如下所述)[：:]\s*(.+)$/);
  if (includeMatch) {
    const lead = cleanItemText(
      `${includeMatch[1] || ''}${includeMatch[2] || ''}`
    );
    const parts = cleanItemText(includeMatch[3] || '')
      .split('、')
      .map(cleanItemText)
      .filter((part) => part.length > 2);
    if (parts.length >= 2) {
      const result: string[] = [];
      const leadLabel = lead.replace(/(包括|如下|如下所述)$/, '').trim();
      if (leadLabel.length > 4) {
        result.push(leadLabel);
      }
      result.push(...parts);
      return result;
    }
  }

  // 「前缀：A、B、C」且顿号列举不少于 2 项
  const colonMatch = trimmed.match(/^(.+?)[：:]\s*(.+)$/);
  if (colonMatch) {
    const lead = cleanItemText(colonMatch[1]);
    const parts = cleanItemText(colonMatch[2])
      .split('、')
      .map(cleanItemText)
      .filter((part) => part.length > 2);
    if (parts.length >= 2 && parts.every((part) => part.length < 80)) {
      const result: string[] = [];
      if (lead.length > 4) {
        result.push(lead);
      }
      result.push(...parts);
      return result;
    }
  }

  return null;
};

const expandSentenceToItems = (sentence: string): string[] => {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return [];
  }

  const enumerated = expandEnumeration(trimmed);
  if (enumerated) {
    return enumerated;
  }

  // 长句按中文分号拆成风险点/措施点
  if (trimmed.includes('；') && trimmed.length > 40) {
    const parts = trimmed
      .split('；')
      .map(cleanItemText)
      .filter((part) => part.length > 4);
    if (parts.length >= 2) {
      return parts;
    }
  }

  return [cleanItemText(trimmed) || trimmed];
};

/** 将章节正文拆成可分条展示的条目 */
export const parseSectionBodyItems = (body?: string): string[] => {
  const text = body?.trim();
  if (!text) {
    return [];
  }

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const items: string[] = [];

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    const listMatch = line.match(
      /^(?:[·•●▪\-–—]\s+|\d+[、.．)\]]\s*|[(（]\d+[)）]\s*)(.+)$/
    );
    if (listMatch?.[1]) {
      items.push(cleanItemText(listMatch[1]));
      return;
    }

    // 先按句号切开，再展开「包括：A、B、C」类列举
    const sentences = line
      .split(/(?<=[。！？])\s*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2);

    if (sentences.length >= 2) {
      sentences.forEach((sentence) => {
        items.push(...expandSentenceToItems(sentence));
      });
      return;
    }

    items.push(...expandSentenceToItems(line));
  });

  return items.filter(Boolean);
};

const buildSection = (
  title: string,
  body: string
): InferenceResultSection | null => {
  const trimmedBody = body.trim();
  if (!title && !trimmedBody) {
    return null;
  }
  const finalTitle = title || '推理结果';
  return {
    title: finalTitle,
    body: trimmedBody,
    items: parseSectionBodyItems(trimmedBody),
    emphasis: KEYWORD_EMPHASIS.test(finalTitle)
  };
};

const extractInlineBody = (line: string, title: string): string => {
  const matched = line.trim().match(new RegExp(`${title}[：:．.]\\s*(.+)$`));
  return matched?.[1]?.trim() || '';
};

/** 按行解析标准分节标题 */
const parseByLineHeaders = (text: string): InferenceResultSection[] => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const sections: InferenceResultSection[] = [];
  let currentTitle = '';
  let currentBody: string[] = [];

  const flush = () => {
    const section = buildSection(currentTitle, currentBody.join('\n'));
    if (section) {
      sections.push(section);
    }
    currentTitle = '';
    currentBody = [];
  };

  lines.forEach((line) => {
    const title = isSectionHeader(line);
    if (title) {
      flush();
      currentTitle = title;
      const inlineBody = extractInlineBody(line, title);
      if (inlineBody) {
        currentBody.push(inlineBody);
      }
      return;
    }
    currentBody.push(line);
  });
  flush();

  return sections;
};

/** 整段散文中按「标签：」切片 */
const parseByInlineLabels = (text: string): InferenceResultSection[] => {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  const matches = [...normalized.matchAll(INLINE_LABEL_PATTERN)];
  if (matches.length === 0) {
    return [];
  }

  const sections: InferenceResultSection[] = [];
  const firstIndex = matches[0].index ?? 0;

  if (firstIndex > 0) {
    const preface = normalized.slice(0, firstIndex).trim();
    if (preface) {
      const section = buildSection('推理目标', preface);
      if (section) {
        sections.push(section);
      }
    }
  }

  matches.forEach((match, index) => {
    const label = match[1];
    const contentStart = (match.index ?? 0) + match[0].length;
    const nextIndex =
      index + 1 < matches.length
        ? (matches[index + 1].index ?? normalized.length)
        : normalized.length;
    const body = normalized
      .slice(contentStart, nextIndex)
      .replace(/^[。！？；\s]+/, '')
      .trim();
    const section = buildSection(label, body);
    if (section) {
      sections.push(section);
    }
  });

  return sections;
};

/** 无标题时按段落 / 句子分条 */
const parseByParagraphs = (text: string): InferenceResultSection[] => {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    return paragraphs
      .map((body, index) => buildSection(`要点 ${index + 1}`, body))
      .filter(Boolean) as InferenceResultSection[];
  }

  const sentences = text
    .split(/(?<=[。！？])\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length > 8);

  if (sentences.length >= 3) {
    return sentences
      .map((body, index) => buildSection(`要点 ${index + 1}`, body))
      .filter(Boolean) as InferenceResultSection[];
  }

  const section = buildSection('推理结果', text);
  return section ? [section] : [];
};

/** 将推理结果正文解析为可结构化渲染的章节 */
export const parseInferenceResultSections = (
  content?: string
): InferenceResultSection[] => {
  const text = content?.trim();
  if (!text) {
    return [];
  }

  const byLines = parseByLineHeaders(text);
  if (byLines.length >= 2) {
    return byLines;
  }

  if (
    byLines.length === 1 &&
    byLines[0]?.title &&
    byLines[0].title !== '推理结果'
  ) {
    const nested = parseByInlineLabels(text);
    if (nested.length >= 2) {
      return nested;
    }
    return byLines;
  }

  const byInline = parseByInlineLabels(text);
  if (byInline.length >= 2) {
    return byInline;
  }

  return parseByParagraphs(text);
};
