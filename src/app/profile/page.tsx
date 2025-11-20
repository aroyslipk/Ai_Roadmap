'use client';

import { useState, useRef } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Github, Upload, RotateCcw } from 'lucide-react';
import { doc, writeBatch, setDoc } from 'firebase/firestore';
import { initialCurriculum } from '@/lib/curriculum';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load photo from localStorage on mount
  const localPhoto = typeof window !== 'undefined' ? localStorage.getItem(`profile_photo_${user?.uid}`) : null;
  
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [photoURL, setPhotoURL] = useState(localPhoto || user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let maxSize = 200;
        let quality = 0.7;
        let resizedBase64 = '';
        
        const tryResize = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          
          ctx.drawImage(img, 0, 0, width, height);
          resizedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          return resizedBase64.length <= 100000;
        };

        while (!tryResize() && quality > 0.3) {
          quality -= 0.1;
        }

        if (resizedBase64.length > 100000) {
          toast({
            variant: 'destructive',
            title: 'Image too large',
            description: 'Please choose a smaller image.',
          });
        } else {
          localStorage.setItem(`profile_photo_${user.uid}`, resizedBase64);
          setPhotoURL(resizedBase64);
          
          if (firestore && user) {
            const userRef = doc(firestore, 'users', user.uid);
            setDoc(userRef, { 
              photoURL: resizedBase64,
              updatedAt: new Date().toISOString(),
              id: user.uid
            }, { merge: true }).catch((err) => {
              console.warn('Could not save photo to Firestore:', err);
            });
          }
          
          window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: resizedBase64 }));
          
          toast({
            title: 'Photo Updated!',
            description: 'Your profile picture has been saved.',
          });
        }
      };
      
      img.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load image.',
        });
      };
      
      img.src = reader.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!auth?.currentUser) return;
    setIsSaving(true);
    try {
      const placeholderURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&size=200&background=random`;
      
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: placeholderURL, // Short URL, actual photo in localStorage
      });
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!firestore || !user) return;

    const confirmation = confirm('Are you sure you want to reset all your progress? This cannot be undone.');
    if (!confirmation) return;

    setIsResetting(true);
    
    toast({ 
      title: 'Resetting...', 
      description: 'Please wait while we reset your progress.' 
    });

    try {
      // Use Promise.all for faster parallel writes instead of batch
      const resetPromises = initialCurriculum.map(dayData => {
        const dayRef = doc(firestore, `users/${user.uid}/days`, String(dayData.day));
        const dayWithUser = { ...dayData, userId: user.uid, id: String(dayData.day) };
        return dayRef;
      });

      const batch = writeBatch(firestore);
      initialCurriculum.forEach(dayData => {
        const dayRef = doc(firestore, `users/${user.uid}/days`, String(dayData.day));
        const dayWithUser = { ...dayData, userId: user.uid, id: String(dayData.day) };
        batch.set(dayRef, dayWithUser);
      });
      
      batch.commit().catch(err => console.error('Reset error:', err));
      
      toast({ 
        title: 'Progress Reset!', 
        description: 'Redirecting to home...' 
      });
      
      setIsResetting(false);
      router.push('/');
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Could not reset your progress.' 
      });
      setIsResetting(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-8">
         <Button onClick={() => router.push('/')}>Back to Roadmap</Button>
       </header>
       <main className="flex flex-1 items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || user.email?.split('@')[0] || 'User')}&size=200&background=random`} />
                    <AvatarFallback className="text-2xl">{displayName?.[0] ?? user.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email ?? 'Anonymous'} disabled />
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>

            {/* Contact Admin */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://github.com/aroyslipk', '_blank')}
            >
              <Github className="h-4 w-4 mr-2" />
              Contact Admin
            </Button>

            {/* Reset Progress */}
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleResetProgress}
              disabled={isResetting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isResetting ? 'Resetting...' : 'Reset All Progress'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
