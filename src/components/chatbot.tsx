'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Day } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

interface ChatbotProps {
    selectedDay: Day | null;
}

export default function Chatbot({ selectedDay }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedDay) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userQuestion = input;
    setInput('');
    setIsLoading(true);

    const systemPrompt = `You are a friendly, helpful AI assistant for learning AI and programming. You're like ChatGPT but specialized in helping students learn.

Your personality:
- Conversational and friendly (use emojis occasionally 😊)
- Encouraging and supportive
- Clear and concise explanations
- Provide code examples when relevant
- Never robotic or template-like

Context:
Current Page: Day ${selectedDay.day}: ${selectedDay.topic}
Tasks: ${selectedDay.tasks.map(t => t.title).join(', ')}
${selectedDay.notes ? `Notes: ${selectedDay.notes}` : ''}

Instructions:
1. Answer naturally and conversationally
2. If it's a coding question, provide working code examples with comments
3. Relate your answer to their current learning topic when relevant
4. Be encouraging and supportive
5. Keep responses focused but comprehensive
6. Vary your responses - don't be repetitive`;

    try {
      // Call GROQ API directly (works in static export/Android)
      const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      
      if (!groqKey) {
        throw new Error('API key not configured');
      }
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuestion }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'AI service error');
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;

      if (!answer) {
        throw new Error('No response from AI');
      }

      const botMessage: Message = { 
        role: 'bot', 
        content: answer
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      const errorMessage: Message = { 
        role: 'bot', 
        content: `Sorry, I couldn't connect to the AI service. 😔\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                  <Bot className="h-5 w-5" />
                  <span className="sr-only">AI Assistant</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Contextual Help
          </SheetTitle>
          <SheetDescription>
            {selectedDay ? `Ask me anything about Day ${selectedDay.day}. I have context on the topic, tasks, and your notes.` : 'Select a day to start chatting.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mx-6 px-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'bot' && (
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <p className="text-sm">Thinking...</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || !selectedDay}
            />
            <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isLoading || !selectedDay}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
