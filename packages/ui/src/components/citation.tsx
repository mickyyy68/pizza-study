import * as React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "../lib/utils";

/* =============================================================================
   Types
   ============================================================================= */

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  quote?: string;
}

/* =============================================================================
   CitationBadge - Inline [1] badge
   ============================================================================= */

export interface CitationBadgeProps {
  number: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

/**
 * Small superscript badge for inline citations.
 * Clickable to scroll to sources section.
 */
export function CitationBadge({
  number,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: CitationBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "inline-flex items-center justify-center",
        "ml-0.5 align-super",
        "h-4 min-w-4 px-1",
        "rounded text-[10px] font-medium",
        "bg-primary/20 text-primary hover:bg-primary/30",
        "transition-colors cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className
      )}
      aria-label={`Citation ${number}, click to view source`}
    >
      {number}
    </button>
  );
}

/* =============================================================================
   CitationPreview - Hover tooltip
   ============================================================================= */

export interface CitationPreviewProps {
  citation: Citation;
  position?: { x: number; y: number };
  className?: string;
}

/**
 * Hover preview showing quoted passage and source info.
 */
export function CitationPreview({
  citation,
  position,
  className,
}: CitationPreviewProps) {
  return (
    <div
      className={cn(
        "absolute z-50 w-72 p-3 rounded-lg border bg-popover text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        className
      )}
      style={
        position
          ? { left: position.x, top: position.y }
          : undefined
      }
    >
      {/* Quote */}
      {citation.quote && (
        <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3 mb-3">
          "{citation.quote}"
        </blockquote>
      )}

      {/* Source info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        <span className="truncate flex-1">{citation.documentName}</span>
        <span>p. {citation.pageNumber}</span>
      </div>
    </div>
  );
}

/* =============================================================================
   CitationSources - Bottom sources section
   ============================================================================= */

export interface CitationSourcesProps {
  citations: Citation[];
  onSourceClick?: (citation: Citation) => void;
  highlightedId?: string;
  className?: string;
}

/**
 * Sources section displayed at the bottom of a message.
 */
export function CitationSources({
  citations,
  onSourceClick,
  highlightedId,
  className,
}: CitationSourcesProps) {
  if (citations.length === 0) return null;

  return (
    <div className={cn("mt-4 pt-4 border-t border-border", className)}>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        Sources
      </h4>
      <div className="space-y-1.5">
        {citations.map((citation, index) => (
          <SourceItem
            key={citation.id}
            citation={citation}
            number={index + 1}
            onClick={() => onSourceClick?.(citation)}
            highlighted={citation.id === highlightedId}
          />
        ))}
      </div>
    </div>
  );
}

interface SourceItemProps {
  citation: Citation;
  number: number;
  onClick?: () => void;
  highlighted?: boolean;
}

function SourceItem({ citation, number, onClick, highlighted }: SourceItemProps) {
  return (
    <button
      type="button"
      id={`source-${citation.id}`}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm",
        "transition-all duration-200",
        "hover:bg-muted",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        highlighted && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      {/* Number */}
      <span className="flex-shrink-0 h-5 w-5 rounded bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
        {number}
      </span>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <span className="block truncate text-foreground">
          {citation.documentName}
        </span>
        <span className="text-xs text-muted-foreground">
          Page {citation.pageNumber}
        </span>
      </div>

      {/* External link icon */}
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

/* =============================================================================
   Citation Parser Utility
   ============================================================================= */

/**
 * Parse citation markers from text.
 * Matches [[cite:N]] patterns and returns positions.
 */
export function parseCitations(
  text: string
): { start: number; end: number; id: string }[] {
  const regex = /\[\[cite:(\d+)\]\]/g;
  const matches: { start: number; end: number; id: string }[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      id: match[1],
    });
  }

  return matches;
}

/**
 * Replace citation markers with components.
 * Returns array of text and citation badge elements.
 */
export function renderWithCitations(
  text: string,
  citations: Citation[],
  onCitationClick?: (id: string) => void
): React.ReactNode[] {
  const matches = parseCitations(text);
  if (matches.length === 0) return [text];

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    // Add text before citation
    if (match.start > lastIndex) {
      result.push(text.slice(lastIndex, match.start));
    }

    // Find citation data
    const citationIndex = citations.findIndex((c) => c.id === match.id);
    const citationNumber = citationIndex >= 0 ? citationIndex + 1 : parseInt(match.id);

    // Add citation badge
    result.push(
      <CitationBadge
        key={`cite-${i}`}
        number={citationNumber}
        onClick={() => onCitationClick?.(match.id)}
      />
    );

    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}
