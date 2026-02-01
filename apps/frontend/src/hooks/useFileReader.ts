import { getFileExtension } from "@repo/ui";
import { useCallback, useRef, useState } from "react";

/**
 * Result of reading a file.
 *
 * For text files, content is the text string.
 * For PDFs, content is null (binary sent directly to backend).
 */
export interface FileReadResult {
  /** Text content for text-based files, null for binary files */
  content: string | null;
  /** Whether the file is binary (like PDF) */
  isBinary: boolean;
  /** The original file */
  file: File;
}

interface UseFileReaderState {
  isLoading: boolean;
  error: string | null;
  result: FileReadResult | null;
}

interface UseFileReaderReturn extends UseFileReaderState {
  /** Read a file and return its content */
  readFile: (file: File) => Promise<FileReadResult>;
  /** Cancel any in-progress read operation */
  cancel: () => void;
  /** Reset state */
  reset: () => void;
}

// Text-based file extensions
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".markdown", ".csv", ".json"]);

/**
 * Hook for reading file contents.
 *
 * - Text files (.txt, .md, .csv, .json) are read as text
 * - Binary files (.pdf) are flagged but not read (sent directly to backend)
 *
 * @example
 * ```tsx
 * const { readFile, isLoading, error } = useFileReader();
 *
 * const handleFile = async (file: File) => {
 *   const result = await readFile(file);
 *   if (result.isBinary) {
 *     // Send file directly to backend
 *   } else {
 *     // Use result.content for text
 *   }
 * };
 * ```
 */
export function useFileReader(): UseFileReaderReturn {
  const [state, setState] = useState<UseFileReaderState>({
    isLoading: false,
    error: null,
    result: null,
  });

  // Track current read operation for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<FileReader | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.abort();
      readerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: "Read cancelled",
    }));
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      isLoading: false,
      error: null,
      result: null,
    });
  }, [cancel]);

  const readFile = useCallback(async (file: File): Promise<FileReadResult> => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState({
      isLoading: true,
      error: null,
      result: null,
    });

    const ext = getFileExtension(file.name);
    const isTextFile = TEXT_EXTENSIONS.has(ext);

    // For binary files (PDFs), don't read content - just flag them
    if (!isTextFile) {
      const result: FileReadResult = {
        content: null,
        isBinary: true,
        file,
      };

      setState({
        isLoading: false,
        error: null,
        result,
      });

      return result;
    }

    // For text files, read the content
    return new Promise<FileReadResult>((resolve, reject) => {
      const reader = new FileReader();
      readerRef.current = reader;

      // Handle abort
      const handleAbort = () => {
        reader.abort();
        reject(new Error("Read cancelled"));
      };

      abortController.signal.addEventListener("abort", handleAbort);

      reader.onload = () => {
        abortController.signal.removeEventListener("abort", handleAbort);
        readerRef.current = null;

        const content = reader.result as string;
        const result: FileReadResult = {
          content,
          isBinary: false,
          file,
        };

        setState({
          isLoading: false,
          error: null,
          result,
        });

        resolve(result);
      };

      reader.onerror = () => {
        abortController.signal.removeEventListener("abort", handleAbort);
        readerRef.current = null;

        const error = "Failed to read file. Please try again.";
        setState({
          isLoading: false,
          error,
          result: null,
        });

        reject(new Error(error));
      };

      reader.onabort = () => {
        abortController.signal.removeEventListener("abort", handleAbort);
        readerRef.current = null;

        const error = "Read cancelled";
        setState({
          isLoading: false,
          error,
          result: null,
        });

        reject(new Error(error));
      };

      // Read as text
      reader.readAsText(file);
    });
  }, []);

  return {
    ...state,
    readFile,
    cancel,
    reset,
  };
}
