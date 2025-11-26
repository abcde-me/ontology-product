// 判断内容是否包含 markdown 格式
export const containsMarkdown = (content: string | number): boolean => {
  if (typeof content === 'number') return false;
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题 (#, ##, ###, etc.)
    /\*\*.*?\*\*/, // 粗体 (**text**)
    /\*.*?\*/, // 斜体 (*text*)
    /\[.*?\]\(.*?\)/, // 链接 [text](url)
    /^\s*[-*+]\s/, // 无序列表 (-, *, +)
    /^\s*\d+\.\s/, // 有序列表 (1., 2., etc.)
    /`.*?`/, // 行内代码 (`code`)
    /```[\s\S]*?```/, // 代码块 (```code```)
    /^\s*>\s/, // 引用 (> text)
    /\|.*\|/, // 表格 (| col |)
    /!\[.*?\]\(.*?\)/ // 图片 ![alt](url)
  ];
  return markdownPatterns.some((pattern) => pattern.test(content));
};
