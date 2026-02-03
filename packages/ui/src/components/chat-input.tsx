import {
  Attachment01Icon,
  SentIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import { DocumentPicker, type PickerDocument } from "./document-picker";
import { AttachmentChip, ChipsContainer, DocumentChip } from "./input-chips";

/**
 * ChatInput component for Pizza Study.
 *
 * Unified input bar with:
 * - Optional model selector slot
 * - @ mentions for documents (minimal inline tags)
 * - File attachments with drag-drop
 * - Keyboard shortcuts
 */

export interface MentionedDocument {
  id: string;
  name: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  status: "uploading" | "complete" | "error";
  progress: number;
}

export interface ChatInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Maximum rows before scrolling */
  maxRows?: number;
  /** Loading state (disables input) */
  isLoading?: boolean;
  /** Stop handler (shown when loading) */
  onStop?: () => void;

  /** Optional model selector element to render inline */
  modelSelector?: React.ReactNode;

  // @ Mentions
  /** Available documents for @ mentions */
  documents?: PickerDocument[];
  /** Currently mentioned documents */
  mentionedDocs?: MentionedDocument[];
  /** Called when a document is mentioned */
  onMentionAdd?: (doc: PickerDocument) => void;
  /** Called when a mention is removed */
  onMentionRemove?: (docId: string) => void;

  // Attachments
  /** Currently attached files */
  attachments?: AttachedFile[];
  /** Called when files are attached */
  onAttach?: (files: FileList) => void;
  /** Called when an attachment is removed */
  onAttachmentRemove?: (id: string) => void;
  /** Called to retry a failed upload */
  onAttachmentRetry?: (id: string) => void;
  /** Accepted file types */
  acceptedFileTypes?: string;
}

