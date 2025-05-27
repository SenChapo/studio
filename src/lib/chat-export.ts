
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface Folder {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  folderId: string;
  content: string;
  timestamp: Date;
}

export const exportChatAsTxt = (messages: ChatMessage[], lang: string = 'id'): void => {
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const formattedMessages = messages
    .map(
      (msg) =>
        `[${new Date(msg.timestamp).toLocaleString(locale)}] ${msg.role.toUpperCase()}: ${msg.content}`
    )
    .join('\n\n');
  
  const blob = new Blob([formattedMessages], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lumina-chat-${new Date().toISOString()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportChatAsJson = (messages: ChatMessage[], lang: string = 'id'): void => {
  // Language parameter doesn't affect JSON structure but kept for consistency
  const jsonString = JSON.stringify(messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString() // Standardize timestamp format for JSON
  })), null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lumina-chat-${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
