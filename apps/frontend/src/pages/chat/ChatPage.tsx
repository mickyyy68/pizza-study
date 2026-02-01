import { useChat } from "@ai-sdk/react";
import { Avatar, ChatInput, ChatMessage, cn } from "@repo/ui";
import { BookOpen, HelpCircle, Lightbulb, Sparkles } from "lucide-react";
import { type ChangeEvent, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * ChatPage - Full-page chat for Pizza Study.
 *
 * Features:
 * - Full conversation history
 * - Rich message rendering
 * - Suggested prompts when empty
 */
export function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `${API_URL}/api/chat`,
    });

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages triggers scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = () => {
    if (input.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-auto px-4 py-6">
        <div className="mx-auto w-full max-w-4xl">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleInputChange} />
          ) : (
            <div className="space-y-6 pb-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  variant={message.role as "user" | "assistant"}
                  content={message.content}
                  avatar={
                    message.role === "assistant" ? (
                      <Avatar size="md" fallback="AI" />
                    ) : (
                      <Avatar size="md" fallback="You" />
                    )
                  }
                />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <ChatMessage
                  variant="assistant"
                  content=""
                  isStreaming
                  avatar={<Avatar size="md" fallback="AI" />}
                />
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="mx-auto w-full max-w-4xl">
          <ChatInput
            value={input}
            onChange={(value) =>
              handleInputChange({
                target: { value },
              } as ChangeEvent<HTMLTextAreaElement>)
            }
            onSubmit={onSubmit}
            placeholder="Ask anything about your studies..."
            isLoading={isLoading}
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  onSuggestionClick: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Welcome screen shown when chat is empty.
 */
function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = [
    {
      icon: Lightbulb,
      title: "Explain a concept",
      prompt: "Can you explain the concept of integration by parts?",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: BookOpen,
      title: "Quiz me",
      prompt: "Quiz me on Newton's Laws of Motion",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: HelpCircle,
      title: "Help with homework",
      prompt: "I'm stuck on a calculus problem. Can you help?",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const handleSuggestionClick = (prompt: string) => {
    onSuggestionClick({
      target: { value: prompt },
    } as ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10">
      {/* Logo/Icon */}
      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl font-bold mb-2">
        How can I help you study?
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Ask me questions, request explanations, get quizzed on topics, or
        explore concepts from your documents.
      </p>

      {/* Suggestions */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion.title}
            onClick={() => handleSuggestionClick(suggestion.prompt)}
            className="group p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                suggestion.color,
              )}
            >
              <suggestion.icon className="h-5 w-5" />
            </div>
            <p className="font-medium text-sm group-hover:text-primary transition-colors">
              {suggestion.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              "{suggestion.prompt}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
