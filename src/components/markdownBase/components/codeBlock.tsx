import React, { memo, useMemo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import TwoCopy from '@/assets/chat/chat-copy.svg';
import { copyCode } from '@/utils/json';
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const capitalizationLanguageNameMap: Record<string, string> = {
  sql: 'SQL',
  javascript: 'JavaScript',
  java: 'Java',
  typescript: 'TypeScript',
  vbscript: 'VBScript',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  php: 'PHP',
  python: 'Python',
  yaml: 'Yaml',
  mermaid: 'Mermaid',
  markdown: 'MarkDown',
  makefile: 'MakeFile',
  echarts: 'ECharts',
  shell: 'Shell',
  powershell: 'PowerShell',
  json: 'JSON',
  latex: 'Latex',
  svg: 'SVG'
};

const getCorrectCapitalizationLanguageName = (language: string) => {
  if (!language) return 'Plain';

  if (language?.toLowerCase() in capitalizationLanguageNameMap)
    return capitalizationLanguageNameMap[language];

  return language.charAt(0).toUpperCase() + language.substring(1);
};

const CodeBlock = memo(({ inline, className, children, ...props }: any) => {
  const codeContent = useMemo(
    () => String(children).replace(/\n$/, ''),
    [children]
  );

  const match = /language-(\w+)/.exec(className || '');
  const language = match?.[1];
  const languageShowName = getCorrectCapitalizationLanguageName(language || '');

  // 纯文本
  if (languageShowName === 'Plain') {
    return <code {...props}>{children}</code>;
  }

  const handleCopy = () => {
    copyCode(codeContent);
  };

  return (
    <div>
      <div
        className="flex items-center justify-between border-b p-1 pl-3"
        style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
      >
        <div className="flex w-full items-center justify-between text-[13px] font-normal text-gray-500">
          <span>{languageShowName || 'text'}</span>
          <TwoCopy
            className="w-[16px] cursor-pointer hover:opacity-80"
            onClick={handleCopy}
          />
        </div>
      </div>
      <SyntaxHighlighter
        {...props}
        style={atelierHeathLight}
        customStyle={{
          paddingLeft: 12,
          backgroundColor: '#fff'
        }}
        language={language}
        showLineNumbers
        PreTag="div"
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
