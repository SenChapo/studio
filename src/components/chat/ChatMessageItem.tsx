
import type { ChatMessage } from "@/lib/chat-export";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added AvatarImage
import { Bot, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedTextRenderer } from "@/components/shared/FormattedTextRenderer";

// Define User type to match useMockAuth
type UserAuth = { name: string; avatar: string } | null;

interface ChatMessageItemProps {
  message: ChatMessage;
  onInitiateSaveNote?: (content: string) => void;
  user: UserAuth; // Add user prop
}

const CodeBlock = ({ codeContent }: { codeContent: string }) => {
  return (
    <pre className="bg-muted p-3 my-2 rounded-md overflow-x-auto shadow-inner">
      <code className="font-mono text-sm text-muted-foreground">{codeContent}</code>
    </pre>
  );
};

export function ChatMessageItem({ message, onInitiateSaveNote, user }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const botAvatarUrl = "https://i.imgur.com/Zytm8Lw.jpeg"; // Updated bot avatar URL

  const parts = message.content.split(/(```(?:[\w-]+)?\n[\s\S]*?\n```)/g).filter(part => part.trim() !== '');

  return (
    <div
      className={cn(
        "flex items-start space-x-3 py-3",
        isUser ? "justify-end animate-slide-in-right" : "justify-start animate-slide-in-left"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarImage src={botAvatarUrl} alt="Hibeur AI Avatar" data-ai-hint="bot avatar" />
          <AvatarFallback><Bot className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-lg shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-bl-none" // Updated for AI messages
        )}
      >
        <div className="text-sm animate-content-fade-in">
          {parts.map((part, index) => {
            if (part.startsWith("```")) {
              const codeContent = part.replace(/```(?:[\w-]+)?\n/, "").replace(/\n```$/, "");
              return <CodeBlock key={`${message.id}-code-${index}`} codeContent={codeContent} />;
            }
            return <FormattedTextRenderer key={`${message.id}-text-${index}`} content={part} className={!isUser ? "text-primary-foreground" : ""} />;
          })}
        </div>
        <div className="flex justify-between items-center mt-2 animate-content-fade-in" style={{ animationDelay: '0.2s' /* slight delay for footer too */}}>
          <p className={cn(
              "text-xs",
              isUser ? "text-primary-foreground/70" : "text-primary-foreground/80" // Adjusted opacity for AI timestamp
            )}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!isUser && onInitiateSaveNote && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20" // Adjusted for contrast on gradient
              onClick={() => onInitiateSaveNote(message.content)}
              title="Simpan ke Catatan"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Simpan
            </Button>
          )}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          {user?.avatar && (
            <AvatarImage src={user.avatar} alt={user.name || "User"} data-ai-hint="chat avatar" />
          )}
          <AvatarFallback>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
