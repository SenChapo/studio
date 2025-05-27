'use client';

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat-export";
import { ChatMessageItem } from "./ChatMessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoadingAiResponse: boolean;
}

export function ChatMessageList({ messages, isLoadingAiResponse }: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoadingAiResponse]);

  return (
    <ScrollArea className="flex-grow" ref={scrollAreaRef}>
      <div className="p-4 space-y-2" ref={viewportRef}>
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoadingAiResponse && (
          <ChatMessageItem
            key="loading"
            message={{
              id: "loading-indicator",
              role: "ai",
              content: "Lumina is thinking...",
              timestamp: new Date(),
            }}
          />
        )}
      </div>
    </ScrollArea>
  );
}
