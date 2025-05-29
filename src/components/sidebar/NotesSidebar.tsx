
'use client';

import type { Folder, Note, ChatSession } from '@/lib/chat-export';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FolderPlus, Folder as FolderIcon, FileText, ChevronRight, ChevronDown, StickyNote, Trash2, MessageSquare, PlusCircle, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  SidebarHeader as UiSidebarHeader,
  SidebarFooter as UiSidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction
} from '@/components/ui/sidebar';

interface NotesSidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: (folderName: string) => void;
  onViewNote: (noteId: string) => void;
  onInitiateDeleteFolder: (folderId: string) => void;
  chatSessions: ChatSession[];
  onLoadChatSession: (sessionId: string) => void;
  onStartNewChat: () => void;
  onInitiateDeleteChatSession: (sessionId: string) => void;
  activeChatSessionId: string | null;
}

export function NotesSidebar({
  folders,
  notes,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onViewNote,
  onInitiateDeleteFolder,
  chatSessions,
  onLoadChatSession,
  onStartNewChat,
  onInitiateDeleteChatSession,
  activeChatSessionId,
}: NotesSidebarProps) {
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [newFolderNameDialog, setNewFolderNameDialog] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  // const [expandedChatHistory, setExpandedChatHistory] = useState(true); // This can be removed or kept if explicit toggle is needed

  const handleAddFolderSubmit = () => {
    if (newFolderNameDialog.trim()) {
      onAddFolder(newFolderNameDialog.trim());
      setNewFolderNameDialog('');
      setIsAddFolderDialogOpen(false);
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // const toggleChatHistoryExpansion = () => { // Keep if needed for a main toggle
  //   setExpandedChatHistory(prev => !prev);
  // };

  const filteredNotes = (folderId: string) => notes.filter(note => note.folderId === folderId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <ScrollArea className="flex-grow">
        {/* Folders Section */}
        <UiSidebarHeader className="p-2 flex items-center justify-between sticky top-0 bg-sidebar z-10">
          <div className="flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-sidebar-primary group-data-[collapsible=icon]:mx-auto" />
            <h2 className="text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">Folders</h2>
          </div>
          
          <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-primary hover:bg-sidebar-primary/10 hover:text-sidebar-primary group-data-[collapsible=icon]:mx-auto"
                title="Tambah Folder Baru"
              >
                <FolderPlus className="h-5 w-5" />
                <span className="sr-only">Tambah Folder Baru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Buat Folder Baru</DialogTitle>
                <DialogDescription>
                  Masukkan nama untuk folder baru Anda. Klik tambahkan jika sudah selesai.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="folderName"
                  placeholder="Nama Folder"
                  value={newFolderNameDialog}
                  onChange={(e) => setNewFolderNameDialog(e.target.value)}
                  className="col-span-3"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFolderSubmit()}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddFolderSubmit} disabled={!newFolderNameDialog.trim()}>
                  Tambahkan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </UiSidebarHeader>
        
        <Separator className="my-0 bg-sidebar-border" />

        <SidebarMenu className="px-2 py-2">
          {folders.length === 0 && (
            <p className="p-4 text-sm text-center text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              Belum ada folder. Klik <FolderPlus className="inline h-4 w-4 mx-0.5" /> untuk membuat.
            </p>
          )}
          {folders.map((folder) => {
            const isActive = folder.id === selectedFolderId;
            const notesInFolder = filteredNotes(folder.id);
            const isExpanded = expandedFolders[folder.id] ?? true;
            
            return (
              <SidebarMenuItem key={folder.id} className="animate-fade-in">
                <div className="flex items-center w-full">
                  <SidebarMenuButton
                    onClick={() => onSelectFolder(folder.id)}
                    isActive={isActive}
                    tooltip={{ children: folder.name, side: 'right', align: 'start', className:"bg-card text-card-foreground border-border" }}
                    className={cn(
                      "flex-grow", 
                      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <FolderIcon className={cn("h-4 w-4 shrink-0", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80")} />
                    <span className="truncate group-data-[collapsible=icon]:hidden flex-1 min-w-0">{folder.name}</span>
                    
                    {notesInFolder.length > 0 && ( 
                       <span
                          className="group-data-[collapsible=icon]:hidden p-0.5 rounded hover:bg-sidebar-accent/20 dark:hover:bg-sidebar-accent/50 shrink-0 ml-auto" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolderExpansion(folder.id);
                          }}
                          aria-label={isExpanded ? `Ciutkan folder ${folder.name}` : `Luaskan folder ${folder.name}`}
                          title={isExpanded ? `Ciutkan folder ${folder.name}` : `Luaskan folder ${folder.name}`}
                        >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                  </SidebarMenuButton>
                  
                  <SidebarMenuAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onInitiateDeleteFolder(folder.id);
                      }}
                      className="group-data-[collapsible=icon]:hidden text-sidebar-foreground/60 hover:text-destructive shrink-0" 
                      aria-label={`Hapus folder ${folder.name}`}
                      title={`Hapus folder ${folder.name}`}
                    >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>
                </div>
                
                 {isExpanded && notesInFolder.length > 0 && (
                  <SidebarMenuSub className="group-data-[collapsible=icon]:hidden animate-fade-in">
                    {notesInFolder.map((note) => (
                      <SidebarMenuSubItem key={note.id} className="animate-fade-in">
                        <SidebarMenuSubButton
                          onClick={() => onViewNote(note.id)}
                          size="sm"
                          className="text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                          title={note.name} 
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                          <span className="truncate min-w-0">
                            {note.name} 
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
                {isExpanded && notesInFolder.length === 0 && ( 
                    <p className="pl-[calc(theme(spacing.3)_+_1rem)] pr-2 py-1 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden italic">
                        Folder ini kosong.
                    </p>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Chat History Section */}
        <Separator className="my-2 bg-sidebar-border" />
        <UiSidebarHeader className="p-2 flex items-center justify-between sticky top-0 bg-sidebar z-10">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-sidebar-primary group-data-[collapsible=icon]:mx-auto" />
            <h2 className="text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">Riwayat Obrolan</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-primary hover:bg-sidebar-primary/10 hover:text-sidebar-primary group-data-[collapsible=icon]:mx-auto"
            title="Mulai Obrolan Baru"
            onClick={onStartNewChat}
          >
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Mulai Obrolan Baru</span>
          </Button>
        </UiSidebarHeader>

        <Separator className="my-0 bg-sidebar-border" />
        <SidebarMenu className="px-2 py-2">
          {chatSessions.length === 0 && (
            <p className="p-4 text-sm text-center text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              Belum ada riwayat obrolan tersimpan.
            </p>
          )}
          {chatSessions.map((session) => {
            const isActive = session.id === activeChatSessionId;
            return (
              <SidebarMenuItem key={session.id} className="animate-fade-in">
                 <div className="flex items-center w-full">
                  <SidebarMenuButton
                    onClick={() => onLoadChatSession(session.id)}
                    isActive={isActive}
                    tooltip={{ children: session.name, side: 'right', align: 'start', className:"bg-card text-card-foreground border-border" }}
                    className={cn(
                      "flex-grow",
                      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80")} />
                    <span className="truncate group-data-[collapsible=icon]:hidden flex-1 min-w-0">{session.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateDeleteChatSession(session.id);
                    }}
                    className="group-data-[collapsible=icon]:hidden text-sidebar-foreground/60 hover:text-destructive shrink-0"
                    aria-label={`Hapus sesi obrolan ${session.name}`}
                    title={`Hapus sesi obrolan ${session.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>
                </div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </ScrollArea>
      
      <UiSidebarFooter className="p-2 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden sticky bottom-0 bg-sidebar z-10">
        <p className="text-xs text-sidebar-foreground/50 text-center">Hibeur Notes v0.2</p>
      </UiSidebarFooter>
    </div>
  );
}
