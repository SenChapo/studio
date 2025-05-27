
'use client';

import { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputArea } from './ChatInputArea';
import type { ChatMessage, Folder, Note } from '@/lib/chat-export';
import { getAiResponse } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent as UiSidebarContent,
  SidebarInset 
} from "@/components/ui/sidebar";
import { NotesSidebar } from "@/components/sidebar/NotesSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // State for Save Note Dialog
  const [isSaveNoteDialogOpen, setIsSaveNoteDialogOpen] = useState(false);
  const [noteContentToSave, setNoteContentToSave] = useState<string | null>(null);
  const [selectedFolderForSaving, setSelectedFolderForSaving] = useState<string | null>(null);

  useEffect(() => {
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
    // Set default folder for saving if dialog opens and no folder is selected for saving yet
    if (folders.length > 0 && !selectedFolderForSaving) {
      setSelectedFolderForSaving(folders[0].id);
    }
  }, [folders, selectedFolderId, selectedFolderForSaving]);


  const handleAddFolder = (folderName: string) => {
    if (!folderName.trim()) {
      toast({ title: "Error", description: "Nama folder tidak boleh kosong.", variant: "destructive" });
      return;
    }
    const newFolder: Folder = { id: crypto.randomUUID(), name: folderName.trim() };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id); 
    if (!selectedFolderForSaving) { // Also set for saving dialog if it's the first folder
        setSelectedFolderForSaving(newFolder.id);
    }
    toast({ title: "Sukses", description: `Folder '${newFolder.name}' berhasil ditambahkan.` });
  };

  const handleInitiateSaveNote = (content: string) => {
    if (folders.length === 0) {
      toast({ title: "Error", description: "Buat folder terlebih dahulu untuk menyimpan catatan.", variant: "destructive" });
      return;
    }
    setNoteContentToSave(content);
    // Default to the currently selected sidebar folder, or the first folder if none selected in sidebar.
    setSelectedFolderForSaving(selectedFolderId || folders[0]?.id || null);
    setIsSaveNoteDialogOpen(true);
  };

  const handleConfirmSaveNote = () => {
    if (!noteContentToSave || !selectedFolderForSaving) {
      toast({ title: "Error", description: "Konten catatan atau folder tujuan tidak valid.", variant: "destructive" });
      return;
    }
    const targetFolder = folders.find(f => f.id === selectedFolderForSaving);
    if (!targetFolder) {
      toast({ title: "Error", description: "Folder tujuan tidak ditemukan.", variant: "destructive" });
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      folderId: selectedFolderForSaving,
      content: noteContentToSave,
      timestamp: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
    toast({ title: "Sukses", description: `Catatan ditambahkan ke folder '${targetFolder.name}'.` });
    setIsSaveNoteDialogOpen(false);
    setNoteContentToSave(null);
  };


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
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <UiSidebarContent className="p-0">
          <NotesSidebar
            folders={folders}
            notes={notes}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onAddFolder={handleAddFolder}
          />
        </UiSidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <ChatHeader messages={messages} />
          <ChatMessageList 
            messages={messages} 
            isLoadingAiResponse={isLoading} 
            loadingText="Lumina sedang berpikir..."
            onInitiateSaveNote={handleInitiateSaveNote}
          />
          <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </SidebarInset>

      <Dialog open={isSaveNoteDialogOpen} onOpenChange={setIsSaveNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Simpan Catatan ke Folder</DialogTitle>
            <DialogDescription>
              Pilih folder tujuan untuk menyimpan catatan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {noteContentToSave && (
              <div className="space-y-1">
                <Label htmlFor="noteContentPreview">Isi Catatan (pratinjau):</Label>
                <p id="noteContentPreview" className="text-sm text-muted-foreground max-h-20 overflow-y-auto border p-2 rounded-md bg-muted/50">
                  {noteContentToSave.substring(0, 150) + (noteContentToSave.length > 150 ? '...' : '')}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="folderSelect">Pilih Folder</Label>
              <Select
                value={selectedFolderForSaving || undefined}
                onValueChange={(value) => setSelectedFolderForSaving(value)}
                disabled={folders.length === 0}
              >
                <SelectTrigger id="folderSelect" className="w-full">
                  <SelectValue placeholder={folders.length > 0 ? "Pilih folder..." : "Tidak ada folder"} />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                  {folders.length === 0 && (
                     <p className="p-2 text-sm text-muted-foreground">Buat folder terlebih dahulu.</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleConfirmSaveNote} 
              disabled={!selectedFolderForSaving || folders.length === 0}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
