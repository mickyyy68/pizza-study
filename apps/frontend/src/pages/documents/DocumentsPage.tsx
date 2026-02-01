import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SkeletonCard,
  buttonVariants,
  cn,
} from "@repo/ui";
import {
  FileText,
  Grid,
  List,
  RefreshCw,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
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

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;

    return documents.filter((doc) => {
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      );
    });
  }, [documents, searchQuery]);

  const showEmpty = status !== "loading" && filteredDocuments.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-semibold">Documents</h1>
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
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Link
                to="/documents/upload"
                className={cn(buttonVariants(), "gap-2")}
              >
                <UploadCloud className="h-4 w-4" />
                Upload
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
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
            onClearSearch={() => setSearchQuery("")}
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
                <DocumentCard key={doc.id} document={doc} />
              ) : (
                <DocumentRow key={doc.id} document={doc} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ document }: { document: ApiDocument }) {
  const preview = buildPreview(document.content);
  const tags = extractTags(document.metadata);

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <Badge variant="muted" size="sm">
            Document
          </Badge>
        </div>

        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {document.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3">
          {preview}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          Updated {formatDate(document.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

function DocumentRow({ document }: { document: ApiDocument }) {
  const preview = buildPreview(document.content);
  const tags = extractTags(document.metadata);

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{document.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {preview}
        </p>
        <p className="text-xs text-muted-foreground">
          Updated {formatDate(document.updatedAt)}
        </p>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-lg font-semibold mb-2">
        {searchQuery ? "No matching documents" : "No documents yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[320px] mb-4">
        {searchQuery
          ? "Try a different search term or clear the filter."
          : "Upload a document to see it here and start asking questions."}
      </p>
      {searchQuery ? (
        <Button variant="outline" size="sm" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : (
        <Link
          to="/documents/upload"
          className={cn(buttonVariants({ size: "sm" }), "gap-2")}
        >
          <UploadCloud className="h-4 w-4" />
          Upload document
        </Link>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Unable to load documents</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Make sure the backend is running and the database is available.
        </p>
      </CardContent>
    </Card>
  );
}

function buildPreview(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "No preview available.";
  if (trimmed.length <= 160) return trimmed;
  return `${trimmed.slice(0, 160).trim()}…`;
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
