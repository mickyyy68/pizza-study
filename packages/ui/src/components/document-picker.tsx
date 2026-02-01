import * as React from "react";
import { FileText, Search } from "lucide-react";
import { cn } from "../lib/utils";

export interface PickerDocument {
  id: string;
  name: string;
  pageCount?: number;
}

export interface DocumentPickerProps {
  documents: PickerDocument[];
  query: string;
  selectedIndex: number;
  onSelect: (doc: PickerDocument) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  className?: string;
}

/**
 * Dropdown picker for @ mentioning documents.
 * Shows filtered list based on query.
 */
export function DocumentPicker({
  documents,
  query,
  selectedIndex,
  onSelect,
  onClose,
  position,
  className,
}: DocumentPickerProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  // Filter documents by query
  const filtered = React.useMemo(() => {
    if (!query) return documents;
    const q = query.toLowerCase();
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(q)
    );
  }, [documents, query]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-picker-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (filtered.length === 0) {
    return (
      <div
        className={cn(
          "absolute z-50 w-64 rounded-lg border bg-popover p-3 shadow-lg",
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-150",
          className
        )}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>No documents match "{query}"</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Select a document"
      className={cn(
        "absolute z-50 w-72 max-h-64 overflow-y-auto",
        "rounded-lg border bg-popover shadow-lg",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-150",
        className
      )}
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="p-1">
        {filtered.map((doc, index) => (
          <button
            key={doc.id}
            type="button"
            role="option"
            data-picker-item
            aria-selected={index === selectedIndex}
            onClick={() => onSelect(doc)}
            className={cn(
              "flex items-center gap-2 w-full rounded-md px-3 py-2 text-left text-sm",
              "transition-colors",
              "focus:outline-none",
              index === selectedIndex
                ? "bg-primary/10 text-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block truncate">
                {highlightMatch(doc.name, query)}
              </span>
            </div>
            {doc.pageCount && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {doc.pageCount}p
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Highlight matching characters in text.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-primary">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}
