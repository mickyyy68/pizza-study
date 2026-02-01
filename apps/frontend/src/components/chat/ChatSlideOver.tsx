import { useChat } from "@ai-sdk/react";
import { BookOpen02Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChatInput,
  ChatMessage,
  SlideOver,
  SlideOverContent,
  SlideOverFooter,
  SlideOverHeader,
} from "@repo/ui";
import { type ChangeEvent, useEffect, useRef } from "react";
import { useUIStore } from "../../stores/ui-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * ChatSlideOver - Quick chat panel for Pizza Study.
 *
 * Opens with Cmd/Ctrl + K shortcut.
 * Provides quick access to AI chat without leaving the current page.
 */
export function ChatSlideOver() {
  const { chatSlideOverOpen, closeChatSlideOver } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the AI SDK chat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `${API_URL}/api/chat`,
    });

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages triggers scroll when new messages arrive
  useEffect(() => {
    if (chatSlideOverOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatSlideOverOpen]);

  const onSubmit = () => {
    if (input.trim()) {
      handleSubmit();
    }
  };

  return (
    <SlideOver
      open={chatSlideOverOpen}
      onClose={closeChatSlideOver}
      side="right"
      size="md"
    >
      <SlideOverHeader onClose={closeChatSlideOver}>
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={SparklesIcon}
            size={18}
            className="text-primary"
          />
          <span>Quick Chat</span>
        </div>
      </SlideOverHeader>

      <SlideOverContent className="flex flex-col gap-4">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <HugeiconsIcon icon={BookOpen02Icon} size={32} />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">
              How can I help you study?
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Ask me questions about your documents, request quizzes, or get
              help understanding concepts.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            variant={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <ChatMessage
            variant="assistant"
            content=""
            isStreaming
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </SlideOverContent>

      <SlideOverFooter>
        <ChatInput
          value={input}
          onChange={(value) =>
            handleInputChange({
              target: { value },
            } as ChangeEvent<HTMLTextAreaElement>)
          }
          onSubmit={onSubmit}
          placeholder="Ask a question..."
          isLoading={isLoading}
        />
      </SlideOverFooter>
    </SlideOver>
  );
}
