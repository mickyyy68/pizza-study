import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";

export interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

/**
 * Code block with syntax highlighting and copy button.
 * Uses simple CSS-based highlighting for performance.
 */
export function CodeBlock({ children, language, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("group relative my-4 first:mt-0 last:mb-0", className)}>
      {/* Language label and copy button */}
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
        <span>{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center justify-center p-1.5 rounded-md transition-colors",
            "hover:bg-zinc-700 hover:text-zinc-200",
            copied && "text-green-400",
          )}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={16} />
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto rounded-b-lg bg-zinc-900 p-4 text-sm leading-relaxed">
        <code
          className={cn(
            "font-mono text-zinc-100",
            language && `language-${language}`,
          )}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * Inline code styling.
 */
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]",
        className,
      )}
    >
      {children}
    </code>
  );
}
