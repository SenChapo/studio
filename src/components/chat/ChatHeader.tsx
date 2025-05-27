
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, LogIn, LogOut, Settings, UserCircle, FileText, FileJson, PanelLeft } from "lucide-react";
import { CunenkLogo } from "@/components/icons/CunenkLogo"; // Updated import
import type { ChatMessage } from "@/lib/chat-export";
import { exportChatAsTxt, exportChatAsJson } from "@/lib/chat-export";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";


interface ChatHeaderProps {
  messages: ChatMessage[];
}

export function ChatHeader({ messages }: ChatHeaderProps) {
  const { user, signIn, signOut, isLoading, isMounted, updateAvatar } = useMockAuth();
  const { toast } = useToast();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrlInput(user.avatar);
    }
  }, [user, isSettingsDialogOpen]);


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

  const handleSaveSettings = () => {
    if (user && avatarUrlInput.trim()) {
      try {
        // Basic URL validation (can be more sophisticated)
        new URL(avatarUrlInput.trim());
        updateAvatar(avatarUrlInput.trim());
        toast({
          title: "Pengaturan Disimpan",
          description: "Foto profil berhasil diperbarui.",
        });
        setIsSettingsDialogOpen(false);
      } catch (error) {
        toast({
          title: "URL Tidak Valid",
          description: "Harap masukkan URL gambar yang valid.",
          variant: "destructive",
        });
      }
    } else if (user && !avatarUrlInput.trim()) {
        // If input is empty, reset to a default or placeholder if desired, or show error
        // For now, just a toast. Could also reset to a default placeholder.
        toast({
          title: "URL Kosong",
          description: "URL foto profil tidak boleh kosong. Untuk menghapus, gunakan URL placeholder.",
          variant: "destructive",
        });
    }
  };


  return (
    <>
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center gap-2">
          <SidebarTrigger> {/* Removed md:hidden to make it always visible */}
             <PanelLeft className="h-5 w-5"/>
          </SidebarTrigger>
          <CunenkLogo />
        </div>
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
                    <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
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

      {user && (
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pengaturan Akun</DialogTitle>
              <DialogDescription>
                Perbarui informasi profil Anda. Masukkan URL gambar untuk foto profil.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL Foto Profil</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
                 <p className="text-xs text-muted-foreground">
                  Tempelkan link URL gambar. Unggah file belum didukung.
                </p>
              </div>
              {avatarUrlInput && (
                <div className="space-y-2">
                  <Label>Pratinjau Foto Profil</Label>
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrlInput} alt="Pratinjau avatar" data-ai-hint="profile avatar preview"/>
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveSettings}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
