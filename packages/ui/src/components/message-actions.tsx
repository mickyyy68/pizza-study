import {
  Copy01Icon,
  PencilEdit01Icon,
  Refresh01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import * as React from "react";
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
 * Icon-only buttons positioned at top-right of message on hover.
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
        "flex items-center gap-1",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
        className,
      )}
    >
      {/* Copy */}
      <ActionButton
        icon={copied ? Tick01Icon : Copy01Icon}
        label={copied ? "Copied!" : "Copy"}
        onClick={handleCopy}
        active={copied}
      />

      {/* Edit (user only) */}
      {role === "user" && onEdit && (
        <ActionButton icon={PencilEdit01Icon} label="Edit" onClick={onEdit} />
      )}

      {/* Regenerate (assistant only) */}
      {role === "assistant" && onRegenerate && (
        <ActionButton
          icon={Refresh01Icon}
          label="Regenerate"
          onClick={onRegenerate}
        />
      )}
    </div>
  );
}

interface ActionButtonProps {
  icon: IconSvgElement;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ActionButton({ icon, label, onClick, active }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-md",
        "text-muted-foreground",
        "hover:bg-muted/80 hover:text-foreground",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active && "text-green-600 dark:text-green-400",
      )}
      aria-label={label}
    >
      <HugeiconsIcon icon={icon} size={16} />
    </button>
  );
}
