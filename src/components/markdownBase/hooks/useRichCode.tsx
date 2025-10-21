import React, { useCallback, useMemo } from 'react';
import { parseJson } from '@/utils/json';
import { RichEcharts, CodeBlock, Mermaid, Markmap } from '../components/index';
import { getCorrectCapitalizationLanguageName } from '../utils/language';

// 处理代码块的hook
export const useRichCode = (children: any, className: string, props: any) => {
  // 代码段内容
  const codeContent = useMemo(
    () => String(children).replace(/\n$/, ''),
    [children]
  );

  // 解析语言类型
  const match = /language-(\w+)/.exec(className || '');
  const language = match?.[1];
  const languageShowName = getCorrectCapitalizationLanguageName(language || '');

  // 处理纯文本代码
  const processingPlain = useCallback(() => {
    return <code {...props}>{codeContent}</code>;
  }, [codeContent, props]);

  // 处理Mermaid 关系图
  const processingMermaid = useCallback(() => {
    return <Mermaid chart={String(children)} />;
  }, [children]);

  const processingMarkmap = useCallback(() => {
    return <Markmap chart={String(children)} />;
  }, [children]);

  // 处理ECharts图表
  const processingECharts = useCallback(() => {
    const openingBrace = (codeContent.match(/{/g) || []).length;
    const closingBrace = (codeContent.match(/}/g) || []).length;

    // 检查JSON格式是否基本完整
    if (
      openingBrace === 0 ||
      closingBrace === 0 ||
      openingBrace !== closingBrace
    ) {
      return null;
    }

    try {
      const echartsData = parseJson(codeContent);
      return <RichEcharts option={echartsData} {...props} />;
    } catch (error) {
      console.error('echarts data is not valid json', error);
      return null;
    }
  }, [codeContent, props]);

  // 处理默认代码块
  const processingDefault = useCallback(() => {
    return <CodeBlock code={codeContent} language={language} {...props} />;
  }, [codeContent, language, props]);

  // 根据语言类型返回对应的组件
  const codeComponent = useMemo(() => {
    switch (languageShowName) {
      case 'Plain':
        return processingPlain();
      case 'ECharts':
        return processingECharts();
      case 'Mermaid':
        return processingMermaid();
      case 'Markmap':
        return processingMarkmap();
      default:
        return processingDefault();
    }
  }, [
    languageShowName,
    processingPlain,
    processingECharts,
    processingMermaid,
    processingMarkmap,
    processingDefault
  ]);

  return {
    codeContent,
    languageShowName,
    codeComponent
  };
};
