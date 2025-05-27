
'use client';

import type { Folder, Note } from '@/lib/chat-export';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FolderPlus, Folder as FolderIcon, FileText, ChevronRight, ChevronDown } from 'lucide-react';
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
  SidebarGroup,
  SidebarGroupLabel,
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
}

export function NotesSidebar({
  folders,
  notes,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
}: NotesSidebarProps) {
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [newFolderNameDialog, setNewFolderNameDialog] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

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

  const filteredNotes = (folderId: string) => notes.filter(note => note.folderId === folderId);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <UiSidebarHeader className="p-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold px-2 text-sidebar-primary group-data-[collapsible=icon]:hidden">Manajer Catatan</h2>
        <FolderIcon className="h-6 w-6 text-sidebar-primary hidden group-data-[collapsible=icon]:block mx-auto" />
        
        <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 group-data-[collapsible=icon]:mx-auto text-sidebar-primary hover:bg-sidebar-primary/10 hover:text-sidebar-primary"
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

      <ScrollArea className="flex-grow">
        <SidebarMenu className="px-2 py-2">
          {folders.map((folder) => {
            const isActive = folder.id === selectedFolderId;
            const notesInFolder = filteredNotes(folder.id);
            const isExpanded = expandedFolders[folder.id] ?? false;
            
            return (
              <SidebarMenuItem key={folder.id}>
                <SidebarMenuButton
                  onClick={() => onSelectFolder(folder.id)}
                  isActive={isActive}
                  tooltip={{ children: folder.name, side: 'right', align: 'start', className:"bg-card text-card-foreground border-border" }}
                  className={cn(
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <FolderIcon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80")} />
                  <span className="truncate group-data-[collapsible=icon]:hidden">{folder.name}</span>
                </SidebarMenuButton>
                {notesInFolder.length > 0 && (
                   <SidebarMenuAction
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleFolderExpansion(folder.id);
                      }}
                      className="group-data-[collapsible=icon]:hidden"
                      aria-label={isExpanded ? `Collapse folder ${folder.name}` : `Expand folder ${folder.name}`}
                    >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </SidebarMenuAction>
                )}
                 {isExpanded && notesInFolder.length > 0 && (
                  <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                    {notesInFolder.map((note) => (
                      <SidebarMenuSubItem key={note.id}>
                        <SidebarMenuSubButton 
                          size="sm"
                          className="text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                          title={note.content}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {note.content.substring(0, 25) + (note.content.length > 25 ? '...' : '')}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
         {folders.length === 0 && (
            <p className="p-4 text-sm text-center text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              Belum ada folder. Klik tombol <FolderPlus className="inline h-4 w-4 mx-1" /> untuk membuat folder baru.
            </p>
        )}
      </ScrollArea>
      
      <UiSidebarFooter className="p-2 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-sidebar-foreground/50 text-center">Lumina Notes v0.1</p>
      </UiSidebarFooter>
    </div>
  );
}
