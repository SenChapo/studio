
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormattedTextRenderer } from '@/components/shared/FormattedTextRenderer';
import { useMockAuth } from "@/hooks/useMockAuth";


export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useMockAuth(); // Get user from hook

  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // State for Save Note Dialog
  const [isSaveNoteDialogOpen, setIsSaveNoteDialogOpen] = useState(false);
  const [noteContentToSave, setNoteContentToSave] = useState<string | null>(null);
  const [selectedFolderForSaving, setSelectedFolderForSaving] = useState<string | null>(null);

  // State for View/Edit Note Dialog
  const [isViewNoteDialogOpen, setIsViewNoteDialogOpen] = useState(false);
  const [noteToViewOrEdit, setNoteToViewOrEdit] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  
  // State for Delete Note Confirmation Dialog
  const [isDeleteNoteConfirmOpen, setIsDeleteNoteConfirmOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);


  useEffect(() => {
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
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
    if (!selectedFolderForSaving) {
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

  // --- View/Edit Note Dialog Logic ---
  const handleOpenViewNoteDialog = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNoteToViewOrEdit(note);
      setEditedNoteContent(note.content);
      setIsEditingNote(false);
      setIsViewNoteDialogOpen(true);
    }
  }, [notes]);

  const handleToggleEditNote = () => {
    if (noteToViewOrEdit) {
      setIsEditingNote(!isEditingNote);
      if (isEditingNote) { // Was editing, now viewing
        setEditedNoteContent(noteToViewOrEdit.content); // Reset content if edit is cancelled
      }
    }
  };

  const handleSaveEditedNote = () => {
    if (noteToViewOrEdit) {
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === noteToViewOrEdit.id ? { ...n, content: editedNoteContent, timestamp: new Date() } : n
        )
      );
      setNoteToViewOrEdit(prev => prev ? {...prev, content: editedNoteContent, timestamp: new Date()} : null);
      setIsEditingNote(false);
      toast({ title: "Sukses", description: "Catatan berhasil diperbarui." });
      // Optionally close dialog after saving: setIsViewNoteDialogOpen(false);
    }
  };
  
  const handleInitiateDeleteNote = (noteId: string) => {
    setNoteIdToDelete(noteId);
    setIsDeleteNoteConfirmOpen(true);
  };

  const handleConfirmDeleteNote = () => {
    if (noteIdToDelete) {
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteIdToDelete));
      toast({ title: "Sukses", description: "Catatan berhasil dihapus.", variant: "destructive" });
      setNoteIdToDelete(null);
      setIsDeleteNoteConfirmOpen(false);
      if (noteToViewOrEdit && noteToViewOrEdit.id === noteIdToDelete) {
        setIsViewNoteDialogOpen(false); // Close view dialog if the deleted note was being viewed
        setNoteToViewOrEdit(null);
      }
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
            onViewNote={handleOpenViewNoteDialog}
          />
        </UiSidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <ChatHeader messages={messages} />
          <ChatMessageList 
            messages={messages} 
            isLoadingAiResponse={isLoading} 
            loadingText="Cunenk sedang berpikir..."
            onInitiateSaveNote={handleInitiateSaveNote}
            user={user} // Pass user object
          />
          <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </SidebarInset>

      {/* Save Note Dialog */}
      <Dialog open={isSaveNoteDialogOpen} onOpenChange={setIsSaveNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Simpan Catatan ke Folder</DialogTitle>
            <DialogDescription>
              Pilih folder tujuan dan pratinjau catatan Anda sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {noteContentToSave && (
              <div className="space-y-1">
                <Label htmlFor="noteContentPreview">Isi Catatan (pratinjau):</Label>
                <ScrollArea className="max-h-28 w-full rounded-md border p-2 bg-muted/50 text-sm">
                  <FormattedTextRenderer content={noteContentToSave} className="text-muted-foreground" />
                </ScrollArea>
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

      {/* View/Edit Note Dialog */}
      {noteToViewOrEdit && (
        <Dialog open={isViewNoteDialogOpen} onOpenChange={(isOpen) => {
          setIsViewNoteDialogOpen(isOpen);
          if (!isOpen) {
            setNoteToViewOrEdit(null);
            setIsEditingNote(false);
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditingNote ? "Edit Catatan" : "Detail Catatan"}</DialogTitle>
              <DialogDescription>
                {isEditingNote 
                  ? "Ubah konten catatan Anda di bawah ini." 
                  : `Catatan dari folder: ${folders.find(f => f.id === noteToViewOrEdit.folderId)?.name || 'Tidak diketahui'}. Disimpan pada: ${new Date(noteToViewOrEdit.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {isEditingNote ? (
                <Textarea
                  value={editedNoteContent}
                  onChange={(e) => setEditedNoteContent(e.target.value)}
                  className="min-h-[200px] max-h-[60vh] text-sm resize-y"
                  autoFocus
                />
              ) : (
                <ScrollArea className="max-h-[60vh] w-full rounded-md border p-3 bg-muted/50">
                  <FormattedTextRenderer content={noteToViewOrEdit.content} className="text-sm text-card-foreground" />
                </ScrollArea>
              )}
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div>
                {!isEditingNote ? (
                  <Button variant="outline" onClick={handleToggleEditNote}>Edit Catatan</Button>
                ) : (
                  <Button variant="outline" onClick={handleToggleEditNote}>Batal Edit</Button>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="destructive" onClick={() => handleInitiateDeleteNote(noteToViewOrEdit.id)}>Hapus Catatan</Button>
                 {isEditingNote ? (
                  <Button onClick={handleSaveEditedNote}>Simpan Perubahan</Button>
                ) : (
                  <DialogClose asChild>
                    <Button type="button">Tutup</Button>
                  </DialogClose>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={isDeleteNoteConfirmOpen} onOpenChange={setIsDeleteNoteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Catatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteIdToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteNote} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

    