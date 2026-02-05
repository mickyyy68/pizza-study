import type * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../lib/utils";
import { CitationBadge } from "./citation";
import { CodeBlock, InlineCode } from "./code-block";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** Callback when a citation badge is clicked */
  onCitationClick?: (citationId: string) => void;
  /** Callback when mouse enters a citation badge */
  onCitationHover?: (citationId: string, event: React.MouseEvent) => void;
  /** Callback when mouse leaves a citation badge */
  onCitationLeave?: () => void;
}

/**
 * Renders markdown content with styled elements.
 * Supports GFM (tables, strikethrough, autolinks, task lists).
 */
export function MarkdownRenderer({
  content,
  className,
  onCitationClick,
  onCitationHover,
  onCitationLeave,
}: MarkdownRendererProps) {
  return (
    <div className={cn("prose-custom", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-4 mb-2 first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold mt-3 mb-1 first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mt-3 mb-1 first:mt-0 text-muted-foreground">
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 last:mb-0 ml-6 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 last:mb-0 ml-6 list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),

          // Links - special handling for #cite-N citation links
          a: ({ href, children }) => {
            // Check if this is a citation link (#cite-N format)
            const citationMatch = href?.match(/^#cite-(\d+)$/);
            if (citationMatch) {
              const citationId = citationMatch[1];
              return (
                <CitationBadge
                  number={parseInt(citationId, 10)}
                  onClick={() => onCitationClick?.(citationId)}
                  onMouseEnter={(e) => onCitationHover?.(citationId, e)}
                  onMouseLeave={onCitationLeave}
                />
              );
            }

            // Regular external link
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          },

          // Bold and italic
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // Strikethrough
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">{children}</del>
          ),

          // Horizontal rule
          hr: () => <hr className="my-6 border-border" />,

          // Code
          code: ({ className, children, ...props }) => {
            // Check if this is a code block (has language class) or inline
            const match = /language-(\w+)/.exec(className || "");
            const isBlock =
              match ||
              (typeof children === "string" && children.includes("\n"));

            if (isBlock) {
              return (
                <CodeBlock language={match?.[1]}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              );
            }

            return <InlineCode {...props}>{children}</InlineCode>;
          },

          // Pre (wrapper for code blocks)
          pre: ({ children }) => <>{children}</>,

          // Tables
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-border text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="my-4 rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          ),

          // Task list items (GFM) - styled checkboxes
          input: ({ checked }) => (
            <span
              className={cn(
                "inline-flex items-center justify-center mr-2 align-text-bottom",
                "h-4 w-4 rounded border-2 shrink-0",
                "transition-colors duration-150",
                checked
                  ? "bg-primary border-primary"
                  : "bg-background border-border",
              )}
              aria-checked={checked}
              role="checkbox"
            >
              {checked && (
                <svg
                  aria-hidden="true"
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
