import React, { createContext, useContext, useState, useCallback } from 'react';

interface MessagesContextType {
  unreadByConv: Record<string, number>;
  totalUnread: number;
  markAsRead: (convId: string) => void;
}

const MessagesContext = createContext<MessagesContextType>({
  unreadByConv: {},
  totalUnread: 0,
  markAsRead: () => {},
});

const INITIAL_UNREAD: Record<string, number> = {
  'conv-1': 1,
};

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadByConv, setUnreadByConv] = useState(INITIAL_UNREAD);

  const totalUnread = Object.values(unreadByConv).reduce((sum, n) => sum + n, 0);

  const markAsRead = useCallback((convId: string) => {
    setUnreadByConv(prev => {
      if (!prev[convId]) return prev;
      const next = { ...prev };
      delete next[convId];
      return next;
    });
  }, []);

  return (
    <MessagesContext.Provider value={{ unreadByConv, totalUnread, markAsRead }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => useContext(MessagesContext);
