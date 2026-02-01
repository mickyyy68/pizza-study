import {
  Add01Icon,
  ArrowDown01Icon,
  File02Icon,
  Search01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

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
   DocumentList - Container for document items with search and pagination
   ============================================================================= */

export interface DocumentListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  documents: DocumentItem[];
  onToggleSelection: (docId: string) => void;
  onUploadClick?: () => void;
  emptyMessage?: string;
  /** Number of documents to show per page (default: 5) */
  pageSize?: number;
}

/**
 * List of documents available for RAG context.
 * Features search filtering and "show more" pagination.
 */
export function DocumentList({
  className,
  documents,
  onToggleSelection,
  onUploadClick,
  emptyMessage = "No documents uploaded",
  pageSize = 5,
  ...props
}: DocumentListProps) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter documents by search query
  const filteredDocuments = React.useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => doc.name.toLowerCase().includes(query));
  }, [documents, searchQuery]);

  // Get visible documents (paginated)
  const visibleDocuments = filteredDocuments.slice(0, visibleCount);
  const hasMore = filteredDocuments.length > visibleCount;
  const remainingCount = filteredDocuments.length - visibleCount;

  // Reset pagination when search changes
  React.useEffect(() => {
    setVisibleCount(pageSize);
    setFocusedIndex(-1);
  }, [searchQuery, pageSize]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (visibleDocuments.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < visibleDocuments.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < visibleDocuments.length) {
          onToggleSelection(visibleDocuments[focusedIndex].id);
        }
        break;
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + pageSize);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {/* Search input */}
      {documents.length > 3 && (
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter documents..."
            className="pl-10 h-7 text-xs"
            aria-label="Filter documents"
          />
        </div>
      )}

      {/* Document list */}
      {filteredDocuments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2 text-center">
          {searchQuery ? "No documents match your search" : emptyMessage}
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
          {visibleDocuments.map((doc, index) => (
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

      {/* Show more button */}
      {hasMore && (
        <button
          type="button"
          onClick={handleShowMore}
          className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
          Show {Math.min(remainingCount, pageSize)} more
        </button>
      )}

      {/* Upload button */}
      {onUploadClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadClick}
          className="w-full text-xs h-8"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} />
          Upload Document
        </Button>
      )}
    </div>
  );
}

/* =============================================================================
   DocumentListItem - Individual document row with highlight selection
   ============================================================================= */

interface DocumentListItemProps {
  document: DocumentItem;
  onToggle: () => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

/**
 * Single document item with highlight-based selection.
 */
function DocumentListItem({
  document,
  onToggle,
  isFocused = false,
  onFocus,
}: DocumentListItemProps) {
  return (
    <button
      type="button"
      role="listitem"
      aria-pressed={document.isSelected}
      aria-label={`${document.name}${document.isSelected ? " (selected)" : ""}`}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 w-full text-left",
        "transition-all duration-150",
        // Default state
        "hover:bg-muted/50",
        // Focus state
        isFocused && "ring-1 ring-primary/30",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        // Selected state - more prominent highlight
        document.isSelected
          ? "bg-primary/10 hover:bg-primary/15"
          : "bg-transparent",
      )}
      onClick={onToggle}
      onFocus={onFocus}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        <HugeiconsIcon
          icon={File02Icon}
          size={16}
          className={cn(
            "transition-colors duration-150",
            document.isSelected ? "text-primary" : "text-muted-foreground",
          )}
        />
        {/* Recently cited indicator */}
        {document.recentlyCited && (
          <HugeiconsIcon
            icon={SparklesIcon}
            size={10}
            className="absolute -right-1 -top-1 text-primary"
          />
        )}
      </div>

      {/* Name */}
      <span
        className={cn(
          "flex-1 min-w-0 text-sm truncate transition-colors duration-150",
          document.isSelected
            ? "text-foreground font-medium"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        {document.name}
      </span>

      {/* Page count badge */}
      <span
        className={cn(
          "flex-shrink-0 text-xs tabular-nums transition-colors duration-150",
          document.isSelected ? "text-primary/70" : "text-muted-foreground/60",
        )}
      >
        {document.pageCount}p
      </span>
    </button>
  );
}
