import { Badge, Button, Card, CardContent, cn, Input } from "@repo/ui";
import { File, FolderOpen, Grid, List, Search, X } from "lucide-react";
import { allTags } from "../../mock/documents";
import { useDocumentsStore } from "../../stores/documents-store";

/**
 * DocumentsPage - Document library for Pizza Study.
 *
 * Features:
 * - Folder tree navigation
 * - Tag filtering
 * - Search
 * - Grid/list view toggle
 */
export function DocumentsPage() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedTags,
    selectedFolderId,
    setSelectedFolder,
    getFilteredDocuments,
    getFolderChildren,
    getFolderPath,
  } = useDocumentsStore();

  const documents = getFilteredDocuments();
  const rootFolders = getFolderChildren(null);
  const folderPath = getFolderPath(selectedFolderId);

  return (
    <div className="flex h-full">
      {/* Sidebar - Folders & Tags */}
      <aside className="w-64 border-r border-border bg-muted/30 p-4 hidden md:block">
        {/* Folders */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Folders
          </h3>
          <button
            type="button"
            onClick={() => setSelectedFolder(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
              "transition-colors duration-150",
              selectedFolderId === null
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <FolderOpen className="h-4 w-4" />
            All Documents
          </button>
          <FolderTree folders={rootFolders} level={0} />
        </div>

        {/* Tags */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Tags
          </h3>
          <TagCloud />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* View toggle */}
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

          {/* Breadcrumb */}
          {folderPath.length > 0 && (
            <nav className="flex items-center gap-1 mt-3 text-sm">
              <button
                type="button"
                onClick={() => setSelectedFolder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                All
              </button>
              {folderPath.map((folder, index) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <span className="text-muted-foreground">/</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      index === folderPath.length - 1
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </nav>
          )}

          {/* Active filters */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">
                Filtering by:
              </span>
              {selectedTags.map((tag) => (
                <ActiveTagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Document Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {documents.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recursive folder tree component.
 */
function FolderTree({
  folders,
  level,
}: {
  folders: ReturnType<typeof useDocumentsStore.getState>["folders"];
  level: number;
}) {
  const { selectedFolderId, setSelectedFolder, getFolderChildren } =
    useDocumentsStore();

  return (
    <div className="space-y-1" style={{ marginLeft: `${level * 12}px` }}>
      {folders.map((folder) => {
        const children = getFolderChildren(folder.id);

        return (
          <div key={folder.id}>
            <button
              type="button"
              onClick={() => setSelectedFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                "transition-colors duration-150",
                selectedFolderId === folder.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <FolderOpen className="h-4 w-4" />
              {folder.name}
            </button>
            {children.length > 0 && (
              <FolderTree folders={children} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tag cloud component.
 */
function TagCloud() {
  const { selectedTags, toggleTag } = useDocumentsStore();

  return (
    <div className="flex flex-wrap gap-1.5">
      {allTags.slice(0, 12).map((tag) => (
        <button
          type="button"
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium transition-colors",
            selectedTags.includes(tag)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

/**
 * Active tag badge with remove button.
 */
function ActiveTagBadge({ tag }: { tag: string }) {
  const { toggleTag } = useDocumentsStore();

  return (
    <Badge
      variant="secondary"
      size="sm"
      removable
      onRemove={() => toggleTag(tag)}
    >
      {tag}
    </Badge>
  );
}

/**
 * Document card for grid view.
 */
function DocumentCard({
  document,
}: {
  document: ReturnType<typeof useDocumentsStore.getState>["documents"][0];
}) {
  const typeIcons = {
    pdf: "📄",
    note: "📝",
    "flashcard-deck": "🗂️",
    image: "🖼️",
  };

  return (
    <Card className="group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-4">
        {/* Icon & Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
            {typeIcons[document.type]}
          </div>
          <Badge variant="muted" size="sm">
            {document.type}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {document.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
          {document.tags.length > 2 && (
            <Badge variant="outline" size="sm">
              +{document.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Document row for list view.
 */
function DocumentRow({
  document,
}: {
  document: ReturnType<typeof useDocumentsStore.getState>["documents"][0];
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer">
      <File className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{document.title}</p>
        <p className="text-xs text-muted-foreground">
          {document.type} • Updated {document.updatedAt.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-1">
        {document.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" size="sm">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state component.
 */
function EmptyState() {
  const { searchQuery, selectedTags, clearTags, setSearchQuery } =
    useDocumentsStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <File className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-lg font-semibold mb-2">
        No documents found
      </h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-4">
        {searchQuery || selectedTags.length > 0
          ? "Try adjusting your search or filters"
          : "Upload some documents to get started"}
      </p>
      {(searchQuery || selectedTags.length > 0) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery("");
            clearTags();
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
