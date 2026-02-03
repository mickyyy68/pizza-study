import { File02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { BottomSheet } from "./bottom-sheet";

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
 * Simplified document picker with mobile bottom sheet support.
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
  const isMobile = useIsMobile();

  // Filter documents by query
  const filtered = React.useMemo(() => {
    if (!query) return documents;
    const q = query.toLowerCase();
    return documents.filter((doc) => doc.name.toLowerCase().includes(q));
  }, [documents, query]);

  // Scroll selected item into view (desktop only)
  React.useEffect(() => {
    if (selectedIndex >= 0 && !isMobile && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-picker-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isMobile]);

  // Handle escape key (desktop only - bottom sheet handles its own)
  React.useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isMobile]);

  const renderDocumentList = (forMobile: boolean) => {
    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center">
            <HugeiconsIcon
              icon={Search01Icon}
              size={20}
              className="text-muted-foreground/60"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/80">
              No documents found
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No matches for "{query}"
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={forMobile ? "p-2" : "py-1.5"}>
        {filtered.map((doc, index) => {
          const isSelected = !forMobile && index === selectedIndex;

          return (
            <button
              key={doc.id}
              type="button"
              role="option"
              data-picker-item
              aria-selected={isSelected}
              onClick={() => onSelect(doc)}
              className={cn(
                "group relative flex items-center w-full text-left",
                "transition-all duration-150",
                "focus:outline-none",
                forMobile ? "px-4 py-3.5" : "px-4 py-2.5",
                isSelected ? "bg-primary/8" : "hover:bg-muted/50",
              )}
            >
              {/* Selection indicator - left accent */}
              <div
                className={cn(
                  "absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-sm",
                  "bg-primary/50 opacity-0 transition-opacity duration-150",
                  isSelected && "opacity-100",
                  "group-hover:opacity-60",
                )}
                aria-hidden="true"
              />

              <div className="flex items-center gap-3 min-w-0 pl-2 flex-1">
                {/* Document icon */}
                <span
                  className={cn(
                    "shrink-0 size-8 rounded-lg flex items-center justify-center",
                    "bg-secondary/50 text-secondary-foreground/70",
                    "transition-colors duration-150",
                    "group-hover:bg-primary/10 group-hover:text-primary",
                    isSelected && "bg-primary/10 text-primary",
                  )}
                >
                  <HugeiconsIcon icon={File02Icon} size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">
                    {highlightMatch(doc.name, query)}
                  </span>
                  {doc.pageCount && (
                    <span className="text-xs text-muted-foreground">
                      {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // Mobile: use bottom sheet
  if (isMobile) {
    return (
      <BottomSheet open={true} onClose={onClose} title="Select document">
        {renderDocumentList(true)}
      </BottomSheet>
    );
  }

  // Desktop: use dropdown (opens upward)
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Select a document"
      className={cn(
        "absolute z-50 w-80 max-h-72 overflow-hidden",
        "rounded-xl border border-border/40 bg-popover/98 backdrop-blur-md",
        "shadow-xl shadow-black/15",
        "animate-in fade-in-0 slide-in-from-bottom-3 zoom-in-98 duration-200",
        // Default to opening upward if no position override
        !position && "left-0",
        className,
      )}
      style={
        position
          ? { top: position.top, left: position.left }
          : { bottom: "calc(100% + 0.5rem)" }
      }
    >
      {/* Search context header */}
      <div className="px-4 py-2.5 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={14} className="opacity-60" />
          <span>
            {query ? (
              <>
                Searching for "
                <span className="text-foreground font-medium">{query}</span>"
              </>
            ) : (
              "Type to search documents"
            )}
          </span>
        </div>
      </div>

      {/* Document list */}
      <div className="overflow-y-auto max-h-56">
        {renderDocumentList(false)}
      </div>
    </div>
  );
}

/**
 * Highlight matching characters in text with marker effect.
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
      <span className="relative inline-block text-primary font-semibold">
        {/* Marker highlight effect */}
        <span
          className="absolute inset-0 -inset-x-0.5 bg-accent/30 -skew-x-2 rounded-sm -z-10"
          aria-hidden="true"
        />
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}
