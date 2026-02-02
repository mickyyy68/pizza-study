import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";

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
 * Compact model selector pill with dropdown.
 * Shows the current model name; clicking reveals available options.
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

  const selectedModel =
    models.find((m) => m.id === selectedModelId) || models[0];

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, models, selectedIndex, onSelectModel]);

  // Reset selected index when opening
  React.useEffect(() => {
    if (isOpen) {
      const currentIndex = models.findIndex((m) => m.id === selectedModelId);
      setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, models, selectedModelId]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-model-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, selectedIndex]);

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
          "text-xs font-medium",
          "border bg-background",
          "transition-colors duration-150",
          "hover:border-primary/50 hover:bg-muted/50",
          isOpen && "border-primary/50 bg-muted/50",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[120px]">{selectedModel?.name}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Select a model"
          className={cn(
            "absolute bottom-full left-0 mb-2 z-50",
            "w-64 max-h-72 overflow-y-auto",
            "rounded-lg border bg-popover shadow-lg",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-150",
          )}
        >
          <div className="p-1">
            {models.map((model, index) => (
              <button
                key={model.id}
                type="button"
                role="option"
                data-model-item
                aria-selected={model.id === selectedModelId}
                onClick={() => handleSelect(model.id)}
                title={model.id}
                className={cn(
                  "flex flex-col w-full rounded-md px-3 py-2 text-left",
                  "transition-colors",
                  "focus:outline-none",
                  index === selectedIndex
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span className="font-medium text-sm">{model.name}</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
