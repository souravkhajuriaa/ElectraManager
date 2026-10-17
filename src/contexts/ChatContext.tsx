import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  openChatWithPrompt: (prompt: string) => void;
  queuedPrompt: string | null;
  clearQueuedPrompt: () => void;
  activeQueryPreset: string | null;
  setActiveQueryPreset: (preset: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);
  const [activeQueryPreset, setActiveQueryPreset] = useState<string | null>(null);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  const openChatWithPrompt = (prompt: string) => {
    setQueuedPrompt(prompt);
    setIsOpen(true);
  };

  const clearQueuedPrompt = () => {
    setQueuedPrompt(null);
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openChat,
        closeChat,
        toggleChat,
        openChatWithPrompt,
        queuedPrompt,
        clearQueuedPrompt,
        activeQueryPreset,
        setActiveQueryPreset,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useAIChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within a ChatProvider');
  }
  return context;
};