export const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      className,
      value,
      onChange,
      onSubmit,
      maxRows = 5,
      isLoading,
      onStop,
      placeholder = "Type a message...",
      disabled,
      modelSelector,
      // Mentions
      documents = [],
      mentionedDocs = [],
      onMentionAdd,
      onMentionRemove,
      // Attachments
      attachments = [],
      onAttach,
      onAttachmentRemove,
      onAttachmentRetry,
      acceptedFileTypes = ".pdf,.doc,.docx,.txt,.md",
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // @ mention state
    const [showPicker, setShowPicker] = React.useState(false);
    const [mentionQuery, setMentionQuery] = React.useState("");
    const [mentionStartIndex, setMentionStartIndex] = React.useState(-1);
    const [selectedPickerIndex, setSelectedPickerIndex] = React.useState(0);

    // Drag state
    const [isDragging, setIsDragging] = React.useState(false);

    // Auto-resize textarea
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      const lineHeight =
        parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const maxHeight = lineHeight * maxRows;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [maxRows, textareaRef]);

    React.useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    // Filter available documents (exclude already mentioned)
    const availableDocs = React.useMemo(() => {
      const mentionedIds = new Set(mentionedDocs.map((d) => d.id));
      return documents.filter((d) => !mentionedIds.has(d.id));
    }, [documents, mentionedDocs]);

    // Handle input change with @ detection
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;

      onChange(newValue);

      // Detect @ trigger
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const atMatch = textBeforeCursor.match(/@(\w*)$/);

      if (atMatch) {
        setShowPicker(true);
        setMentionQuery(atMatch[1]);
        setMentionStartIndex(cursorPos - atMatch[0].length);
        setSelectedPickerIndex(0);
      } else {
        setShowPicker(false);
        setMentionQuery("");
        setMentionStartIndex(-1);
      }
    };

    // Handle document selection from picker
    const handleDocumentSelect = (doc: PickerDocument) => {
      if (mentionStartIndex >= 0) {
        // Replace @query with empty (we show tags instead)
        const before = value.slice(0, mentionStartIndex);
        const after = value.slice(
          mentionStartIndex + mentionQuery.length + 1, // +1 for @
        );
        onChange(before + after);
      }

      onMentionAdd?.(doc);
      setShowPicker(false);
      setMentionQuery("");
      setMentionStartIndex(-1);
      textareaRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Picker navigation
      if (showPicker) {
        const filteredCount = availableDocs.filter((d) =>
          d.name.toLowerCase().includes(mentionQuery.toLowerCase()),
        ).length;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedPickerIndex((prev) =>
            prev < filteredCount - 1 ? prev + 1 : prev,
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedPickerIndex((prev) => (prev > 0 ? prev - 1 : prev));
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const filtered = availableDocs.filter((d) =>
            d.name.toLowerCase().includes(mentionQuery.toLowerCase()),
          );
          if (filtered[selectedPickerIndex]) {
            handleDocumentSelect(filtered[selectedPickerIndex]);
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowPicker(false);
          return;
        }
      }

      // Submit on Enter (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSubmit) {
          onSubmit();
        }
        return;
      }

      // Cmd/Ctrl+Enter to force send
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canSubmit) {
          onSubmit();
        }
        return;
      }

      // Escape to blur
      if (e.key === "Escape" && !showPicker) {
        textareaRef.current?.blur();
      }
    };

    // File attachment handlers
    const handleFileSelect = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onAttach?.(e.target.files);
        e.target.value = ""; // Reset for re-selection
      }
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current?.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onAttach?.(e.dataTransfer.files);
      }
    };

    const isDisabled = disabled || isLoading;
    const canSubmit =
      (value.trim().length > 0 || attachments.length > 0) && !isDisabled;
    const hasDocTags = mentionedDocs.length > 0;
    const hasAttachments = attachments.length > 0;

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col",
          // Writing desk effect with gradient border on focus
          "writing-desk",
          // Floating effect with warm shadow
          "bg-background/70 backdrop-blur-sm",
          "border border-border/50 rounded-2xl",
          // Hide regular border on focus (gradient border takes over)
          "focus-within:border-transparent",
          "shadow-sm hover:shadow-md",
          "transition-all duration-300 ease-out",
          // Drag state
          isDragging &&
            "ring-2 ring-primary/40 border-primary/40 bg-primary/5 shadow-md",
          isDisabled && "opacity-50",
          className,
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-dropeffect={isDragging ? "copy" : undefined}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/60 bg-gradient-to-b from-primary/8 to-primary/5 z-10 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1">
              <HugeiconsIcon
                icon={Attachment01Icon}
                size={24}
                className="text-primary/70"
              />
              <span className="text-sm text-primary font-medium">
                Drop files here
              </span>
            </div>
          </div>
        )}

        {/* Attachment chips (above the input bar) */}
        {hasAttachments && (
          <div className="px-4 pt-2 pb-1">
            <ChipsContainer>
              {attachments.map((file) => (
                <AttachmentChip
                  key={file.id}
                  id={file.id}
                  name={file.name}
                  status={file.status}
                  progress={file.progress}
                  onRemove={onAttachmentRemove || (() => {})}
                  onRetry={onAttachmentRetry}
                />
              ))}
            </ChipsContainer>
          </div>
        )}

        {/* Document chips row (shown above input when present) */}
        {hasDocTags && (
          <div className="px-4 pt-2 pb-1">
            <ChipsContainer>
              {mentionedDocs.map((doc) => (
                <DocumentChip
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  onRemove={onMentionRemove || (() => {})}
                />
              ))}
            </ChipsContainer>
          </div>
        )}

        {/* Main input row */}
        <div className="flex items-end gap-3 px-4 py-4">
          {/* Model selector (optional slot) */}
          {modelSelector && (
            <div className="shrink-0 self-center p-0.5">{modelSelector}</div>
          )}

          {/* Separator after model selector */}
          {modelSelector && (
            <div className="shrink-0 self-stretch flex items-center py-1">
              <div className="w-px h-6 bg-border/30" />
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent min-w-0",
              // Typography - slightly larger, more presence
              "text-[15px] leading-6",
              "text-foreground placeholder:text-muted-foreground/70",
              // Themed caret
              "caret-primary",
              // Reset ALL browser styling
              "appearance-none",
              "border-0 border-none",
              "outline-0 outline-none",
              "ring-0 ring-offset-0",
              "shadow-none",
              // Also on focus states
              "focus:border-0 focus:outline-0 focus:ring-0 focus:shadow-none",
              "focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none",
              "disabled:cursor-not-allowed",
              // More generous padding
              "py-1.5",
              "max-h-36 overflow-y-auto",
            )}
            style={{
              // Extra insurance against browser defaults
              border: "none",
              outline: "none",
              boxShadow: "none",
              resize: "none",
              WebkitAppearance: "none",
            }}
            aria-label="Message input"
            {...props}
          />

          {/* Attachment button */}
          {onAttach && (
            <>
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={isDisabled}
                className={cn(
                  "shrink-0 size-9 rounded-lg",
                  "flex items-center justify-center",
                  "text-muted-foreground/70 hover:text-foreground",
                  "bg-muted/30 hover:bg-muted/50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                )}
                aria-label="Attach file"
              >
                <HugeiconsIcon icon={Attachment01Icon} size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}

          {/* Send/Stop button */}
          {isLoading && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className={cn(
                "shrink-0 size-9 rounded-lg",
                "flex items-center justify-center",
                // Subtle background with clear intent
                "bg-muted/60 text-muted-foreground",
                "border border-border/50",
                "transition-all duration-200",
                "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
                "active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label="Stop generating"
            >
              <HugeiconsIcon icon={StopIcon} size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => canSubmit && onSubmit()}
              disabled={!canSubmit}
              className={cn(
                "shrink-0 size-9 rounded-lg",
                "flex items-center justify-center",
                // Gradient background for premium feel
                "bg-gradient-to-br from-primary to-primary/90",
                "text-primary-foreground",
                "transition-all duration-200",
                // Enhanced hover with shadow
                "hover:from-primary/95 hover:to-primary/85",
                "hover:shadow-md hover:shadow-primary/20",
                // Active press effect
                "active:scale-95 active:shadow-sm",
                // Disabled state
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                "disabled:hover:shadow-none disabled:hover:from-primary disabled:hover:to-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label="Send message"
            >
              <HugeiconsIcon icon={SentIcon} size={16} />
            </button>
          )}
        </div>

        {/* Document picker dropdown */}
        {showPicker && availableDocs.length > 0 && (
          <DocumentPicker
            documents={availableDocs}
            query={mentionQuery}
            selectedIndex={selectedPickerIndex}
            onSelect={handleDocumentSelect}
            onClose={() => setShowPicker(false)}
            className="bottom-full mb-2 left-0"
          />
        )}
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
