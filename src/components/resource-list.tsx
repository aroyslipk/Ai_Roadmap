'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Resource } from '@/types';
import ResourceItem from './resource-item';
import { BookMarked, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ResourceListProps {
  dayId: number;
  resources: Resource[];
  onResourceUpdate: (dayId: number, resourceId: string, newResource: Partial<Resource>) => void;
  onAddResource: (dayId: number, newResource: Omit<Resource, 'id'>) => void;
}

export default function ResourceList({ dayId, resources, onResourceUpdate, onAddResource }: ResourceListProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleAddResource = () => {
    if (title && url) {
      onAddResource(dayId, {
        title,
        url,
        isFavorited: false,
        isCompleted: false,
      });
      setTitle('');
      setUrl('');
      setOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookMarked className="h-5 w-5" />
          Learning Resources
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>
                Add a new learning resource for Day {dayId}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddResource}>Save resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div key={resource.id}>
                <ResourceItem
                  resource={resource}
                  onUpdate={(newResource) => onResourceUpdate(dayId, resource.id, newResource)}
                />
                 {index < resources.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
