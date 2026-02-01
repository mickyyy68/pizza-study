import * as React from "react";
import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

export interface MessageActionsProps {
  role: "user" | "assistant";
  content: string;
  onCopy?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

/**
 * Hover actions for chat messages.
 * Shows copy for all, edit for user, regenerate for assistant.
 */
export function MessageActions({
  role,
  content,
  onCopy,
  onEdit,
  onRegenerate,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      // Strip markdown for plain text copy
      const plainText = content
        .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
        .replace(/\*([^*]+)\*/g, "$1") // italic
        .replace(/`([^`]+)`/g, "$1") // inline code
        .replace(/```[\s\S]*?```/g, (match) => {
          // Extract code block content
          return match.replace(/```\w*\n?/, "").replace(/\n?```$/, "");
        })
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
        .replace(/^#+\s+/gm, "") // headers
        .replace(/^\s*[-*+]\s+/gm, "• ") // list items
        .replace(/^\s*\d+\.\s+/gm, ""); // numbered lists

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Message actions"
      className={cn(
        "absolute -top-3 flex items-center gap-1 rounded-lg border bg-background px-1 py-0.5 shadow-sm",
        "opacity-0 transition-opacity group-hover:opacity-100",
        role === "user" ? "right-0" : "left-10",
        className
      )}
    >
      {/* Copy */}
      <ActionButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied!" : "Copy message"}
        onClick={handleCopy}
        active={copied}
      />

      {/* Edit (user only) */}
      {role === "user" && onEdit && (
        <ActionButton icon={Pencil} label="Edit message" onClick={onEdit} />
      )}

      {/* Regenerate (assistant only) */}
      {role === "assistant" && onRegenerate && (
        <ActionButton
          icon={RefreshCw}
          label="Regenerate response"
          onClick={onRegenerate}
        />
      )}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ActionButton({ icon: Icon, label, onClick, active }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded p-1.5 text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active && "text-green-500"
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
