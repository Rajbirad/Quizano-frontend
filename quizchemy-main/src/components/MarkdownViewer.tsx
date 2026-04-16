import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  return (
    <div className={`max-w-none ${className}`} style={{ border: 'none' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for better integration with our design system
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-foreground mt-6 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-foreground mt-5 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-foreground mt-4 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-3 text-base">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-4 list-disc pl-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 mb-4 list-decimal pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="bg-accent/30 rounded-lg p-4 my-4">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          // Add support for better bold text rendering
          b: ({ children }) => (
            <b className="font-bold text-foreground">{children}</b>
          ),
          // Add support for strikethrough
          del: ({ children }) => (
            <del className="line-through text-foreground/70">{children}</del>
          ),
          // Enhanced table support
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          ),
          // Add support for horizontal rules
          hr: () => (
            <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" />
          ),
          // Handle line breaks properly
          br: () => (
            <br className="mb-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};