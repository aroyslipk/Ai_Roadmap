'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { ChatMessage } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';
import ClientOnly from './client-only';

interface GroupChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isOnline?: boolean;
    pendingCount?: number;
}

const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
    const isClient = useIsClient();
    
    if (!isClient) {
        return (
            <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        );
    }
    
    let timeAgo = '';
    try {
        const date = msg.createdAt instanceof Date ? msg.createdAt : (msg.createdAt as any).toDate();
        timeAgo = formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        // Do nothing if date is invalid
    }

    return (
         <div className={`flex items-start gap-3 ${msg.isPending ? 'opacity-60' : ''}`}>
            <Avatar className="h-8 w-8">
                <AvatarImage src={msg.userAvatar} data-ai-hint="person face" />
                <AvatarFallback>{msg.userName?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <p className="font-bold text-sm">{msg.userName}</p>
                    <ClientOnly>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo}
                        {msg.isPending && ' • Sending...'}
                      </p>
                    </ClientOnly>
                </div>
                <p className="text-sm">{msg.message}</p>
            </div>
        </div>
    )
}


export default function GroupChat({ messages, onSendMessage, isOnline = true, pendingCount = 0 }: GroupChatProps) {
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isClient = useIsClient();

    const handleSend = () => {
        if(input.trim()){
            onSendMessage(input.trim());
            setInput('');
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
    }, [messages]);
    
    if (!isClient) {
        return (
            <Card className="flex-1 flex flex-col h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        );
    }

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Chat
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="text-xs text-muted-foreground">Offline</span>
            )}
            {pendingCount > 0 && (
              <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                {pendingCount} pending
              </span>
            )}
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <ChatMessageItem key={msg.id || index} msg={msg} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button type="submit" size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
