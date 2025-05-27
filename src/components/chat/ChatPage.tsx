
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
import { Input } from "@/components/ui/input";
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
  const { user } = useMockAuth();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // State for Save Note Dialog
  const [isSaveNoteDialogOpen, setIsSaveNoteDialogOpen] = useState(false);
  const [noteContentToSave, setNoteContentToSave] = useState<string | null>(null);
  const [noteNameToSave, setNoteNameToSave] = useState<string>("");
  const [selectedFolderForSaving, setSelectedFolderForSaving] = useState<string | null>(null);

  // State for View/Edit Note Dialog
  const [isViewNoteDialogOpen, setIsViewNoteDialogOpen] = useState(false);
  const [noteToViewOrEdit, setNoteToViewOrEdit] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteName, setEditedNoteName] = useState('');
  const [editedNoteContent, setEditedNoteContent] = useState('');

  // State for Delete Note Confirmation Dialog
  const [isDeleteNoteConfirmOpen, setIsDeleteNoteConfirmOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

  // State for Delete Folder Confirmation Dialog
  const [isDeleteFolderConfirmOpen, setIsDeleteFolderConfirmOpen] = useState(false);
  const [folderIdToDelete, setFolderIdToDelete] = useState<string | null>(null);


  useEffect(() => {
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
    if (folders.length > 0 && !selectedFolderForSaving) {
      setSelectedFolderForSaving(folders[0]?.id || null);
    }
  }, [folders, selectedFolderId, selectedFolderForSaving]);


  const handleAddFolder = (folderName: string) => {
    if (!folderName.trim()) {
      toast({ title: "Error", description: "Nama folder tidak boleh kosong.", variant: "destructive" });
      return;
    }
    const newFolder: Folder = { id: crypto.randomUUID(), name: folderName.trim() };
    setFolders(prev => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
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
    const firstFewWords = content.split(/\s+/).slice(0, 5).join(" ");
    setNoteNameToSave(firstFewWords || "Catatan Baru");
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

    const finalNoteName = noteNameToSave.trim() || "Catatan Baru";

    const newNote: Note = {
      id: crypto.randomUUID(),
      folderId: selectedFolderForSaving,
      name: finalNoteName,
      content: noteContentToSave,
      timestamp: new Date(), // Creation timestamp
      // lastEditedTimestamp is initially undefined
    };
    setNotes(prev => [...prev, newNote]);
    toast({ title: "Sukses", description: `Catatan '${finalNoteName}' ditambahkan ke folder '${targetFolder.name}'.` });
    setIsSaveNoteDialogOpen(false);
    setNoteContentToSave(null);
    setNoteNameToSave("");
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

  const handleOpenViewNoteDialog = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNoteToViewOrEdit(note);
      setEditedNoteName(note.name);
      setEditedNoteContent(note.content);
      setIsEditingNote(false);
      setIsViewNoteDialogOpen(true);
    }
  }, [notes]);

  const handleToggleEditNote = () => {
    if (noteToViewOrEdit) {
      setIsEditingNote(!isEditingNote);
      if (isEditingNote) {
        setEditedNoteName(noteToViewOrEdit.name);
        setEditedNoteContent(noteToViewOrEdit.content);
      }
    }
  };

  const handleSaveEditedNote = () => {
    if (noteToViewOrEdit) {
      const finalEditedName = editedNoteName.trim() || "Catatan Tanpa Judul";
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteToViewOrEdit.id ? {
            ...n,
            name: finalEditedName,
            content: editedNoteContent,
            lastEditedTimestamp: new Date() // Update last edited timestamp
          } : n
        )
      );
      setNoteToViewOrEdit(prev => prev ? {
        ...prev,
        name: finalEditedName,
        content: editedNoteContent,
        lastEditedTimestamp: new Date()
      } : null);
      setIsEditingNote(false);
      toast({ title: "Sukses", description: "Catatan berhasil diperbarui." });
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
        setIsViewNoteDialogOpen(false);
        setNoteToViewOrEdit(null);
      }
    }
  };

  const handleInitiateDeleteFolder = (folderId: string) => {
    setFolderIdToDelete(folderId);
    setIsDeleteFolderConfirmOpen(true);
  };

  const handleConfirmDeleteFolder = () => {
    if (!folderIdToDelete) return;

    const folderToDelete = folders.find(f => f.id === folderIdToDelete);
    if (!folderToDelete) return;

    setNotes(prevNotes => prevNotes.filter(n => n.folderId !== folderIdToDelete));
    setFolders(prevFolders => prevFolders.filter(f => f.id !== folderIdToDelete));

    toast({ title: "Folder Dihapus", description: `Folder '${folderToDelete.name}' dan semua catatannya berhasil dihapus.`, variant: "destructive" });

    if (selectedFolderId === folderIdToDelete) {
      const remainingFolders = folders.filter(f => f.id !== folderIdToDelete);
      setSelectedFolderId(remainingFolders.length > 0 ? remainingFolders[0].id : null);
    }
    if (selectedFolderForSaving === folderIdToDelete) {
      const remainingFolders = folders.filter(f => f.id !== folderIdToDelete);
      setSelectedFolderForSaving(remainingFolders.length > 0 ? remainingFolders[0].id : null);
    }

    setFolderIdToDelete(null);
    setIsDeleteFolderConfirmOpen(false);
  };

  const formatTimestamp = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            onInitiateDeleteFolder={handleInitiateDeleteFolder}
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
            user={user}
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
              Beri nama catatan Anda, pilih folder tujuan, dan pratinjau sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="noteName">Nama Catatan</Label>
                <Input
                    id="noteName"
                    value={noteNameToSave}
                    onChange={(e) => setNoteNameToSave(e.target.value)}
                    placeholder="Contoh: Ide Resep Nasi Goreng"
                />
            </div>
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
              <DialogTitle>{isEditingNote ? "Edit Catatan" : noteToViewOrEdit.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEditingNote
                  ? "Ubah nama dan konten catatan Anda di bawah ini."
                  : (
                    <>
                      <span className="block">Folder: {folders.find(f => f.id === noteToViewOrEdit.folderId)?.name || 'Tidak diketahui'}</span>
                      <span className="block">Dibuat: {formatTimestamp(noteToViewOrEdit.timestamp)}</span>
                      {noteToViewOrEdit.lastEditedTimestamp && (
                        <span className="block">Terakhir Diedit: {formatTimestamp(noteToViewOrEdit.lastEditedTimestamp)}</span>
                      )}
                    </>
                  )
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {isEditingNote && (
                <div className="space-y-2">
                  <Label htmlFor="editNoteName">Nama Catatan</Label>
                  <Input
                    id="editNoteName"
                    value={editedNoteName}
                    onChange={(e) => setEditedNoteName(e.target.value)}
                    placeholder="Nama Catatan"
                    autoFocus
                  />
                </div>
              )}
              {isEditingNote ? (
                <Textarea
                  value={editedNoteContent}
                  onChange={(e) => setEditedNoteContent(e.target.value)}
                  className="min-h-[200px] max-h-[50vh] text-sm resize-y"
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
                  <Button onClick={handleSaveEditedNote} disabled={!editedNoteName.trim()}>Simpan Perubahan</Button>
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

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={isDeleteFolderConfirmOpen} onOpenChange={setIsDeleteFolderConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus folder '{folders.find(f => f.id === folderIdToDelete)?.name || ''}'?
              Tindakan ini akan menghapus semua catatan di dalamnya dan tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFolderIdToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteFolder} className="bg-destructive hover:bg-destructive/90">Hapus Folder</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

