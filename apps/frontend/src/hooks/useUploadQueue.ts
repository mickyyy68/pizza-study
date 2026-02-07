import { getFileNameWithoutExtension, validateFile } from "@repo/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadItem, UploadStatus } from "../types";

/** Maximum number of concurrent uploads */
const MAX_CONCURRENT_UPLOADS = 3;

/** Maximum retry attempts per file */
const MAX_RETRY_ATTEMPTS = 3;

/** API base URL */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseUploadQueueReturn {
  /** Current items in the upload queue */
  items: UploadItem[];
  /** Add files to the queue (starts upload immediately) */
  addFiles: (files: File[]) => void;
  /** Remove a file from the queue */
  removeFile: (id: string) => void;
  /** Cancel an in-progress upload */
  cancelUpload: (id: string) => void;
  /** Retry a failed upload */
  retryUpload: (id: string) => void;
  /** Clear all completed uploads */
  clearCompleted: () => void;
  /** Clear all items from the queue */
  clearAll: () => void;
  /** Number of active (uploading) items */
  activeCount: number;
  /** Number of pending items waiting in queue */
  pendingCount: number;
  /** Number of completed items */
  completedCount: number;
  /** Number of failed items */
  errorCount: number;
}

/**
 * Generate a unique ID for upload items.
 */
function generateId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Upload a single file to the backend with progress tracking.
 *
 * Uses XMLHttpRequest for upload progress events (fetch doesn't support this).
 */
function uploadFile(
  file: File,
  title: string,
  onProgress: (progress: number) => void,
  signal: AbortSignal,
): Promise<{ documentId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Handle abort signal
    const handleAbort = () => {
      xhr.abort();
    };
    signal.addEventListener("abort", handleAbort);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    // Handle completion
    xhr.onload = () => {
      signal.removeEventListener("abort", handleAbort);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({ documentId: response.id || response.documentId });
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    };

    // Handle errors
    xhr.onerror = () => {
      signal.removeEventListener("abort", handleAbort);
      reject(new Error("Network error. Please check your connection."));
    };

    xhr.onabort = () => {
      signal.removeEventListener("abort", handleAbort);
      reject(new Error("Upload cancelled"));
    };

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    // Send request
    xhr.open("POST", `${API_URL}/api/documents`);
    xhr.send(formData);
  });
}

/**
 * Hook for managing a queue of file uploads.
 *
 * Features:
 * - Immediate upload on file add
 * - Concurrent upload limiting (max 3)
 * - Progress tracking
 * - Cancellation support
 * - Retry logic (max 3 attempts)
 *
 * @example
 * ```tsx
 * const { items, addFiles, removeFile, retryUpload } = useUploadQueue();
 *
 * const handleDrop = (files: File[]) => {
 *   addFiles(files);
 * };
 *
 * return (
 *   <UploadList>
 *     {items.map(item => (
 *       <UploadListItem
 *         key={item.id}
 *         fileName={item.file.name}
 *         status={item.status}
 *         progress={item.progress}
 *         onRemove={() => removeFile(item.id)}
 *         onRetry={() => retryUpload(item.id)}
 *       />
 *     ))}
 *   </UploadList>
 * );
 * ```
 */
export function useUploadQueue(): UseUploadQueueReturn {
  const [items, setItems] = useState<UploadItem[]>([]);

  // Track which uploads are currently in progress
  const activeUploadsRef = useRef<Set<string>>(new Set());

  /**
   * Update a single item in the queue.
   */
  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }, []);

  /**
   * Start uploading a specific item.
   */
  const startUpload = useCallback(
    async (item: UploadItem) => {
      const { id, file, title } = item;

      // Mark as active
      activeUploadsRef.current.add(id);

      // Create abort controller for this upload
      const abortController = new AbortController();

      // Update item with abort controller and uploading status
      updateItem(id, {
        status: "uploading",
        progress: 0,
        error: undefined,
        abortController,
      });

      try {
        const result = await uploadFile(
          file,
          title,
          (progress) => {
            updateItem(id, { progress });
          },
          abortController.signal,
        );

        // Success!
        updateItem(id, {
          status: "complete",
          progress: 100,
          documentId: result.documentId,
          abortController: undefined,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        updateItem(id, {
          status: "error",
          error: errorMessage,
          abortController: undefined,
        });
      } finally {
        // Remove from active uploads
        activeUploadsRef.current.delete(id);
      }
    },
    [updateItem],
  );

  /**
   * Process the queue - start uploads for pending items if under limit.
   * This runs as an effect whenever items change.
   */
  useEffect(() => {
    const activeCount = activeUploadsRef.current.size;
    const availableSlots = MAX_CONCURRENT_UPLOADS - activeCount;

    if (availableSlots <= 0) return;

    // Find pending items that aren't already being processed
    const pendingItems = items.filter(
      (item) =>
        item.status === "pending" && !activeUploadsRef.current.has(item.id),
    );

    // Start uploads for items up to available slots
    const itemsToStart = pendingItems.slice(0, availableSlots);

    for (const item of itemsToStart) {
      startUpload(item);
    }
  }, [items, startUpload]);

  /**
   * Add files to the upload queue.
   */
  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = [];
    const validationErrors: string[] = [];

    for (const file of files) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create upload item
      const title = getFileNameWithoutExtension(file.name);

      newItems.push({
        id: generateId(),
        file,
        title,
        status: "pending",
        progress: 0,
        retryCount: 0,
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }

    if (validationErrors.length > 0) {
      console.warn("Some files were rejected:", validationErrors);
      for (const error of validationErrors) {
        toast.error(error);
      }
    }
  }, []);

  /**
   * Remove a file from the queue.
   */
  const removeFile = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.abortController) {
        item.abortController.abort();
      }
      activeUploadsRef.current.delete(id);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  /**
   * Cancel an in-progress upload.
   */
  const cancelUpload = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.abortController) {
        item.abortController.abort();
      }
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "error" as UploadStatus,
              error: "Upload cancelled",
              abortController: undefined,
            }
          : i,
      );
    });
    activeUploadsRef.current.delete(id);
  }, []);

  /**
   * Retry a failed upload.
   */
  const retryUpload = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item || item.status !== "error") return prev;

      // Check retry limit
      if (item.retryCount >= MAX_RETRY_ATTEMPTS) {
        return prev.map((i) =>
          i.id === id
            ? {
                ...i,
                error: `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) exceeded`,
              }
            : i,
        );
      }

      // Reset to pending with incremented retry count
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "pending" as UploadStatus,
              progress: 0,
              error: undefined,
              retryCount: i.retryCount + 1,
            }
          : i,
      );
    });
  }, []);

  /**
   * Clear all completed uploads.
   */
  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== "complete"));
  }, []);

  /**
   * Clear all items from the queue.
   */
  const clearAll = useCallback(() => {
    // Abort any in-progress uploads
    setItems((prev) => {
      for (const item of prev) {
        if (item.abortController) {
          item.abortController.abort();
        }
      }
      return [];
    });
    activeUploadsRef.current.clear();
  }, []);

  // Computed counts
  const activeCount = items.filter((i) => i.status === "uploading").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const completedCount = items.filter((i) => i.status === "complete").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return {
    items,
    addFiles,
    removeFile,
    cancelUpload,
    retryUpload,
    clearCompleted,
    clearAll,
    activeCount,
    pendingCount,
    completedCount,
    errorCount,
  };
}
