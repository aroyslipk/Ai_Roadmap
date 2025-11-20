'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import type { ChatMessage } from '@/types';

interface PendingMessage {
  id: string;
  message: string;
  timestamp: number;
  userName: string;
  userAvatar: string;
}

export function useOfflineChat() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pending_chat_messages');
    if (stored) {
      try {
        setPendingMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load pending messages:', e);
      }
    }
  }, []);

  // Save pending messages to localStorage
  useEffect(() => {
    localStorage.setItem('pending_chat_messages', JSON.stringify(pendingMessages));
  }, [pendingMessages]);

  // Sync pending messages when online
  useEffect(() => {
    if (!isOnline || !firestore || !user || pendingMessages.length === 0 || isSyncing) return;

    const syncMessages = async () => {
      setIsSyncing(true);
      const messagesCollection = collection(firestore, 'chat_messages');
      
      for (const pending of pendingMessages) {
        try {
          await addDoc(messagesCollection, {
            userId: user.uid,
            userName: pending.userName,
            userAvatar: pending.userAvatar,
            message: pending.message,
            createdAt: Timestamp.fromMillis(pending.timestamp),
          });
        } catch (error) {
          console.error('Failed to sync message:', error);
          setIsSyncing(false);
          return; // Stop syncing if one fails
        }
      }

      // Clear pending messages after successful sync
      setPendingMessages([]);
      setIsSyncing(false);
    };

    syncMessages();
  }, [isOnline, firestore, user, pendingMessages, isSyncing]);

  // Listen to Firebase messages when online
  useEffect(() => {
    if (!firestore || !isOnline) return;

    const messagesCollection = collection(firestore, 'chat_messages');
    const messagesQuery = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const firebaseMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatMessage));
        setMessages(firebaseMessages);
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );

    return () => unsubscribe();
  }, [firestore, isOnline]);

  // Send message (offline-first)
  const sendMessage = (message: string) => {
    if (!user) return;

    const userName = user.displayName || user.email || 'Anonymous';
    const userAvatar = localStorage.getItem(`profile_photo_${user.uid}`) || 
                       user.photoURL || 
                       `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=200&background=random`;

    if (isOnline && firestore) {
      // Send directly to Firebase
      const messagesCollection = collection(firestore, 'chat_messages');
      addDoc(messagesCollection, {
        userId: user.uid,
        userName,
        userAvatar,
        message,
        createdAt: new Date(),
      }).catch(error => {
        console.error('Failed to send message:', error);
        // If fails, add to pending queue
        addToPendingQueue(message, userName, userAvatar);
      });
    } else {
      // Offline: add to pending queue
      addToPendingQueue(message, userName, userAvatar);
    }
  };

  const addToPendingQueue = (message: string, userName: string, userAvatar: string) => {
    const pending: PendingMessage = {
      id: `pending-${Date.now()}-${Math.random()}`,
      message,
      timestamp: Date.now(),
      userName,
      userAvatar,
    };
    setPendingMessages(prev => [...prev, pending]);
  };

  // Combine Firebase messages with pending messages for display
  const allMessages: ChatMessage[] = [
    ...messages,
    ...pendingMessages.map(p => ({
      id: p.id,
      userId: user?.uid || '',
      userName: p.userName,
      userAvatar: p.userAvatar,
      message: p.message,
      createdAt: new Date(p.timestamp),
      isPending: true, // Mark as pending
    }))
  ];

  return {
    messages: allMessages,
    sendMessage,
    isOnline,
    pendingCount: pendingMessages.length,
    isSyncing,
  };
}
