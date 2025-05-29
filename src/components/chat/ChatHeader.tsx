
'use client';

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
import { LogOut, Settings, UserCircle, PanelLeft, Save, MessageSquarePlus } from "lucide-react";
import { HibeurLogo } from "@/components/icons/CunenkLogo"; // Corrected import path
import type { ChatMessage } from "@/lib/chat-export";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";


interface ChatHeaderProps {
  messages: ChatMessage[];
  onSaveChat: () => void;
  currentChatTitle?: string | null;
  isViewingSavedChat?: boolean;
  onStartNewChat: () => void;
}

export function ChatHeader({ messages, onSaveChat, currentChatTitle, isViewingSavedChat, onStartNewChat }: ChatHeaderProps) {
  const { user, signOut, isLoading, isMounted, updateAvatar, updateName } = useMockAuth();
  const { toast } = useToast();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [nameInput, setNameInput] = useState("");


  useEffect(() => {
    if (user) {
      setAvatarUrlInput(user.avatar);
      setNameInput(user.name);
    }
  }, [user, isSettingsDialogOpen]);

  const handleSaveSettings = () => {
    if (user) {
      let avatarUpdated = false;
      let nameUpdated = false;

      if (avatarUrlInput.trim() && avatarUrlInput.trim() !== user.avatar) {
        try {
          new URL(avatarUrlInput.trim());
          updateAvatar(avatarUrlInput.trim());
          avatarUpdated = true;
        } catch (error) {
          toast({
            title: "URL Foto Profil Tidak Valid",
            description: "Harap masukkan URL gambar yang valid.",
            variant: "destructive",
          });
          return; // Stop if avatar URL is invalid
        }
      } else if (!avatarUrlInput.trim()){
         toast({
            title: "URL Foto Profil Kosong",
            description: "URL foto profil tidak boleh kosong. Default akan digunakan jika dikosongkan dan disimpan.",
            variant: "destructive",
          });
          return;
      }

      if (nameInput.trim() && nameInput.trim() !== user.name) {
        updateName(nameInput.trim());
        nameUpdated = true;
      } else if (!nameInput.trim()){
        toast({
            title: "Nama Kosong",
            description: "Nama tidak boleh kosong.",
            variant: "destructive",
          });
          return;
      }

      if (avatarUpdated || nameUpdated) {
        toast({
          title: "Pengaturan Disimpan",
          description: "Informasi profil berhasil diperbarui.",
        });
      }
      setIsSettingsDialogOpen(false);
    }
  };


  return (
    <>
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm animate-fade-in-down">
        <div className="flex items-center gap-2">
          <SidebarTrigger>
             <PanelLeft className="h-5 w-5"/>
          </SidebarTrigger>
          <HibeurLogo />
          {/* The currentChatTitle display was here and is now removed */}
        </div>
        <div className="flex items-center space-x-2">
          {isViewingSavedChat ? (
             <Button variant="outline" onClick={onStartNewChat}>
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Obrolan Baru
            </Button>
          ) : (
            <Button variant="outline" onClick={onSaveChat} disabled={messages.length === 0}>
              <Save className="mr-2 h-4 w-4" /> Simpan Obrolan
            </Button>
          )}

          {isMounted && user ? (
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
                Perbarui informasi profil Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nameInput">Nama</Label>
                <Input
                  id="nameInput"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>
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
                    <AvatarFallback>{nameInput ? nameInput.charAt(0).toUpperCase() : 'P'}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveSettings} disabled={isLoading}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
