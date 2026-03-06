import React, { useMemo, useRef } from 'react';
import styles from './index.module.scss';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';
import { CopyItemIcon } from '@ceai-front/arco-material';
import { Tag } from '@arco-design/web-react';

interface SdkDocumentationProps {
  content?: string;
}

export const SdkDocumentation: React.FC<SdkDocumentationProps> = ({
  content
}) => {
  const rawMarkdown = content && content.trim() ? content : '暂无文档';
  const docRef = useRef<HTMLDivElement>(null);
  const remarkGfmPlugin = ((RemarkGfm as any).default ??
    RemarkGfm) as typeof RemarkGfm;

  const { metadata, markdown } = useMemo(() => {
    // 统一换行后再解析 frontmatter，避免不同平台换行符导致解析失败。
    const normalizedMarkdown = rawMarkdown.replace(/\r\n/g, '\n');
    const frontmatterMatch = normalizedMarkdown.match(
      /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/
    );

    if (!frontmatterMatch) {
      return {
        metadata: [] as Array<{ key: string; value: string }>,
        markdown: normalizedMarkdown
      };
    }

    const metadata = frontmatterMatch[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(':');
        if (!key || !rest.length) {
          return null;
        }
        return {
          key: key.trim(),
          value: rest.join(':').trim()
        };
      })
      .filter(Boolean) as Array<{ key: string; value: string }>;

    return {
      metadata,
      markdown: normalizedMarkdown.slice(frontmatterMatch[0].length).trim()
    };
  }, [rawMarkdown]);

  const components = useMemo(() => {
    const headingCountMap = new Map<string, number>();
    const joinClassName = (...classNames: Array<string | undefined>) =>
      classNames.filter(Boolean).join(' ');

    const getNodeText = (children?: React.ReactNode): string => {
      return React.Children.toArray(children)
        .map((child) => {
          if (typeof child === 'string' || typeof child === 'number') {
            return String(child);
          }
          if (React.isValidElement(child)) {
            return getNodeText(child.props?.children);
          }
          return '';
        })
        .join('')
        .trim();
    };

    const toHeadingId = (text: string): string => {
      // 目录锚点与标题 ID 必须稳定，便于后续排查目录跳转问题。
      const base =
        text
          .toLowerCase()
          .trim()
          .replace(/[`~!@#$%^&*()+=[\]{}|\\:;"'<>,.?/]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'section';

      const current = headingCountMap.get(base) ?? 0;
      headingCountMap.set(base, current + 1);
      return current === 0 ? base : `${base}-${current}`;
    };

    const renderHeading =
      (level: 1 | 2 | 3 | 4 | 5 | 6) =>
      ({ children, ...props }: { children?: React.ReactNode }) => {
        const id = toHeadingId(getNodeText(children));
        const TagName = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <TagName id={id} {...props}>
            {children}
          </TagName>
        );
      };

    return {
      h1: renderHeading(1),
      h2: renderHeading(2),
      h3: renderHeading(3),
      h4: renderHeading(4),
      h5: renderHeading(5),
      h6: renderHeading(6),
      a({
        href,
        children,
        ...props
      }: {
        href?: string;
        children?: React.ReactNode;
      }) {
        if (!href) {
          return <a {...props}>{children}</a>;
        }
        if (href.startsWith('#')) {
          return (
            <a
              href={href}
              {...props}
              onClick={(event) => {
                // 目录点击时在文档容器内部滚动，避免页面级滚动定位错误。
                event.preventDefault();
                const id = decodeURIComponent(href.slice(1));
                const target = docRef.current?.querySelector(
                  `[id="${id.replace(/"/g, '\\"')}"]`
                ) as HTMLElement | null;
                if (!target) {
                  return;
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', `#${id}`);
              }}
            >
              {children}
            </a>
          );
        }
        return (
          <a href={href} target={'_blank'} rel={'noreferrer'} {...props}>
            {children}
          </a>
        );
      },
      table({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;

        // 按需求保留 Markdown 原生 table，并且不包裹外层 div。
        return (
          <table
            className={joinClassName(styles['md-table'], className)}
            {...restProps}
          >
            {children}
          </table>
        );
      },
      thead({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;
        return (
          <thead
            className={joinClassName(styles['md-thead'], className)}
            {...restProps}
          >
            {children}
          </thead>
        );
      },
      tbody({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;
        return (
          <tbody
            className={joinClassName(styles['md-tbody'], className)}
            {...restProps}
          >
            {children}
          </tbody>
        );
      },
      tr({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;
        return (
          <tr
            className={joinClassName(styles['md-tr'], className)}
            {...restProps}
          >
            {children}
          </tr>
        );
      },
      th({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;
        return (
          <th
            className={joinClassName(styles['md-th'], className)}
            {...restProps}
          >
            {children}
          </th>
        );
      },
      td({ children, ...props }: { children?: React.ReactNode }) {
        const { className, ...restProps } = props as {
          className?: string;
        } & Record<string, unknown>;
        return (
          <td
            className={joinClassName(styles['md-td'], className)}
            {...restProps}
          >
            {children}
          </td>
        );
      },
      pre({ children }: { children?: React.ReactNode }) {
        // 三反引号代码块统一走 pre 渲染，避免与单反引号行内 code 混淆。
        const codeElement = React.Children.toArray(children).find((child) =>
          React.isValidElement(child)
        ) as
          | React.ReactElement<{
              className?: string;
              children?: React.ReactNode;
            }>
          | undefined;

        const className = codeElement?.props?.className;
        const match = /language-(\w+)/.exec(className || '');
        const language = match?.[1] ?? 'text';
        const codeText = String(
          getNodeText(codeElement?.props?.children ?? children)
        ).replace(/\n$/, '');

        return (
          <div className={styles['code-block']}>
            <div className={styles['code-toolbar']}>
              <span className={styles['code-lang']}>{language}</span>
              <CopyItemIcon value={codeText} />
            </div>
            <pre className={styles['code-pre']}>
              <code className={className}>{codeText}</code>
            </pre>
          </div>
        );
      },
      code({
        className,
        children,
        ...props
      }: {
        className?: string;
        children?: React.ReactNode;
      }) {
        // 单反引号行内 code 仅走这里，样式与代码块分离。
        return (
          <code
            className={joinClassName(styles['inline-code'], className)}
            {...props}
          >
            {children}
          </code>
        );
      },
      script() {
        return null;
      }
    };
  }, [markdown]);

  return (
    <div className={styles['sdk-doc']} ref={docRef}>
      {!!metadata.length && (
        <div className={styles['meta-tags']}>
          {metadata.map((item) => (
            <div
              key={`${item.key}:${item.value}`}
              className={styles['meta-tag-item']}
            >
              <Tag color={'arcoblue'}>{item.key}</Tag>
              <span className={styles['meta-tag-value']}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfmPlugin]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
