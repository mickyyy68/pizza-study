import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  FileDropzone,
  getFileExtension,
  UploadList,
  UploadListItem,
} from "@repo/ui";
import { FileUp, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import { useUIStore } from "../../stores/ui-store";

/**
 * UploadDocumentPage - Drag-and-drop document upload with queue display.
 *
 * Features:
 * - Dropzone for drag-and-drop or click-to-upload
 * - Immediate upload on file drop
 * - Upload queue with progress tracking
 * - Retry and remove actions
 * - Supports text files (.txt, .md, .csv, .json) and PDFs
 */
export function UploadDocumentPage() {
  const { openChatSlideOver } = useUIStore();
  const {
    items,
    addFiles,
    removeFile,
    retryUpload,
    clearCompleted,
    activeCount,
    pendingCount,
    completedCount,
    errorCount,
  } = useUploadQueue();

  const hasItems = items.length > 0;
  const hasCompleted = completedCount > 0;

  // Generate status message for screen readers
  const statusMessage = useMemo(() => {
    if (items.length === 0) return "";

    const parts: string[] = [];
    if (activeCount > 0) parts.push(`${activeCount} uploading`);
    if (pendingCount > 0) parts.push(`${pendingCount} pending`);
    if (completedCount > 0) parts.push(`${completedCount} completed`);
    if (errorCount > 0) parts.push(`${errorCount} failed`);

    return parts.join(", ");
  }, [items.length, activeCount, pendingCount, completedCount, errorCount]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold">
              Upload documents
            </h1>
            <p className="text-sm text-muted-foreground">
              Drop your study materials to add them to your library
            </p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <FileDropzone
        onFilesSelected={addFiles}
        accept=".txt,.md,.markdown,.csv,.json,.pdf"
        multiple={true}
        size="lg"
      />

      {/* Empty state hint */}
      {!hasItems && (
        <p className="text-center text-sm text-muted-foreground">
          Your uploads will appear here
        </p>
      )}

      {/* Upload Queue */}
      {hasItems && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upload queue</CardTitle>
              {hasCompleted && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <UploadList statusMessage={statusMessage}>
              {items.map((item) => (
                <UploadListItem
                  key={item.id}
                  fileName={item.file.name}
                  fileSize={item.file.size}
                  fileType={getFileExtension(item.file.name)}
                  status={item.status}
                  progress={item.progress}
                  error={item.error}
                  onRemove={() => removeFile(item.id)}
                  onRetry={
                    item.status === "error"
                      ? () => retryUpload(item.id)
                      : undefined
                  }
                />
              ))}
            </UploadList>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          to="/documents"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View documents
        </Link>
        <Button onClick={openChatSlideOver} variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask questions
        </Button>
      </div>
    </div>
  );
}
