import {
  Add01Icon,
  File02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";

/* =============================================================================
   Types
   ============================================================================= */

export interface DocumentItem {
  id: string;
  name: string;
  pageCount: number;
  isSelected: boolean;
  recentlyCited: boolean;
}

/* =============================================================================
   DocumentList - Container for document items
   ============================================================================= */

export interface DocumentListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  documents: DocumentItem[];
  onToggleSelection: (docId: string) => void;
  onUploadClick?: () => void;
  emptyMessage?: string;
}

/**
 * List of documents available for RAG context.
 */
export function DocumentList({
  className,
  documents,
  onToggleSelection,
  onUploadClick,
  emptyMessage = "No documents uploaded",
  ...props
}: DocumentListProps) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (documents.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < documents.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < documents.length) {
          onToggleSelection(documents[focusedIndex].id);
        }
        break;
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground px-2 py-3 text-center">
          {emptyMessage}
        </p>
      ) : (
        <div
          ref={listRef}
          role="list"
          aria-label="Documents"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="flex flex-col gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md"
        >
          {documents.map((doc, index) => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              onToggle={() => onToggleSelection(doc.id)}
              isFocused={index === focusedIndex}
              onFocus={() => setFocusedIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Upload button */}
      {onUploadClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadClick}
          className="mt-2 w-full justify-start gap-2"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Upload Document
        </Button>
      )}
    </div>
  );
}

/* =============================================================================
   DocumentListItem - Individual document row
   ============================================================================= */

interface DocumentListItemProps {
  document: DocumentItem;
  onToggle: () => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

/**
 * Single document item with checkbox, name, and metadata.
 */
function DocumentListItem({
  document,
  onToggle,
  isFocused = false,
  onFocus,
}: DocumentListItemProps) {
  const itemId = `doc-${document.id}`;

  return (
    <div
      role="listitem"
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isFocused && "bg-muted/50 ring-1 ring-primary/20",
        document.isSelected && "bg-primary/5",
      )}
      onClick={onToggle}
      onFocus={onFocus}
    >
      {/* Checkbox */}
      <Checkbox
        id={itemId}
        checked={document.isSelected}
        onChange={onToggle}
        aria-label={`Include ${document.name} in context`}
        className="pointer-events-none"
      />

      {/* Icon */}
      <div className="relative flex-shrink-0">
        <HugeiconsIcon
          icon={File02Icon}
          size={16}
          className="text-muted-foreground"
        />
        {/* Recently cited indicator */}
        {document.recentlyCited && (
          <HugeiconsIcon
            icon={SparklesIcon}
            size={12}
            className="absolute -right-1 -top-1 text-primary"
          />
        )}
      </div>

      {/* Name and metadata */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor={itemId}
          className={cn(
            "block text-sm truncate cursor-pointer",
            document.isSelected
              ? "text-foreground font-medium"
              : "text-muted-foreground",
          )}
        >
          {document.name}
        </label>
      </div>

      {/* Page count badge */}
      <span className="flex-shrink-0 text-xs text-muted-foreground">
        {document.pageCount}p
      </span>
    </div>
  );
}
