'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import {
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'email' | 'password' | null>(null);

  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  const reauthenticate = async () => {
    if (!auth?.currentUser || !currentPassword) {
        toast({ variant: "destructive", title: "Error", description: "Current password is required." });
        return null;
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        return true;
    } catch (error: any) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "The password you entered is incorrect." });
        return null;
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Password must be at least 6 characters' });
      return;
    }
    
    setIsSaving(true);
    const reauthenticated = await reauthenticate();
    if(reauthenticated && auth?.currentUser){
        try {
            await updatePassword(auth.currentUser, newPassword);
            toast({ title: 'Success', description: 'Your password has been updated.' });
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setActionToConfirm(null);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error updating password', description: error.message });
        }
    }
    setIsSaving(false);
  };

  const handleChangeEmail = async () => {
     if (!newEmail) {
      toast({ variant: 'destructive', title: 'New email cannot be empty.' });
      return;
    }
    
    setIsSaving(true);
    const reauthenticated = await reauthenticate();
     if(reauthenticated && auth?.currentUser){
        try {
            await updateEmail(auth.currentUser, newEmail);
            toast({ title: 'Success', description: 'Your email has been updated. Please check your new email to verify.' });
            setNewEmail('');
            setCurrentPassword('');
            setActionToConfirm(null);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error updating email', description: error.message });
        }
    }
    setIsSaving(false);
  };
  
  const handleConfirm = () => {
      if (actionToConfirm === 'password') {
          handleChangePassword();
      } else if (actionToConfirm === 'email') {
          handleChangeEmail();
      }
  }


  return (
     <div className="flex h-screen w-full flex-col">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-8">
         <Button onClick={() => router.push('/')}>Back to Roadmap</Button>
       </header>
       <main className="flex flex-1 items-center justify-center p-4">
        <AlertDialog onOpenChange={() => setActionToConfirm(null)}>
            <Card className="w-full max-w-md">
                <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your account credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                     <AlertDialogTrigger asChild>
                        <Button variant="outline" onClick={() => setActionToConfirm('password')} disabled={isSaving}>Update Password</Button>
                    </AlertDialogTrigger>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-semibold">Change Email</h3>
                     <div className="space-y-2">
                        <Label>Current Email</Label>
                        <Input value={user.email ?? ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-email">New Email</Label>
                        <Input
                            id="new-email"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                     <AlertDialogTrigger asChild>
                        <Button variant="outline" onClick={() => setActionToConfirm('email')} disabled={isSaving}>Update Email</Button>
                    </AlertDialogTrigger>
                </div>
                </CardContent>
            </Card>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Please re-authenticate to continue</AlertDialogTitle>
                    <AlertDialogDescription>
                        For your security, please enter your current password to make this change.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCurrentPassword('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={!currentPassword || isSaving}>
                        {isSaving ? 'Confirming...' : 'Confirm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
