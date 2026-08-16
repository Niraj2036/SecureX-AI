"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const starterMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hi! I'm your AI assistant. Ask me anything about your organization, employees, documents, or data.",
  },
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => prompt.trim().length > 0 && !isLoading, [prompt, isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!canSend) return;

    const userText = prompt.trim();
    const userMessage: Message = { id: Date.now(), role: "user", content: userText };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rag/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ question: userText }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer || "Sorry, I couldn't process that.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, there was an error connecting to the AI service." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      <V3PageHeader
        title="AI Assistant"
        description="Ask questions about your organization, employees, and documents."
        badgeText="Powered by AI"
        badgeIcon={<Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
      />

      {/* Chat Container */}
      <div className="v3-card flex flex-col flex-1 overflow-hidden p-0 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                }`}
              >
                {message.content}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-500/20">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-muted text-muted-foreground border border-border/50 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border/60 p-4 flex items-center gap-2 bg-background/50">
          <input
            type="text"
            placeholder="Ask anything about your organization..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 h-10 rounded-xl border border-border/80 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}