
'use client';

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat-export";
import { ChatMessageItem } from "./ChatMessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react"; // Changed from HibeurLogo to Layers icon

type User = { name: string; avatar: string } | null;

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoadingAiResponse: boolean;
  loadingText?: string;
  onInitiateSaveNote?: (content: string) => void;
  user: User;
  isViewingSavedChat?: boolean;
}

export function ChatMessageList({ 
  messages, 
  isLoadingAiResponse, 
  loadingText = "Hibeur sedang berpikir...", 
  onInitiateSaveNote, 
  user,
  isViewingSavedChat 
}: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      if (messages.length > 0 || isLoadingAiResponse) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }
  }, [messages, isLoadingAiResponse]);

  const showWelcomeMessage = messages.length === 0 && !isLoadingAiResponse && !isViewingSavedChat;

  return (
    <ScrollArea className="flex-grow" ref={scrollAreaRef}>
      {showWelcomeMessage ? (
         <div className="h-full flex flex-col items-center justify-center text-center p-4">
          <div className="p-8 rounded-lg bg-card shadow-2xl max-w-md border border-primary/30">
            <Layers className="mx-auto mb-6 h-16 w-16 text-primary opacity-90" />
            <h2 className="text-2xl font-bold text-primary mb-4"> {/* Ukuran font diubah dari text-3xl ke text-2xl */}
              Selamat Datang di Hibeur AI!
            </h2>
            <p className="text-muted-foreground text-base mb-1">
              Saya adalah asisten virtual Anda.
            </p>
            <p className="text-muted-foreground text-base">
              Silakan ajukan pertanyaan atau topik yang ingin Anda diskusikan.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2" ref={viewportRef}>
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} onInitiateSaveNote={onInitiateSaveNote} user={user} />
          ))}
          {isLoadingAiResponse && !isViewingSavedChat && ( // Only show loading if not viewing saved chat
            <ChatMessageItem
              key="loading"
              message={{
                id: "loading-indicator",
                role: "ai",
                content: loadingText,
                timestamp: new Date(),
              }}
              user={null}
            />
          )}
        </div>
      )}
    </ScrollArea>
  );
}
