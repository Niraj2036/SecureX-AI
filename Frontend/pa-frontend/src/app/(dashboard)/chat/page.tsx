"use client";

import { useMemo, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

function getMockAnswer(question: string): string {
  const normalized = question.toLowerCase();

  if (normalized.includes("okr")) {
    return "You can create, track, and update OKRs from the OKR Management section.";
  }

  if (normalized.includes("employee")) {
    return "Employee details and profile actions are available under Employee Management.";
  }

  if (normalized.includes("report") || normalized.includes("analytics")) {
    return "Reports and analytics are available in the sidebar under Report and Analytics.";
  }

  return "This is a frontend-only chat UI right now. Backend response integration can be added later.";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [prompt, setPrompt] = useState("");

  const canSend = useMemo(() => prompt.trim().length > 0, [prompt]);

  const handleSend = () => {
    if (!canSend) return;

    const userText = prompt.trim();
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userText,
    };

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: getMockAnswer(userText),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setPrompt("");
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
