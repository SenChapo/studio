
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
  SidebarContent as UiSidebarContent, // Renamed to avoid conflict
  SidebarInset 
} from "@/components/ui/sidebar";
import { NotesSidebar } from "@/components/sidebar/NotesSidebar";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [folders, setFolders] = useState<Folder[]>([
    { id: 'folder-1', name: 'Catatan Umum' },
    { id: 'folder-2', name: 'Ide Proyek' },
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null);

  useEffect(() => {
    // Ensure a folder is selected if available
    if (!selectedFolderId && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  const handleAddFolder = (folderName: string) => {
    if (!folderName.trim()) {
      toast({ title: "Error", description: "Nama folder tidak boleh kosong.", variant: "destructive" });
      return;
    }
    const newFolder: Folder = { id: crypto.randomUUID(), name: folderName.trim() };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id); // Select new folder
    toast({ title: "Sukses", description: `Folder '${newFolder.name}' berhasil ditambahkan.` });
  };

  const handleAddNoteToSelectedFolder = (content: string) => {
    if (!selectedFolderId) {
      toast({ title: "Error", description: "Pilih folder terlebih dahulu untuk menyimpan catatan.", variant: "destructive" });
      return;
    }
    const targetFolder = folders.find(f => f.id === selectedFolderId);
    if (!targetFolder) {
      toast({ title: "Error", description: "Folder tujuan tidak ditemukan.", variant: "destructive" });
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      folderId: selectedFolderId,
      content,
      timestamp: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
    toast({ title: "Sukses", description: `Catatan ditambahkan ke folder '${targetFolder.name}'.` });
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
        <UiSidebarContent className="p-0"> {/* Use UiSidebarContent and remove its padding */}
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
            onAddNote={handleAddNoteToSelectedFolder}
          />
          <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
