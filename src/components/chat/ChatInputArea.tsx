
'use client';

import { useState, type FormEvent, useRef, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Image as ImageIcon } from "lucide-react";

interface ChatInputAreaProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isDisabled?: boolean;
}

export function ChatInputArea({ onSendMessage, isLoading, isDisabled }: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isDisabled) {
      await onSendMessage(inputValue.trim());
      setInputValue("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (isDisabled) {
      setInputValue(""); // Clear input when disabled (e.g., viewing saved chat)
    }
  }, [isDisabled]);


  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start space-x-2 p-4 border-t bg-card animate-fade-in-up"
    >
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? "Melihat riwayat obrolan. Mulai obrolan baru untuk mengirim pesan." : "Tanya Hibeur AI..."}
        className="flex-grow resize-none max-h-40 min-h-[40px] text-base"
        rows={1}
        disabled={isLoading || isDisabled}
        aria-label="Input obrolan"
      />
      <Link href="/summarize-image" passHref legacyBehavior>
        <Button asChild variant="outline" size="icon" aria-label="Ringkas Gambar" className="shrink-0" disabled={isDisabled}>
          <a><ImageIcon className="h-5 w-5" /></a>
        </Button>
      </Link>
      <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || isDisabled} aria-label="Kirim pesan" className="shrink-0">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
