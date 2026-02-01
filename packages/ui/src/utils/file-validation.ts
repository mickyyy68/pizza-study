/**
 * File validation utilities for Pizza Study uploads.
 *
 * Handles file type checking, size validation, and formatting
 * for the document upload experience.
 */

// Accepted file extensions and their MIME types
export const ACCEPTED_FILE_TYPES = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".csv": "text/csv",
  ".json": "application/json",
  ".pdf": "application/pdf",
} as const;

// Human-readable labels for file types
export const FILE_TYPE_LABELS: Record<string, string> = {
  ".txt": "Text",
  ".md": "Markdown",
  ".markdown": "Markdown",
  ".csv": "CSV",
  ".json": "JSON",
  ".pdf": "PDF",
};

// File size limits in bytes
export const MAX_FILE_SIZE_PDF = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_TEXT = 1 * 1024 * 1024; // 1MB

/**
 * Get the file extension from a filename (lowercase, with dot).
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Get the filename without extension.
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return filename;
  return filename.slice(0, lastDot);
}

/**
 * Check if a file has a valid/accepted file type.
 */
export function isValidFileType(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ext in ACCEPTED_FILE_TYPES;
}

/**
 * Get the human-readable label for a file type.
 */
export function getFileTypeLabel(extension: string): string {
  const ext = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;
  return FILE_TYPE_LABELS[ext] || "File";
}

/**
 * Get the appropriate icon name for a file type (Lucide icon names).
 */
export function getFileTypeIcon(extension: string): string {
  const ext = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;

  switch (ext) {
    case ".pdf":
      return "FileText"; // Red-tinted in usage
    case ".json":
      return "FileJson";
    case ".md":
    case ".markdown":
      return "FileCode";
    case ".csv":
      return "FileSpreadsheet";
    default:
      return "FileText";
  }
}

/**
 * Check if a file is within the allowed size limit.
 * Returns an object with validation result and optional error message.
 */
export function isValidFileSize(file: File): {
  valid: boolean;
  error?: string;
} {
  const ext = getFileExtension(file.name);
  const isPdf = ext === ".pdf";
  const maxSize = isPdf ? MAX_FILE_SIZE_PDF : MAX_FILE_SIZE_TEXT;
  const maxSizeLabel = isPdf ? "10MB" : "1MB";

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeLabel} limit. Your file is ${formatFileSize(file.size)}.`,
    };
  }

  return { valid: true };
}

/**
 * Validate a file for both type and size.
 * Returns an object with validation result and optional error message.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check type first
  if (!isValidFileType(file)) {
    const ext = getFileExtension(file.name) || "unknown";
    const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES).join(", ");
    return {
      valid: false,
      error: `File type "${ext}" is not supported. Accepted types: ${acceptedTypes}`,
    };
  }

  // Check size
  return isValidFileSize(file);
}

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "Invalid size";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const base = 1024;

  // Find the appropriate unit
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1,
  );

  const value = bytes / base ** exponent;

  // Format with appropriate decimal places
  const formatted =
    exponent === 0 ? value.toString() : value.toFixed(value < 10 ? 2 : 1);

  return `${formatted} ${units[exponent]}`;
}

/**
 * Get the accept string for file input elements.
 */
export function getAcceptString(): string {
  return Object.entries(ACCEPTED_FILE_TYPES)
    .map(([ext, mime]) => `${ext},${mime}`)
    .join(",");
}
