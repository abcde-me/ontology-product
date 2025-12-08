export enum LanguageDisplayName {
  sql = 'SQL',
  javascript = 'JavaScript',
  java = 'Java',
  typescript = 'TypeScript',
  vbscript = 'VBScript',
  css = 'CSS',
  html = 'HTML',
  xml = 'XML',
  php = 'PHP',
  python = 'Python',
  yaml = 'YAML',
  mermaid = 'Mermaid',
  markdown = 'Markdown',
  makefile = 'Makefile',
  echarts = 'ECharts',
  shell = 'Shell',
  powershell = 'PowerShell',
  json = 'JSON',
  latex = 'LaTeX',
  svg = 'SVG'
}

export const getCorrectCapitalizationLanguageName = (
  language?: string
): string => {
  if (!language) return 'Plain';

  const normalizedLang = language.toLowerCase();

  return normalizedLang in LanguageDisplayName
    ? LanguageDisplayName[normalizedLang as keyof typeof LanguageDisplayName]
    : formatCustomLanguageName(normalizedLang);
};

const formatCustomLanguageName = (language: string): string =>
  language.charAt(0).toUpperCase() + language.slice(1);
