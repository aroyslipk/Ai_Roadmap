'use client';

import { useState } from 'react';
import GroupChat from './group-chat';
import type { Day, ChatMessage } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';

interface RightPaneProps {
    chatMessages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isOnline?: boolean;
    pendingCount?: number;
}

export default function RightPane({ chatMessages, onSendMessage, isOnline, pendingCount }: RightPaneProps) {
  return (
    <>
      {/* Just render the chat content - button is in page.tsx */}
      <div className="flex flex-col h-full overflow-hidden">
        <GroupChat messages={chatMessages} onSendMessage={onSendMessage} isOnline={isOnline} pendingCount={pendingCount} />
      </div>
    </>
  );
}
