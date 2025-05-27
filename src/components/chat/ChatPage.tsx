
'use client';

import { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputArea } from './ChatInputArea';
import type { ChatMessage } from '@/lib/chat-export';
import { getAiResponse } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Add initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'ai',
        content: 'Halo! Saya Lumina AI. Ada yang bisa saya bantu hari ini?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (prompt: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse({ prompt });
      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }
      if (aiResponse.text) {
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: aiResponse.text,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
         throw new Error("Respon AI kosong.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
      toast({
        title: "Error",
        description: `Gagal mendapatkan respon AI: ${errorMessage}`,
        variant: "destructive",
      });
      // Optionally add an error message to the chat
      const errorAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: `Maaf, saya mengalami kesalahan: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader messages={messages} />
      <ChatMessageList messages={messages} isLoadingAiResponse={isLoading} loadingText="Lumina sedang berpikir..." />
      <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
