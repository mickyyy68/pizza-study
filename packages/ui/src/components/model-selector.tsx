import {
  ArrowDown01Icon,
  AiBrain01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { BottomSheet } from "./bottom-sheet";

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface ModelSelectorProps {
  models: Model[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
}

/**
 * Refined model selector with dropdown on desktop, bottom sheet on mobile.
 * Features a subtle trigger that expands to show model options.
 */
export function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
  className,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const selectedModel =
    models.find((m) => m.id === selectedModelId) || models[0];

  // Close on click outside (desktop only)
  React.useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Keyboard navigation (desktop only)
  React.useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % models.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + models.length) % models.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          onSelectModel(models[selectedIndex].id);
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile, models, selectedIndex, onSelectModel]);

  // Reset selected index when opening
  React.useEffect(() => {
    if (isOpen) {
      const currentIndex = models.findIndex((m) => m.id === selectedModelId);
      setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, models, selectedModelId]);

  // Scroll selected item into view (desktop)
  React.useEffect(() => {
    if (isOpen && !isMobile && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-model-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, isMobile, selectedIndex]);

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  const renderModelList = (forMobile: boolean) => (
    <div className={cn("py-1.5", forMobile && "pb-4")}>
      {models.map((model, index) => {
        const isSelected = model.id === selectedModelId;
        const isHighlighted = !forMobile && index === selectedIndex;

        return (
          <button
            key={model.id}
            type="button"
            role="option"
            data-model-item
            aria-selected={isSelected}
            onClick={() => handleSelect(model.id)}
            className={cn(
              "relative w-full text-left transition-all duration-150",
              "focus:outline-none",
              forMobile ? "px-4 py-3.5" : "px-4 py-3",
              isHighlighted && "bg-primary/8",
              !isHighlighted && "hover:bg-muted/40",
            )}
          >
            {/* Selection indicator - left accent line */}
            {isSelected && (
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 pl-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-primary" : "text-foreground/90",
                    )}
                  >
                    {model.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {model.description}
                </p>
              </div>
              {isSelected && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={16}
                  className="text-primary shrink-0 mt-0.5"
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button - seal/stamp aesthetic */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2",
          // Pill shape with decorative styling
          "h-8 pl-3 pr-2.5 rounded-lg",
          "border border-primary/20",
          "bg-gradient-to-br from-primary/5 to-transparent",
          // Typography
          "text-sm font-medium text-foreground/80",
          "transition-all duration-200",
          // Hover state
          "hover:border-primary/40 hover:bg-primary/8",
          "hover:text-foreground",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          // Open state
          isOpen && "border-primary/50 bg-primary/10 text-foreground shadow-sm",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Model icon - decorative element */}
        <span
          className={cn(
            "ml-1 size-5 rounded-md flex items-center justify-center",
            "bg-primary/10 text-primary",
            "transition-colors duration-200",
            isOpen && "bg-primary/20",
          )}
        >
          <HugeiconsIcon icon={AiBrain01Icon} size={12} />
        </span>

        <span className="truncate max-w-[100px]">{selectedModel?.name}</span>

        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={cn(
            "text-muted-foreground/60 transition-transform duration-200",
            isOpen && "rotate-180 text-primary/60",
          )}
        />
      </button>

      {/* Desktop dropdown - opens upward */}
      {isOpen && !isMobile && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Select a model"
          className={cn(
            "absolute left-0 z-50",
            "w-80 max-h-96 overflow-hidden",
            "rounded-xl border border-border/40 bg-popover/98 backdrop-blur-md",
            "shadow-xl shadow-black/15",
            "animate-in fade-in-0 slide-in-from-bottom-3 zoom-in-98 duration-200",
            "p-2",
          )}
          style={{ bottom: "calc(100% + 0.5rem)" }}
        >
          {/* Decorative header */}
          <div className="relative px-4 py-3.5 border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-t-lg">
            {/* Decorative top line */}
            <div
              className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              aria-hidden="true"
            />

            <div className="flex items-center gap-2">
              <span className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={AiBrain01Icon}
                  size={14}
                  className="text-primary"
                />
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Model
              </span>
            </div>
          </div>

          {/* Model list */}
          <div className="overflow-y-auto max-h-72 rounded-b-lg">
            {renderModelList(false)}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <BottomSheet
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Select model"
        >
          {renderModelList(true)}
        </BottomSheet>
      )}
    </div>
  );
}
