import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { useChat } from "../hooks/useChat";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Pizza Study Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary-100 ml-8"
                    : "bg-gray-100 mr-8"
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {message.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-gray-100 mr-8">
                <div className="text-xs text-gray-500 mb-1">Assistant</div>
                <div className="text-sm text-gray-400">Thinking...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
