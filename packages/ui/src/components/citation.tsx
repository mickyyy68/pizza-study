import { File02Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

/* =============================================================================
   Types
   ============================================================================= */

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  /** Human-readable location label, e.g. "Excerpt 1" */
  locationLabel?: string;
  /** Page number if available from document metadata */
  pageNumber?: number;
  /** Quote excerpt for preview */
  quote?: string;
}

/* =============================================================================
   CitationBadge - Inline [1] badge
   ============================================================================= */

export interface CitationBadgeProps {
  number: number;
  onClick?: () => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
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
        // Inline positioning
        "inline-flex items-center justify-center",
        // Size - visible but not intrusive
        "text-xs font-bold",
        // Spacing and shape
        "mx-1 px-1.5 py-0.5 rounded",
        // Colors - visible badge style
        "bg-primary/20 text-primary",
        "hover:bg-primary hover:text-primary-foreground",
        // Smooth transition
        "transition-colors duration-150 cursor-pointer",
        // Accessibility focus states
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        className,
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
  // Calculate position that stays within viewport
  const tooltipWidth = 288; // w-72 = 18rem = 288px
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1200;
  const padding = 8;

  let left = position ? position.x - tooltipWidth / 2 : 0;
  // Clamp to viewport
  left = Math.max(
    padding,
    Math.min(left, viewportWidth - tooltipWidth - padding),
  );

  // Use portal to render at document body level, avoiding any parent overflow/z-index issues
  const content = (
    <div
      className={cn(
        "fixed w-72 p-3 rounded-lg shadow-2xl",
        "text-neutral-100",
        "border border-neutral-700",
        "pointer-events-none",
        className,
      )}
      style={{
        left: position ? left : 0,
        top: position ? position.y : 0,
        zIndex: 99999,
        backgroundColor: "#171717", // neutral-900 - inline for guaranteed opacity
      }}
    >
      {/* Quote */}
      {citation.quote && (
        <blockquote className="text-sm italic text-neutral-300 border-l-2 border-primary/50 pl-3 mb-3">
          "{citation.quote}"
        </blockquote>
      )}

      {/* Source info */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <HugeiconsIcon icon={File02Icon} size={14} />
        <span className="truncate flex-1">{citation.documentName}</span>
        {citation.locationLabel ? (
          <span>{citation.locationLabel}</span>
        ) : citation.pageNumber ? (
          <span>p. {citation.pageNumber}</span>
        ) : null}
      </div>
    </div>
  );

  // Render via portal to document body to avoid overflow/stacking context issues
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
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
        {citations.map((citation) => (
          <SourceItem
            key={citation.id}
            citation={citation}
            number={parseInt(citation.id, 10)}
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

function SourceItem({
  citation,
  number,
  onClick,
  highlighted,
}: SourceItemProps) {
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
        highlighted && "bg-primary/10 ring-1 ring-primary/30",
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
        {(citation.locationLabel || citation.pageNumber) && (
          <span className="text-xs text-muted-foreground">
            {citation.locationLabel || `Page ${citation.pageNumber}`}
          </span>
        )}
      </div>

      {/* External link icon */}
      <HugeiconsIcon
        icon={LinkSquare02Icon}
        size={14}
        className="text-muted-foreground flex-shrink-0"
      />
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
  text: string,
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
  onCitationClick?: (id: string) => void,
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
    const citationNumber =
      citationIndex >= 0 ? citationIndex + 1 : parseInt(match.id);

    // Add citation badge
    result.push(
      <CitationBadge
        key={`cite-${i}`}
        number={citationNumber}
        onClick={() => onCitationClick?.(match.id)}
      />,
    );

    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}
