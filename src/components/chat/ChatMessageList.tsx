
'use client';

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat-export";
import { ChatMessageItem } from "./ChatMessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define User type to match useMockAuth
type User = { name: string; avatar: string } | null;

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoadingAiResponse: boolean;
  loadingText?: string;
  onInitiateSaveNote?: (content: string) => void;
  user: User; // Add user prop
}

export function ChatMessageList({ messages, isLoadingAiResponse, loadingText = "Cunenk sedang berpikir...", onInitiateSaveNote, user }: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      if (messages.length > 0 || isLoadingAiResponse) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }
  }, [messages, isLoadingAiResponse]);

  return (
    <ScrollArea className="flex-grow" ref={scrollAreaRef}>
      {messages.length === 0 && !isLoadingAiResponse ? (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center" ref={viewportRef}>
          <div className="p-8 rounded-lg bg-card shadow-xl max-w-lg border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-80"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
              <path d="M12 22V12"/>
              <path d="m7 12.5 10 5"/>
              <path d="m7 7.5 10 5"/>
            </svg>
            <h2 className="text-2xl font-semibold mb-3 text-primary">Selamat Datang di Cunenk AI!</h2>
            <p className="text-muted-foreground text-base">
              Saya adalah asisten virtual Anda. <br />
              Silakan ajukan pertanyaan atau topik yang ingin Anda diskusikan.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2" ref={viewportRef}>
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} onInitiateSaveNote={onInitiateSaveNote} user={user} />
          ))}
          {isLoadingAiResponse && (
            <ChatMessageItem
              key="loading"
              message={{
                id: "loading-indicator",
                role: "ai",
                content: loadingText,
                timestamp: new Date(),
              }}
              user={null} // AI messages don't need user prop for avatar
            />
          )}
        </div>
      )}
    </ScrollArea>
  );
}

    