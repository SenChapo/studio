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
        title: "Kesalahan Ekspor",
        description: "Tidak ada pesan untuk diekspor.",
        variant: "destructive",
      });
      return;
    }
    if (format === "txt") {
      exportChatAsTxt(messages, "id");
    } else {
      exportChatAsJson(messages, "id");
    }
    toast({
      title: "Ekspor Berhasil",
      description: `Riwayat obrolan diekspor sebagai ${format.toUpperCase()}.`,
    });
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <LuminaLogo />
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ekspor obrolan">
              <Download className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ekspor Obrolan</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("txt")}>
              <FileText className="mr-2 h-4 w-4" />
              Ekspor sebagai TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <FileJson className="mr-2 h-4 w-4" />
              Ekspor sebagai JSON
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
                    Pengaturan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} disabled={isLoading}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={signIn} disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
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
