
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
  SidebarHeader as UiSidebarHeader,
  SidebarFooter as UiSidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar'; // Using shadcn sidebar components

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
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const handleAddFolderClick = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const filteredNotes = (folderId: string) => notes.filter(note => note.folderId === folderId);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <UiSidebarHeader className="p-2">
        <h2 className="text-lg font-semibold px-2 text-sidebar-primary group-data-[collapsible=icon]:hidden">Manajer Catatan</h2>
         {/* Placeholder for icon only mode */}
        <FolderIcon className="h-6 w-6 text-sidebar-primary hidden group-data-[collapsible=icon]:block mx-auto" />
      </UiSidebarHeader>

      <div className="p-2 group-data-[collapsible=icon]:hidden">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Nama Folder Baru"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="bg-sidebar-accent text-sidebar-accent-foreground placeholder:text-sidebar-accent-foreground/70 border-sidebar-border focus:ring-sidebar-ring h-9"
            onKeyPress={(e) => e.key === 'Enter' && handleAddFolderClick()}
          />
          <Button onClick={handleAddFolderClick} size="icon" variant="outline" className="h-9 w-9 border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground">
            <FolderPlus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Separator className="my-2 bg-sidebar-border group-data-[collapsible=icon]:hidden" />

      <ScrollArea className="flex-grow">
        <SidebarMenu className="px-2">
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
                    "justify-between",
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80")} />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{folder.name}</span>
                  </div>
                  {notesInFolder.length > 0 && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 group-data-[collapsible=icon]:hidden hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent folder selection
                          toggleFolderExpansion(folder.id);
                        }}
                      >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                </SidebarMenuButton>
                {isExpanded && notesInFolder.length > 0 && (
                  <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                    {notesInFolder.map((note) => (
                      <SidebarMenuSubItem key={note.id}>
                        <SidebarMenuSubButton 
                          size="sm"
                          className="text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                          title={note.content} // Full content on hover
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
              Belum ada folder. Buat folder baru untuk memulai.
            </p>
        )}
      </ScrollArea>
      
      <UiSidebarFooter className="p-2 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-sidebar-foreground/50 text-center">Lumina Notes v0.1</p>
      </UiSidebarFooter>
    </div>
  );
}
