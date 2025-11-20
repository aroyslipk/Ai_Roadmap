'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NotebookText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesEditorProps {
  dayId: number;
  notes: string;
  onNotesChange: (dayId: number, notes: string) => void;
}

export default function NotesEditor({ dayId, notes, onNotesChange }: NotesEditorProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Notes Saved!',
      description: `Your notes for Day ${dayId} have been saved.`,
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookText className="h-5 w-5" />
          My Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Start writing your notes here... Markdown is supported."
          className="min-h-[200px] text-base"
          value={notes}
          onChange={(e) => onNotesChange(dayId, e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         <Button onClick={handleSave}>Save Notes</Button>
      </CardFooter>
    </Card>
  );
}
