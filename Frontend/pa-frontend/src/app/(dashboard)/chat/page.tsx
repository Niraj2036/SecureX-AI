"use client";

import { useMemo, useState } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const starterMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hi, I am your chatbot UI. Ask me anything.",
  },
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => prompt.trim().length > 0 && !isLoading, [prompt, isLoading]);

  const handleSend = async () => {
    if (!canSend) return;

    const userText = prompt.trim();
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userText,
    };

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

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer || "Sorry, I couldn't process that.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, there was an error connecting to the AI service.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 w-full h-full">
      <Card className="max-w-4xl w-full h-[calc(100vh-8rem)] mx-auto flex flex-col">
        <CardHeader>
          <CardTitle>Chatbot</CardTitle>
          
        </CardHeader>

        <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
          <ScrollArea className="flex-1 rounded-md border p-4 bg-white">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-slate-100 text-slate-900 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your question..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!canSend} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
