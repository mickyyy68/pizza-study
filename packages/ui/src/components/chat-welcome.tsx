import {
  BookOpen01Icon,
  BulbIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { cn } from "../lib/utils";

/* =============================================================================
   Types
   ============================================================================= */

export interface SuggestionCard {
  id: string;
  icon: React.ReactNode;
  iconColorClass: string;
  title: string;
  description: string;
  prompt: string;
}

export interface ChatWelcomeProps {
  /** Callback when a suggestion card is clicked */
  onSelectPrompt?: (prompt: string) => void;
  /** Optional custom suggestions (defaults to standard 3) */
  suggestions?: SuggestionCard[];
  /** Additional className for the container */
  className?: string;
}

/* =============================================================================
   Default Suggestions
   ============================================================================= */

const defaultSuggestions: SuggestionCard[] = [
  {
    id: "explain",
    icon: <HugeiconsIcon icon={BulbIcon} size={24} />,
    iconColorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 group-hover:bg-yellow-500/20",
    title: "Explain a concept",
    description: '"Can you explain the concept of integration by parts?"',
    prompt: "Can you explain the concept of integration by parts?",
  },
  {
    id: "quiz",
    icon: <HugeiconsIcon icon={BookOpen01Icon} size={24} />,
    iconColorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-500 group-hover:bg-blue-500/20",
    title: "Quiz me",
    description: '"Quiz me on Newton\'s Laws of Motion with 5 questions."',
    prompt: "Quiz me on Newton's Laws of Motion with 5 questions.",
  },
  {
    id: "homework",
    icon: <HugeiconsIcon icon={HelpCircleIcon} size={24} />,
    iconColorClass: "bg-green-500/10 text-green-600 dark:text-green-500 group-hover:bg-green-500/20",
    title: "Help with homework",
    description: '"I\'m stuck on a calculus problem. Can you guide me?"',
    prompt: "I'm stuck on a calculus problem. Can you guide me?",
  },
];

/* =============================================================================
   Sub-components
   ============================================================================= */

interface SuggestionCardComponentProps {
  suggestion: SuggestionCard;
  onClick?: () => void;
}

function SuggestionCardComponent({ suggestion, onClick }: SuggestionCardComponentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative p-6 rounded-2xl text-left",
        "border border-border bg-card/30",
        "hover:bg-card transition-all duration-300",
        "hover:shadow-glow hover:-translate-y-1",
        // Focus styles match hover for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "focus-visible:bg-card focus-visible:shadow-glow focus-visible:-translate-y-1",
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors",
          suggestion.iconColorClass,
        )}
      >
        {suggestion.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {suggestion.title}
      </h3>

      {/* Description/example */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {suggestion.description}
      </p>
    </button>
  );
}

/* =============================================================================
   Main Component
   ============================================================================= */

/**
 * ChatWelcome - Welcome/empty state for the chat page.
 *
 * Displays a hero section with greeting and suggestion cards
 * that users can click to populate the chat input.
 */
export function ChatWelcome({
  onSelectPrompt,
  suggestions = defaultSuggestions,
  className,
}: ChatWelcomeProps) {
  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto space-y-12",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      {/* Hero section */}
      <div className="space-y-4">
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-tight text-foreground">
          How can I help you{" "}
          <span className="text-gradient-primary">study?</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-light">
          Ask me questions, request explanations, or build study plans using
          your saved documents. I&apos;m here to make learning delicious.
        </p>
      </div>

      {/* Suggestions section */}
      <section className="space-y-4" aria-labelledby="suggestions-heading">
        <p
          id="suggestions-heading"
          className="text-sm font-medium uppercase tracking-widest text-muted-foreground opacity-60"
        >
          Start with
        </p>

        {/* Suggestion cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group">
          {suggestions.map((suggestion) => (
            <SuggestionCardComponent
              key={suggestion.id}
              suggestion={suggestion}
              onClick={() => onSelectPrompt?.(suggestion.prompt)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
