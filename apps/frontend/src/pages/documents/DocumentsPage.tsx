import {
  Cancel01Icon,
  CloudUploadIcon,
  Delete01Icon,
  File02Icon,
  GridIcon,
  Menu01Icon,
  Refresh01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Badge,
  Button,
  buttonVariants,
  cn,
  Input,
  SkeletonCard,
} from "@repo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ApiDocument = {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type LoadStatus = "idle" | "loading" | "error";

/**
 * DocumentsPage - Document library for Pizza Study.
 *
 * Loads documents from the backend and renders them in grid/list views.
 */
export function DocumentsPage() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/documents`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to load documents.";
        throw new Error(message);
      }

      const payload = (await response.json()) as ApiDocument[];
      if (!Array.isArray(payload)) {
        throw new Error("Unexpected response from server.");
      }

      setDocuments(payload);
      setStatus("idle");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load documents.";
      setError(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteClick = useCallback((doc: ApiDocument) => {
    setDeleteTarget({ id: doc.id, title: doc.title });
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/documents/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete document");
      // Keep dialog open so user can retry
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  const documentTags = useMemo(() => {
    const tagMap = new Map<string, string[]>();
    documents.forEach((doc) => {
      tagMap.set(doc.id, extractTags(doc.metadata));
    });
    return tagMap;
  }, [documents]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    documentTags.forEach((tags) => tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [documentTags]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query && !selectedTag) return documents;

    return documents.filter((doc) => {
      const tags = documentTags.get(doc.id) ?? [];
      if (selectedTag && !tags.includes(selectedTag)) return false;

      if (!query) return true;

      return (
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      );
    });
  }, [documents, documentTags, searchQuery, selectedTag]);

  const totalDocuments = documents.length;
  const filteredCount = filteredDocuments.length;

  const lastUpdated = useMemo(() => {
    if (documents.length === 0) return null;
    return documents.reduce((latest, doc) => {
      const latestTime = new Date(latest).getTime();
      const currentTime = new Date(doc.updatedAt).getTime();
      return currentTime > latestTime ? doc.updatedAt : latest;
    }, documents[0].updatedAt);
  }, [documents]);

  const showEmpty = status !== "loading" && filteredDocuments.length === 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Library
            </p>
            <h1 className="font-serif text-3xl font-semibold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Documents stored in your database and ready for RAG search.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchDocuments}
              disabled={status === "loading"}
            >
              <HugeiconsIcon icon={Refresh01Icon} size={16} />
              Refresh
            </Button>
            <Link
              to="/documents/upload"
              className={cn(buttonVariants(), "gap-2")}
            >
              <HugeiconsIcon icon={CloudUploadIcon} size={16} />
              Upload
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatPill label="Total docs" value={String(totalDocuments)} />
          <StatPill
            label="Last updated"
            value={lastUpdated ? formatDate(lastUpdated) : "-"}
          />
          <StatPill
            label="Tags"
            value={availableTags.length ? String(availableTags.length) : "-"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm">
          <div className="relative flex-1 min-w-[220px]">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Filter
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !selectedTag
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <TagFilterChip
                key={tag}
                tag={tag}
                selected={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
              />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Showing {filteredCount} of {totalDocuments}
            </p>
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-full",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Grid view"
              >
                <HugeiconsIcon icon={GridIcon} size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-full",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List view"
              >
                <HugeiconsIcon icon={Menu01Icon} size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {status === "loading" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`doc-skeleton-${index}`} />
            ))}
          </div>
        )}

        {status === "error" && (
          <ErrorState message={error ?? "Unable to load documents."} />
        )}

        {status !== "loading" && status !== "error" && showEmpty && (
          <EmptyState
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            onClearSearch={() => setSearchQuery("")}
            onClearTag={() => setSelectedTag(null)}
          />
        )}

        {status !== "loading" && status !== "error" && !showEmpty && (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3",
            )}
          >
            {filteredDocuments.map((doc) =>
              viewMode === "grid" ? (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  tags={documentTags.get(doc.id) ?? []}
                  onDelete={handleDeleteClick}
                  onTagSelect={setSelectedTag}
                />
              ) : (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  tags={documentTags.get(doc.id) ?? []}
                  onDelete={handleDeleteClick}
                  onTagSelect={setSelectedTag}
                />
              ),
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleDeleteCancel}
            onKeyDown={(e) => e.key === "Escape" && handleDeleteCancel()}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg mx-4">
            <h2 className="font-serif text-lg font-semibold mb-2">
              Delete Document
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteTarget.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-serif font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function TagFilterChip({
  tag,
  selected,
  onClick,
}: {
  tag: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        selected
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {tag}
    </button>
  );
}

function DocumentCard({
  document,
  tags,
  onDelete,
  onTagSelect,
}: {
  document: ApiDocument;
  tags: string[];
  onDelete: (doc: ApiDocument) => void;
  onTagSelect: (tag: string) => void;
}) {
  const preview = buildPreview(document.content);

  return (
    <article className="group relative rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            <HugeiconsIcon
              icon={File02Icon}
              size={20}
              className="text-muted-foreground"
            />
          </div>
          <div>
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {document.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Updated {formatDate(document.updatedAt)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(document)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={`Delete ${document.title}`}
        >
          <HugeiconsIcon icon={Delete01Icon} size={16} />
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
        {preview}
      </p>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} type="button" onClick={() => onTagSelect(tag)}>
              <Badge variant="outline" size="sm">
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function DocumentRow({
  document,
  tags,
  onDelete,
  onTagSelect,
}: {
  document: ApiDocument;
  tags: string[];
  onDelete: (doc: ApiDocument) => void;
  onTagSelect: (tag: string) => void;
}) {
  const preview = buildPreview(document.content);

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
        <HugeiconsIcon
          icon={File02Icon}
          size={20}
          className="text-muted-foreground"
        />
      </div>
      <div className="flex-1 min-w-[220px]">
        <p className="font-medium text-sm truncate">{document.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {preview}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Updated {formatDate(document.updatedAt)}
        </p>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 4).map((tag) => (
            <button key={tag} type="button" onClick={() => onTagSelect(tag)}>
              <Badge variant="outline" size="sm">
                {tag}
              </Badge>
            </button>
          ))}
          {tags.length > 4 && (
            <Badge variant="muted" size="sm">
              +{tags.length - 4}
            </Badge>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => onDelete(document)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        aria-label={`Delete ${document.title}`}
      >
        <HugeiconsIcon icon={Delete01Icon} size={16} />
      </button>
    </div>
  );
}

function EmptyState({
  searchQuery,
  selectedTag,
  onClearSearch,
  onClearTag,
}: {
  searchQuery: string;
  selectedTag: string | null;
  onClearSearch: () => void;
  onClearTag: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] text-center rounded-2xl border border-dashed border-border/70 bg-muted/40 p-8">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <HugeiconsIcon
          icon={File02Icon}
          size={32}
          className="text-muted-foreground"
        />
      </div>
      <h3 className="font-serif text-lg font-semibold mb-2">
        {searchQuery || selectedTag
          ? "No matching documents"
          : "No documents yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[340px] mb-4">
        {searchQuery || selectedTag
          ? "Try a different search term or clear the filters."
          : "Upload a document to see it here and start asking questions."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {searchQuery && (
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            Clear search
          </Button>
        )}
        {selectedTag && (
          <Button variant="outline" size="sm" onClick={onClearTag}>
            Clear tag
          </Button>
        )}
        {!searchQuery && !selectedTag && (
          <Link
            to="/documents/upload"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <HugeiconsIcon icon={CloudUploadIcon} size={16} />
            Upload document
          </Link>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-lg rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
      <h2 className="font-serif text-lg font-semibold">
        Unable to load documents
      </h2>
      <p className="text-sm text-muted-foreground mt-2">{message}</p>
      <p className="text-sm text-muted-foreground mt-4">
        Make sure the backend is running and the database is available.
      </p>
    </div>
  );
}

function buildPreview(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "No preview available.";
  if (trimmed.length <= 160) return trimmed;
  return `${trimmed.slice(0, 160).trim()}...`;
}

function extractTags(metadata: ApiDocument["metadata"]) {
  if (!metadata || typeof metadata !== "object") return [];
  const tags = (metadata as { tags?: unknown }).tags;
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag): tag is string => typeof tag === "string");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown date";
  return date.toLocaleDateString();
}
