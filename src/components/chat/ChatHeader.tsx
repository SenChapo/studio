import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, LogIn, LogOut, Settings, UserCircle, FileText, FileJson } from "lucide-react";
import { LuminaLogo } from "@/components/icons/LuminaLogo";
import type { ChatMessage } from "@/lib/chat-export";
import { exportChatAsTxt, exportChatAsJson } from "@/lib/chat-export";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useToast } from "@/hooks/use-toast";

interface ChatHeaderProps {
  messages: ChatMessage[];
}

export function ChatHeader({ messages }: ChatHeaderProps) {
  const { user, signIn, signOut, isLoading, isMounted } = useMockAuth();
  const { toast } = useToast();

  const handleExport = (format: "txt" | "json") => {
    if (messages.length === 0) {
      toast({
        title: "Export Error",
        description: "There are no messages to export.",
        variant: "destructive",
      });
      return;
    }
    if (format === "txt") {
      exportChatAsTxt(messages);
    } else {
      exportChatAsJson(messages);
    }
    toast({
      title: "Export Successful",
      description: `Chat log exported as ${format.toUpperCase()}.`,
    });
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <LuminaLogo />
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Export chat">
              <Download className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Chat</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("txt")}>
              <FileText className="mr-2 h-4 w-4" />
              Export as TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <FileJson className="mr-2 h-4 w-4" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isMounted && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile avatar" />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} disabled={isLoading}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={signIn} disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </>
        )}
        {!isMounted && (
            <Button variant="outline" disabled size="icon">
                <UserCircle className="h-5 w-5 animate-pulse" />
            </Button>
        )}
      </div>
    </header>
  );
}
