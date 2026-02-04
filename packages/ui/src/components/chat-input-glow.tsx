import {
  Attachment01Icon,
  Image01Icon,
  SentIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import { DocumentPicker, type PickerDocument } from "./document-picker";
import { AttachmentChip, ChipsContainer, DocumentChip } from "./input-chips";

/**
 * ChatInputGlow - Enhanced chat input with glowing halo effect.
 *
 * Features:
 * - Glowing gradient halo around the card
 * - Model selector pill at the top
 * - @ mentions for documents
 * - File attachments with drag-drop
 * - Attachment/image buttons on left, send on right
 * - Disclaimer text below
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

export interface ChatInputGlowProps
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

  /** Called when image attachment is clicked */
  onImageAttach?: () => void;

  /** Show disclaimer text below input */
  showDisclaimer?: boolean;
}

export const ChatInputGlow = React.forwardRef<HTMLTextAreaElement, ChatInputGlowProps>(
  (
    {
      className,
      value,
      onChange,
      onSubmit,
      maxRows = 5,
      isLoading,
      onStop,
      placeholder = "Ask anything or mention documents...",
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
      onImageAttach,
      showDisclaimer = true,
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
        const before = value.slice(0, mentionStartIndex);
        const after = value.slice(
          mentionStartIndex + mentionQuery.length + 1,
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
        e.target.value = "";
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
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        {/* Glow wrapper */}
        <div className="relative group">
          {/* Gradient glow effect - behind the card */}
          <div
            className={cn(
              "absolute -inset-0.5 rounded-2xl blur transition-all duration-300",
              "bg-gradient-to-r from-primary to-destructive",
              "opacity-20 group-hover:opacity-40",
              "group-focus-within:opacity-50",
            )}
            aria-hidden="true"
          />

          {/* Main input card */}
          <div
            ref={containerRef}
            className={cn(
              "relative flex flex-col gap-2",
              "bg-card border border-border rounded-2xl p-3",
              "shadow-2xl",
              // Drag state
              isDragging && "ring-2 ring-primary/40 border-primary/40",
              isDisabled && "opacity-50",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            aria-dropeffect={isDragging ? "copy" : undefined}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/60 bg-gradient-to-b from-primary/8 to-primary/5 z-10 backdrop-blur-[1px]">
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

            {/* Top row: Model selector */}
            {modelSelector && (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {modelSelector}
                </div>
              </div>
            )}

            {/* Attachment chips */}
            {hasAttachments && (
              <div className="px-2">
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

            {/* Document chips */}
            {hasDocTags && (
              <div className="px-2">
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
                "w-full bg-transparent border-0 focus:ring-0 p-3",
                "text-base text-foreground",
                "placeholder:text-muted-foreground",
                "resize-none max-h-48",
                "outline-none focus:outline-none",
                "caret-primary",
                "disabled:cursor-not-allowed",
              )}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
              aria-label="Message input"
              {...props}
            />

            {/* Bottom row: Actions */}
            <div className="flex items-center justify-between px-2 pb-1">
              {/* Left: Attachment buttons */}
              <div className="flex items-center gap-2">
                {onAttach && (
                  <>
                    <button
                      type="button"
                      onClick={handleFileSelect}
                      disabled={isDisabled}
                      className={cn(
                        "p-2 rounded-lg",
                        "text-muted-foreground",
                        "hover:bg-black/5 dark:hover:bg-white/5",
                        "hover:text-primary transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      )}
                      aria-label="Attach file"
                    >
                      <HugeiconsIcon icon={Attachment01Icon} size={20} />
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
                {onImageAttach && (
                  <button
                    type="button"
                    onClick={onImageAttach}
                    disabled={isDisabled}
                    className={cn(
                      "p-2 rounded-lg",
                      "text-muted-foreground",
                      "hover:bg-black/5 dark:hover:bg-white/5",
                      "hover:text-primary transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    )}
                    aria-label="Attach image"
                  >
                    <HugeiconsIcon icon={Image01Icon} size={20} />
                  </button>
                )}
              </div>

              {/* Right: Send/Stop button */}
              {isLoading && onStop ? (
                <button
                  type="button"
                  onClick={onStop}
                  className={cn(
                    "p-2 rounded-lg",
                    "bg-muted/60 text-muted-foreground",
                    "border border-border/50",
                    "transition-all duration-200",
                    "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  aria-label="Stop generating"
                >
                  <HugeiconsIcon icon={StopIcon} size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => canSubmit && onSubmit()}
                  disabled={!canSubmit}
                  className={cn(
                    "p-2 rounded-lg",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "shadow-md",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  aria-label="Send message"
                >
                  <HugeiconsIcon icon={SentIcon} size={20} />
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
        </div>

        {/* Disclaimer text */}
        {showDisclaimer && (
          <div className="mt-3 text-center">
            <p className="text-[10px] text-muted-foreground opacity-40">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        )}
      </div>
    );
  },
);

ChatInputGlow.displayName = "ChatInputGlow";
