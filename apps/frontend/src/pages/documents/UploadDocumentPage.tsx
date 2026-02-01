import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  buttonVariants,
  cn,
} from "@repo/ui";
import { FileUp, MessageSquare, RefreshCw } from "lucide-react";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUIStore } from "../../stores/ui-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * UploadDocumentPage - create a document and store it in the database.
 *
 * Sends POST /api/documents with title/content/metadata.
 */
export function UploadDocumentPage() {
  const { openChatSlideOver } = useUIStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const isSubmitting = status === "uploading";
  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const statusBadge = useMemo(() => {
    if (status === "success") {
      return <Badge className="bg-emerald-500/10 text-emerald-700">Saved</Badge>;
    }
    if (status === "error") {
      return <Badge className="bg-rose-500/10 text-rose-700">Error</Badge>;
    }
    if (status === "uploading") {
      return (
        <Badge className="bg-amber-500/10 text-amber-700">Uploading</Badge>
      );
    }
    return <Badge variant="secondary">Draft</Badge>;
  }, [status]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContent(text);
      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(baseName);
      }
      setError(null);
      setStatus("idle");
    } catch (err) {
      setError("Unable to read that file. Please try a text-based file.");
      setStatus("error");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setStatus("uploading");
    setError(null);
    setCreatedId(null);

    let metadataValue: Record<string, unknown> | undefined;
    if (metadata.trim()) {
      try {
        metadataValue = JSON.parse(metadata) as Record<string, unknown>;
      } catch (err) {
        setStatus("error");
        setError("Metadata must be valid JSON (or leave it empty).");
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          metadata: metadataValue,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Upload failed. Please try again.";
        throw new Error(message);
      }

      const payload = (await response.json()) as { id?: string };
      setCreatedId(payload.id ?? null);
      setStatus("success");
      navigate("/documents");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setMetadata("");
    setError(null);
    setCreatedId(null);
    setStatus("idle");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold">
              Upload a document
            </h1>
            <p className="text-sm text-muted-foreground">
              Your document is stored in Postgres and embedded for RAG search.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document details</CardTitle>
              {statusBadge}
            </div>
            <CardDescription>
              Add a title and paste or upload the content to index it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="document-title"
                >
                  Title
                </label>
                <Input
                  id="document-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Pizza Dough Guide"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="document-file"
                >
                  Upload a text file (optional)
                </label>
                <input
                  id="document-file"
                  type="file"
                  accept=".txt,.md,.markdown,.csv,.json"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="document-content"
                >
                  Content
                </label>
                <textarea
                  id="document-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste the document text here..."
                  rows={10}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Content is chunked and embedded automatically when saved.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="document-metadata"
                >
                  Metadata (optional JSON)
                </label>
                <textarea
                  id="document-metadata"
                  value={metadata}
                  onChange={(event) => setMetadata(event.target.value)}
                  placeholder='{"source":"syllabus","course":"Math 101"}'
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {createdId && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Document stored with id:{" "}
                  <span className="font-mono">{createdId}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload document"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-2">Reset</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ask questions right away</CardTitle>
            <CardDescription>
              Open the chat to ask about your newly uploaded document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Tip: If your backend is wired for RAG, Chat can use the embeddings
              saved from this upload.
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={openChatSlideOver} variant="outline">
                <MessageSquare className="h-4 w-4" />
                <span className="ml-2">Open Quick Chat</span>
              </Button>
              <Link
                to="/chat"
                className={cn(buttonVariants(), "justify-center")}
              >
                Go to full chat page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
