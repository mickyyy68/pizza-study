import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, } from "@repo/ui";
import { useChat } from "../hooks/useChat";
export default function Home() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
    return (_jsx("div", { className: "container mx-auto max-w-2xl p-4", children: _jsxs(Card, { className: "mb-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pizza Study Chat" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4 mb-4 max-h-96 overflow-y-auto", children: [messages.map((message) => (_jsxs("div", { className: `p-3 rounded-lg ${message.role === "user"
                                        ? "bg-primary-100 ml-8"
                                        : "bg-gray-100 mr-8"}`, children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: message.role === "user" ? "You" : "Assistant" }), _jsx("div", { className: "text-sm whitespace-pre-wrap", children: message.content })] }, message.id))), isLoading && (_jsxs("div", { className: "p-3 rounded-lg bg-gray-100 mr-8", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Assistant" }), _jsx("div", { className: "text-sm text-gray-400", children: "Thinking..." })] }))] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2", children: [_jsx(Input, { value: input, onChange: handleInputChange, placeholder: "Type your message...", disabled: isLoading, className: "flex-1" }), _jsx(Button, { type: "submit", disabled: isLoading || !input.trim(), children: "Send" })] })] })] }) }));
}
