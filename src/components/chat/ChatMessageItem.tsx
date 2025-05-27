import type { ChatMessage } from "@/lib/chat-export";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
}

// Basic markdown code block parser
const CodeBlock = ({ codeContent }: { codeContent: string }) => {
  return (
    <pre className="bg-muted p-3 my-2 rounded-md overflow-x-auto shadow-inner">
      <code className="font-mono text-sm text-muted-foreground">{codeContent}</code>
    </pre>
  );
};

const TextBlock = ({ textContent }: { textContent: string }) => {
  // Replace multiple newlines with a single <br /> for paragraph-like spacing
  // And preserve single newlines for intentional line breaks
  const paragraphs = textContent.split(/(\n\s*\n)/).map((paragraph, index) => {
    if (paragraph.match(/(\n\s*\n)/)) { // This is a separator (multiple newlines)
      return <div key={`sep-${index}`} className="h-2"></div>; // Render as small vertical space
    }
    if (paragraph.trim() === '') return null;
    return (
      <p key={index} className="whitespace-pre-wrap leading-relaxed">
        {paragraph}
      </p>
    );
  }).filter(Boolean);
  
  return <>{paragraphs}</>;
};


export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  
  const parts = message.content.split(/(```(?:[\w-]+)?\n[\s\S]*?\n```)/g).filter(part => part.trim() !== '');

  return (
    <div
      className={cn(
        "flex items-start space-x-3 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarFallback><Bot className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-lg shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        <div className="text-sm">
          {parts.map((part, index) => {
            if (part.startsWith("```")) {
              const codeContent = part.replace(/```(?:[\w-]+)?\n/, "").replace(/\n```$/, "");
              return <CodeBlock key={`${message.id}-code-${index}`} codeContent={codeContent} />;
            }
            return <TextBlock key={`${message.id}-text-${index}`} textContent={part} />;
          })}
        </div>
        <p className={cn(
            "text-xs mt-2",
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
